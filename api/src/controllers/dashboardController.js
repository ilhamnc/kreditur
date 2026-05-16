import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getDashboardStats = async (req, res) => {
  try {
    const kredits = await prisma.kredit.findMany({ where: { status: { in: ['ACC', 'LUNAS'] } } });
    let totalHutangKeseluruhan = 0; let totalSisaHutangKeseluruhan = 0; let totalLabaBersih = 0;

    kredits.forEach(k => {
      totalHutangKeseluruhan += k.totalHutang;
      totalSisaHutangKeseluruhan += k.sisaHutang;
      totalLabaBersih += k.totalProfit;
    });

    res.json({ totalHutangKeseluruhan, totalSisaHutangKeseluruhan, totalLabaBersih });
  } catch (error) { res.status(500).json({ error: error.message }); }
};

// INI YANG KITA PERBAIKI
export const getDebiturList = async (req, res) => {
  try {
    const data = await prisma.debitur.findMany({
      include: { 
        kredits: true, // Pastikan riwayat kredit dikirim
        user: { select: { username: true } } // Pastikan username dikirim
      },
      orderBy: { id: 'desc' }
    });
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};