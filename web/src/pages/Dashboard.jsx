import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Dashboard = ({ setActiveTab }) => {
  const [stats, setStats] = useState({ totalHutangKeseluruhan: 0, totalSisaHutangKeseluruhan: 0, totalLabaBersih: 0 });
  const [recentTx, setRecentTx] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const resStats = await axios.get(`${baseURL}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(resStats.data);
        const resTx = await axios.get(`${baseURL}/api/kredit`, { headers: { Authorization: `Bearer ${token}` } });
        setRecentTx(resTx.data.slice(0, 5));
      } catch (error) { console.error("Gagal memuat data", error); } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Memuat...</div>;

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
        <div className="bg-blue-600 p-3 md:p-4 rounded-xl text-white shadow flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-blue-200 uppercase tracking-wider mb-0.5">Total Hutang Beredar</p>
            <h3 className="text-xl md:text-2xl font-black">Rp {stats.totalHutangKeseluruhan.toLocaleString('id-ID')}</h3>
          </div>
          <Users size={60} className="absolute -bottom-2 -right-2 text-blue-500 opacity-50" />
        </div>
        <div className="bg-orange-500 p-3 md:p-4 rounded-xl text-white shadow flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-orange-200 uppercase tracking-wider mb-0.5">Sisa Hutang (Belum Lunas)</p>
            <h3 className="text-xl md:text-2xl font-black">Rp {stats.totalSisaHutangKeseluruhan.toLocaleString('id-ID')}</h3>
          </div>
          <Wallet size={60} className="absolute -bottom-2 -right-2 text-orange-400 opacity-50" />
        </div>
        <div className="bg-green-500 p-3 md:p-4 rounded-xl text-white shadow flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] font-bold text-green-200 uppercase tracking-wider mb-0.5">Total Laba Bersih</p>
            <h3 className="text-xl md:text-2xl font-black">Rp {stats.totalLabaBersih.toLocaleString('id-ID')}</h3>
          </div>
          <TrendingUp size={60} className="absolute -bottom-2 -right-2 text-green-400 opacity-50" />
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-3 md:p-4 border-b flex justify-between items-center bg-gray-50/50">
           <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-xs md:text-sm"><Clock size={14} className="text-blue-600"/> 5 Transaksi Terakhir</h3>
           <button onClick={() => setActiveTab('rekap')} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline">Lihat Semua <ArrowRight size={10}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-800 text-white text-[9px] md:text-[10px] font-black uppercase">
              <tr><th className="p-2 md:p-3">Tanggal</th><th className="p-2 md:p-3">Pelanggan</th><th className="p-2 md:p-3">Total</th><th className="p-2 md:p-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTx.map(tx => (
                <tr key={tx.id} className="hover:bg-blue-50/50">
                  <td className="p-2 md:p-3 text-[10px] md:text-xs font-bold text-gray-600">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="p-2 md:p-3 text-[10px] md:text-xs font-black text-gray-800">{tx.debitur?.namaLengkap}</td>
                  <td className="p-2 md:p-3 text-[10px] md:text-xs font-black text-blue-600">Rp {tx.totalHutang.toLocaleString('id-ID')}</td>
                  <td className="p-2 md:p-3"><span className={`px-1.5 py-0.5 rounded text-[9px] font-black text-white ${tx.status === 'ACC' ? 'bg-blue-500' : tx.status === 'PENGAJUAN' ? 'bg-orange-500' : tx.status === 'LUNAS' ? 'bg-green-500' : 'bg-red-500'}`}>{tx.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;