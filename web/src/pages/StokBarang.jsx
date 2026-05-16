import { useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, PlusCircle, Edit, Trash2, PackagePlus, XCircle } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatRpInput = (angka) => {
  if (!angka) return '';
  return angka.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRpInput = (text) => text.toString().replace(/[^0-9]/g, '');

const StokBarang = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ id: '', nama: '', hargaKulakan: '', hargaJual: '', stok: '', cashback: '' });

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${baseURL}/api/products`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setProducts(res.data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      hargaKulakan: parseInt(form.hargaKulakan || 0),
      hargaJual: parseInt(form.hargaJual || 0),
      cashback: parseInt(form.cashback || 0),
      stok: parseInt(form.stok || 0)
    };

    try {
      await axios.post(`${baseURL}/api/products`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setForm({ id: '', nama: '', hargaKulakan: '', hargaJual: '', stok: '', cashback: '' });
      setIsModalOpen(false); fetchProducts(); alert("✅ Barang tersimpan!");
    } catch (err) { alert("❌ Gagal menyimpan barang"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus produk ini permanen?")) return;
    try {
      await axios.delete(`${baseURL}/api/products/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchProducts();
    } catch (err) { alert("❌ Gagal. Barang mungkin sedang dipakai di transaksi."); }
  };

  const handleEdit = (p) => { setForm({ ...p, hargaKulakan: p.hargaKulakan.toString(), hargaJual: p.hargaJual.toString(), cashback: p.cashback.toString(), stok: p.stok.toString() }); setIsModalOpen(true); };

  const handleRestock = async (p) => {
    const qtyStr = window.prompt(`[ BARANG MASUK ]\nStok Saat Ini: ${p.stok}\nMasukkan tambahan stok:`);
    if (!qtyStr) return;
    const qty = parseInt(qtyStr);
    if (isNaN(qty) || qty <= 0) return alert("❌ Jumlah tidak valid!");
    
    const totalModal = qty * p.hargaKulakan;
    const masukBukuKas = window.confirm(`Uang keluar Rp ${totalModal.toLocaleString()}.\nCatat di Buku Kas Pengeluaran?`);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${baseURL}/api/products`, { ...p, stok: p.stok + qty }, { headers: { Authorization: `Bearer ${token}` } });
      if (masukBukuKas) await axios.post(`${baseURL}/api/keuangan/manual`, { tipe: 'PENGELUARAN', keterangan: `Restock: ${p.nama} (x${qty})`, nominal: totalModal }, { headers: { Authorization: `Bearer ${token}` } });
      fetchProducts();
    } catch (err) { alert("❌ Gagal memproses."); }
  };

  const filtered = products.filter(p => p.nama.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3"><div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-xl"><Package size={20}/></div><div><h2 className="text-lg md:text-xl font-black">Stok Barang</h2></div></div>
        <div className="flex gap-2 w-full md:w-auto">
           <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input className="w-full pl-9 pr-4 py-2 rounded-xl border-2 outline-none font-bold text-xs md:text-sm" placeholder="Cari barang..." onChange={e => setSearchTerm(e.target.value)} /></div>
           <button onClick={()=>{setForm({id:'', nama:'', hargaKulakan:'', hargaJual:'', stok:'', cashback:''}); setIsModalOpen(true);}} className="bg-blue-600 text-white px-3 md:px-4 py-2 rounded-xl font-black hover:bg-blue-700 whitespace-nowrap flex items-center gap-1.5 text-xs md:text-sm"><PlusCircle size={16}/> Tambah</button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b">
              <tr><th className="p-3 md:p-4">Nama Produk</th><th className="p-3 md:p-4 text-center">Stok</th><th className="p-3 md:p-4">Harga & Cashback</th><th className="p-3 md:p-4 text-center">Aksi</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-blue-50/50">
                  <td className="p-3 md:p-4"><p className="font-black text-xs md:text-sm">{p.nama}</p><p className="text-[10px] text-gray-400">#{p.id}</p></td>
                  <td className="p-3 md:p-4 text-center"><span className={`px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg text-[10px] md:text-xs font-black ${p.stok > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.stok}</span></td>
                  <td className="p-3 md:p-4">
                    <p className="font-bold text-gray-500 text-[10px] md:text-xs">Beli: Rp {p.hargaKulakan.toLocaleString()}</p>
                    <p className="font-black text-blue-600 text-xs md:text-sm">Jual: Rp {p.hargaJual.toLocaleString()}</p>
                    {p.cashback > 0 && <p className="font-bold text-green-600 text-[10px]">Cashback: Rp {p.cashback.toLocaleString()}</p>}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex gap-1.5 justify-center">
                      <button onClick={()=>handleRestock(p)} className="text-[10px] md:text-xs bg-green-100 text-green-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-green-200"><PackagePlus size={14}/> +Stok</button>
                      <button onClick={()=>handleEdit(p)} className="text-[10px] md:text-xs bg-yellow-100 text-yellow-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-yellow-200"><Edit size={14}/> Edit</button>
                      <button onClick={()=>handleDelete(p.id)} className="text-[10px] md:text-xs bg-red-100 text-red-700 px-2 md:px-3 py-1.5 md:py-2 rounded-lg font-bold flex items-center gap-1 hover:bg-red-200"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="bg-gray-50 p-4 md:p-5 border-b flex justify-between items-center shrink-0"><h3 className="font-black text-sm md:text-base">{form.id ? 'Edit Barang' : 'Tambah Barang'}</h3><button onClick={()=>setIsModalOpen(false)}><XCircle size={20} className="text-gray-400"/></button></div>
            <div className="overflow-y-auto p-4 md:p-5">
              <form onSubmit={handleSave} className="space-y-4">
                <div><label className="text-[10px] font-black text-gray-400 uppercase">Nama Barang</label><input required className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none" value={form.nama} onChange={e=>setForm({...form, nama: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Harga Modal (Rp)</label>
                    <input required type="text" inputMode="numeric" className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none" value={formatRpInput(form.hargaKulakan)} onChange={e=>setForm({...form, hargaKulakan: parseRpInput(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Harga Jual (Rp)</label>
                    <input required type="text" inputMode="numeric" className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none" value={formatRpInput(form.hargaJual)} onChange={e=>setForm({...form, hargaJual: parseRpInput(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Cashback (Rp)</label>
                    <input type="text" inputMode="numeric" className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold mt-1 bg-green-50 outline-none" value={formatRpInput(form.cashback)} onChange={e=>setForm({...form, cashback: parseRpInput(e.target.value)})} placeholder="Opsional"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase">Stok Gudang</label>
                    <input required type="text" inputMode="numeric" className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none" value={formatRpInput(form.stok)} onChange={e=>setForm({...form, stok: parseRpInput(e.target.value)})} />
                  </div>
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white py-3 md:py-3.5 rounded-xl font-black mt-2 md:mt-4 text-xs md:text-sm shadow-lg">Simpan Data</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StokBarang;