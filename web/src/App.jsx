import { useState, useEffect } from 'react';
import LoginPage from './components/loginPage';
import AdminLayout from './layouts/AdminLayout';

// Halaman Admin/Karyawan
import Dashboard from './pages/Dashboard';
import Transaksi from './pages/Transaksi';
import RekapKredit from './pages/RekapKredit';
import DataDebitur from './pages/DataDebitur';
import StokBarang from './pages/StokBarang';
import Keuangan from './pages/Keuangan';
import ManajemenKaryawan from './pages/ManajemenKaryawan';
import Profit from './pages/Profit';

// Halaman Pelanggan (BARU)
import DebiturDashboard from './pages/DebiturDashboard';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!token) return <LoginPage setToken={setToken} setUser={setUser} />;

  // LOGIKA ROUTING: Jika yang login adalah PELANGGAN, langsung tampilkan portalnya
  if (user?.role === 'DEBITUR') {
    return <DebiturDashboard user={user} setToken={setToken} />;
  }

  // Jika yang login adalah OWNER / KARYAWAN, jalankan sistem Admin normal
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard setActiveTab={setActiveTab} />;
      case 'transaksi': return <Transaksi />;
      case 'rekap': return <RekapKredit user={user} />;
      case 'debitur': return <DataDebitur user={user} />;
      case 'stok': return <StokBarang />;
      case 'keuangan': return <Keuangan />;
      case 'karyawan': return <ManajemenKaryawan user={user} />;
      case 'profit': return <Profit />;
      default: return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} setToken={setToken} user={user}>
      {renderContent()}
    </AdminLayout>
  );
}

export default App;