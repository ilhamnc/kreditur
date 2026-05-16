import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const getProducts = async (req, res) => {
  try {
    const data = await prisma.product.findMany();
    res.json(data);
  } catch (error) { res.status(500).json({ error: error.message }); }
};

export const upsertProduct = async (req, res) => {
  const { id, nama, hargaKulakan, hargaJual, stok, cashback } = req.body;
  try {
    let result;
    if (id) {
      result = await prisma.product.update({ where: { id }, data: { nama, hargaKulakan: parseFloat(hargaKulakan), hargaJual: parseFloat(hargaJual), stok: parseInt(stok), cashback: parseFloat(cashback||0) } });
    } else {
      result = await prisma.product.create({ data: { nama, hargaKulakan: parseFloat(hargaKulakan), hargaJual: parseFloat(hargaJual), stok: parseInt(stok), cashback: parseFloat(cashback||0) } });
    }
    res.json(result);
  } catch (error) { res.status(400).json({ error: error.message }); }
};