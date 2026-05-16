import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, ShoppingBag, Eye, CheckCircle, ArrowRight, ArrowLeft, Plus, Trash2, Search, XCircle, EyeOff } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const formatRpInput = (angka) => {
  if (!angka) return '';
  return angka.toString().replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const parseRpInput = (text) => text.toString().replace(/[^0-9]/g, '');

const Transaksi = () => {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState([]);
  const [debiturList, setDebiturList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [searchCustomer, setSearchCustomer] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const [debitur, setDebitur] = useState({ isNew: false, username: '', password: '', namaLengkap: '', noHp: '', alamat: '', usia: '', jenisKelamin: 'L', catatan: '' });
  const [cart, setCart] = useState([]);
  const [tempo, setTempo] = useState('');
  const [manualItem, setManualItem] = useState({ nama: '', hargaKulakan: '', hargaJual: '', cashback: '', qty: 1 });

  useEffect(() => { fetchProducts(); fetchDebiturs(); }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${baseURL}/api/products`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setProducts(res.data);
  };
  const fetchDebiturs = async () => {
    const res = await axios.get(`${baseURL}/api/debitur`, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
    setDebiturList(res.data);
  };

  const addToCart = (p) => {
    const exist = p.id ? cart.find(x => x.productId === p.id) : cart.find(x => x.nama === p.nama);
    if (exist) {
      setCart(cart.map(x => (x.productId === p.id || x.nama === p.nama) ? { ...exist, qty: parseInt(exist.qty) + parseInt(p.qty || 1), subtotal: (parseInt(exist.qty) + parseInt(p.qty || 1)) * p.hargaJual } : x));
    } else {
      setCart([...cart, { productId: p.id || null, nama: p.nama, hargaKulakan: parseInt(p.hargaKulakan || 0), hargaJual: parseInt(p.hargaJual || 0), cashback: parseInt(p.cashback || 0), qty: parseInt(p.qty || 1), subtotal: parseInt(p.hargaJual || 0) * parseInt(p.qty || 1) }]);
    }
  };

  const addManualToCart = () => {
    if(!manualItem.nama) return alert("Nama barang wajib diisi!");
    addToCart(manualItem);
    setManualItem({ nama: '', hargaKulakan: '', hargaJual: '', cashback: '', qty: 1 });
  };

  const selectExistingCustomer = (d) => {
    setDebitur({ isNew: false, username: '', password: '', namaLengkap: d.namaLengkap, noHp: d.noHp, alamat: d.alamat || '', usia: d.usia || '', jenisKelamin: d.jenisKelamin || 'L', catatan: d.catatan || '' });
    alert(`✅ Pelanggan ${d.namaLengkap} terpilih!`);
  };

  const saveNewCustomerModal = (e) => {
    e.preventDefault();
    setDebitur({ ...debitur, isNew: true });
    setIsModalOpen(false);
    alert("✅ Data pelanggan baru sementara tersimpan untuk transaksi ini.");
  };

  const totalHutang = cart.reduce((a, b) => a + b.subtotal, 0);
  const totalCashback = cart.reduce((a, b) => a + (b.cashback * b.qty), 0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.post(`${baseURL}/api/kredit`, { ...debitur, items: cart, tempo }, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });
      alert("✅ Transaksi Berhasil Disimpan!"); window.location.reload();
    } catch (err) { alert("❌ Gagal: " + (err.response?.data?.error || "Kesalahan pada sistem")); } 
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 md:space-y-6">
      {/* STEPPER KECIL */}
      <div className="flex items-center justify-between bg-white p-3 md:p-4 rounded-2xl shadow-sm border overflow-x-auto hide-scrollbar whitespace-nowrap">
        {[ {s:1, n:'Pelanggan', i:UserPlus}, {s:2, n:'Barang', i:ShoppingBag}, {s:3, n:'Preview', i:Eye} ].map((item) => (
          <div key={item.s} className={`flex items-center gap-1.5 md:gap-2 ${step >= item.s ? 'text-blue-600' : 'text-gray-300'}`}>
            <div className={`p-1.5 md:p-2 rounded-lg ${step >= item.s ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}><item.i size={16}/></div>
            <span className="text-xs md:text-sm font-bold">{item.n}</span>
            {item.s < 3 && <div className="h-0.5 md:h-1 w-4 md:w-16 bg-gray-100 mx-1 md:mx-2 rounded-full" />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <div className="bg-white p-4 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row gap-3 md:gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 md:top-3.5 text-gray-400" size={18} />
              <input type="text" className="w-full pl-10 pr-4 py-2 md:py-3 rounded-xl md:rounded-2xl border-2 outline-none focus:border-blue-500 font-bold text-xs md:text-sm" placeholder="Cari pelanggan lama..." onChange={e => setSearchCustomer(e.target.value)} />
            </div>
            <span className="font-bold text-gray-400 text-xs">ATAU</span>
            <button onClick={() => {setDebitur({ isNew: true, username: '', password: '', namaLengkap: '', noHp: '', alamat: '', usia: '', jenisKelamin: 'L', catatan: '' }); setIsModalOpen(true);}} className="w-full md:w-auto bg-blue-50 text-blue-600 font-black py-2.5 md:py-3 px-4 md:px-6 rounded-xl md:rounded-2xl hover:bg-blue-100 flex items-center gap-2 justify-center text-xs md:text-sm"><UserPlus size={16}/> Pelanggan Baru</button>
          </div>

          <div className="max-h-48 md:max-h-64 overflow-y-auto space-y-2 border-t pt-4">
            {debiturList.filter(d => d.namaLengkap.toLowerCase().includes(searchCustomer.toLowerCase())).map(d => (
              <div key={d.id} onClick={() => selectExistingCustomer(d)} className={`p-3 md:p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${debitur.noHp === d.noHp && !debitur.isNew ? 'border-blue-500 bg-blue-50/50 shadow-sm' : 'border-transparent bg-gray-50 hover:border-blue-200'}`}>
                <div><p className="font-black text-gray-800 text-sm md:text-base">{d.namaLengkap}</p><p className="text-xs font-bold text-blue-600">{d.noHp}</p></div>
                {debitur.noHp === d.noHp && !debitur.isNew && <CheckCircle className="text-blue-500" size={20} />}
              </div>
            ))}
          </div>

          {debitur.namaLengkap && (
            <div className="bg-green-50 p-3 md:p-4 rounded-xl border border-green-200 flex justify-between items-center">
               <div><p className="text-[10px] font-bold text-green-600 uppercase">Pelanggan Terpilih:</p><p className="font-black text-sm md:text-lg text-green-800">{debitur.namaLengkap} <span className="text-xs font-bold text-gray-500">({debitur.noHp})</span> {debitur.isNew && <span className="bg-orange-500 text-white text-[10px] px-2 py-0.5 rounded ml-2">BARU</span>}</p></div>
            </div>
          )}
          
          <button onClick={()=>setStep(2)} disabled={!debitur.namaLengkap} className="w-full bg-blue-600 text-white py-3 md:py-4 rounded-xl md:rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:bg-gray-300 flex justify-center items-center gap-2 text-sm md:text-base transition-transform active:scale-95">Lanjut Pilih Barang <ArrowRight size={18}/></button>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3 md:p-4">
          <div className="bg-white rounded-2xl md:rounded-3xl w-full max-w-xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
            <div className="bg-blue-600 p-4 md:p-5 text-white flex justify-between items-center shrink-0">
               <h2 className="text-sm md:text-lg font-black flex items-center gap-2"><UserPlus size={18}/> Form Pelanggan Baru</h2>
               <button onClick={()=>setIsModalOpen(false)} className="hover:text-red-300"><XCircle size={20}/></button>
            </div>
            <div className="overflow-y-auto p-4 md:p-6">
              <form onSubmit={saveNewCustomerModal} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-orange-50 p-3 md:p-4 rounded-xl border border-orange-100">
                   <div><label className="text-[10px] font-black text-orange-600">USERNAME AKUN</label><input type="text" className="w-full border p-2 md:p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none" value={debitur.username} onChange={e=>setDebitur({...debitur, username: e.target.value})} placeholder="Opsional" /></div>
                   <div>
                      <label className="text-[10px] font-black text-orange-600">PASSWORD AKUN</label>
                      <div className="relative mt-1">
                        <input type={showPwd ? "text" : "password"} className="w-full border p-2 md:p-2.5 rounded-lg text-xs md:text-sm font-bold outline-none pr-8" value={debitur.password} onChange={e=>setDebitur({...debitur, password: e.target.value})} placeholder="Opsional (123456)" />
                        <button type="button" onClick={()=>setShowPwd(!showPwd)} className="absolute right-2 top-2 md:top-2.5 text-gray-400">{showPwd ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
                      </div>
                   </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                   <div><label className="text-[10px] font-black text-gray-400">NAMA LENGKAP *</label><input type="text" className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold outline-none" value={debitur.namaLengkap} onChange={e=>setDebitur({...debitur, namaLengkap: e.target.value})} required/></div>
                   <div><label className="text-[10px] font-black text-gray-400">NOMOR HP *</label><input type="text" className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold outline-none" value={debitur.noHp} onChange={e=>setDebitur({...debitur, noHp: e.target.value})} required/></div>
                 </div>
                 <div><label className="text-[10px] font-black text-gray-400">ALAMAT</label><textarea className="w-full border-2 p-2.5 rounded-xl text-xs md:text-sm font-bold outline-none" value={debitur.alamat} onChange={e=>setDebitur({...debitur, alamat: e.target.value})} rows="2" /></div>
                 <button type="submit" className="w-full bg-blue-600 text-white font-black py-3 md:py-3.5 mt-2 rounded-xl shadow-lg text-xs md:text-sm">Simpan & Pilih Pelanggan</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
             <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 border-blue-100 shadow-sm">
                <h3 className="font-black text-blue-600 mb-3 md:mb-4 flex items-center gap-1.5 text-xs md:text-sm"><Plus size={16}/> Input Manual / Cari</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <input className="col-span-2 md:col-span-4 border-2 p-2.5 rounded-xl font-bold text-xs md:text-sm outline-none" placeholder="Nama Barang" value={manualItem.nama} onChange={e=>setManualItem({...manualItem, nama: e.target.value})} />
                  <input type="text" inputMode="numeric" className="col-span-2 border-2 p-2.5 rounded-xl font-bold text-xs md:text-sm outline-none" placeholder="Modal (Rp)" value={formatRpInput(manualItem.hargaKulakan)} onChange={e=>setManualItem({...manualItem, hargaKulakan: parseRpInput(e.target.value)})} />
                  <input type="text" inputMode="numeric" className="col-span-2 border-2 p-2.5 rounded-xl font-bold text-xs md:text-sm outline-none" placeholder="Harga Jual (Rp)" value={formatRpInput(manualItem.hargaJual)} onChange={e=>setManualItem({...manualItem, hargaJual: parseRpInput(e.target.value)})} />
                  <input type="text" inputMode="numeric" className="col-span-2 border-2 p-2.5 rounded-xl font-bold text-xs md:text-sm outline-none" placeholder="Cashback (Rp)" value={formatRpInput(manualItem.cashback)} onChange={e=>setManualItem({...manualItem, cashback: parseRpInput(e.target.value)})} />
                  <div className="col-span-2 flex items-center gap-2"><span className="text-xs md:text-sm font-bold">Qty:</span><input type="text" inputMode="numeric" min="1" className="flex-1 border-2 p-2.5 rounded-xl font-bold text-xs md:text-sm outline-none" value={formatRpInput(manualItem.qty)} onChange={e=>setManualItem({...manualItem, qty: parseRpInput(e.target.value)})} /></div>
                </div>
                <button onClick={addManualToCart} className="w-full mt-4 bg-blue-600 text-white py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm shadow-sm active:scale-95 transition-transform">Tambah ke Keranjang</button>
             </div>
             
             {products.length > 0 && (
               <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border shadow-sm">
                  <h3 className="font-black text-gray-800 mb-3 md:mb-4 text-xs md:text-sm">Pilih dari Stok Ready</h3>
                  <div className="grid grid-cols-2 gap-2 md:gap-3">
                    {products.map(p => (
                      <button key={p.id} onClick={()=>addToCart({...p, qty: 1})} className="p-3 md:p-4 border-2 rounded-xl md:rounded-2xl text-left hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <p className="font-bold text-xs md:text-sm text-gray-800 truncate">{p.nama}</p>
                        <p className="text-[10px] md:text-xs text-blue-600 font-black mt-1">Rp {p.hargaJual.toLocaleString()}</p>
                        {p.cashback > 0 && <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded font-black mt-1 inline-block">+ CB Rp {p.cashback.toLocaleString()}</span>}
                      </button>
                    ))}
                  </div>
               </div>
             )}
          </div>
          
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border shadow-sm h-fit space-y-4">
             <h3 className="font-black flex items-center gap-1.5 text-gray-800 text-xs md:text-sm"><ShoppingBag size={16}/> Keranjang</h3>
             <div className="space-y-2 md:space-y-3 max-h-48 md:max-h-60 overflow-y-auto pr-1">
                {cart.length === 0 && <p className="text-center py-4 text-gray-400 font-bold text-xs">Kosong</p>}
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-gray-50 p-2 md:p-3 rounded-xl border border-gray-100">
                    <div className="w-3/4">
                       <p className="text-xs md:text-sm font-bold text-gray-800 truncate">{item.nama}</p>
                       <p className="text-[10px] font-bold text-blue-600 mt-0.5">{item.qty}x Rp {(item.hargaJual||0).toLocaleString()}</p>
                    </div>
                    <button onClick={()=>{const n=[...cart];n.splice(idx,1);setCart(n)}} className="text-red-500 bg-red-50 p-1.5 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                ))}
             </div>
             <div className="pt-3 md:pt-4 border-t space-y-3">
                <div><label className="text-[10px] font-black text-gray-400 uppercase">Tempo</label><input type="date" className="w-full mt-1 border-2 p-2 md:p-2.5 rounded-xl font-bold text-xs outline-none" value={tempo} onChange={e=>setTempo(e.target.value)} /></div>
                <div className="flex justify-between items-center font-black text-blue-600 text-sm md:text-base pt-1"><span>Total:</span><span>Rp {totalHutang.toLocaleString()}</span></div>
                {totalCashback > 0 && <div className="flex justify-between items-center font-black text-green-600 text-[10px] md:text-xs"><span>Cashback:</span><span>Rp {totalCashback.toLocaleString()}</span></div>}
                <div className="flex gap-2 pt-2">
                  <button onClick={()=>setStep(1)} className="p-2 md:p-3 bg-gray-100 text-gray-600 rounded-xl"><ArrowLeft size={16}/></button>
                  <button onClick={()=>setStep(3)} disabled={cart.length === 0} className="flex-1 bg-blue-600 text-white font-black py-2 md:py-3 rounded-xl disabled:bg-gray-300 text-xs md:text-sm">Review Pesanan</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border max-w-2xl mx-auto space-y-4 md:space-y-6">
          <div className="text-center"><div className="w-12 h-12 md:w-16 md:h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2 md:mb-3"><Eye size={24}/></div><h2 className="text-lg md:text-xl font-black text-gray-800">Review Transaksi</h2></div>
          
          <div className="bg-gray-50 p-4 md:p-6 rounded-xl md:rounded-2xl border-2 border-dashed border-gray-200 space-y-3 md:space-y-4">
             <div className="grid grid-cols-2 text-xs md:text-sm gap-y-1.5 md:gap-y-2">
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Nama Pelanggan</span><span className="text-right font-black text-gray-800">{debitur.namaLengkap}</span>
                <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Jatuh Tempo</span><span className="text-right font-black text-red-500">{tempo ? new Date(tempo).toLocaleDateString('id-ID') : 'Tidak Ada'}</span>
             </div>
             <hr className="border-gray-200" />
             <div className="space-y-2">
               {cart.map((i, idx) => (
                 <div key={idx} className="flex justify-between text-xs md:text-sm">
                   <div>
                     <span className="font-bold text-gray-600 truncate">{i.nama} <span className="text-blue-600">x{i.qty}</span></span>
                   </div>
                   <span className="font-black text-gray-800">Rp {(i.subtotal||0).toLocaleString()}</span>
                 </div>
               ))}
             </div>
             <hr className="border-gray-200" />
             <div className="flex justify-between text-base md:text-lg font-black text-blue-600 pt-1"><span>TOTAL HUTANG</span><span>Rp {totalHutang.toLocaleString()}</span></div>
          </div>
          
          <div className="flex gap-3 md:gap-4">
             <button onClick={()=>setStep(2)} className="flex-1 bg-gray-100 text-gray-600 font-black py-3 md:py-4 rounded-xl text-xs md:text-sm">Kembali</button>
             <button onClick={handleSubmit} disabled={loading} className="flex-[2] bg-green-500 text-white font-black py-3 md:py-4 rounded-xl shadow-lg flex justify-center items-center gap-1.5 text-xs md:text-sm active:scale-95">{loading ? 'Memproses...' : <><CheckCircle size={16}/> Submit Transaksi</>}</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default Transaksi;