import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const SECRET = process.env.JWT_SECRET || 'rahasia-kredit-123';

export const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { username }, include: { debiturProfile: true } });
    if (!user) return res.status(404).json({ error: "Akun tidak ditemukan" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Password salah" });

    const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, nama: user.debiturProfile?.namaLengkap || user.username } });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const gantiPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "Password lama salah" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    res.json({ message: "Password berhasil diubah!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
};