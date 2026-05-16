import { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowDownRight, ArrowUpRight, PlusCircle, Wallet, Edit, Trash2, XCircle, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// HELPER FORMAT RIBUAN
const formatRpInput = (angka) => {
  if (!angka) return '';
  return angka.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRpInput = (text) => text.toString().replace(/[^0-9]/g, '');

const Keuangan = () => {
  const [kas, setKas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formKas, setFormKas] = useState({ id: null, tipe: 'PENGELUARAN', keterangan: '', nominal: '' });
  
  const [activeTab, setActiveTab] = useState('SEMUA');

  useEffect(() => { fetchKas(); }, []);
  const fetchKas = async () => {
    const res = await axios.get(`${baseURL}/api/keuangan`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setKas(res.data);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const payload = { ...formKas, nominal: parseInt(formKas.nominal || 0) };

    try {
      if (formKas.id) await axios.put(`${baseURL}/api/keuangan/${formKas.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      else await axios.post(`${baseURL}/api/keuangan/manual`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setIsModalOpen(false); fetchKas(); alert("✅ Berhasil disimpan!");
    } catch (err) { alert("❌ Gagal menyimpan"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Hapus catatan kas ini secara permanen?")) return;
    await axios.delete(`${baseURL}/api/keuangan/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchKas();
  };

  const totalPemasukan = kas.filter(k => k.tipe === 'PEMASUKAN').reduce((sum, k) => sum + k.nominal, 0);
  const totalPengeluaran = kas.filter(k => k.tipe === 'PENGELUARAN').reduce((sum, k) => sum + k.nominal, 0);
  const saldoAkhir = totalPemasukan - totalPengeluaran;
  const displayedKas = kas.filter(k => activeTab === 'SEMUA' || k.tipe === activeTab);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-4 bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border">
        <div className="flex items-center gap-3 w-full md:w-auto">
           <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl"><Wallet size={20} className="md:w-6 md:h-6"/></div>
           <div><h2 className="text-lg md:text-xl font-black">Buku Kas & Keuangan</h2><p className="text-[10px] md:text-xs font-bold text-gray-500 hidden md:block">Pemantauan arus kas sistem</p></div>
        </div>
        <button onClick={()=>{setFormKas({id: null, tipe: 'PENGELUARAN', keterangan: '', nominal: ''}); setIsModalOpen(true);}} className="w-full md:w-auto bg-blue-600 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl md:rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-blue-700 text-sm md:text-base transition-transform active:scale-95"><PlusCircle size={18}/> Catat Kas Manual</button>
      </div>

      {/* KARTU RINGKASAN: Grid responsif, di HP jadi 2 kolom atas, 1 bawah. Di Laptop 3 kolom berjajar */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
         <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="p-2 md:p-4 bg-green-100 text-green-600 rounded-lg md:rounded-full"><TrendingUp size={18} className="md:w-6 md:h-6"/></div>
            <div><p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pemasukan</p><h3 className="text-sm md:text-xl font-black text-gray-800 mt-0.5 md:mt-0">Rp {totalPemasukan.toLocaleString()}</h3></div>
         </div>
         <div className="bg-white p-3 md:p-5 rounded-xl md:rounded-2xl border shadow-sm flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
            <div className="p-2 md:p-4 bg-red-100 text-red-600 rounded-lg md:rounded-full"><TrendingDown size={18} className="md:w-6 md:h-6"/></div>
            <div><p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Pengeluaran</p><h3 className="text-sm md:text-xl font-black text-gray-800 mt-0.5 md:mt-0">Rp {totalPengeluaran.toLocaleString()}</h3></div>
         </div>
         <div className="col-span-2 md:col-span-1 bg-blue-600 text-white p-4 md:p-5 rounded-xl md:rounded-2xl border border-blue-500 shadow-lg flex items-center gap-3 md:gap-4">
            <div className="p-3 md:p-4 bg-white/20 rounded-full"><DollarSign size={20} className="md:w-6 md:h-6"/></div>
            <div><p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Saldo Akhir Kas</p><h3 className="text-xl md:text-2xl font-black mt-0.5 md:mt-0">Rp {saldoAkhir.toLocaleString()}</h3></div>
         </div>
      </div>
        
      {/* TABEL RIWAYAT */}
      <div className="bg-white rounded-xl md:rounded-2xl border overflow-hidden shadow-sm">
        <div className="flex border-b overflow-x-auto hide-scrollbar">
           <button onClick={()=>setActiveTab('SEMUA')} className={`flex-1 min-w-[110px] md:min-w-0 py-3 md:py-4 font-black text-xs md:text-sm transition-colors ${activeTab === 'SEMUA' ? 'border-b-4 border-blue-600 text-blue-600 bg-blue-50/50' : 'text-gray-400 hover:bg-gray-50'}`}>Semua Riwayat</button>
           <button onClick={()=>setActiveTab('PEMASUKAN')} className={`flex-1 min-w-[110px] md:min-w-0 py-3 md:py-4 font-black text-xs md:text-sm transition-colors ${activeTab === 'PEMASUKAN' ? 'border-b-4 border-green-500 text-green-600 bg-green-50/50' : 'text-gray-400 hover:bg-gray-50'}`}>Pemasukan Saja</button>
           <button onClick={()=>setActiveTab('PENGELUARAN')} className={`flex-1 min-w-[110px] md:min-w-0 py-3 md:py-4 font-black text-xs md:text-sm transition-colors ${activeTab === 'PENGELUARAN' ? 'border-b-4 border-red-500 text-red-600 bg-red-50/50' : 'text-gray-400 hover:bg-gray-50'}`}>Pengeluaran Saja</button>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left whitespace-nowrap">
             <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase border-b"><tr><th className="p-3 md:p-4">Tanggal & Waktu</th><th className="p-3 md:p-4">Keterangan Transaksi</th><th className="p-3 md:p-4 text-right">Nominal Uang</th><th className="p-3 md:p-4 text-center">Manajemen</th></tr></thead>
             <tbody className="divide-y divide-gray-50">
               {displayedKas.length === 0 && <tr><td colSpan="4" className="p-6 md:p-10 text-center text-gray-400 font-bold text-xs md:text-sm">Tidak ada data di kategori ini.</td></tr>}
               {displayedKas.map(k => (
                 <tr key={k.id} className="hover:bg-blue-50/50 transition-colors">
                   <td className="p-3 md:p-4 text-[10px] md:text-xs font-bold text-gray-500">{new Date(k.tanggal).toLocaleString('id-ID')}</td>
                   <td className="p-3 md:p-4 font-bold text-xs md:text-sm flex gap-1.5 md:gap-2 items-center">{k.tipe === 'PEMASUKAN' ? <ArrowDownRight size={16} className="text-green-500"/> : <ArrowUpRight size={16} className="text-red-500"/>}{k.keterangan}</td>
                   <td className={`p-3 md:p-4 text-right font-black text-sm md:text-lg ${k.tipe === 'PEMASUKAN' ? 'text-green-600' : 'text-red-600'}`}>{k.tipe === 'PEMASUKAN' ? '+' : '-'} Rp {k.nominal.toLocaleString()}</td>
                   <td className="p-3 md:p-4 text-center">
                     <div className="flex justify-center gap-1.5 md:gap-2">
                       <button onClick={()=>{setFormKas({...k, nominal: k.nominal.toString()}); setIsModalOpen(true);}} className="p-1.5 md:p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"><Edit size={14} className="md:w-4 md:h-4"/></button>
                       <button onClick={()=>handleDelete(k.id)} className="p-1.5 md:p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"><Trash2 size={14} className="md:w-4 md:h-4"/></button>
                     </div>
                   </td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 p-4 md:p-6 border-b flex justify-between items-center shrink-0">
               <h3 className="font-black text-sm md:text-lg">{formKas.id ? 'Edit Data Kas' : 'Catat Kas Manual'}</h3>
               <button onClick={()=>setIsModalOpen(false)}><XCircle className="text-gray-400 hover:text-red-500 w-5 h-5 md:w-6 md:h-6"/></button>
            </div>
            <div className="overflow-y-auto p-4 md:p-6">
               <form onSubmit={handleSimpan} className="space-y-4">
                 <div className="flex gap-1.5 md:gap-2 bg-gray-100 p-1.5 rounded-xl mb-4 md:mb-6">
                   <button type="button" onClick={()=>setFormKas({...formKas, tipe:'PENGELUARAN'})} className={`flex-1 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all ${formKas.tipe==='PENGELUARAN'?'bg-red-500 text-white shadow':'text-gray-500 hover:bg-gray-200'}`}>Pengeluaran</button>
                   <button type="button" onClick={()=>setFormKas({...formKas, tipe:'PEMASUKAN'})} className={`flex-1 py-2 md:py-2.5 rounded-lg font-bold text-xs md:text-sm transition-all ${formKas.tipe==='PEMASUKAN'?'bg-green-500 text-white shadow':'text-gray-500 hover:bg-gray-200'}`}>Pemasukan</button>
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Keterangan Transaksi</label>
                   <input required className="w-full border-2 p-2.5 md:p-3 rounded-xl font-bold mt-1 outline-none focus:border-blue-500 text-xs md:text-sm" value={formKas.keterangan} onChange={e=>setFormKas({...formKas, keterangan: e.target.value})} placeholder="Contoh: Bayar Listrik, Pemasukan Toko..." />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Nominal (Rp)</label>
                   <input required type="text" inputMode="numeric" className="w-full border-2 p-2.5 md:p-3 rounded-xl font-black mt-1 outline-none focus:border-blue-500 text-sm md:text-lg" value={formatRpInput(formKas.nominal)} onChange={e=>setFormKas({...formKas, nominal: parseRpInput(e.target.value)})} placeholder="0" />
                 </div>
                 <button type="submit" className={`w-full py-3 md:py-4 mt-2 md:mt-4 rounded-xl font-black text-white shadow-lg text-sm md:text-base transition-transform active:scale-95 ${formKas.tipe==='PEMASUKAN'?'bg-green-500 hover:bg-green-600 shadow-green-100':'bg-red-500 hover:bg-red-600 shadow-red-100'}`}>Simpan Transaksi {formKas.tipe === 'PEMASUKAN' ? 'Masuk' : 'Keluar'}</button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Keuangan;