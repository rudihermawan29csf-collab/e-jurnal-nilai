
import React, { useState } from 'react';
import { LogOut, LayoutDashboard, Users, BookOpen, GraduationCap, Menu, X, ChevronDown } from 'lucide-react';
import { Role } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  role: Role;
  onLogout: () => void;
  currentView: string;
  onChangeView: (view: string) => void;
  userName: string;
  schoolName: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, role, onLogout, currentView, onChangeView, userName, schoolName 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getMenuItems = () => {
    switch(role) {
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'teachers', label: 'Guru', icon: Users },
          { id: 'students', label: 'Siswa', icon: GraduationCap },
          { id: 'settings', label: 'Setelan', icon: BookOpen },
        ];
      case 'guru':
        return [
          { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
          { id: 'input-bab', label: 'Bab', icon: BookOpen },
          { id: 'input-nilai', label: 'Input Nilai', icon: GraduationCap },
          { id: 'monitoring', label: 'Monitoring', icon: Users },
        ];
      case 'siswa':
        return [
          { id: 'dashboard', label: 'Nilai', icon: LayoutDashboard },
          { id: 'tasks', label: 'Tugas', icon: BookOpen },
        ];
      default: return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f5f5f7]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/50 h-16 md:h-20 px-4 md:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl p-1 shadow-sm border border-gray-100 overflow-hidden flex-shrink-0">
            <img 
              src="https://iili.io/fjROYZv.png"
              alt="Logo Sekolah"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden sm:block overflow-hidden">
            <h1 className="font-bold text-sm md:text-base leading-tight text-gray-800 truncate">{schoolName}</h1>
            <p className="text-[10px] text-gray-500 font-medium truncate">E-Rapor Sistem Informasi Nilai</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                    : 'text-gray-600 hover:bg-white/80 hover:text-black active:scale-[0.98]'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Info & Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <p className="text-xs font-bold text-gray-800 truncate max-w-[150px]">{userName}</p>
            <p className="text-[10px] text-gray-500 capitalize">{role}</p>
          </div>
          
          <button 
            onClick={onLogout}
            className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-100"
            title="Keluar"
          >
            <LogOut size={20} />
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2.5 text-gray-600 hover:bg-white/80 rounded-xl transition-colors border border-gray-200/50"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-20 px-4 pb-4 animate-fade-in">
          <div className="absolute inset-0 bg-gray-900/10 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)}></div>
          <div className="relative glass-panel rounded-3xl p-4 shadow-2xl border border-white/80 flex flex-col gap-2">
            <div className="px-4 py-3 border-b border-gray-100 mb-2">
              <p className="text-sm font-bold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500 capitalize">{role}</p>
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onChangeView(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-4 w-full px-5 py-3.5 rounded-2xl text-base font-bold transition-all ${
                    isActive 
                      ? 'bg-blue-500 text-white shadow-xl shadow-blue-500/20' 
                      : 'text-gray-600 hover:bg-gray-100 active:scale-[0.98]'
                  }`}
                >
                  <Icon size={22} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto p-4 md:p-8 relative scroll-smooth">
        <div className="max-w-7xl mx-auto space-y-6 pb-20 md:pb-12">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
