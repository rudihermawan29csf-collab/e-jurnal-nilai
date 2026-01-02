import React, { useState, useEffect } from 'react';
import { getGrades, getIncompleteTasks, getTeachers } from '../services/dataService';
import { Student, GradeRecord, Task, Teacher } from '../types';
import { MessageCircle, CheckCircle, XCircle, ChevronRight, Bookmark } from 'lucide-react';

const StudentDashboard: React.FC<{ student: Student, view: string }> = ({ student, view }) => {
  const [myGrades, setMyGrades] = useState<GradeRecord[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>(getTeachers());

  useEffect(() => {
    // Filter grades for this student
    const allGrades = getGrades();
    setMyGrades(allGrades.filter(g => g.studentId === student.id));
    setTasks(getIncompleteTasks(student.id));
    setTeachers(getTeachers());
  }, [student.id]);

  const getTeacherPhone = (subject: string) => {
    const t = teachers.find(t => t.subjects.includes(subject));
    return t?.phone || '';
  };

  if (view === 'tasks') {
    return (
      <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Tugas Belum Lengkap</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tasks.map(task => {
             const phone = getTeacherPhone(task.subject);
             return (
              <div key={task.id} className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-400 hover:scale-[1.02] transition-all duration-300 shadow-lg shadow-red-500/10 border-t border-r border-b border-white/60">
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-red-50 text-red-500 rounded-lg text-xs font-bold uppercase tracking-wider">{task.subject}</span>
                  <div className="p-1.5 bg-red-100 rounded-full text-red-500">
                    <XCircle size={18} />
                  </div>
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-1 leading-tight">{task.chapter}</h3>
                <p className="text-sm font-medium text-gray-500 mb-4">{task.subChapter}</p>
                <div className="text-sm text-gray-600 mb-6 bg-white/60 p-4 rounded-xl border border-white/50">{task.description}</div>
                
                {phone && (
                  <a 
                    href={`https://wa.me/${phone.replace(/^0/, '62')}?text=Assalamualaikum, saya ${student.name} kelas ${student.className} ingin bertanya tentang tugas ${task.chapter}...`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-2.5 rounded-xl hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 font-medium"
                  >
                    <MessageCircle size={18} /> Hubungi Guru
                  </a>
                )}
              </div>
             );
          })}
          {tasks.length === 0 && (
            <div className="col-span-full py-16 text-center">
              <div className="inline-flex p-6 bg-green-100/50 rounded-3xl text-green-500 mb-6 shadow-sm"><CheckCircle size={48}/></div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Hebat!</h3>
              <p className="text-gray-500">Semua tugasmu sudah lengkap. Pertahankan prestasimu.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="glass-panel p-8 rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/20 relative overflow-hidden">
        <div className="relative z-10">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Halo, {student.name}</h1>
            <p className="opacity-90 font-medium">Kelas {student.className} • NISN {student.nisn}</p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
      </div>

      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Bookmark size={20} className="text-blue-500"/> Rekap Nilai Semester Ini</h3>
        <div className="glass-panel rounded-2xl overflow-hidden border border-white/60">
          <table className="w-full text-left">
            <thead className="bg-white/40 text-gray-500 text-xs uppercase tracking-wider backdrop-blur-sm">
              <tr>
                <th className="p-5 font-bold">Mata Pelajaran</th>
                <th className="p-5 text-center font-bold">Rata-rata PH</th>
                <th className="p-5 text-center font-bold">STS</th>
                <th className="p-5 text-center font-bold">SAS</th>
                <th className="p-5 text-center font-bold text-blue-600">Nilai Rapor</th>
                <th className="p-5 text-right font-bold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myGrades.map(g => {
                // Calc simple average of known chapter avgs
                const chapAvgs = Object.values(g.grades).map((x: any) => x.average).filter((n: number) => n>0);
                const finalAvg = chapAvgs.length ? chapAvgs.reduce((a: number,b: number)=>a+b,0)/chapAvgs.length : 0;
                const rapor = Math.round((finalAvg + (g.sts||0) + (g.sas||0))/3); // Demo logic

                return (
                  <tr key={g.id} className="hover:bg-blue-50/30 transition-colors group">
                    <td className="p-5 font-bold text-gray-800 flex items-center gap-3">
                        <div className="w-2 h-8 bg-blue-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        {g.subject}
                    </td>
                    <td className="p-5 text-center text-gray-600 font-medium">{Math.round(finalAvg) || '-'}</td>
                    <td className="p-5 text-center text-gray-600 font-medium">{g.sts || '-'}</td>
                    <td className="p-5 text-center text-gray-600 font-medium">{g.sas || '-'}</td>
                    <td className="p-5 text-center font-bold text-blue-600 text-lg bg-blue-50/30 rounded-lg">{rapor || '-'}</td>
                    <td className="p-5 text-right">
                      {rapor >= 75 
                        ? <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold"><CheckCircle size={12}/> Tuntas</span>
                        : <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 bg-red-100 text-red-700 rounded-full font-bold"><XCircle size={12}/> Belum Tuntas</span>
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {myGrades.length === 0 && (
             <div className="p-12 text-center text-gray-400 italic">Belum ada data nilai yang masuk.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;