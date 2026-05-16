import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// KARYAWAN CONTROL
// ==========================================
export const getKaryawan = async (req, res) => {
  try {
    const data = await prisma.user.findMany({ where: { role: 'KARYAWAN' }, select: { id: true, username: true, createdAt: true } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const createKaryawan = async (req, res) => {
  const { username, password } = req.body;
  try {
    const exist = await prisma.user.findUnique({ where: { username } });
    if(exist) return res.status(400).json({ error: "Username sudah dipakai oleh pengguna lain!" });
    
    const hashed = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { username, password: hashed, role: 'KARYAWAN' } });
    res.status(201).json({ message: "Karyawan berhasil ditambahkan!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// FITUR BARU: UPDATE KARYAWAN
export const updateKaryawan = async (req, res) => {
  const { id } = req.params;
  const { username, password } = req.body;
  try {
    const dataUpdate = { username };
    // Jika password diisi, maka update passwordnya juga
    if (password && password.trim() !== '') {
      dataUpdate.password = await bcrypt.hash(password, 10);
    }
    
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: dataUpdate
    });
    res.json({ message: "Data Karyawan berhasil diperbarui!" });
  } catch (error) { res.status(400).json({ error: "Username mungkin sudah dipakai." }); }
};

export const deleteKaryawan = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Karyawan dihapus." });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

// ==========================================
// DEBITUR (PELANGGAN) CONTROL FULL CRUD
// ==========================================
export const createDebitur = async (req, res) => {
  const { username, password, namaLengkap, noHp, alamat, usia, jenisKelamin, catatan } = req.body;
  try {
    const uname = username || noHp;
    const exist = await prisma.user.findUnique({ where: { username: uname } });
    if (exist) return res.status(400).json({ error: "Username atau No HP sudah terdaftar di sistem." });

    const hashed = await bcrypt.hash(password || '123456', 10);
    await prisma.user.create({
      data: {
        username: uname, password: hashed, role: 'DEBITUR',
        debiturProfile: { create: { namaLengkap, noHp, alamat, usia: parseInt(usia||0), jenisKelamin, catatan } }
      }
    });
    res.json({ message: "Pelanggan baru berhasil ditambahkan!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const updateDebitur = async (req, res) => {
  const { id } = req.params; 
  const { username, namaLengkap, noHp, alamat, usia, jenisKelamin, catatan } = req.body;
  
  try {
    const debitur = await prisma.debitur.findUnique({ where: { id: parseInt(id) } });

    // 1. Update Profil Fisik
    await prisma.debitur.update({
      where: { id: parseInt(id) },
      data: { namaLengkap, noHp, alamat, usia: parseInt(usia||0), jenisKelamin, catatan }
    });

    // 2. Update Username Login (Jika diganti)
    if (username && username.trim() !== '') {
       const checkUser = await prisma.user.findUnique({ where: { username } });
       if (checkUser && checkUser.id !== debitur.userId) {
         return res.status(400).json({ error: "Username sudah dipakai oleh orang lain." });
       }
       await prisma.user.update({
         where: { id: debitur.userId },
         data: { username }
       });
    }

    res.json({ message: "Data pelanggan & username berhasil diperbarui!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const deleteDebitur = async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: parseInt(req.params.userId) } });
    res.json({ message: "Data dihapus." });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const resetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: parseInt(userId) }, data: { password: hashed } });
    res.json({ message: "Password di-reset!" });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

// ==========================================
// PRODUK CONTROL
// ==========================================
export const deleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: "Produk dihapus." });
  } catch (error) { res.status(400).json({ error: "Gagal menghapus." }); }
};