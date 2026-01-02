import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import { Role, User, Teacher, Student } from './types';
import AdminDashboard from './views/AdminDashboard';
import TeacherDashboard from './views/TeacherDashboard';
import StudentDashboard from './views/StudentDashboard';
import { getSettings, getTeachers, getStudents } from './services/dataService';
import { Lock, User as UserIcon, LogIn, ChevronDown } from 'lucide-react';
import { CLASS_LIST } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('dashboard');
  
  // Login State
  const [loginRole, setLoginRole] = useState<Role>('admin');
  
  // Admin & Teacher Inputs
  const [username, setUsername] = useState(''); // For Admin
  const [password, setPassword] = useState(''); // For Admin & Guru
  
  // Teacher Select
  const [selectedTeacherId, setSelectedTeacherId] = useState('');
  
  // Student Select
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');

  // Data for Selectors
  const [teachersList, setTeachersList] = useState<Teacher[]>([]);
  const [studentsList, setStudentsList] = useState<Student[]>([]);

  useEffect(() => {
    setTeachersList(getTeachers());
    setStudentsList(getStudents());
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const settings = getSettings();

    if (loginRole === 'admin') {
      // Admin: Username 'admin', Password '007007Rh'
      if (username === 'admin' && password === (settings.adminPassword || '007007Rh')) {
        setUser({ id: 'admin', name: 'Administrator', role: 'admin' });
        setCurrentView('dashboard');
      } else {
        alert('Username atau Password Admin salah!');
      }

    } else if (loginRole === 'guru') {
      // Guru: Select Name, Password 'guru123'
      if (!selectedTeacherId) return alert("Pilih nama guru terlebih dahulu.");
      
      const teacher = teachersList.find(t => t.id === selectedTeacherId);
      if (teacher && password === (settings.teacherDefaultPassword || 'guru123')) {
        setUser(teacher);
        setCurrentView('dashboard');
      } else {
        alert('Password Guru salah!');
      }

    } else if (loginRole === 'siswa') {
      // Siswa: Select Class, Select Name (No Password)
      if (!selectedStudentId) return alert("Pilih nama siswa terlebih dahulu.");
      
      const student = studentsList.find(s => s.id === selectedStudentId);
      if (student) {
        setUser(student);
        setCurrentView('dashboard');
      } else {
        alert('Data siswa tidak valid.');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUsername('');
    setPassword('');
    setSelectedTeacherId('');
    setSelectedClass('');
    setSelectedStudentId('');
    setLoginRole('admin');
  };

  if (!user) {
    const availableStudents = selectedClass 
      ? studentsList.filter(s => s.className === selectedClass) 
      : [];

    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

        <div className="w-full max-w-md glass-panel rounded-3xl p-8 animate-fade-in relative z-10 border border-white/60 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-white rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/10 mb-4 p-2 backdrop-blur-md border border-white">
               <img 
                 src="https://iili.io/fjROYZv.png" 
                 alt="Logo"
                 className="w-full h-full object-contain"
               />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">SMPN 3 Pacet</h1>
            <p className="text-gray-500">Sistem Informasi Nilai</p>
          </div>

          <div className="flex bg-gray-100/80 p-1.5 rounded-xl mb-6 backdrop-blur-sm border border-gray-200/50">
            {(['admin', 'guru', 'siswa'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => {
                  setLoginRole(r);
                  // Reset states on role switch
                  setUsername('');
                  setPassword('');
                  setSelectedTeacherId('');
                  setSelectedClass('');
                  setSelectedStudentId('');
                }}
                className={`flex-1 py-2 text-sm font-bold rounded-lg capitalize transition-all duration-300 ${
                  loginRole === r 
                  ? 'bg-white text-blue-600 shadow-md transform scale-100' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* --- ADMIN LOGIN FORM --- */}
            {loginRole === 'admin' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Username</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-3 top-3.5 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                    <input
                      type="text"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="admin"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="•••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- GURU LOGIN FORM --- */}
            {loginRole === 'guru' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Nama Guru</label>
                  <div className="relative group">
                    <select
                      required
                      className="w-full pl-4 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
                      value={selectedTeacherId}
                      onChange={e => setSelectedTeacherId(e.target.value)}
                    >
                      <option value="">-- Pilih Nama Guru --</option>
                      {teachersList.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-3 top-3.5 text-gray-400 transition-colors group-focus-within:text-blue-500" size={18} />
                    <input
                      type="password"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                      placeholder="•••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* --- SISWA LOGIN FORM --- */}
            {loginRole === 'siswa' && (
              <>
                 <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Kelas</label>
                  <div className="relative group">
                    <select
                      required
                      className="w-full pl-4 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
                      value={selectedClass}
                      onChange={e => {
                        setSelectedClass(e.target.value);
                        setSelectedStudentId(''); // Reset student when class changes
                      }}
                    >
                      <option value="">-- Pilih Kelas --</option>
                      {CLASS_LIST.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1 ml-1 tracking-wider">Nama Siswa</label>
                  <div className="relative group">
                    <select
                      required
                      disabled={!selectedClass}
                      className={`w-full pl-4 pr-10 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none ${!selectedClass ? 'opacity-50 cursor-not-allowed' : ''}`}
                      value={selectedStudentId}
                      onChange={e => setSelectedStudentId(e.target.value)}
                    >
                      <option value="">-- Pilih Nama Siswa --</option>
                      {availableStudents.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none" size={18} />
                  </div>
                  {!selectedClass && <p className="text-xs text-red-400 mt-1 ml-1">*Pilih kelas terlebih dahulu</p>}
                </div>
              </>
            )}

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <LogIn size={20} />
              Masuk
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400 font-medium">
            &copy; 2026 SMPN 3 Pacet created by erha
          </div>
        </div>
      </div>
    );
  }

  const settings = getSettings();

  return (
    <Layout 
      role={user.role} 
      onLogout={handleLogout} 
      currentView={currentView} 
      onChangeView={setCurrentView}
      userName={user.name}
      schoolName={settings.schoolName}
    >
      {user.role === 'admin' && <AdminDashboard view={currentView} />}
      {user.role === 'guru' && <TeacherDashboard teacher={user as Teacher} view={currentView} onChangeView={setCurrentView} />}
      {user.role === 'siswa' && <StudentDashboard student={user as Student} view={currentView} />}
    </Layout>
  );
};

export default App;