import { useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, UserPlus, Users, XCircle, Eye, EyeOff, Edit } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ManajemenKaryawan = ({ user }) => {
  const [karyawan, setKaryawan] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  
  const [form, setForm] = useState({ id: null, username: '', password: '' });

  useEffect(() => { if (user?.role === 'OWNER') fetchKaryawan(); }, [user]);

  const fetchKaryawan = async () => {
    const res = await axios.get(`${baseURL}/api/karyawan`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setKaryawan(res.data);
  };

  const handleSimpan = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (form.id) {
        await axios.put(`${baseURL}/api/karyawan/${form.id}`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Data Karyawan diperbarui!");
      } else {
        await axios.post(`${baseURL}/api/karyawan`, form, { headers: { Authorization: `Bearer ${token}` } });
        alert("✅ Karyawan baru berhasil ditambahkan!");
      }
      setForm({ id: null, username: '', password: '' }); setIsModalOpen(false); fetchKaryawan();
    } catch (err) { alert(`❌ Gagal: ${err.response?.data?.error}`); }
  };

  const handleEdit = (k) => {
    setForm({ id: k.id, username: k.username, password: '' }); 
    setShowPwd(false);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setForm({ id: null, username: '', password: '' });
    setShowPwd(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, username) => {
    if(!window.confirm(`Hapus permanen akses Karyawan '${username}'?`)) return;
    await axios.delete(`${baseURL}/api/karyawan/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    fetchKaryawan();
  };

  if (user?.role !== 'OWNER') return <div className="p-6 md:p-10 font-bold text-red-500 bg-red-50 rounded-2xl text-center text-sm md:text-base">Akses Ditolak. Khusus Owner.</div>;

  return (
    <div className="space-y-4 md:space-y-6">
      {/* HEADER COMPACT */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border flex justify-between items-center">
        <div className="flex items-center gap-2.5 md:gap-3">
           <div className="p-2 md:p-3 bg-blue-100 text-blue-600 rounded-lg md:rounded-xl"><Users size={20} className="md:w-6 md:h-6"/></div>
           <h2 className="text-base md:text-xl font-black text-gray-800">Manajemen Karyawan</h2>
        </div>
        <button onClick={openAddModal} className="bg-blue-600 text-white px-3 py-2 md:px-4 md:py-2.5 rounded-lg md:rounded-xl font-black flex items-center gap-1.5 md:gap-2 hover:bg-blue-700 text-xs md:text-sm shadow-sm transition-transform active:scale-95"><UserPlus size={16}/> Akun Baru</button>
      </div>
      
      {/* LIST KARYAWAN */}
      <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border">
        <div className="space-y-2 md:space-y-3">
          {karyawan.length === 0 && <p className="text-center py-6 text-gray-400 font-bold text-sm">Belum ada akun karyawan.</p>}
          {karyawan.map(k => (
            <div key={k.id} className="flex justify-between items-center bg-gray-50 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-100 transition-colors hover:bg-blue-50/50">
              <div>
                 <p className="font-bold text-sm md:text-lg text-gray-800">{k.username}</p>
                 <p className="text-[9px] md:text-[10px] text-gray-400 uppercase font-black tracking-wider mt-0.5 md:mt-1">ID Pekerja: #{k.id}</p>
              </div>
              <div className="flex gap-1.5 md:gap-2">
                <button onClick={()=>handleEdit(k)} className="bg-yellow-50 text-yellow-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-yellow-100 transition-colors" title="Edit Akun"><Edit size={16} className="md:w-5 md:h-5"/></button>
                <button onClick={()=>handleDelete(k.id, k.username)} className="bg-red-50 text-red-600 p-2 md:p-3 rounded-lg md:rounded-xl hover:bg-red-100 transition-colors" title="Hapus Akses"><Trash2 size={16} className="md:w-5 md:h-5"/></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
            <div className="bg-gray-50 p-4 md:p-6 border-b flex justify-between items-center shrink-0">
               <h3 className="font-black text-sm md:text-lg text-gray-800">{form.id ? 'Edit Akun Karyawan' : 'Buat Akun Karyawan'}</h3>
               <button onClick={()=>setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 transition-colors"><XCircle size={20} className="md:w-6 md:h-6"/></button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto">
               <form onSubmit={handleSimpan} className="space-y-4">
                 <div>
                   <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username Login</label>
                   <input className="w-full border-2 p-2.5 md:p-3 rounded-xl font-bold mt-1 outline-none focus:border-blue-500 text-sm" value={form.username} onChange={e=>setForm({...form, username: e.target.value})} placeholder="Tanpa spasi" required/>
                 </div>
                 <div className="relative">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{form.id ? 'Password Baru (Opsional)' : 'Password Akses'}</label>
                    <div className="relative mt-1">
                      <input type={showPwd?"text":"password"} className="w-full border-2 p-2.5 md:p-3 rounded-xl font-bold pr-10 outline-none focus:border-blue-500 text-sm" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} placeholder={form.id ? "Kosongkan jika tidak diganti" : "Minimal 6 karakter"} required={!form.id}/>
                      <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-3 md:right-4 top-2.5 md:top-3 text-gray-400 hover:text-gray-600 transition-colors">{showPwd?<EyeOff size={18}/>:<Eye size={18}/>}</button>
                    </div>
                 </div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-black py-3.5 md:py-4 rounded-xl hover:bg-blue-700 mt-2 md:mt-4 shadow-lg text-sm md:text-base transition-transform active:scale-95">Simpan Data Akun</button>
               </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManajemenKaryawan;