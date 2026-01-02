
import React, { useState, useEffect } from 'react';
import { getStudents, getChapters, saveChapters, getGrades, saveGrades, getSettings, getTeacherConfig, saveTeacherConfig, getTeachers } from '../services/dataService';
import { Teacher, Chapter, GradeRecord, Student, TeacherConfig } from '../types';
import { CLASS_LIST } from '../constants';
import { Plus, Save, ChevronDown, Check, AlertCircle, BookOpen, FileText, Clock, List, Edit2, Trash2, AlertTriangle, GraduationCap, Monitor, Users, Calendar, History, X } from 'lucide-react';

const TeacherDashboard: React.FC<{ teacher: Teacher, view: string, onChangeView?: (view: string) => void }> = ({ teacher: initialTeacher, view, onChangeView }) => {
  const settings = getSettings();
  const [teacher, setTeacher] = useState<Teacher>(initialTeacher);
  const [chapters, setChapters] = useState<Chapter[]>(getChapters());
  const [grades, setGrades] = useState<GradeRecord[]>(getGrades());
  const [students, setStudents] = useState<Student[]>(getStudents());

  // --- HELPER FUNCTIONS ---

  const getAssignedClassesForSubject = (subject: string) => {
    if (!teacher.classMap) return [];
    return Object.keys(teacher.classMap).filter(cls => 
      Array.isArray(teacher.classMap?.[cls]) && teacher.classMap[cls].includes(subject)
    ).sort();
  };

  const getValidJenjangsForSubject = (subject: string) => {
    const assignedClasses = getAssignedClassesForSubject(subject);
    const jenjangs = new Set<string>();
    assignedClasses.forEach(cls => {
      if (cls.startsWith('VII ')) jenjangs.add('7');
      else if (cls.startsWith('VIII ')) jenjangs.add('8');
      else if (cls.startsWith('IX ')) jenjangs.add('9');
    });
    return Array.from(jenjangs).sort();
  };

  const getClassesByJenjangAndSubject = (jenjang: string, subject: string) => {
    const assignedClasses = getAssignedClassesForSubject(subject);
    const roman = jenjang === '7' ? 'VII ' : jenjang === '8' ? 'VIII ' : 'IX ';
    return assignedClasses.filter(c => c.startsWith(roman));
  };

  const getScoreColor = (value: number) => {
    if (value === undefined || value === null || value <= 0) return 'text-gray-300';
    if (value >= 85) return 'bg-green-100 text-green-700 font-bold';
    if (value >= 75) return 'bg-blue-50 text-blue-700 font-bold';
    if (value >= 70) return 'bg-yellow-100 text-yellow-700 font-bold';
    return 'bg-red-100 text-red-700 font-bold';
  };
  
  // --- STATE: INPUT BAB ---
  const [babSubject, setBabSubject] = useState(teacher.subjects[0] || '');
  const [babSemester, setBabSemester] = useState(settings.semester);
  const [babJenjang, setBabJenjang] = useState(''); 
  const [babClasses, setBabClasses] = useState<string[]>([]);
  const [babCount, setBabCount] = useState(1);
  const [babInputs, setBabInputs] = useState([{ name: '' }]);
  const [editingChapterGroup, setEditingChapterGroup] = useState<{oldName: string, newName: string, subject: string, semester: string} | null>(null);

  // --- STATE: INPUT NILAI ---
  const [scoreDate, setScoreDate] = useState(new Date().toISOString().split('T')[0]);
  const [scoreSemester, setScoreSemester] = useState(settings.semester);
  const [scoreJenjang, setScoreJenjang] = useState('');
  const [scoreClass, setScoreClass] = useState<string>(''); 
  const [scoreSubject, setScoreSubject] = useState(teacher.subjects[0] || '');
  const [scoreChapterId, setScoreChapterId] = useState('');
  const [scoreSubChapterName, setScoreSubChapterName] = useState(''); 
  const [scoreType, setScoreType] = useState('formative_1');
  const [scoreDescription, setScoreDescription] = useState(''); 
  const [tempGrades, setTempGrades] = useState<GradeRecord[]>([]);

  // --- STATE: MONITORING ---
  const [monSubject, setMonSubject] = useState(teacher.subjects[0] || '');
  const [monSemester, setMonSemester] = useState<'Ganjil'|'Genap'>(settings.semester);
  const [monClass, setMonClass] = useState('');

  useEffect(() => {
    const allTeachers = getTeachers();
    const updatedTeacher = allTeachers.find(t => t.id === initialTeacher.id);
    if (updatedTeacher) {
      setTeacher(updatedTeacher);
    }
    setChapters(getChapters());
    setGrades(getGrades());
    setTempGrades(getGrades()); 
    setStudents(getStudents()); 
  }, [view]);

  useEffect(() => {
    const validJ = getValidJenjangsForSubject(babSubject);
    if (!validJ.includes(babJenjang)) setBabJenjang(validJ[0] || '');
  }, [babSubject, teacher]);

  useEffect(() => {
    const validJ = getValidJenjangsForSubject(scoreSubject);
    if (!validJ.includes(scoreJenjang)) {
      setScoreJenjang(validJ[0] || '');
      setScoreClass('');
    }
  }, [scoreSubject, teacher]);

  useEffect(() => {
     if (babInputs.length !== babCount) {
         const newInputs = [...babInputs];
         if (babCount > newInputs.length) {
             for(let i = newInputs.length; i < babCount; i++) {
                 newInputs.push({ name: '' });
             }
         } else {
             newInputs.splice(babCount);
         }
         setBabInputs(newInputs);
     }
  }, [babCount]);

  // Handle ScoreType Availability
  const getAvailableScoreTypes = () => {
      if (!scoreClass || !scoreSubject) return [];
      const classGrades = grades.filter(g => g.className === scoreClass && g.subject === scoreSubject && g.semester === scoreSemester);
      
      const allTypes = [
          { id: 'formative_1', label: 'Formatif 1' },
          { id: 'formative_2', label: 'Formatif 2' },
          { id: 'formative_3', label: 'Formatif 3' },
          { id: 'formative_4', label: 'Formatif 4' },
          { id: 'formative_5', label: 'Formatif 5' },
          { id: 'summative', label: 'Sumatif' },
          { id: 'sts', label: 'STS' },
          { id: 'sas', label: 'SAS' }
      ];

      return allTypes.filter(type => {
          return !classGrades.some(g => {
              if (type.id === 'sts') return g.sts && g.sts > 0;
              if (type.id === 'sas') return g.sas && g.sas > 0;
              if (scoreChapterId && g.grades[scoreChapterId]) {
                  const ch = g.grades[scoreChapterId];
                  if (type.id === 'summative') return ch.summative && ch.summative > 0;
                  if (type.id.startsWith('formative_')) {
                      const idx = parseInt(type.id.split('_')[1]) - 1;
                      return ch.formatives[idx] && ch.formatives[idx] > 0;
                  }
              }
              return false;
          });
      });
  };

  // Auto reset scoreType when chapter/class changes
  useEffect(() => {
      const available = getAvailableScoreTypes();
      if (available.length > 0) {
          if (!available.find(a => a.id === scoreType)) {
              setScoreType(available[0].id);
          }
      } else {
          setScoreType('');
      }
  }, [scoreChapterId, scoreClass, scoreSubject, scoreSemester, grades]);

  const saveNewChapter = () => {
    if(babClasses.length === 0) return alert("Pilih minimal satu kelas");
    for(let i=0; i<babInputs.length; i++) {
        if(!babInputs[i].name) return alert(`Nama Bab ke-${i+1} wajib diisi`);
    }
    
    let updatedChapters = [...chapters];
    babClasses.forEach(cls => {
       babInputs.forEach((input, idx) => {
           updatedChapters = updatedChapters.filter(c => 
              !(c.subject === babSubject && c.semester === babSemester && c.className === cls && c.name === input.name)
           );
           updatedChapters.push({
               id: `chap_${Date.now()}_${cls.replace(/\s/g,'')}_${idx}_${Math.random().toString(36).substr(2, 5)}`, 
               semester: babSemester,
               subject: babSubject,
               className: cls,
               name: input.name,
               subChapters: [] 
           });
       });
    });
    
    setChapters(updatedChapters);
    saveChapters(updatedChapters);
    alert(`Bab berhasil disimpan`);
    setBabCount(1);
    setBabInputs([{ name: '' }]);
    setBabClasses([]);
  };

  const handleEditChapterName = () => {
    if (!editingChapterGroup || !editingChapterGroup.newName) return;
    const { oldName, newName, subject, semester } = editingChapterGroup;
    
    const updated = chapters.map(c => {
        if (c.subject === subject && c.semester === semester && c.name === oldName) {
            return { ...c, name: newName };
        }
        return c;
    });
    
    setChapters(updated);
    saveChapters(updated);
    setEditingChapterGroup(null);
    alert("Nama Bab berhasil diubah!");
  };

  const deleteChapterGroup = (subject: string, semester: string, name: string) => {
    if(confirm(`Hapus Bab "${name}"?`)) {
        const updated = chapters.filter(c => !(c.subject === subject && c.semester === semester && c.name === name));
        setChapters(updated);
        saveChapters(updated);
    }
  };

  const handleTempGradeChange = (studentId: string, className: string, value: number) => {
    let typeKey = '';
    let subIdx = 0;
    if (scoreType.startsWith('formative_')) {
        typeKey = 'formative';
        subIdx = parseInt(scoreType.split('_')[1]) - 1;
    } else {
        typeKey = scoreType; 
    }

    if (isNaN(value)) value = 0;
    if (value < 0) value = 0;
    if (value > 100) value = 100;

    const updatedTemp = [...tempGrades];
    const existingIdx = updatedTemp.findIndex(g => g.studentId === studentId && g.subject === scoreSubject && g.semester === scoreSemester);
    
    let record: GradeRecord;
    if (existingIdx >= 0) {
        record = JSON.parse(JSON.stringify(updatedTemp[existingIdx]));
    } else {
        record = { 
            id: `grade_${Date.now()}_${studentId}`, 
            studentId, 
            subject: scoreSubject, 
            semester: scoreSemester, 
            className: className, 
            grades: {}, 
            lastUpdated: scoreDate 
        };
    }

    record.lastUpdated = scoreDate;
    
    if (typeKey === 'sts') record.sts = value;
    else if (typeKey === 'sas') record.sas = value;
    else if (scoreChapterId) {
       if (!record.grades[scoreChapterId]) {
           record.grades[scoreChapterId] = { formatives: [0,0,0,0,0], summative: 0, average: 0, description: scoreDescription };
       }
       if (typeKey === 'formative') record.grades[scoreChapterId].formatives[subIdx] = value;
       else if (typeKey === 'summative') record.grades[scoreChapterId].summative = value;
       record.grades[scoreChapterId].description = scoreDescription;
    }

    if (existingIdx >= 0) updatedTemp[existingIdx] = record;
    else updatedTemp.push(record);
    
    setTempGrades(updatedTemp);
  };

  const handleSaveToStorage = () => {
      if (!scoreType) return alert("Pilih jenis nilai terlebih dahulu");
      const studentsInClass = students.filter(s => s.className === scoreClass);
      let globalGrades = [...getGrades()]; 
      
      studentsInClass.forEach(s => {
          const tempRec = tempGrades.find(g => g.studentId === s.id && g.subject === scoreSubject && g.semester === scoreSemester);
          const globalIdx = globalGrades.findIndex(g => g.studentId === s.id && g.subject === scoreSubject && g.semester === scoreSemester);
          
          let recordToSave: GradeRecord;
          if (tempRec) recordToSave = JSON.parse(JSON.stringify(tempRec));
          else if (globalIdx >= 0) recordToSave = JSON.parse(JSON.stringify(globalGrades[globalIdx]));
          else {
              recordToSave = { 
                  id: `grade_${Date.now()}_${s.id}`, 
                  studentId: s.id, 
                  subject: scoreSubject, 
                  semester: scoreSemester, 
                  className: s.className, 
                  grades: {}, 
                  lastUpdated: scoreDate 
              };
          }

          if (scoreType === 'sts') {
              recordToSave.sts = recordToSave.sts || 0;
          } else if (scoreType === 'sas') {
              recordToSave.sas = recordToSave.sas || 0;
          } else if (scoreChapterId) {
              if (!recordToSave.grades[scoreChapterId]) {
                  recordToSave.grades[scoreChapterId] = { formatives: [0,0,0,0,0], summative: 0, average: 0, description: scoreDescription };
              }
              const g = recordToSave.grades[scoreChapterId];
              g.description = scoreDescription;
          }
          recordToSave.lastUpdated = scoreDate;
          if (globalIdx >= 0) globalGrades[globalIdx] = recordToSave;
          else globalGrades.push(recordToSave);
      });

      setGrades(globalGrades);
      saveGrades(globalGrades);
      
      // RESET FORM SETELAH SIMPAN
      setScoreJenjang('');
      setScoreClass('');
      setScoreChapterId('');
      setScoreSubChapterName('');
      setScoreType('formative_1');
      setScoreDescription('');
      setTempGrades([]); 
      
      alert("Nilai berhasil disimpan!");
  };

  const deleteHistory = (type: string, chapterId: string, date: string, className?: string) => {
    if(!confirm(`Hapus seluruh nilai untuk ${type.replace('_',' ')} di tanggal ${date}?`)) return;
    const targetClass = className || scoreClass;
    if(!targetClass) return alert("Pilih kelas terlebih dahulu");

    const studentsInClass = students.filter(s => s.className === targetClass);
    let updated = [...grades];
    studentsInClass.forEach(s => {
        const idx = updated.findIndex(g => g.studentId === s.id && g.subject === scoreSubject && g.semester === scoreSemester);
        if(idx >= 0) {
            const rec = updated[idx];
            if(type === 'sts') rec.sts = 0;
            else if(type === 'sas') rec.sas = 0;
            else if(chapterId && rec.grades[chapterId]) {
                if(type.startsWith('formative')) {
                    rec.grades[chapterId].formatives[parseInt(type.split('_')[1]) - 1] = 0;
                } else if(type === 'summative') {
                    rec.grades[chapterId].summative = 0;
                }
            }
        }
    });
    setGrades(updated);
    saveGrades(updated);
  };

  const handleEditFromSummary = (h: any, className: string) => {
      // Switch view to input-nilai
      if (onChangeView) onChangeView('input-nilai');
      
      // Set values
      setScoreClass(className);
      // Determine jenjang from class name
      const jen = className.startsWith('VII ') ? '7' : className.startsWith('VIII ') ? '8' : '9';
      setScoreJenjang(jen);
      setScoreDate(h.date);
      setScoreType(h.type);
      setScoreDescription(h.desc);
      setScoreChapterId(h.cid);
      
      // Look up chapter name if cid exists
      if (h.cid !== 'null' && h.cid !== '-') {
          const chap = chapters.find(c => c.id === h.cid);
          if (chap) setScoreSubChapterName(chap.name);
      } else {
          setScoreSubChapterName('');
      }
  };

  if (view === 'input-bab') {
    const validJenjangs = getValidJenjangsForSubject(babSubject);
    const availableClasses = getClassesByJenjangAndSubject(babJenjang, babSubject);
    const myChapters = chapters.filter(c => teacher.subjects.includes(c.subject));
    const groupedChapters: any[] = [];
    myChapters.forEach(c => {
        const key = `${c.subject}|${c.semester}|${c.name}`;
        const existing = groupedChapters.find(g => g.key === key);
        if (existing) { 
          if (!existing.classes.includes(c.className)) {
            existing.classes.push(c.className); 
            existing.classes.sort(); 
          }
        }
        else { groupedChapters.push({ key, subject: c.subject, semester: c.semester, name: c.name, classes: [c.className] }); }
    });

    return (
      <div className="space-y-8 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl max-w-4xl mx-auto border border-white/60">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><BookOpen size={24} className="text-blue-500"/> Input Struktur Bab</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Mata Pelajaran</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-gray-200 focus:bg-white outline-none" value={babSubject} onChange={e => setBabSubject(e.target.value)}>
                        {teacher.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Semester</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-gray-200 focus:bg-white outline-none" value={babSemester} onChange={e => setBabSemester(e.target.value as any)}>
                        <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Jumlah Bab</label>
                    <select className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-gray-200 focus:bg-white outline-none" value={babCount} onChange={e => setBabCount(parseInt(e.target.value))}>
                        {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n} Bab</option>)}
                    </select>
                </div>
            </div>

            <div className="mb-6">
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Jenjang Kelas</label>
                <select className="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-gray-200 focus:bg-white outline-none" value={babJenjang} onChange={e => setBabJenjang(e.target.value)}>
                    <option value="">-- Pilih Jenjang --</option>
                    {validJenjangs.map(j => <option key={j} value={j}>Kelas {j}</option>)}
                </select>
            </div>

            <div className="mb-8 p-5 bg-white/40 rounded-2xl border border-gray-200">
                <label className="block text-sm font-bold text-gray-700 mb-4">Pilih Kelas Berlaku</label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    {availableClasses.map(cls => (
                        <label key={cls} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/60">
                            <input type="checkbox" checked={babClasses.includes(cls)} onChange={e => e.target.checked ? setBabClasses([...babClasses, cls]) : setBabClasses(babClasses.filter(c => c !== cls))} className="rounded text-blue-500 focus:ring-0" />
                            <span className="text-sm font-bold text-gray-600">{cls}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="space-y-4 mb-8">
                {babInputs.map((input, i) => (
                    <div key={i} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-200">
                        <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1.5 ml-1">Nama Bab {i+1}</label>
                        <input type="text" placeholder="Contoh: Bab 1: Bilangan Bulat" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none" value={input.name} onChange={e => { const n = [...babInputs]; n[i].name = e.target.value; setBabInputs(n); }} />
                    </div>
                ))}
            </div>
            
            <button onClick={saveNewChapter} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-[0.98]">
                Simpan Struktur Bab
            </button>
        </div>

        <div className="glass-panel p-6 rounded-3xl border border-white/60 overflow-hidden shadow-sm relative">
            <h3 className="font-bold text-lg mb-6 text-gray-800 flex items-center gap-2 px-2"><List size={18} className="text-blue-500"/> Daftar Bab Terdaftar</h3>
            
            {/* Edit Modal (Inline/Simple) */}
            {editingChapterGroup && (
                <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm p-8 flex items-center justify-center animate-fade-in">
                    <div className="max-w-md w-full glass-panel p-6 rounded-2xl border border-blue-200 shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-bold text-gray-800">Edit Nama Bab</h4>
                            <button onClick={() => setEditingChapterGroup(null)}><X size={20} className="text-gray-400"/></button>
                        </div>
                        <input 
                            type="text" 
                            className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none mb-4" 
                            value={editingChapterGroup.newName}
                            onChange={e => setEditingChapterGroup({...editingChapterGroup, newName: e.target.value})}
                        />
                        <div className="flex gap-2">
                            <button onClick={() => setEditingChapterGroup(null)} className="flex-1 py-2 rounded-xl bg-gray-100 font-bold text-gray-600">Batal</button>
                            <button onClick={handleEditChapterName} className="flex-1 py-2 rounded-xl bg-blue-600 font-bold text-white">Simpan Perubahan</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-gray-100/50 border-b text-[10px] uppercase text-gray-500 tracking-wider">
                        <tr>
                            <th className="p-4 w-32">Kelas</th>
                            <th className="p-4 w-24 text-center">Semester</th>
                            <th className="p-4 w-40">Mapel</th>
                            <th className="p-4">Nama Bab</th>
                            <th className="p-4 w-28 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-100">
                        {groupedChapters.map((grp, i) => (
                            <tr key={i} className="hover:bg-blue-50/20 transition-colors">
                                <td className="p-4 align-top">
                                    <div className="flex flex-wrap gap-1">
                                        {grp.classes.map((c: string) => <span key={c} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">{c}</span>)}
                                    </div>
                                </td>
                                <td className="p-4 align-top text-center text-gray-500 font-bold">{grp.semester}</td>
                                <td className="p-4 align-top text-gray-600 font-medium">{grp.subject}</td>
                                <td className="p-4 align-top font-bold text-gray-800">{grp.name}</td>
                                <td className="p-4 align-top text-right">
                                    <div className="flex justify-end gap-1">
                                        <button onClick={() => setEditingChapterGroup({oldName: grp.name, newName: grp.name, subject: grp.subject, semester: grp.semester})} className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all" title="Edit Nama Bab"><Edit2 size={18}/></button>
                                        <button onClick={() => deleteChapterGroup(grp.subject, grp.semester, grp.name)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all" title="Hapus"><Trash2 size={18}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    );
  }

  if (view === 'input-nilai') {
    const validJenjangsForScore = getValidJenjangsForSubject(scoreSubject);
    const availableClasses = getClassesByJenjangAndSubject(scoreJenjang, scoreSubject);
    const filteredStudents = students.filter(s => s.className === scoreClass);
    filteredStudents.sort((a,b) => a.name.localeCompare(b.name));
    const relevantChapters = chapters.filter(c => c.subject === scoreSubject && c.semester === scoreSemester && c.className === scoreClass);

    const availableScoreTypes = getAvailableScoreTypes();

    // Derive history correctly
    const historyList: any[] = [];
    if (scoreClass) {
        const classGrades = grades.filter(g => g.className === scoreClass && g.subject === scoreSubject && g.semester === scoreSemester);
        const uniqueEntries = new Set<string>();
        classGrades.forEach(g => {
            const date = g.lastUpdated || 'No Date';
            if(g.sts && g.sts > 0) uniqueEntries.add(`sts|${date}|null`);
            if(g.sas && g.sas > 0) uniqueEntries.add(`sas|${date}|null`);
            Object.keys(g.grades).forEach(cid => {
                const gd = g.grades[cid];
                gd.formatives.forEach((f, idx) => { if(f > 0) uniqueEntries.add(`formative_${idx+1}|${date}|${cid}`); });
                if(gd.summative > 0) uniqueEntries.add(`summative|${date}|${cid}`);
            });
        });
        uniqueEntries.forEach(entry => {
            const [type, date, cid] = entry.split('|');
            const chap = relevantChapters.find(c => c.id === cid);
            const classGradesWithCid = classGrades.find(g => g.grades[cid]);
            const desc = classGradesWithCid?.grades[cid]?.description || '-';
            historyList.push({ type, date, chapterName: chap?.name || '-', chapterId: cid, description: desc });
        });
    }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="glass-panel p-6 rounded-2xl border border-white/60">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><GraduationCap size={20} className="text-blue-500"/> Input Nilai</h2>
                <input type="date" className="px-3 py-1.5 bg-white border rounded-lg text-sm" value={scoreDate} onChange={e => setScoreDate(e.target.value)}/>
             </div>
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                 <select className="p-2.5 rounded-xl border text-sm" value={scoreSemester} onChange={e => setScoreSemester(e.target.value as any)}>
                    <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
                 </select>
                 <select className="p-2.5 rounded-xl border text-sm" value={scoreJenjang} onChange={e => setScoreJenjang(e.target.value)}>
                    <option value="">-- Jenjang --</option>
                    {validJenjangsForScore.map(j => <option key={j} value={j}>Kelas {j}</option>)}
                 </select>
                 <select className="p-2.5 rounded-xl border text-sm" value={scoreSubject} onChange={e => setScoreSubject(e.target.value)}>
                    {teacher.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <select className="p-2.5 rounded-xl border text-sm" value={scoreClass} onChange={e => setScoreClass(e.target.value)}>
                    <option value="">-- Kelas --</option>
                    {availableClasses.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                 </select>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <select className="p-2.5 rounded-xl border text-sm" value={scoreSubChapterName} onChange={e => { setScoreSubChapterName(e.target.value); const ch = relevantChapters.find(c => c.name === e.target.value); setScoreChapterId(ch?.id || ''); }}>
                    <option value="">-- Pilih Bab --</option>
                    {relevantChapters.map((c, idx) => <option key={idx} value={c.name}>{c.name}</option>)}
                </select>
                <select className="p-2.5 rounded-xl border text-sm" value={scoreType} onChange={e => setScoreType(e.target.value)}>
                    <option value="">-- Pilih Jenis Nilai --</option>
                    {availableScoreTypes.map(st => <option key={st.id} value={st.id}>{st.label}</option>)}
                    {availableScoreTypes.length === 0 && scoreClass && <option disabled>Semua jenis nilai sudah terisi</option>}
                </select>
                <input type="text" placeholder="Keterangan Tugas" className="p-2.5 rounded-xl border text-sm" value={scoreDescription} onChange={e => setScoreDescription(e.target.value)} />
             </div>
        </div>
        
        {scoreClass && scoreType && (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/60">
                <table className="w-full text-left table-auto">
                    <thead className="bg-white/40 text-gray-500 text-[10px] uppercase tracking-wider">
                        <tr>
                            <th className="p-3 w-8 text-center">No</th>
                            <th className="p-3">Nama Siswa</th>
                            <th className="p-3 w-28 text-center">Nilai</th>
                            <th className="p-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-[10px]">
                        {filteredStudents.map((s, idx) => {
                            const rec = tempGrades.find(g => g.studentId === s.id && g.subject === scoreSubject && g.semester === scoreSemester);
                            let val = 0;
                            if (rec) {
                                if (scoreType === 'sts') val = rec.sts || 0;
                                else if (scoreType === 'sas') val = rec.sas || 0;
                                else if (scoreChapterId && rec.grades[scoreChapterId]) {
                                    if(scoreType === 'summative') val = rec.grades[scoreChapterId].summative || 0;
                                    else if (scoreType.startsWith('formative_')) val = rec.grades[scoreChapterId].formatives[parseInt(scoreType.split('_')[1]) - 1] || 0;
                                }
                            }
                            return (
                            <tr key={s.id} className="hover:bg-blue-50/30">
                                <td className="p-3 text-center text-gray-400">{idx+1}</td>
                                <td className="p-3 font-bold text-gray-800">{s.name}</td>
                                <td className="p-3">
                                    <input type="number" className="w-full p-1 text-center border rounded font-bold" value={val || ''} placeholder="0" onChange={e => handleTempGradeChange(s.id, s.className, parseInt(e.target.value))}/>
                                </td>
                                <td className="p-3 font-bold">
                                    {val >= 75 ? <span className="text-green-600">Tuntas</span> : (val > 0 ? <span className="text-red-500">Remedial</span> : <span className="text-gray-300">-</span>)}
                                </td>
                            </tr>
                            );
                        })}
                    </tbody>
                </table>
                <div className="p-4 border-t bg-gray-50/30 text-right">
                    <button onClick={handleSaveToStorage} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center gap-2 ml-auto">
                        <Save size={16}/> Simpan Nilai
                    </button>
                </div>
            </div>
        )}

        {scoreClass && (
            <div className="glass-panel p-6 rounded-2xl border border-white/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><History size={18} className="text-blue-500"/> Riwayat Input Nilai</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px] text-[10px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Jenis Nilai</th>
                                <th className="p-3">Bab</th>
                                <th className="p-3">Keterangan</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {historyList.map((h, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3">{h.date}</td>
                                    <td className="p-3 font-bold capitalize">{h.type.replace('_',' ')}</td>
                                    <td className="p-3">{h.chapterName}</td>
                                    <td className="p-3 text-gray-500 italic">{h.description}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => { setScoreType(h.type); setScoreChapterId(h.chapterId); setScoreSubChapterName(h.chapterName); setScoreDate(h.date); setScoreDescription(h.description); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={14}/></button>
                                            <button onClick={() => deleteHistory(h.type, h.chapterId, h.date)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {historyList.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-400">Belum ada riwayat input.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    );
  }

  if (view === 'monitoring') {
     const assignedClassesForMon = getAssignedClassesForSubject(monSubject);
     const classStudents = students.filter(s => s.className === monClass);
     const availableChapters = chapters.filter(c => c.subject === monSubject && c.className === monClass && c.semester === monSemester);
     availableChapters.sort((a,b) => a.name.localeCompare(b.name, undefined, {numeric: true}));

     const classGrades = grades.filter(g => g.className === monClass && g.subject === monSubject && g.semester === monSemester);
     
     const activeColumnsMap: {[chapId: string]: { formatives: boolean[], summative: boolean }} = {};
     let isStsActive = false;
     let isSasActive = false;

     availableChapters.forEach(chap => {
        activeColumnsMap[chap.id] = { formatives: [false, false, false, false, false], summative: false };
        classGrades.forEach(g => {
            const chapGrade = g.grades[chap.id];
            if (chapGrade) {
                chapGrade.formatives.forEach((val, idx) => { if(val > 0) activeColumnsMap[chap.id].formatives[idx] = true; });
                if (chapGrade.summative > 0) activeColumnsMap[chap.id].summative = true;
            }
            if (g.sts && g.sts > 0) isStsActive = true;
            if (g.sas && g.sas > 0) isSasActive = true;
        });
     });

     // Derived summary for bottom table with Semester and Chapter
     const monSummary: any[] = [];
     if(monClass) {
        const uniqueSet = new Set<string>();
        classGrades.forEach(g => {
            const date = g.lastUpdated || '-';
            const sem = g.semester || '-';
            if(g.sts && g.sts > 0) uniqueSet.add(`sts|${date}|-|null|${sem}`);
            if(g.sas && g.sas > 0) uniqueSet.add(`sas|${date}|-|null|${sem}`);
            Object.keys(g.grades).forEach(cid => {
                const gd = g.grades[cid];
                gd.formatives.forEach((f, idx) => { if(f > 0) uniqueSet.add(`formative_${idx+1}|${date}|${gd.description || '-'}|${cid}|${sem}`); });
                if(gd.summative > 0) uniqueSet.add(`summative|${date}|${gd.description || '-'}|${cid}|${sem}`);
            });
        });
        uniqueSet.forEach(s => { 
            const [type, date, desc, cid, sem] = s.split('|'); 
            const chap = chapters.find(c => c.id === cid);
            monSummary.push({ type, date, desc, cid, semester: sem, chapterName: chap?.name || '-' }); 
        });
     }

    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-wrap gap-4 items-end glass-panel p-6 rounded-2xl border border-white/60">
           <div className="w-48">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Mata Pelajaran</label>
              <select className="w-full p-2.5 rounded-xl border mt-1 outline-none bg-white/50" value={monSubject} onChange={e => { setMonSubject(e.target.value); setMonClass(''); }}>
                  {teacher.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
           </div>
           <div className="w-32">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Semester</label>
              <select className="w-full p-2.5 rounded-xl border mt-1 outline-none bg-white/50" value={monSemester} onChange={e => setMonSemester(e.target.value as any)}>
                  <option value="Ganjil">Ganjil</option><option value="Genap">Genap</option>
              </select>
           </div>
           <div className="w-48">
              <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Kelas</label>
              <select className="w-full p-2.5 rounded-xl border mt-1 outline-none bg-white/50" value={monClass} onChange={e => setMonClass(e.target.value)}>
                  <option value="">-- Pilih Kelas --</option>
                  {assignedClassesForMon.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
           </div>
        </div>

        {monClass ? (
            <div className="glass-panel rounded-2xl overflow-hidden border border-white/60 shadow-sm animate-fade-in-up">
                <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-[10px] table-auto">
                        <thead className="bg-gray-50/50 text-gray-600 border-b">
                            <tr>
                                <th rowSpan={3} className="p-2 border-r w-8 text-center font-bold bg-gray-50">No</th>
                                <th rowSpan={3} className="p-2 border-r text-left font-bold bg-white/95 whitespace-nowrap w-1">Nama Siswa</th>
                                {availableChapters.map((chap, i) => (
                                    <th key={i} colSpan={7} className="p-2 border-r text-center font-bold bg-blue-600 text-white truncate max-w-[200px]">{chap.name}</th>
                                ))}
                                <th rowSpan={3} className="p-2 border-r w-12 bg-amber-500 text-white text-center font-bold">STS</th>
                                <th rowSpan={3} className="p-2 border-r w-12 bg-amber-500 text-white text-center font-bold">SAS</th>
                                <th rowSpan={3} className="p-2 w-14 bg-emerald-600 text-white text-center font-bold">Rapor</th>
                            </tr>
                            <tr>
                                {availableChapters.map((_, i) => (
                                    <React.Fragment key={i}>
                                        <th colSpan={5} className="p-1 border-r border-b text-center font-bold bg-blue-50 text-blue-800">Formatif</th>
                                        <th rowSpan={2} className="p-1 border-r text-center font-bold bg-blue-100 text-blue-900">Sum</th>
                                        <th rowSpan={2} className="p-1 border-r text-center font-bold bg-slate-100 text-slate-700">RR</th>
                                    </React.Fragment>
                                ))}
                            </tr>
                            <tr className="bg-blue-50/30 text-gray-400">
                                {availableChapters.map((_, i) => (
                                    <React.Fragment key={i}>
                                        {[1,2,3,4,5].map(f => <th key={f} className="p-1 border-r text-center w-8 font-medium">{f}</th>)}
                                    </React.Fragment>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white/20">
                            {classStudents.map((s, idx) => {
                                const record = classGrades.find(g => g.studentId === s.id) || {grades: {}, sts:0, sas:0};
                                
                                let totalBabAverageSum = 0;
                                let activeChaptersCount = 0;

                                return (
                                    <tr key={s.id} className="hover:bg-blue-50/20 transition-colors">
                                        <td className="p-2 text-center border-r text-gray-400 bg-gray-50">{idx+1}</td>
                                        <td className="p-2 border-r font-bold text-gray-800 bg-white/95 whitespace-nowrap w-1">{s.name}</td>
                                        {availableChapters.map((chap, i) => {
                                            const cData = record.grades[chap.id] || {formatives: [0,0,0,0,0], summative: 0};
                                            const activeConfig = activeColumnsMap[chap.id];
                                            
                                            const activeFormativeIndices = activeConfig.formatives.map((active, idx) => active ? idx : -1).filter(idx => idx !== -1);
                                            const formSum = activeFormativeIndices.reduce((sum, idx) => sum + (cData.formatives[idx] || 0), 0);
                                            const formAvg = activeFormativeIndices.length > 0 ? formSum / activeFormativeIndices.length : 0;
                                            
                                            let chapterAverage = 0;
                                            const activeCategoriesCount = (activeFormativeIndices.length > 0 ? 1 : 0) + (activeConfig.summative ? 1 : 0);
                                            if (activeCategoriesCount > 0) {
                                                chapterAverage = Math.round((formAvg + (cData.summative || 0)) / activeCategoriesCount);
                                                totalBabAverageSum += chapterAverage;
                                                activeChaptersCount++;
                                            }

                                            return (
                                                <React.Fragment key={i}>
                                                    {cData.formatives.map((val, fi) => (<td key={fi} className={`p-2 border-r text-center ${getScoreColor(val)}`}>{val || 0}</td>))}
                                                    <td className={`p-2 border-r text-center font-bold ${getScoreColor(cData.summative)}`}>{cData.summative || 0}</td>
                                                    <td className={`p-2 border-r text-center font-bold bg-gray-50/30`}>{chapterAverage || 0}</td>
                                                </React.Fragment>
                                            );
                                        })}
                                        
                                        {(() => {
                                            const stsVal = record.sts || 0;
                                            const sasVal = record.sas || 0;
                                            
                                            let rapor = 0;
                                            if (activeChaptersCount > 0 || isStsActive || isSasActive) {
                                                const avgBab = activeChaptersCount > 0 ? totalBabAverageSum / activeChaptersCount : 0;
                                                const divisor = (activeChaptersCount > 0 ? 1 : 0) + (isStsActive ? 1 : 0) + (isSasActive ? 1 : 0);
                                                rapor = Math.round((avgBab + stsVal + sasVal) / (divisor || 1)) || 0;
                                            }

                                            return (
                                                <>
                                                    <td className={`p-2 border-r text-center font-bold ${getScoreColor(stsVal)}`}>{stsVal}</td>
                                                    <td className={`p-2 border-r text-center font-bold ${getScoreColor(sasVal)}`}>{sasVal}</td>
                                                    <td className="p-2 text-center font-bold bg-emerald-50 text-emerald-700 text-xs">{rapor}</td>
                                                </>
                                            );
                                        })()}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        ) : (
            <div className="p-16 text-center glass-panel rounded-2xl border border-white/60">
                 <Monitor size={48} className="mx-auto text-blue-500 mb-4 opacity-20" />
                 <h3 className="text-lg font-bold text-gray-800 mb-1">Pilih Kelas Monitoring</h3>
            </div>
        )}

        {monClass && (
            <div className="glass-panel p-6 rounded-2xl border border-white/60">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Keterangan Hasil Input Nilai</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[10px]">
                        <thead className="bg-gray-50 text-gray-500 uppercase">
                            <tr>
                                <th className="p-3 w-10">No</th>
                                <th className="p-3">Tanggal</th>
                                <th className="p-3">Semester</th>
                                <th className="p-3">Jenis Nilai</th>
                                <th className="p-3">Bab</th>
                                <th className="p-3">Keterangan</th>
                                <th className="p-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {monSummary.map((sum, i) => (
                                <tr key={i} className="hover:bg-gray-50">
                                    <td className="p-3">{i+1}</td>
                                    <td className="p-3">{sum.date}</td>
                                    <td className="p-3">{sum.semester}</td>
                                    <td className="p-3 font-bold capitalize">{sum.type.replace('_',' ')}</td>
                                    <td className="p-3">{sum.chapterName}</td>
                                    <td className="p-3 text-gray-500 italic">{sum.desc}</td>
                                    <td className="p-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleEditFromSummary(sum, monClass)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={14}/></button>
                                            <button onClick={() => deleteHistory(sum.type, sum.cid, sum.date, monClass)} className="p-1.5 text-red-500 hover:bg-red-50 rounded" title="Hapus"><Trash2 size={14}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {monSummary.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-400">Belum ada keterangan input.</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    );
  }

  // Dashboard Summary
  const assignedClassesCount = teacher.classMap ? Object.keys(teacher.classMap).length : 0;
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="glass-panel p-8 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="relative z-10">
                <h1 className="text-3xl font-bold mb-2 tracking-tight">Selamat Datang, {teacher.name}</h1>
                <p className="opacity-90 font-medium">Semester {settings.semester} • TP {settings.academicYear}</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/60">
                <BookOpen className="text-blue-500 mb-3" size={32} />
                <h3 className="text-lg font-bold text-gray-800">Mapel</h3>
                <p className="text-gray-500 text-sm">{teacher.subjects.join(', ')}</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-white/60">
                <Users className="text-purple-500 mb-3" size={32} />
                <h3 className="text-lg font-bold text-gray-800">Kelas Diampu</h3>
                <p className="text-gray-500 text-sm">{assignedClassesCount} Kelas Aktif</p>
            </div>
            <div className="glass-panel p-6 rounded-2xl border border-white/60">
                <List className="text-green-500 mb-3" size={32} />
                <h3 className="text-lg font-bold text-gray-800">Total Bab</h3>
                <p className="text-gray-500 text-sm">{chapters.filter(c => teacher.subjects.includes(c.subject)).length} Bab Terdaftar</p>
            </div>
        </div>
    </div>
  );
};

export default TeacherDashboard;
