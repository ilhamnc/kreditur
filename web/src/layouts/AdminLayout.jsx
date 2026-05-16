import { useState } from 'react';
import { LayoutDashboard, Users, FileText, Package, Wallet, Menu, X, LogOut, CreditCard, TrendingUp } from 'lucide-react';

const AdminLayout = ({ children, activeTab, setActiveTab, setToken, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Menu navigasi standar
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'transaksi', label: 'Form Pengajuan Baru', icon: CreditCard },
    { id: 'rekap', label: 'Rekap Kredit & ACC', icon: FileText },
    { id: 'debitur', label: 'Data Debitur', icon: Users },
    { id: 'stok', label: 'Stok Barang', icon: Package },
    { id: 'keuangan', label: 'Buku Kas & Keuangan', icon: Wallet },
    { id: 'profit', label: 'Analisis Laba (Rank)', icon: TrendingUp },
  ];

  // Tambahkan menu Karyawan khusus untuk OWNER
  if (user?.role === 'OWNER') {
    menuItems.push({ id: 'karyawan', label: 'Manajemen Karyawan', icon: Users });
  }

  const handleNavClick = (id) => {
    setActiveTab(id); 
    setIsSidebarOpen(false);
  };

  const handleLogout = () => {
    if(window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
    }
  };

  return (
    <div className="flex h-screen w-full bg-gray-50 overflow-hidden text-gray-800 font-sans">
      {/* Overlay Mobile */}
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-xl lg:shadow-none lg:border-r border-gray-200 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 flex flex-col`}>
        <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-blue-600 tracking-tight">KREDITUR</h2>
            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mt-1">Management System</p>
          </div>
          <button className="lg:hidden text-gray-400 hover:text-red-500" onClick={() => setIsSidebarOpen(false)}><X size={20} /></button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button 
              key={item.id} 
              onClick={() => handleNavClick(item.id)} 
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-bold text-sm ${activeTab === item.id ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'}`}
            >
              <item.icon size={18} /> {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white flex items-center px-4 md:px-8 justify-between shrink-0 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-blue-600 bg-blue-50 rounded-lg" onClick={() => setIsSidebarOpen(true)}><Menu size={20} /></button>
            <h1 className="text-lg font-bold text-gray-800 capitalize">{menuItems.find(m => m.id === activeTab)?.label || "Dashboard"}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase">{user?.role}</p>
              <p className="text-sm font-black text-gray-900">{user?.nama || user?.username}</p>
            </div>
            <button onClick={handleLogout} className="text-red-600 bg-red-50 p-2.5 rounded-xl hover:bg-red-100 transition-colors shadow-sm" title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;