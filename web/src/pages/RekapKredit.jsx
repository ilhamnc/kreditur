import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Info, XCircle, FileText, Link, Trash2, Edit } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatRpInput = (angka) => {
  if (!angka) return '';
  return angka.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRpInput = (text) => text.toString().replace(/[^0-9]/g, '');

const RekapKredit = ({ user }) => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const [editForm, setEditForm] = useState({ status: '', statusPengambilan: '', tempo: '', totalHutang: '', sisaHutang: '' });

  const [payMode, setPayMode] = useState('ADD'); 
  const [payId, setPayId] = useState(null);
  const [payNominal, setPayNominal] = useState('');
  const [buktiUrl, setBuktiUrl] = useState('');

  useEffect(() => { fetchKredits(); }, []);

  const fetchKredits = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/kredit`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setData(res.data);
    } catch (err) {
      if(err.response?.status === 401) alert("Sesi habis, harap login ulang.");
    }
  };

  const openModal = (item) => {
    setSelected(item); 
    setPayMode('ADD'); setPayId(null); setPayNominal(''); setBuktiUrl('');
    setEditForm({
      status: item.status,
      statusPengambilan: item.statusPengambilan,
      tempo: item.tempo ? item.tempo.split('T')[0] : '',
      totalHutang: item.totalHutang.toString(),
      sisaHutang: item.sisaHutang.toString()
    });
  };

  const handleDeleteKredit = async () => {
    if(!window.confirm("HAPUS PERMANEN transaksi ini?\nStok akan dikembalikan otomatis, tapi uang di Buku Kas harus Anda hapus manual.")) return;
    try {
      await axios.delete(`${baseURL}/api/kredit/${selected.id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Transaksi berhasil dihapus!");
      setSelected(null); fetchKredits();
    } catch (err) { alert("❌ Gagal menghapus transaksi."); }
  };

  const handleUpdateFull = async (e) => {
    e.preventDefault();
    if(user?.role !== 'OWNER') return alert("Hanya Owner yang bisa mengedit transaksi.");
    setLoading(true);
    try {
      const payload = { ...editForm, totalHutang: parseInt(editForm.totalHutang || 0), sisaHutang: parseInt(editForm.sisaHutang || 0) };
      await axios.put(`${baseURL}/api/kredit/${selected.id}/full`, payload, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Data Transaksi berhasil diperbarui!");
      setSelected(null); fetchKredits();
    } catch (err) { alert("❌ Gagal menyimpan perubahan."); } 
    finally { setLoading(false); }
  };

  const handleBayar = async (e) => {
    e.preventDefault();
    setLoading(true);
    const nominalAngka = parseInt(payNominal || 0);
    try {
      if (payMode === 'EDIT') {
        await axios.put(`${baseURL}/api/kredit/bayar/${payId}`, { nominal: nominalAngka, buktiBayar: buktiUrl }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        alert("✅ Pembayaran berhasil diperbarui!");
      } else {
        await axios.post(`${baseURL}/api/kredit/bayar`, { kreditId: selected.id, nominal: nominalAngka, buktiBayar: buktiUrl }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
        alert("✅ Pembayaran baru berhasil disimpan!");
      }
      setSelected(null); fetchKredits();
    } catch (err) { alert("Gagal memproses pembayaran"); } finally { setLoading(false); }
  };

  const handleEditPembayaranClick = (p) => {
    setPayMode('EDIT'); setPayId(p.id); setPayNominal(p.nominal.toString()); setBuktiUrl(p.buktiBayar || '');
  };

  const handleDeletePembayaran = async (id) => {
    if(!window.confirm("Hapus riwayat angsuran ini?\nSisa tagihan akan kembali bertambah.")) return;
    try {
      await axios.delete(`${baseURL}/api/kredit/bayar/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setSelected(null); fetchKredits();
    } catch (err) { alert("❌ Gagal menghapus pembayaran"); }
  };

  const getRowClass = (item) => {
    if (item.status === 'LUNAS') return 'bg-green-50/80 hover:bg-green-100';
    if (item.status === 'PENGAJUAN') return 'bg-orange-50/50 hover:bg-orange-100/50';
    if (item.status === 'DITOLAK') return 'bg-red-50 hover:bg-red-100';
    if (item.tempo && new Date(item.tempo) < new Date() && item.status !== 'LUNAS') return 'bg-red-100/70 hover:bg-red-200/80';
    if (item.status === 'ACC') return 'bg-blue-50/50 hover:bg-blue-100/50';
    return 'bg-white';
  };

  const filteredData = data.filter(i => {
    const matchName = i.debitur.namaLengkap.toLowerCase().includes(searchTerm.toLowerCase());
    const d = new Date(i.tanggal);
    const start = startDate ? new Date(startDate) : new Date('2000-01-01');
    const end = endDate ? new Date(endDate) : new Date('2100-01-01');
    end.setHours(23, 59, 59);
    return matchName && d >= start && d <= end;
  });

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row flex-wrap gap-3 md:gap-4 items-start md:items-end">
        <div className="flex-1 min-w-[200px]"><h2 className="text-lg md:text-xl font-black">Rekap & Tindakan</h2><p className="text-[10px] md:text-xs text-gray-500 mt-1">Klik tabel untuk Edit, ACC, dan Input Pembayaran.</p></div>
        <div className="w-full md:w-auto flex gap-2">
           <div className="flex-1"><label className="text-[10px] font-black text-gray-400">DARI TGL</label><input type="date" className="w-full border-2 p-2 rounded-xl text-xs font-bold outline-none" value={startDate} onChange={e=>setStartDate(e.target.value)}/></div>
           <div className="flex-1"><label className="text-[10px] font-black text-gray-400">SAMPAI TGL</label><input type="date" className="w-full border-2 p-2 rounded-xl text-xs font-bold outline-none" value={endDate} onChange={e=>setEndDate(e.target.value)}/></div>
        </div>
        <div className="relative w-full md:w-64"><Search className="absolute left-3 top-2.5 text-gray-400" size={16} /><input className="w-full pl-9 pr-4 py-2 border-2 rounded-xl text-xs md:text-sm outline-none" placeholder="Cari nota..." onChange={e=>setSearchTerm(e.target.value)} /></div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
           <table className="w-full text-left whitespace-nowrap cursor-pointer">
             <thead className="bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider">
               <tr><th className="p-3 md:p-4">Tanggal & Tempo</th><th className="p-3 md:p-4">Debitur</th><th className="p-3 md:p-4">Total & Sisa</th><th className="p-3 md:p-4">Status & Barang</th><th className="p-3 md:p-4 text-center">Aksi</th></tr>
             </thead>
             <tbody className="divide-y divide-gray-200">
               {filteredData.length === 0 && <tr><td colSpan="5" className="p-8 text-center font-bold text-gray-400 text-sm">Data tidak ditemukan.</td></tr>}
               {filteredData.map(item => (
                 <tr key={item.id} onClick={() => openModal(item)} className={`${getRowClass(item)} transition-colors`}>
                   <td className="p-3 md:p-4"><p className="font-bold text-xs md:text-sm text-gray-800">{new Date(item.tanggal).toLocaleDateString('id-ID')}</p><p className="text-[10px] font-black text-red-500 mt-1">Tempo: {item.tempo ? new Date(item.tempo).toLocaleDateString('id-ID') : '-'}</p></td>
                   <td className="p-3 md:p-4"><p className="font-black text-xs md:text-sm text-gray-800">{item.debitur.namaLengkap}</p><p className="text-[10px] font-bold text-gray-500 mt-0.5">{item.debitur.noHp}</p></td>
                   <td className="p-3 md:p-4"><p className="font-bold text-gray-500 text-[10px] md:text-xs line-through">Rp {item.totalHutang.toLocaleString()}</p><p className="font-black text-red-600 text-xs md:text-sm mt-0.5">Sisa: Rp {item.sisaHutang.toLocaleString()}</p></td>
                   <td className="p-3 md:p-4 flex flex-col gap-1.5 items-start mt-1">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black text-white ${item.status === 'ACC' ? 'bg-blue-500' : item.status === 'PENGAJUAN' ? 'bg-orange-500' : item.status === 'LUNAS' ? 'bg-green-500' : 'bg-red-500'}`}>{item.status}</span>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.statusPengambilan === 'SUDAH' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>{item.statusPengambilan === 'SUDAH' ? 'DIAMBIL' : 'BELUM'}</span>
                   </td>
                   <td className="p-3 md:p-4 text-center"><div className="flex items-center justify-center p-1.5 bg-white/50 rounded-lg hover:bg-white transition-colors text-blue-600 shadow-sm"><Edit size={14}/></div></td>
                 </tr>
               ))}
             </tbody>
           </table>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-3xl max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center shrink-0">
               <h2 className="text-base md:text-lg font-black text-gray-800">Nota #{selected.id} - {selected.debitur.namaLengkap}</h2>
               <div className="flex items-center gap-1.5 md:gap-2">
                 {user?.role === 'OWNER' && (
                   <button onClick={handleDeleteKredit} className="p-2 md:p-2.5 bg-red-100 text-red-600 rounded-xl hover:bg-red-200" title="Hapus Transaksi"><Trash2 size={16}/></button>
                 )}
                 <button onClick={()=>setSelected(null)} className="p-2 md:p-2.5 bg-gray-200 text-gray-600 rounded-xl hover:bg-gray-300" title="Tutup"><XCircle size={16}/></button>
               </div>
            </div>

            <div className="p-4 space-y-4 md:space-y-6 flex-1 overflow-y-auto">
               <form onSubmit={handleUpdateFull} className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 space-y-3">
                  <h3 className="font-black text-blue-800 flex items-center gap-1.5 text-xs md:text-sm"><Edit size={14}/> Edit Transaksi Terpadu</h3>
                  <div className="grid grid-cols-2 gap-3">
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase">Status Kredit</label>
                       <select className="w-full border p-2 md:p-2.5 rounded-xl font-bold mt-1 text-xs md:text-sm" value={editForm.status} onChange={e=>setEditForm({...editForm, status: e.target.value})} disabled={user?.role !== 'OWNER'}>
                         <option value="PENGAJUAN">PENGAJUAN</option><option value="ACC">ACC</option><option value="LUNAS">LUNAS</option><option value="DITOLAK">DITOLAK</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase">Fisik Barang</label>
                       <select className="w-full border p-2 md:p-2.5 rounded-xl font-bold mt-1 text-xs md:text-sm" value={editForm.statusPengambilan} onChange={e=>setEditForm({...editForm, statusPengambilan: e.target.value})} disabled={user?.role !== 'OWNER'}>
                         <option value="BELUM">BELUM DIAMBIL</option><option value="SUDAH">SUDAH DIAMBIL</option>
                       </select>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase">Total Hutang</label>
                       <input type="text" inputMode="numeric" className="w-full border p-2 md:p-2.5 rounded-xl font-bold mt-1 text-xs md:text-sm" value={formatRpInput(editForm.totalHutang)} onChange={e=>setEditForm({...editForm, totalHutang: parseRpInput(e.target.value)})} disabled={user?.role !== 'OWNER'}/>
                     </div>
                     <div>
                       <label className="text-[10px] font-black text-gray-500 uppercase">Sisa Tagihan</label>
                       <input type="text" inputMode="numeric" className="w-full border p-2 md:p-2.5 rounded-xl font-black mt-1 text-red-600 text-xs md:text-sm" value={formatRpInput(editForm.sisaHutang)} onChange={e=>setEditForm({...editForm, sisaHutang: parseRpInput(e.target.value)})} disabled={user?.role !== 'OWNER'}/>
                     </div>
                     <div className="col-span-2">
                       <label className="text-[10px] font-black text-gray-500 uppercase">Jatuh Tempo</label>
                       <input type="date" className="w-full border p-2 md:p-2.5 rounded-xl font-bold mt-1 text-xs md:text-sm" value={editForm.tempo} onChange={e=>setEditForm({...editForm, tempo: e.target.value})} disabled={user?.role !== 'OWNER'}/>
                     </div>
                  </div>
                  {user?.role === 'OWNER' && (
                    <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white font-black py-2.5 rounded-xl shadow-lg active:scale-95 text-xs md:text-sm mt-2">Simpan Perubahan Transaksi</button>
                  )}
               </form>

               <div className="bg-white border rounded-2xl p-4">
                 <h3 className="font-black text-gray-800 mb-2 text-xs md:text-sm">Daftar Barang Dibeli</h3>
                 <div className="space-y-1.5">
                   {selected.items.map((i, idx) => (
                     <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                       <div>
                         <span className="font-bold text-gray-700">{i.product.nama} <span className="text-blue-600 ml-1">x{i.qty}</span></span>
                       </div>
                       <span className="font-black text-gray-800">Rp {(i.hargaJual * i.qty).toLocaleString()}</span>
                     </div>
                   ))}
                 </div>
               </div>

               {parseInt(editForm.sisaHutang||0) > 0 && selected.status !== 'PENGAJUAN' && selected.status !== 'DITOLAK' && (
                  <form onSubmit={handleBayar} className={`border p-4 rounded-2xl space-y-3 ${payMode === 'EDIT' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-green-50/50 border-green-200'}`}>
                    <div className="flex justify-between items-center">
                      <h3 className={`font-black text-xs md:text-sm ${payMode === 'EDIT' ? 'text-yellow-700' : 'text-green-700'}`}>{payMode === 'EDIT' ? 'Ubah Data Pembayaran' : 'Input Angsuran Baru'}</h3>
                      {payMode === 'EDIT' && (<button type="button" onClick={() => {setPayMode('ADD'); setPayId(null); setPayNominal(''); setBuktiUrl('');}} className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-2 py-1 rounded">Batal</button>)}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-[10px] font-black text-gray-500 uppercase">Nominal Dibayar (Rp)</label><input type="text" inputMode="numeric" required className="w-full border p-2 md:p-2.5 rounded-xl font-black mt-1 text-xs md:text-sm outline-none" value={formatRpInput(payNominal)} onChange={e=>setPayNominal(parseRpInput(e.target.value))}/></div>
                      <div><label className="text-[10px] font-black text-gray-500 uppercase">Link Bukti</label><div className="flex items-center gap-1.5 bg-white border p-1.5 md:p-2 rounded-xl mt-1"><Link size={14} className="text-gray-400"/><input type="url" className="w-full outline-none text-[10px] md:text-xs bg-transparent" value={buktiUrl} onChange={e=>setBuktiUrl(e.target.value)}/></div></div>
                    </div>
                    <button type="submit" disabled={loading} className={`w-full text-white font-black py-2.5 rounded-xl shadow-lg text-xs md:text-sm active:scale-95 ${payMode === 'EDIT' ? 'bg-yellow-500' : 'bg-green-500'}`}>{payMode === 'EDIT' ? 'Simpan Ubahan Nominal' : 'Simpan Pembayaran'}</button>
                  </form>
               )}

               <div className="bg-white border rounded-2xl overflow-hidden">
                  <h3 className="font-black bg-gray-50 p-3 border-b flex items-center gap-1.5 text-xs md:text-sm text-gray-800"><FileText size={16}/> Riwayat Angsuran</h3>
                  <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                    {selected.pembayaran.length === 0 ? <p className="text-center text-xs font-bold text-gray-400 py-3">Kosong.</p> : null}
                    {selected.pembayaran.map((p, idx) => (
                      <div key={idx} className={`flex justify-between items-center p-2.5 rounded-xl border ${payId === p.id ? 'bg-yellow-50 border-yellow-200 shadow-inner' : 'bg-gray-50 border-gray-100'}`}>
                        <div><p className="font-black text-green-600 text-xs md:text-sm">Rp {p.nominal.toLocaleString()}</p><p className="text-[10px] font-bold text-gray-500">{new Date(p.tanggal).toLocaleDateString('id-ID')}</p></div>
                        <div className="flex items-center gap-1.5">
                           {p.buktiBayar ? <a href={p.buktiBayar} target="_blank" rel="noreferrer" className="text-[10px] font-black text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">Link</a> : <span className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded-lg">No Link</span>}
                           <button type="button" onClick={()=>handleEditPembayaranClick(p)} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Edit size={12}/></button>
                           {user?.role === 'OWNER' && (<button type="button" onClick={()=>handleDeletePembayaran(p.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg"><Trash2 size={12}/></button>)}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RekapKredit;