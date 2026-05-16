import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Trophy, FileText } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profit = () => {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => { fetchKredits(); }, []);

  const fetchKredits = async () => {
    const res = await axios.get(`${baseURL}/api/kredit`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setData(res.data);
  };

  // Kalkulasi Profit: HANYA DARI BARANG YANG DIAMBIL & DI-ACC/LUNAS
  const validKredits = data.filter(k => {
    const d = new Date(k.tanggal);
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    end.setHours(23, 59, 59);
    return k.statusPengambilan === 'SUDAH' && (k.status === 'ACC' || k.status === 'LUNAS') && d >= start && d <= end;
  });

  const totalProfitKeseluruhan = validKredits.reduce((sum, k) => sum + k.totalProfit, 0);

  // Grouping by Debitur untuk Rank
  const rankMap = {};
  validKredits.forEach(k => {
    if(!rankMap[k.debitur.namaLengkap]) rankMap[k.debitur.namaLengkap] = 0;
    rankMap[k.debitur.namaLengkap] += k.totalProfit;
  });

  const rankArray = Object.keys(rankMap).map(nama => ({ nama, profit: rankMap[nama] })).sort((a, b) => b.profit - a.profit);
  
  // Mengurutkan Transaksi dari yang terbaru untuk Tabel Detail
  const sortedKredits = [...validKredits].sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER COMPACT */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border flex flex-col md:flex-row gap-3 md:gap-4 items-start md:items-center">
        <div className="flex-1">
           <h2 className="text-lg md:text-xl font-black flex items-center gap-2 text-gray-800"><TrendingUp size={20} className="text-blue-600"/> Analisis Laba Bersih</h2>
           <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-0.5 md:mt-1">Dihitung dari barang yang sudah diambil.</p>
        </div>
        <div className="flex w-full md:w-auto gap-2">
           <div className="flex-1 md:w-auto"><label className="text-[10px] font-black text-gray-400">DARI TGL</label><input type="date" className="w-full border-2 p-2 md:p-2.5 rounded-xl text-xs md:text-sm font-bold outline-none" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div>
           <div className="flex-1 md:w-auto"><label className="text-[10px] font-black text-gray-400">SAMPAI TGL</label><input type="date" className="w-full border-2 p-2 md:p-2.5 rounded-xl text-xs md:text-sm font-bold outline-none" value={endDate} onChange={e=>setEndDate(e.target.value)}/></div>
        </div>
      </div>

      {/* KARTU HIJAU TOTAL LABA */}
      <div className="bg-green-500 p-6 md:p-8 rounded-2xl md:rounded-3xl text-white shadow-lg text-center flex flex-col justify-center items-center">
         <p className="font-black text-green-200 uppercase tracking-widest text-[10px] md:text-xs">Total Laba Bersih Tersalisasi (Periode ini)</p>
         <h1 className="text-3xl md:text-5xl font-black mt-1 md:mt-2">Rp {totalProfitKeseluruhan.toLocaleString('id-ID')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* RANK PROFIT (KOLOM KIRI) */}
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border lg:col-span-1 h-fit">
          <h3 className="font-black text-sm md:text-base mb-3 md:mb-4 flex items-center gap-2 text-gray-800"><Trophy className="text-yellow-500" size={18}/> Rank Profit Debitur</h3>
          <div className="space-y-2 md:space-y-3 max-h-[400px] overflow-y-auto pr-1 hide-scrollbar">
            {rankArray.length === 0 && <p className="text-gray-400 font-bold text-center py-6 text-xs md:text-sm">Belum ada data profit.</p>}
            {rankArray.map((r, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-2.5 md:p-3 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2.5 md:gap-3">
                   <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center font-black text-[10px] md:text-xs shadow-sm ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-gray-300 text-gray-800' : idx === 2 ? 'bg-orange-400 text-white' : 'bg-white border text-gray-500'}`}>{idx + 1}</div>
                   <p className="font-black text-gray-800 text-xs md:text-sm truncate max-w-[100px] md:max-w-[150px]">{r.nama}</p>
                </div>
                <p className="font-black text-green-600 text-xs md:text-sm">+ Rp {r.profit.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TABEL DETAIL TRANSAKSI (KOLOM KANAN) */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border overflow-hidden lg:col-span-2">
          <div className="p-4 md:p-5 border-b flex justify-between items-center bg-gray-50/50">
             <h3 className="font-black text-gray-800 flex items-center gap-1.5 text-sm md:text-base"><FileText size={18} className="text-blue-600"/> Detail Laba per Transaksi</h3>
          </div>
          <div className="overflow-x-auto max-h-[400px] overflow-y-auto hide-scrollbar">
            <table className="w-full text-left whitespace-nowrap">
              <thead className="bg-gray-800 text-white text-[9px] md:text-[10px] font-black uppercase tracking-wider sticky top-0 z-10">
                <tr>
                  <th className="p-3 md:p-4">Tanggal</th>
                  <th className="p-3 md:p-4">Nota & Pelanggan</th>
                  <th className="p-3 md:p-4">Kalkulasi Profit</th>
                  <th className="p-3 md:p-4 text-right">Laba Bersih</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedKredits.length === 0 && <tr><td colSpan="4" className="p-6 text-center text-gray-400 font-bold text-xs md:text-sm">Belum ada rincian transaksi.</td></tr>}
                {sortedKredits.map(k => {
                  // Hitung total modal secara dinamis dari items transaksi ini
                  const totalModal = k.items.reduce((sum, item) => sum + (item.hargaKulakan * item.qty), 0);

                  return (
                    <tr key={k.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="p-3 md:p-4 text-[10px] md:text-xs font-bold text-gray-500">{new Date(k.tanggal).toLocaleDateString('id-ID')}</td>
                      <td className="p-3 md:p-4">
                        <p className="font-black text-xs md:text-sm text-gray-800">Nota #{k.id}</p>
                        <p className="text-[10px] md:text-xs font-bold text-blue-600 mt-0.5">{k.debitur.namaLengkap}</p>
                      </td>
                      <td className="p-3 md:p-4">
                        {/* TABEL RINCIAN MINI ALA BUSA KILOAN */}
                        <div className="flex flex-col gap-1 text-[9px] md:text-[10px] font-bold text-gray-500 w-32 md:w-40">
                           <div className="flex justify-between border-b border-dashed border-gray-200 pb-1">
                             <span className="text-gray-400">Total Jual</span>
                             <span className="text-gray-800">Rp {k.totalHutang.toLocaleString('id-ID')}</span>
                           </div>
                           <div className="flex justify-between border-b border-dashed border-gray-200 pb-1 pt-0.5">
                             <span className="text-gray-400">Total Modal</span>
                             <span className="text-gray-800">Rp {totalModal.toLocaleString('id-ID')}</span>
                           </div>
                           {k.totalCashback > 0 && (
                             <div className="flex justify-between pt-0.5">
                               <span className="text-orange-400">Cashback</span>
                               <span className="text-orange-500">Rp {k.totalCashback.toLocaleString('id-ID')}</span>
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="p-3 md:p-4 font-black text-green-600 text-sm md:text-base text-right align-middle">+ Rp {k.totalProfit.toLocaleString('id-ID')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profit;