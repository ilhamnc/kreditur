import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getBukuKas = async (req, res) => {
  try {
    const data = await prisma.keuangan.findMany({ orderBy: { tanggal: 'desc' } });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const addKasManual = async (req, res) => {
  const { tipe, keterangan, nominal } = req.body; 
  try {
    const tx = await prisma.keuangan.create({
      data: { tipe, keterangan, nominal: parseFloat(nominal) }
    });
    res.json({ message: `Data ${tipe} berhasil dicatat!`, data: tx });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

// ==========================================
// FITUR BARU: EDIT & HAPUS KAS
// ==========================================
export const updateKas = async (req, res) => {
  const { id } = req.params;
  const { tipe, keterangan, nominal } = req.body;
  try {
    const tx = await prisma.keuangan.update({
      where: { id: parseInt(id) },
      data: { tipe, keterangan, nominal: parseFloat(nominal) }
    });
    res.json({ message: "Data kas berhasil diperbarui!", data: tx });
  } catch (error) { res.status(400).json({ error: error.message }); }
};

export const deleteKas = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.keuangan.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Data kas berhasil dihapus!" });
  } catch (error) { res.status(400).json({ error: error.message }); }
};