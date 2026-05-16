import { useState } from 'react';
import axios from 'axios';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginPage = ({ setToken, setUser }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${baseURL}/api/auth/login`, { username, password });
      
      // Simpan data ke memori browser
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Update state di App.jsx
      setToken(res.data.token);
      setUser(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal terhubung ke server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <h1 className="text-2xl font-black tracking-tight">KREDITUR APP</h1>
          <p className="text-blue-100 text-sm mt-1">Sistem Manajemen Utang & Approval</p>
        </div>

        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-6">Masuk ke Sistem</h2>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-bold flex items-center gap-2 mb-4 border border-red-100">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="text" 
                  className="w-full border-2 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
                  value={username} onChange={e => setUsername(e.target.value)} required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                <input 
                  type="password" 
                  className="w-full border-2 pl-10 pr-4 py-2.5 rounded-xl text-sm font-semibold outline-none focus:border-blue-500"
                  value={password} onChange={e => setPassword(e.target.value)} required
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-transform active:scale-95 disabled:bg-gray-400 mt-2 flex justify-center items-center gap-2"
            >
              {loading ? 'Memverifikasi...' : 'Login Sekarang'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;