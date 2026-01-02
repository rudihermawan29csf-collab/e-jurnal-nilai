import React, { useState, useEffect } from 'react';
import { getTeachers, saveTeachers, getStudents, saveStudents, getSettings, saveSettings } from '../services/dataService';
import { Teacher, Student, SchoolSettings } from '../types';
import { Plus, Trash2, Edit2, Save, Upload, Download, Users, GraduationCap, Settings, ChevronDown, Award, Check } from 'lucide-react';
import { CLASS_LIST, SUBJECT_LIST, EXTRACURRICULAR_LIST } from '../constants';

const AdminDashboard: React.FC<{ view: string }> = ({ view }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [settings, setSettings] = useState<SchoolSettings>(getSettings());
  
  // Modal/Editing State
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    setTeachers(getTeachers());
    setStudents(getStudents());
    setSettings(getSettings());
  }, []);

  const handleSaveTeacher = () => {
    const updated = isEditing 
      ? teachers.map(t => t.id === isEditing ? { ...formData, id: isEditing } : t)
      : [...teachers, { ...formData, id: Date.now().toString(), role: 'guru' }];
    
    setTeachers(updated);
    saveTeachers(updated);
    setShowForm(false);
    setIsEditing(null);
  };

  const deleteTeacher = (id: string) => {
    if(confirm('Hapus data guru ini?')) {
      const updated = teachers.filter(t => t.id !== id);
      setTeachers(updated);
      saveTeachers(updated);
    }
  };

  const handleSaveStudent = () => {
    const updated = isEditing 
      ? students.map(s => s.id === isEditing ? { ...formData, id: isEditing } : s)
      : [...students, { ...formData, id: Date.now().toString(), role: 'siswa' }];
    
    setStudents(updated);
    saveStudents(updated);
    setShowForm(false);
    setIsEditing(null);
  };

  const deleteStudent = (id: string) => {
    if(confirm('Hapus data siswa ini?')) {
      const updated = students.filter(s => s.id !== id);
      setStudents(updated);
      saveStudents(updated);
    }
  };

  const handleUpdateSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSettings(settings);
    alert('Pengaturan disimpan!');
  };

  // --- CSV HELPER FUNCTIONS ---
  const downloadStudentTemplate = () => {
    const headers = "No,Nama Lengkap,NIS,NISN,Jenis Kelamin(L/P),Kelas";
    const example = "1,Ahmad Siswa,1234,0012345678,L,VII A";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + example;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_siswa_excel.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split('\n');
      const newStudents: Student[] = [];
      
      // Skip header row 0
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const cols = line.split(',');
        if (cols.length >= 6) {
           newStudents.push({
             id: `s_${Date.now()}_${i}`,
             name: cols[1].trim(),
             nis: cols[2].trim(),
             nisn: cols[3].trim(),
             gender: cols[4].trim().toUpperCase() as 'L'|'P',
             className: cols[5].trim(),
             role: 'siswa'
           });
        }
      }

      if (newStudents.length > 0) {
        const updated = [...students, ...newStudents];
        setStudents(updated);
        saveStudents(updated);
        alert(`Berhasil mengupload ${newStudents.length} data siswa.`);
      } else {
        alert("Gagal membaca data atau format salah.");
      }
    };
    reader.readAsText(file);
  };

  if (view === 'settings') {
    return (
      <div className="glass-panel p-8 rounded-3xl animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 tracking-tight">Pengaturan Sekolah</h2>
        <form onSubmit={handleUpdateSettings} className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Sekolah</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                value={settings.schoolName}
                onChange={e => setSettings({...settings, schoolName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tahun Pelajaran</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                value={settings.academicYear}
                onChange={e => setSettings({...settings, academicYear: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Semester</label>
              <div className="relative">
                <select 
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all appearance-none"
                  value={settings.semester}
                  onChange={e => setSettings({...settings, semester: e.target.value as any})}
                >
                  <option value="Ganjil">Ganjil</option>
                  <option value="Genap">Genap</option>
                </select>
                <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
              </div>
            </div>
          </div>
          
           <div className="pt-6 border-t border-gray-200/50">
            <h3 className="font-semibold text-gray-900 mb-4">Kepala Sekolah</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Kepala Sekolah</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={settings.headmasterName || ''}
                  onChange={e => setSettings({...settings, headmasterName: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NIP Kepala Sekolah</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={settings.headmasterNip || ''}
                  onChange={e => setSettings({...settings, headmasterNip: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200/50">
            <h3 className="font-semibold text-gray-900 mb-4">Keamanan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password Admin</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={settings.adminPassword}
                  onChange={e => setSettings({...settings, adminPassword: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password Default Guru</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  value={settings.teacherDefaultPassword}
                  onChange={e => setSettings({...settings, teacherDefaultPassword: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="flex items-center gap-2 bg-blue-500 text-white px-6 py-2.5 rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30 font-medium">
            <Save size={18} /> Simpan Pengaturan
          </button>
        </form>
      </div>
    );
  }

  if (view === 'teachers') {
    return (
      <div className="space-y-6">
        {!showForm && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Data Guru</h2>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-white/60 hover:bg-white shadow-sm transition-all">
              <Download size={18} /> Template
            </button>
            <button 
              onClick={() => { setFormData({subjects: [], classMap: {}}); setIsEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus size={18} /> Tambah Guru
            </button>
          </div>
        </div>
        )}

        {showForm ? (
          <div className="glass-panel p-6 rounded-2xl animate-fade-in-up border border-white/60">
            <h3 className="font-bold mb-4 text-lg">{isEditing ? 'Edit Guru' : 'Tambah Guru Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Nama Lengkap</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">NIP</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nip || ''} onChange={e => setFormData({...formData, nip: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">No HP</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>

               {/* Pangkat & Golongan Inputs */}
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Pangkat</label>
                <input 
                  className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.pangkat || ''} 
                  placeholder="Contoh: Pembina"
                  onChange={e => setFormData({...formData, pangkat: e.target.value})} 
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Golongan</label>
                <input 
                  className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={formData.golongan || ''} 
                  placeholder="Contoh: IV/a"
                  onChange={e => setFormData({...formData, golongan: e.target.value})} 
                />
              </div>
              
              <div className="relative">
                 <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Wali Kelas</label>
                 <div className="relative">
                    <select 
                      className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                      value={formData.homeroomClass || ''}
                      onChange={e => setFormData({...formData, homeroomClass: e.target.value})}
                    >
                      <option value="">-- Pilih Wali Kelas --</option>
                      {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                 </div>
              </div>

              <div className="relative">
                 <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Pembina Ekstra</label>
                 <div className="relative">
                     <select 
                        className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                        value={formData.extracurricular || ''}
                        onChange={e => setFormData({...formData, extracurricular: e.target.value})}
                     >
                        <option value="">-- Pilih Ekstra --</option>
                        {EXTRACURRICULAR_LIST.map(ex => <option key={ex} value={ex}>{ex}</option>)}
                     </select>
                     <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                 </div>
              </div>

              <div className="col-span-full">
                 <label className="text-sm font-semibold mb-2 block text-gray-700">Mata Pelajaran (Pilih untuk membuka opsi kelas)</label>
                 <div className="flex flex-wrap gap-2 mb-4">
                   {SUBJECT_LIST.map(sub => (
                     <button 
                      key={sub} 
                      type="button"
                      onClick={() => {
                        const current = formData.subjects || [];
                        setFormData({...formData, subjects: current.includes(sub) ? current.filter((s:string) => s!==sub) : [...current, sub]});
                      }}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${formData.subjects?.includes(sub) ? 'bg-blue-100 border-blue-300 text-blue-600 font-medium' : 'bg-white/50 border-gray-200 hover:bg-white'}`}
                     >
                       {sub}
                     </button>
                   ))}
                 </div>
              </div>
              
              <div className="col-span-full">
                 <label className="text-sm font-semibold mb-3 block text-gray-700">Kelas Mengajar (Per Mata Pelajaran)</label>
                 <div className="space-y-3">
                   {formData.subjects && formData.subjects.length > 0 ? (
                       formData.subjects.map((sub: string) => (
                           <div key={sub} className="bg-white/50 p-3 rounded-xl border border-gray-100">
                               <p className="text-xs font-bold text-blue-600 uppercase mb-2">{sub}</p>
                               <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                               {CLASS_LIST.map(cls => {
                                   const currentMap = formData.classMap || {};
                                   const subjectsInClass = currentMap[cls] || [];
                                   const isChecked = subjectsInClass.includes(sub);

                                   return (
                                     <label key={cls} className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-600">
                                        <input 
                                           type="checkbox"
                                           checked={isChecked}
                                           onChange={(e) => {
                                               const newMap = { ...currentMap };
                                               let newSubs = [...(newMap[cls] || [])];
                                               
                                               if (e.target.checked) {
                                                   if (!newSubs.includes(sub)) newSubs.push(sub);
                                               } else {
                                                   newSubs = newSubs.filter((s: string) => s !== sub);
                                               }
                                               
                                               if (newSubs.length > 0) newMap[cls] = newSubs;
                                               else delete newMap[cls]; // Cleanup empty

                                               setFormData({ ...formData, classMap: newMap });
                                           }}
                                           className="rounded text-blue-500 focus:ring-0"
                                        />
                                        {cls}
                                     </label>
                                   );
                               })}
                               </div>
                           </div>
                       ))
                   ) : <p className="text-gray-400 text-xs italic">Pilih mata pelajaran terlebih dahulu.</p>}
                 </div>
              </div>

            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Batal</button>
              <button onClick={handleSaveTeacher} className="px-5 py-2 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors">Simpan</button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/60">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead className="bg-white/40 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-3 font-semibold w-10">No</th>
                  <th className="p-3 font-semibold min-w-[200px]">Nama / NIP</th>
                  <th className="p-3 font-semibold min-w-[120px]">Pangkat / Gol</th>
                  <th className="p-3 font-semibold min-w-[150px]">Mapel</th>
                  {CLASS_LIST.map(c => (
                    <th key={c} className="p-3 font-semibold text-center whitespace-nowrap w-10">{c}</th>
                  ))}
                  <th className="p-3 font-semibold min-w-[120px]">Pembina Ekstra</th>
                  <th className="p-3 font-semibold min-w-[120px]">No HP</th>
                  <th className="p-3 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {teachers.map((t, idx) => (
                  <tr key={t.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-3 text-gray-500 text-center">{idx + 1}</td>
                    <td className="p-3">
                        <div className="font-semibold text-gray-900">{t.name}</div>
                        <div className="text-xs text-gray-400 font-normal">{t.nip}</div>
                    </td>
                    <td className="p-3">
                        <div className="text-gray-800">{t.pangkat || '-'}</div>
                        <div className="text-xs text-gray-500">{t.golongan || '-'}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.map(s => <span key={s} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-medium border border-blue-100">{s}</span>)}
                      </div>
                    </td>
                    
                    {CLASS_LIST.map(c => {
                        const subs = t.classMap?.[c] || [];
                        return (
                        <td key={c} className="p-3 text-center">
                            {subs.length > 0 ? (
                                <div className="flex flex-col gap-1 items-center">
                                    {subs.map(s => <span key={s} className="text-[9px] bg-green-100 text-green-700 px-1 rounded whitespace-nowrap">{s.substring(0,3)}</span>)}
                                </div>
                            ) : <span className="text-gray-200 text-xs">-</span>}
                        </td>
                    )})}

                    <td className="p-3 text-gray-600">{t.extracurricular || '-'}</td>
                    <td className="p-3 text-gray-600">{t.phone}</td>
                    
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setFormData(t); setIsEditing(t.id); setShowForm(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteTeacher(t.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </div>
    );
  }

  // ... (Student view remains same)
  if (view === 'students') {
    return (
      <div className="space-y-6">
        {!showForm && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Data Siswa</h2>
          <div className="flex gap-3">
             <button onClick={downloadStudentTemplate} className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-white/60 hover:bg-white shadow-sm transition-all">
              <Download size={18} /> Template
            </button>
            <label className="flex items-center gap-2 text-gray-600 bg-white/80 backdrop-blur px-4 py-2 rounded-xl border border-white/60 hover:bg-white shadow-sm transition-all cursor-pointer">
              <Upload size={18} /> Upload
              <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
            </label>
            <button 
              onClick={() => { setFormData({}); setIsEditing(null); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-xl hover:bg-blue-600 shadow-lg shadow-blue-500/30 transition-all"
            >
              <Plus size={18} /> Tambah Siswa
            </button>
          </div>
        </div>
        )}

        {showForm ? (
          <div className="glass-panel p-6 rounded-2xl animate-fade-in-up border border-white/60">
            <h3 className="font-bold mb-4 text-lg">{isEditing ? 'Edit Siswa' : 'Tambah Siswa Baru'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="col-span-1 md:col-span-2">
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Nama Lengkap</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">NIS</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nis || ''} onChange={e => setFormData({...formData, nis: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">NISN</label>
                <input className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={formData.nisn || ''} onChange={e => setFormData({...formData, nisn: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Jenis Kelamin</label>
                <div className="relative">
                  <select 
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={formData.gender || ''}
                    onChange={e => setFormData({...formData, gender: e.target.value})}
                  >
                    <option value="">-- Pilih --</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-bold ml-1 uppercase">Kelas</label>
                <div className="relative">
                  <select 
                    className="w-full p-2.5 rounded-lg border border-gray-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={formData.className || ''}
                    onChange={e => setFormData({...formData, className: e.target.value})}
                  >
                    <option value="">-- Pilih Kelas --</option>
                    {CLASS_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-3.5 text-gray-400 pointer-events-none"/>
                </div>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium">Batal</button>
              <button onClick={handleSaveStudent} className="px-5 py-2 bg-blue-500 text-white rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-colors">Simpan</button>
            </div>
          </div>
        ) : (
          <div className="glass-panel rounded-2xl overflow-hidden border border-white/60">
            <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead className="bg-white/40 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider backdrop-blur-sm">
                <tr>
                  <th className="p-4 font-semibold">No</th>
                  <th className="p-4 font-semibold">Nama Siswa</th>
                  <th className="p-4 font-semibold">NIS/NISN</th>
                  <th className="p-4 font-semibold">L/P</th>
                  <th className="p-4 font-semibold">Kelas</th>
                  <th className="p-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="p-4 text-gray-500">{idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-900">{s.name}</td>
                    <td className="p-4 text-gray-500 font-mono text-xs">{s.nis} / {s.nisn}</td>
                    <td className="p-4">{s.gender}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold text-gray-600">{s.className}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => { setFormData(s); setIsEditing(s.id); setShowForm(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => deleteStudent(s.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        )}
      </div>
    );
  }

  // Dashboard View (Default)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Guru</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{teachers.length}</p>
        </div>
        <div className="w-12 h-12 bg-blue-100/50 text-blue-600 rounded-2xl flex items-center justify-center"><Users size={24} /></div>
      </div>
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between border border-white/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Siswa</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{students.length}</p>
        </div>
        <div className="w-12 h-12 bg-green-100/50 text-green-600 rounded-2xl flex items-center justify-center"><GraduationCap size={24} /></div>
      </div>
      <div className="glass-panel p-6 rounded-2xl flex items-center justify-between col-span-1 md:col-span-2 border border-white/60 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
        <div>
          <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Tahun Pelajaran</p>
          <p className="text-2xl font-bold text-gray-800 mt-1">{settings.academicYear} - {settings.semester}</p>
        </div>
        <div className="w-12 h-12 bg-purple-100/50 text-purple-600 rounded-2xl flex items-center justify-center"><Settings size={24} /></div>
      </div>
    </div>
  );
};

export default AdminDashboard;