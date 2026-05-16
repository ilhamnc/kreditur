import { useState, useEffect } from 'react';
import axios from 'axios';
import { LogOut, User, Wallet, Gift, Clock, FileText, XCircle, Package, Receipt } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DebiturDashboard = ({ user, setToken }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // STATE UNTUK POP-UP DETAIL TRANSAKSI
  const [selectedTx, setSelectedTx] = useState(null);

  useEffect(() => {
    const fetchMyData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${baseURL}/api/kredit`, { headers: { Authorization: `Bearer ${token}` } });
        setData(res.data);
      } catch (error) {
        console.error("Gagal menarik data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMyData();
  }, []);

  const handleLogout = () => {
    if(window.confirm("Keluar dari akun Anda?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    }
  };

  // Kalkulasi Personal
  const totalHutang = data.reduce((sum, k) => sum + k.sisaHutang, 0);
  const totalCashback = data.reduce((sum, k) => sum + k.totalCashback, 0);

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-gray-400 animate-pulse text-sm">Menyiapkan Portal Anda...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-10">
      {/* HEADER COMPACT */}
      <header className="bg-blue-600 text-white p-3 md:p-6 shadow-md flex justify-between items-center sticky top-0 z-20">
        <div>
           <h1 className="text-base md:text-xl font-black flex items-center gap-1.5 md:gap-2"><User size={18} className="md:w-5 md:h-5"/> Hai, {user.nama || user.username}!</h1>
           <p className="text-[9px] md:text-xs font-bold text-blue-200 mt-0.5 md:mt-1 uppercase tracking-widest">Portal Pelanggan</p>
        </div>
        <button onClick={handleLogout} className="p-2 md:p-2.5 bg-white/20 hover:bg-white/30 rounded-lg md:rounded-xl transition-colors" title="Logout">
          <LogOut size={16} className="md:w-[18px] md:h-[18px]"/>
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-3 md:p-6 space-y-3 md:space-y-6 mt-2 md:mt-0">
        
        {/* KARTU RINGKASAN COMPACT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
           <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-red-100 flex items-center gap-3 md:gap-4">
             <div className="p-3 md:p-4 bg-red-100 text-red-600 rounded-xl md:rounded-2xl"><Wallet size={20} className="md:w-6 md:h-6"/></div>
             <div>
               <p className="text-[9px] md:text-xs font-black text-gray-400 uppercase tracking-widest">Tagihan Belum Dibayar</p>
               <h3 className="text-xl md:text-3xl font-black text-red-600 mt-0.5 md:mt-1">Rp {totalHutang.toLocaleString('id-ID')}</h3>
             </div>
           </div>
           
           <div className="bg-gradient-to-br from-green-500 to-green-600 p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-lg shadow-green-200 text-white flex items-center gap-3 md:gap-4">
             <div className="p-3 md:p-4 bg-white/20 rounded-xl md:rounded-2xl"><Gift size={20} className="md:w-6 md:h-6"/></div>
             <div>
               <p className="text-[9px] md:text-xs font-black text-green-100 uppercase tracking-widest">Total Cashback Anda</p>
               <h3 className="text-xl md:text-3xl font-black mt-0.5 md:mt-1">Rp {totalCashback.toLocaleString('id-ID')}</h3>
             </div>
           </div>
        </div>

        {/* RIWAYAT TRANSAKSI SAYA COMPACT */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
           <div className="p-3 md:p-6 border-b flex items-center gap-1.5 md:gap-2 bg-gray-50/50">
              <Clock size={16} className="text-blue-600 md:w-5 md:h-5"/>
              <h3 className="font-black text-gray-800 text-xs md:text-base">Riwayat Transaksi Saya</h3>
           </div>
           
           <div className="overflow-x-auto hide-scrollbar">
             <table className="w-full text-left whitespace-nowrap">
               <thead className="bg-gray-800 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider">
                 <tr>
                   <th className="p-2.5 md:p-4">Nota & Tanggal</th>
                   <th className="p-2.5 md:p-4">Status</th>
                   <th className="p-2.5 md:p-4">Sisa Tagihan</th>
                   <th className="p-2.5 md:p-4 text-center">Detail</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                 {data.length === 0 && <tr><td colSpan="4" className="p-6 md:p-8 text-center text-gray-400 font-bold text-xs md:text-sm">Belum ada riwayat transaksi.</td></tr>}
                 {data.map(k => (
                   <tr key={k.id} className="hover:bg-blue-50/50 transition-colors">
                     <td className="p-2.5 md:p-4">
                       <p className="font-black text-gray-800 text-[10px] md:text-sm">Nota #{k.id}</p>
                       <p className="text-[9px] md:text-[10px] font-bold text-gray-500 mt-0.5 md:mt-1">{new Date(k.tanggal).toLocaleDateString('id-ID')}</p>
                     </td>
                     <td className="p-2.5 md:p-4 flex flex-col gap-1 items-start mt-0.5 md:mt-0">
                        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[10px] font-black text-white ${k.status === 'ACC' ? 'bg-blue-500' : k.status === 'PENGAJUAN' ? 'bg-orange-500' : k.status === 'LUNAS' ? 'bg-green-500' : 'bg-red-500'}`}>{k.status}</span>
                        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded text-[8px] md:text-[10px] font-black ${k.statusPengambilan === 'SUDAH' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{k.statusPengambilan === 'SUDAH' ? 'DIAMBIL' : 'BELUM'}</span>
                     </td>
                     <td className="p-2.5 md:p-4">
                       {k.sisaHutang > 0 
                         ? <span className="font-black text-red-600 text-[10px] md:text-sm">Rp {k.sisaHutang.toLocaleString('id-ID')}</span> 
                         : <span className="font-black text-green-600 text-[10px] md:text-sm">LUNAS</span>}
                     </td>
                     <td className="p-2.5 md:p-4 text-center">
                        <button onClick={() => setSelectedTx(k)} className="inline-flex items-center justify-center p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors shadow-sm" title="Lihat Detail Transaksi">
                          <FileText size={14} className="md:w-[18px] md:h-[18px]"/>
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </div>

      </main>

      {/* POP-UP MODAL DETAIL TRANSAKSI COMPACT */}
      {selectedTx && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-2xl max-h-[95vh] md:max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            
            {/* Header Modal */}
            <div className="bg-gray-50 p-3 md:p-6 border-b flex justify-between items-center shrink-0">
               <h2 className="text-sm md:text-xl font-black text-gray-800 flex items-center gap-1.5 md:gap-2"><Receipt size={16} className="text-blue-600 md:w-5 md:h-5"/> Rincian Nota #{selectedTx.id}</h2>
               <button onClick={() => setSelectedTx(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                 <XCircle size={20} className="md:w-6 md:h-6"/>
               </button>
            </div>

            {/* Konten Scrollable */}
            <div className="p-3 md:p-6 overflow-y-auto space-y-4 md:space-y-6">
               
               {/* Informasi Utama */}
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 bg-blue-50/50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-blue-100">
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Tanggal</p>
                    <p className="text-[10px] md:text-sm font-bold text-gray-800 mt-0.5 md:mt-1">{new Date(selectedTx.tanggal).toLocaleDateString('id-ID')}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Jatuh Tempo</p>
                    <p className={`text-[10px] md:text-sm font-bold mt-0.5 md:mt-1 ${selectedTx.tempo ? 'text-red-500' : 'text-gray-800'}`}>{selectedTx.tempo ? new Date(selectedTx.tempo).toLocaleDateString('id-ID') : 'Tidak ada'}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Status Nota</p>
                    <p className="text-[10px] md:text-sm font-black text-blue-600 mt-0.5 md:mt-1">{selectedTx.status}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase">Fisik Barang</p>
                    <p className="text-[10px] md:text-sm font-bold text-gray-800 mt-0.5 md:mt-1">{selectedTx.statusPengambilan === 'SUDAH' ? 'Sudah Diambil' : 'Belum Diambil'}</p>
                  </div>
               </div>

               {/* Daftar Barang */}
               <div>
                 <h3 className="font-black text-gray-800 mb-2 md:mb-3 text-xs md:text-base flex items-center gap-1.5 md:gap-2"><Package size={14} className="md:w-4 md:h-4"/> Daftar Barang</h3>
                 <div className="space-y-1.5 md:space-y-2">
                   {selectedTx.items.map((item, idx) => (
                     <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-lg md:rounded-xl border border-gray-100 text-[10px] md:text-sm">
                       <div>
                         <p className="font-bold text-gray-800">{item.product?.nama || 'Barang'}</p>
                         <p className="text-[9px] md:text-[10px] font-bold text-blue-600 mt-0.5">{item.qty} x Rp {item.hargaJual.toLocaleString('id-ID')}</p>
                         {item.cashback > 0 && <p className="text-[9px] md:text-[10px] font-black text-green-600 mt-0.5">+ Cashback Rp {(item.cashback * item.qty).toLocaleString('id-ID')}</p>}
                       </div>
                       <p className="font-black text-gray-800">Rp {item.subtotal.toLocaleString('id-ID')}</p>
                     </div>
                   ))}
                 </div>
               </div>

               {/* Total Kalkulasi */}
               <div className="bg-gray-800 text-white p-3 md:p-4 rounded-xl md:rounded-2xl">
                  <div className="flex justify-between text-[10px] md:text-sm font-bold border-b border-gray-600 pb-1.5 md:pb-2 mb-1.5 md:mb-2">
                    <span className="text-gray-300">Total Keseluruhan</span>
                    <span>Rp {selectedTx.totalHutang.toLocaleString('id-ID')}</span>
                  </div>
                  {selectedTx.totalCashback > 0 && (
                    <div className="flex justify-between text-[10px] md:text-sm font-bold border-b border-gray-600 pb-1.5 md:pb-2 mb-1.5 md:mb-2">
                      <span className="text-green-400">Total Cashback Anda</span>
                      <span className="text-green-400">Rp {selectedTx.totalCashback.toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs md:text-lg font-black mt-1.5 md:mt-2">
                    <span className={selectedTx.sisaHutang > 0 ? "text-red-400" : "text-green-400"}>SISA TAGIHAN</span>
                    <span className={selectedTx.sisaHutang > 0 ? "text-red-400" : "text-green-400"}>Rp {selectedTx.sisaHutang.toLocaleString('id-ID')}</span>
                  </div>
               </div>

               {/* Riwayat Angsuran */}
               <div>
                 <h3 className="font-black text-gray-800 mb-2 md:mb-3 text-xs md:text-base flex items-center gap-1.5 md:gap-2"><Wallet size={14} className="md:w-4 md:h-4"/> Riwayat Pembayaran Anda</h3>
                 <div className="space-y-1.5 md:space-y-2">
                   {!selectedTx.pembayaran || selectedTx.pembayaran.length === 0 ? (
                     <p className="text-center text-[10px] md:text-xs font-bold text-gray-400 py-3 md:py-4 bg-gray-50 rounded-lg md:rounded-xl border border-dashed">Belum ada riwayat pembayaran.</p>
                   ) : (
                     selectedTx.pembayaran.map((p, idx) => (
                       <div key={idx} className="flex justify-between items-center bg-green-50/50 p-2 md:p-3 rounded-lg md:rounded-xl border border-green-100">
                         <div>
                           <p className="font-black text-green-700 text-[10px] md:text-sm">Rp {p.nominal.toLocaleString('id-ID')}</p>
                           <p className="text-[8px] md:text-[10px] font-bold text-gray-500 mt-0.5">{new Date(p.tanggal).toLocaleDateString('id-ID')} (Oleh: {p.diterimaOleh})</p>
                         </div>
                         {p.buktiBayar ? (
                           <a href={p.buktiBayar} target="_blank" rel="noreferrer" className="text-[8px] md:text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg hover:bg-blue-200">Lihat Bukti</a>
                         ) : (
                           <span className="text-[8px] md:text-[10px] text-gray-400 font-bold bg-white border px-1.5 py-0.5 md:px-2 md:py-1 rounded-md">Tanpa Link</span>
                         )}
                       </div>
                     ))
                   )}
                 </div>
               </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DebiturDashboard;