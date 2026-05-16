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
        // Ambil Data Stats
        const resStats = await axios.get(`${baseURL}/api/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } });
        setStats(resStats.data);
        
        // Ambil Data Transaksi Terbaru (Limit 5)
        const resTx = await axios.get(`${baseURL}/api/kredit`, { headers: { Authorization: `Bearer ${token}` } });
        setRecentTx(resTx.data.slice(0, 5)); // Ambil 5 teratas
      } catch (error) {
        console.error("Gagal memuat data dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatRp = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n || 0);

  if (loading) return <div className="p-10 text-center font-bold text-gray-400 animate-pulse">Memuat data analitik...</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800">Ringkasan Finansial</h2>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1 uppercase tracking-wider">Kalkulasi sistem KREDITUR terpadu</p>
        </div>
      </div>

      {/* KARTU STATISTIK */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        <div className="bg-blue-600 p-5 md:p-6 rounded-2xl text-white shadow-lg shadow-blue-200 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-bold text-blue-200 uppercase tracking-wider mb-1 md:mb-2">Total Hutang Beredar</p>
            <h3 className="text-2xl md:text-3xl font-black">{formatRp(stats.totalHutangKeseluruhan)}</h3>
          </div>
          <Users size={80} className="absolute -bottom-4 -right-4 text-blue-500 opacity-50" />
        </div>

        <div className="bg-orange-500 p-5 md:p-6 rounded-2xl text-white shadow-lg shadow-orange-200 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-bold text-orange-200 uppercase tracking-wider mb-1 md:mb-2">Sisa Hutang (Belum Dibayar)</p>
            <h3 className="text-2xl md:text-3xl font-black">{formatRp(stats.totalSisaHutangKeseluruhan)}</h3>
          </div>
          <Wallet size={80} className="absolute -bottom-4 -right-4 text-orange-400 opacity-50" />
        </div>

        <div className="bg-green-500 p-5 md:p-6 rounded-2xl text-white shadow-lg shadow-green-200 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-[10px] md:text-xs font-bold text-green-200 uppercase tracking-wider mb-1 md:mb-2">Estimasi Total Laba Bersih</p>
            <h3 className="text-2xl md:text-3xl font-black">{formatRp(stats.totalLabaBersih)}</h3>
          </div>
          <TrendingUp size={80} className="absolute -bottom-4 -right-4 text-green-400 opacity-50" />
        </div>
      </div>
      
      {/* MONITORING TRANSAKSI TERBARU */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-6">
        <div className="p-4 md:p-6 border-b flex justify-between items-center bg-gray-50/50">
           <h3 className="font-black text-gray-800 flex items-center gap-2 text-sm md:text-base"><Clock size={18} className="text-blue-600"/> 5 Transaksi Terakhir</h3>
           <button onClick={() => setActiveTab('rekap')} className="text-[10px] md:text-xs font-bold text-blue-600 flex items-center gap-1 hover:underline">Lihat Semua <ArrowRight size={12}/></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-3 md:p-4">Tanggal</th>
                <th className="p-3 md:p-4">Pelanggan</th>
                <th className="p-3 md:p-4">Total</th>
                <th className="p-3 md:p-4">Status ACC</th>
                <th className="p-3 md:p-4">Pengambilan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentTx.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-sm font-bold text-gray-400">Belum ada transaksi</td></tr>}
              {recentTx.map(tx => (
                <tr key={tx.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 md:p-4 text-xs md:text-sm font-bold text-gray-600">{new Date(tx.tanggal).toLocaleDateString('id-ID')}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm font-black text-gray-800">{tx.debitur?.namaLengkap}</td>
                  <td className="p-3 md:p-4 text-xs md:text-sm font-black text-blue-600">Rp {tx.totalHutang.toLocaleString()}</td>
                  <td className="p-3 md:p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black text-white ${tx.status === 'ACC' ? 'bg-blue-500' : tx.status === 'PENGAJUAN' ? 'bg-orange-500' : tx.status === 'LUNAS' ? 'bg-green-500' : 'bg-red-500'}`}>{tx.status}</span>
                  </td>
                  <td className="p-3 md:p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-black ${tx.statusPengambilan === 'SUDAH' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{tx.statusPengambilan === 'SUDAH' ? 'DIAMBIL' : 'BELUM'}</span>
                  </td>
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