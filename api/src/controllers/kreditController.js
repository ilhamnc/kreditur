import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const createKredit = async (req, res) => {
  const { username, password, catatan, tempo, namaLengkap, noHp, alamat, usia, jenisKelamin, items } = req.body;
  const creatorRole = req.user.role;

  try {
    let debitur = await prisma.debitur.findUnique({ where: { noHp } });
    if (!debitur) {
      const defaultPassword = await bcrypt.hash(password || '123456', 10);
      const uname = username || noHp;
      const checkUser = await prisma.user.findUnique({ where: { username: uname } });
      if (checkUser) return res.status(400).json({ error: "Username sudah dipakai." });

      const newUser = await prisma.user.create({
        data: {
          username: uname, password: defaultPassword, role: 'DEBITUR',
          debiturProfile: { create: { namaLengkap, noHp, alamat, usia: parseInt(usia||0), jenisKelamin, catatan } }
        },
        include: { debiturProfile: true }
      });
      debitur = newUser.debiturProfile;
    } else {
      await prisma.debitur.update({ where: { id: debitur.id }, data: { catatan } });
    }

    let totalHutang = 0; let totalProfit = 0; let totalCashback = 0; const itemSnapshots = [];
    for (const item of items) {
      let p = item.productId ? await prisma.product.findUnique({ where: { id: item.productId } }) : await prisma.product.findFirst({ where: { nama: item.nama } });
      if (!p) p = await prisma.product.create({ data: { nama: item.nama, hargaKulakan: parseFloat(item.hargaKulakan||0), hargaJual: parseFloat(item.hargaJual||0), stok: 0, cashback: parseFloat(item.cashback||0) } });
      const qty = parseInt(item.qty);
      const subCashback = (p.cashback || item.cashback || 0) * qty;
      totalHutang += (p.hargaJual * qty);
      totalProfit += ((p.hargaJual - p.hargaKulakan) * qty) - subCashback;
      totalCashback += subCashback;
      itemSnapshots.push({ productId: p.id, qty, subtotal: p.hargaJual * qty, hargaKulakan: p.hargaKulakan, hargaJual: p.hargaJual, cashback: p.cashback || item.cashback || 0 });
    }

    const status = creatorRole === 'OWNER' ? 'ACC' : 'PENGAJUAN';
    await prisma.kredit.create({
      data: {
        debiturId: debitur.id, creatorId: req.user.id, status,
        tempo: tempo ? new Date(tempo) : null,
        totalHutang, sisaHutang: totalHutang, totalProfit, totalCashback,
        items: { create: itemSnapshots }
      }
    });

    res.status(201).json({ message: "Berhasil!", status });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const getKreditList = async (req, res) => {
  try {
    let whereClause = {};
    if (req.user.role === 'DEBITUR') {
      const dbtr = await prisma.debitur.findUnique({ where: { userId: req.user.id } });
      whereClause = { debiturId: dbtr.id };
    }
    const data = await prisma.kredit.findMany({
      where: whereClause,
      include: { debitur: true, items: { include: { product: true } }, pembayaran: true },
      orderBy: { tanggal: 'desc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const bayarAngsuran = async (req, res) => {
  const { kreditId, nominal, buktiBayar } = req.body;
  try {
    const k = await prisma.kredit.findUnique({ where: { id: parseInt(kreditId) }, include: { debitur: true } });
    const sisaBaru = k.sisaHutang - parseFloat(nominal);
    await prisma.pembayaran.create({ data: { kreditId: k.id, nominal: parseFloat(nominal), diterimaOleh: req.user.username, buktiBayar } });
    await prisma.kredit.update({ where: { id: k.id }, data: { sisaHutang: sisaBaru < 0 ? 0 : sisaBaru, status: sisaBaru <= 0 ? 'LUNAS' : 'ACC' } });
    await prisma.keuangan.create({ data: { tipe: 'PEMASUKAN', nominal: parseFloat(nominal), keterangan: `Angsuran Hutang: ${k.debitur.namaLengkap} (#${k.id})` } });
    res.json({ message: "Pembayaran Tersimpan!" });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deleteKredit = async (req, res) => {
  try {
    const k = await prisma.kredit.findUnique({ where: { id: parseInt(req.params.id) }, include: { items: true } });
    if (!k) return res.status(404).json({ error: "Data tidak ditemukan." });
    if (k.statusPengambilan === 'SUDAH') {
       for (const item of k.items) await prisma.product.update({ where: { id: item.productId }, data: { stok: { increment: item.qty } } });
    }
    await prisma.kredit.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Transaksi dihapus permanen." });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// =======================================================
// FITUR BARU: UPDATE FULL TRANSAKSI SECARA SIMPEL TERPADU
// =======================================================
export const updateKreditFull = async (req, res) => {
  const { id } = req.params;
  const { tempo, status, statusPengambilan, totalHutang, sisaHutang } = req.body;
  try {
    const k = await prisma.kredit.findUnique({ where: { id: parseInt(id) }, include: { items: true } });
    if (!k) return res.status(404).json({ error: "Data tidak ditemukan." });

    // Sinkronisasi Stok Otomatis Jika Status Pengambilan Diubah Manual
    if (k.statusPengambilan !== statusPengambilan) {
      if (statusPengambilan === 'SUDAH') {
        for (const item of k.items) await prisma.product.update({ where: { id: item.productId }, data: { stok: { decrement: item.qty } } });
      } else if (statusPengambilan === 'BELUM') {
        for (const item of k.items) await prisma.product.update({ where: { id: item.productId }, data: { stok: { increment: item.qty } } });
      }
    }

    await prisma.kredit.update({
      where: { id: parseInt(id) },
      data: {
        tempo: tempo ? new Date(tempo) : null,
        status,
        statusPengambilan,
        totalHutang: parseFloat(totalHutang),
        sisaHutang: parseFloat(sisaHutang)
      }
    });

    res.json({ message: "Data Transaksi berhasil diperbarui keseluruhan!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// =======================================================
// FITUR BARU: UPDATE & DELETE ANGSURAN / PEMBAYARAN
// =======================================================
export const updatePembayaran = async (req, res) => {
  const { id } = req.params;
  const { nominal, buktiBayar } = req.body;
  try {
    const pLama = await prisma.pembayaran.findUnique({ where: { id: parseInt(id) }, include: { kredit: true } });
    if (!pLama) return res.status(404).json({ error: "Data pembayaran tidak ditemukan." });

    // Hitung selisih nominal baru vs lama untuk menyesuaikan ulang sisa hutang
    const selisih = parseFloat(nominal) - pLama.nominal;
    const sisaBaru = pLama.kredit.sisaHutang - selisih;

    await prisma.pembayaran.update({
      where: { id: parseInt(id) },
      data: { nominal: parseFloat(nominal), buktiBayar }
    });

    // Update ulang status dan sisa hutang pada tabel Kredit
    await prisma.kredit.update({
      where: { id: pLama.kreditId },
      data: { sisaHutang: sisaBaru < 0 ? 0 : sisaBaru, status: sisaBaru <= 0 ? 'LUNAS' : 'ACC' }
    });

    res.json({ message: "Pembayaran berhasil diperbarui!" });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deletePembayaran = async (req, res) => {
  try {
    const p = await prisma.pembayaran.findUnique({ where: { id: parseInt(req.params.id) }, include: { kredit: true } });
    if (!p) return res.status(404).json({ error: "Data pembayaran tidak ditemukan." });

    // Kembalikan sisa hutang seperti sebelum dibayar
    const sisaBaru = p.kredit.sisaHutang + p.nominal;

    await prisma.kredit.update({
      where: { id: p.kreditId },
      data: { sisaHutang: sisaBaru, status: sisaBaru > 0 ? 'ACC' : 'LUNAS' }
    });

    await prisma.pembayaran.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Pembayaran dihapus & sisa hutang dikembalikan." });
  } catch (error) { res.status(400).json({ error: error.message }); }
};