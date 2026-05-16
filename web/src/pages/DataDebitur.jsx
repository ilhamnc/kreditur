import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, KeyRound, Trash2, Edit, PlusCircle, XCircle, Clock, Eye, EyeOff, FileText, UserCheck } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DataDebitur = ({ user }) => {
  const [debiturs, setDebiturs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false); 
  const [form, setForm] = useState({ id: null, userId: null, username: '', password: '', namaLengkap: '', noHp: '', alamat: '', usia: '', jenisKelamin: 'L', catatan: '' });

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [showResetPwd, setShowResetPwd] = useState(false);
  const [resetData, setResetData] = useState({ userId: null, nama: '', newPassword: '' });

  const [viewNoteData, setViewNoteData] = useState(null);

  useEffect(() => { fetchDebitur(); }, []);

  const fetchDebitur = async () => {
    try {
      const res = await axios.get(`${baseURL}/api/debitur`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      setDebiturs(res.data);
    } catch (error) { 
      if (error.response?.status === 401 || error.response?.status === 403) {
        alert("⚠️ Sesi Login Anda telah berakhir (Token Expired). Silakan LOGOUT lalu LOGIN KEMBALI.");
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (form.id) {
        await axios.put(`${baseURL}/api/debitur/${form.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Data debitur diperbarui!");
      } else {
        await axios.post(`${baseURL}/api/debitur`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Debitur baru berhasil ditambahkan!");
      }
      setIsModalOpen(false); fetchDebitur();
    } catch (err) { 
      alert(`❌ Gagal: ${err.response?.data?.error || 'Kesalahan server'}`); 
    }
  };

  const handleEdit = (d) => {
    setForm({
      id: d.id, userId: d.userId, username: d.user?.username || '', password: '', 
      namaLengkap: d.namaLengkap, noHp: d.noHp, alamat: d.alamat || '',
      usia: d.usia || '', jenisKelamin: d.jenisKelamin || 'L', catatan: d.catatan || ''
    });
    setShowPwd(false);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setForm({ id: null, userId: null, username: '', password: '', namaLengkap: '', noHp: '', alamat: '', usia: '', jenisKelamin: 'L', catatan: '' });
    setShowPwd(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (userId, nama) => {
    if (!window.confirm(`HAPUS PERMANEN debitur ${nama} beserta seluruh riwayat transaksinya?`)) return;
    try {
      await axios.delete(`${baseURL}/api/debitur/${userId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      fetchDebitur();
    } catch (err) { alert(`❌ Gagal menghapus: ${err.response?.data?.error}`); }
  };

  const openResetModal = (userId, nama) => {
    setResetData({ userId, nama, newPassword: '' }); 
    setShowResetPwd(false);
    setIsResetModalOpen(true);
  };

  const submitResetPassword = async (e) => {
    e.preventDefault();
    if (!resetData.newPassword) return alert("Password tidak boleh kosong!");
    try {
      await axios.put(`${baseURL}/api/debitur/reset-password`, { userId: resetData.userId, newPassword: resetData.newPassword }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Password berhasil diganti!");
      setIsResetModalOpen(false);
    } catch (err) { alert(`❌ Gagal mengganti password: ${err.response?.data?.error || err.message}`); }
  };

  const filtered = debiturs.map(d => {
    const kredits = d.kredits || []; 
    const totalHutangFilter = kredits.reduce((sum, k) => sum + (k.totalHutang || 0), 0);
    const sisaHutangFilter = kredits.reduce((sum, k) => sum + (k.sisaHutang || 0), 0);
    const totalCashbackFilter = kredits.reduce((sum, k) => sum + (k.totalCashback || 0), 0);
    
    let lastTxDate = "-";
    if (kredits.length > 0) {
      const dates = kredits.map(k => new Date(k.tanggal));
      lastTxDate = new Date(Math.max(...dates)).toLocaleDateString('id-ID');
    }

    return { ...d, totalHutangIndividu: totalHutangFilter, sisaHutangIndividu: sisaHutangFilter, totalCashbackIndividu: totalCashbackFilter, lastTxDate };
  }).filter(d => (d.namaLengkap || "").toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-lg md:text-xl font-black flex items-center gap-2 text-gray-800"><UserCheck size={20} className="text-blue-600"/> Database Debitur</h2>
          <p className="text-[10px] md:text-xs font-bold text-gray-500 mt-1">Manajemen profil & akun login debitur.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
             <input className="w-full pl-9 pr-4 py-2 border-2 rounded-xl text-xs md:text-sm font-bold outline-none focus:border-blue-500" placeholder="Cari debitur..." onChange={e=>setSearchTerm(e.target.value)} />
          </div>
          <button onClick={openAddModal} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-black hover:bg-blue-700 whitespace-nowrap flex items-center gap-1.5 text-xs md:text-sm transition-transform active:scale-95"><PlusCircle size={16}/> Tambah</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider">
              <tr>
                <th className="p-3 md:p-4">Data Debitur</th>
                <th className="p-3 md:p-4">Total Hutang</th>
                <th className="p-3 md:p-4">Sisa Tagihan</th>
                <th className="p-3 md:p-4">Cashback</th>
                <th className="p-3 md:p-4">Info Lainnya</th>
                <th className="p-3 md:p-4 text-center">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-400 font-bold text-sm">Data debitur tidak ditemukan.</td></tr>
              )}
              {filtered.map(d => (
                <tr key={d.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="p-3 md:p-4">
                    <p className="font-black text-gray-800 text-sm">{d.namaLengkap}</p>
                    <p className="text-[10px] font-bold text-gray-500 mt-0.5">User: <span className="text-blue-600">{d.user?.username || '-'}</span> | HP: {d.noHp}</p>
                  </td>
                  <td className="p-3 md:p-4 font-bold text-gray-500 text-xs md:text-sm">Rp {d.totalHutangIndividu.toLocaleString()}</td>
                  <td className="p-3 md:p-4 font-black text-red-600 text-xs md:text-sm">Rp {d.sisaHutangIndividu.toLocaleString()}</td>
                  <td className="p-3 md:p-4 font-bold text-green-600 text-xs md:text-sm">Rp {d.totalCashbackIndividu.toLocaleString()}</td>
                  <td className="p-3 md:p-4">
                    <p className="text-[10px] font-bold text-gray-500 flex items-center gap-1"><Clock size={12}/> Tx: {d.lastTxDate}</p>
                    {d.catatan && (
                      <button onClick={()=>setViewNoteData({nama: d.namaLengkap, catatan: d.catatan})} className="mt-1 text-[10px] bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-bold hover:bg-yellow-200 flex items-center gap-1 transition-colors">
                        <FileText size={12}/> Lihat Catatan
                      </button>
                    )}
                  </td>
                  <td className="p-3 md:p-4">
                    <div className="flex gap-1.5 justify-center">
                       <button onClick={()=>handleEdit(d)} className="p-1.5 md:p-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors" title="Edit Profil"><Edit size={16}/></button>
                       <button onClick={()=>openResetModal(d.userId, d.namaLengkap)} className="p-1.5 md:p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Ganti Password"><KeyRound size={16}/></button>
                       {user?.role === 'OWNER' && (
                         <button onClick={()=>handleDelete(d.userId, d.namaLengkap)} className="p-1.5 md:p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="Hapus Permanen"><Trash2 size={16}/></button>
                       )}
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
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-gray-50 p-4 md:p-6 border-b flex justify-between items-center shrink-0 rounded-t-2xl md:rounded-t-3xl">
              <h3 className="font-black text-base md:text-lg text-gray-800">{form.id ? 'Edit Data Debitur' : 'Tambah Debitur Baru'}</h3>
              <button onClick={()=>setIsModalOpen(false)}><XCircle className="text-gray-400 hover:text-red-500"/></button>
            </div>
            
            <div className="overflow-y-auto p-4 md:p-6">
              <form onSubmit={handleSave} className="space-y-4">
                
                {/* USERNAME & PASSWORD BOX */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100">
                  <div>
                    <label className="text-[10px] font-black text-orange-600 uppercase">Username Login</label>
                    <input className="w-full border p-2 md:p-2.5 rounded-lg text-xs md:text-sm font-bold mt-1 outline-none focus:border-orange-400" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} placeholder="Ketik username baru..." />
                  </div>
                  {/* PASSWORD HANYA MUNCUL SAAT TAMBAH BARU */}
                  {!form.id && (
                    <div>
                      <label className="text-[10px] font-black text-orange-600 uppercase">Password Awal</label>
                      <div className="relative mt-1">
                        <input type={showPwd ? "text" : "password"} className="w-full border p-2 md:p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none pr-10 focus:border-orange-400" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder="Opsional (123456)" />
                        <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 top-2 md:top-2.5 text-gray-400 hover:text-gray-600">{showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div><label className="text-[10px] font-black text-gray-400 uppercase">Nama Lengkap *</label><input required className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.namaLengkap} onChange={e=>setForm({...form, namaLengkap: e.target.value})} /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase">Nomor HP *</label><input required className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.noHp} onChange={e=>setForm({...form, noHp: e.target.value})} /></div>
                </div>
                
                <div><label className="text-[10px] font-black text-gray-400 uppercase">Alamat Lengkap</label><textarea className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.alamat} onChange={e=>setForm({...form, alamat: e.target.value})} rows="2" /></div>
                
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  <div><label className="text-[10px] font-black text-gray-400 uppercase">Usia</label><input type="number" className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.usia} onChange={e=>setForm({...form, usia: e.target.value})} /></div>
                  <div><label className="text-[10px] font-black text-gray-400 uppercase">Gender</label><select className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.jenisKelamin} onChange={e=>setForm({...form, jenisKelamin: e.target.value})}><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></div>
                </div>

                <div><label className="text-[10px] font-black text-gray-400 uppercase">Catatan Khusus</label><textarea className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold mt-1 outline-none focus:border-blue-500" value={form.catatan} onChange={e=>setForm({...form, catatan: e.target.value})} rows="3" placeholder="Tulis deskripsi atau catatan..." /></div>

                <button type="submit" className="w-full bg-blue-600 text-white py-3.5 md:py-4 rounded-xl font-black mt-4 md:mt-6 shadow-lg hover:bg-blue-700 transition-transform active:scale-95 text-sm md:text-base">
                  Simpan Data Debitur
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {isResetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-blue-50 p-4 md:p-6 border-b border-blue-100 flex justify-between items-center">
              <h3 className="font-black text-base md:text-lg text-blue-800 flex items-center gap-2"><KeyRound size={18}/> Ganti Password</h3>
              <button onClick={()=>setIsResetModalOpen(false)}><XCircle className="text-blue-400 hover:text-red-500"/></button>
            </div>
            <form onSubmit={submitResetPassword} className="p-4 md:p-6 space-y-4">
              <div>
                <p className="text-xs md:text-sm font-bold text-gray-500 mb-4">Ubah sandi login untuk: <span className="text-gray-900 font-black">{resetData.nama}</span></p>
                <label className="text-[10px] font-black text-gray-400 uppercase">Input Password Baru</label>
                <div className="relative mt-1">
                  <input 
                    type={showResetPwd ? "text" : "password"} 
                    className="w-full border-2 p-2.5 md:p-3 rounded-xl text-xs md:text-sm font-bold outline-none focus:border-blue-500 pr-10" 
                    value={resetData.newPassword} 
                    onChange={e=>setResetData({...resetData, newPassword: e.target.value})} 
                    placeholder="Ketik password baru..."
                    required 
                  />
                  <button type="button" onClick={()=>setShowResetPwd(!showResetPwd)} className="absolute right-3 md:right-4 top-3 text-gray-400 hover:text-gray-600">
                    {showResetPwd ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-3 md:py-3.5 rounded-xl font-black mt-4 shadow-lg hover:bg-blue-700 transition-transform active:scale-95 text-sm md:text-base">
                Simpan Password Baru
              </button>
            </form>
          </div>
        </div>
      )}

      {viewNoteData && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-yellow-50 p-4 md:p-5 border-b border-yellow-100 flex justify-between items-center shrink-0">
              <h3 className="font-black text-base md:text-lg text-yellow-800 flex items-center gap-2"><FileText size={18}/> Catatan Debitur</h3>
              <button onClick={()=>setViewNoteData(null)}><XCircle className="text-yellow-500 hover:text-red-500"/></button>
            </div>
            <div className="p-4 md:p-6 overflow-y-auto">
              <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 md:mb-3">Dari: {viewNoteData.nama}</p>
              <div className="bg-gray-50 p-4 md:p-5 rounded-2xl border text-xs md:text-sm font-bold text-gray-800 whitespace-pre-wrap leading-relaxed">
                {viewNoteData.catatan}
              </div>
              <button onClick={()=>setViewNoteData(null)} className="w-full mt-4 md:mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl font-black hover:bg-gray-200 transition-colors text-sm md:text-base">Tutup</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DataDebitur;