import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { verifyToken, isStaff, isOwner } from './middleware/authMiddleware.js';
import { login, gantiPassword } from './controllers/authController.js';
import { createKredit, bayarAngsuran, getKreditList, deleteKredit, updateKreditFull, updatePembayaran, deletePembayaran } from './controllers/kreditController.js';
import { getDashboardStats, getDebiturList } from './controllers/dashboardController.js';
import { getProducts, upsertProduct } from './controllers/productController.js';
import { getBukuKas, addKasManual, updateKas, deleteKas } from './controllers/keuanganController.js';
import { getKaryawan, createKaryawan, updateKaryawan, deleteKaryawan, createDebitur, updateDebitur, deleteDebitur, resetPassword, deleteProduct } from './controllers/adminController.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

app.post('/api/auth/login', login);
app.put('/api/auth/ganti-password', verifyToken, gantiPassword);

app.get('/api/dashboard/stats', verifyToken, isStaff, getDashboardStats);
app.get('/api/debitur', verifyToken, isStaff, getDebiturList);

// RUTE TRANSAKSI KREDIT YANG SUDAH DISEDERHANAKAN
app.get('/api/kredit', verifyToken, getKreditList); 
app.post('/api/kredit', verifyToken, isStaff, createKredit);
app.post('/api/kredit/bayar', verifyToken, isStaff, bayarAngsuran);
app.delete('/api/kredit/:id', verifyToken, isOwner, deleteKredit);
app.put('/api/kredit/:id/full', verifyToken, isOwner, updateKreditFull);
app.put('/api/kredit/bayar/:id', verifyToken, isStaff, updatePembayaran);
app.delete('/api/kredit/bayar/:id', verifyToken, isOwner, deletePembayaran);

app.get('/api/products', verifyToken, isStaff, getProducts);
app.post('/api/products', verifyToken, isStaff, upsertProduct);
app.delete('/api/products/:id', verifyToken, isStaff, deleteProduct);

app.get('/api/keuangan', verifyToken, isStaff, getBukuKas);
app.post('/api/keuangan/manual', verifyToken, isStaff, addKasManual);
app.put('/api/keuangan/:id', verifyToken, isStaff, updateKas);
app.delete('/api/keuangan/:id', verifyToken, isStaff, deleteKas);

app.get('/api/karyawan', verifyToken, isOwner, getKaryawan);
app.post('/api/karyawan', verifyToken, isOwner, createKaryawan);
app.put('/api/karyawan/:id', verifyToken, isOwner, updateKaryawan);
app.delete('/api/karyawan/:id', verifyToken, isOwner, deleteKaryawan);

app.post('/api/debitur', verifyToken, isStaff, createDebitur);
app.put('/api/debitur/reset-password', verifyToken, isStaff, resetPassword);
app.put('/api/debitur/:id', verifyToken, isStaff, updateDebitur); 
app.delete('/api/debitur/:userId', verifyToken, isStaff, deleteDebitur);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Backend KREDITUR menyala di port ${PORT}`));