// In a real production app, this would use import { initializeApp } from "firebase/app";
// import { getFirestore, collection, getDocs, ... } from "firebase/firestore";
import { Student, Teacher, SchoolSettings, Chapter, GradeRecord, Task, TeacherConfig } from "../types";
import { DEFAULT_SETTINGS, CLASS_LIST } from "../constants";

// --- MOCK DATA FOR DEMO PURPOSES ---

const STORAGE_KEYS = {
  SETTINGS: 'smpn3_settings',
  TEACHERS: 'smpn3_teachers_v7', // Version bump for classMap change
  STUDENTS: 'smpn3_students_v3', 
  CHAPTERS: 'smpn3_chapters',
  GRADES: 'smpn3_grades',
  TASKS: 'smpn3_tasks',
  TEACHER_CONFIG: 'smpn3_teacher_config'
};

// --- SETTINGS ---
export const getSettings = (): SchoolSettings => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (data) return JSON.parse(data);
  return {
    ...DEFAULT_SETTINGS,
    headmasterName: "Didik Sulistyo, M.M.Pd",
    headmasterNip: "196605181989011002"
  };
};

export const saveSettings = (settings: SchoolSettings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getTeacherConfig = (): TeacherConfig => {
  const data = localStorage.getItem(STORAGE_KEYS.TEACHER_CONFIG);
  return data ? JSON.parse(data) : { 
    activeChapterCount: 5,
  };
};

export const saveTeacherConfig = (config: TeacherConfig) => {
  localStorage.setItem(STORAGE_KEYS.TEACHER_CONFIG, JSON.stringify(config));
};

// --- TEACHERS ---
export const getTeachers = (): Teacher[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
  if (data) return JSON.parse(data);
  
  // Helper to init class map. Now it needs to be { className: [subject1, subject2] }
  // For mock data, we assign the teacher's first subject to all classes for simplicity
  const createDefaultClassMap = (subjects: string[]) => {
      const map: any = {};
      CLASS_LIST.forEach(c => map[c] = [...subjects]);
      return map;
  };

  const initial: Teacher[] = [
    { id: 't1', name: 'Dra. Sri Hayati', role: 'guru', nip: '19670628 200801 2 006', phone: '081234567890', subjects: ['Bahasa Indonesia'], homeroomClass: 'VII A', classMap: createDefaultClassMap(['Bahasa Indonesia']), pangkat: 'Pembina', golongan: 'IV/a' },
    { id: 't2', name: 'Bakhtiar Rifai, SE', role: 'guru', nip: '19800304 200801 1', phone: '081234567891', subjects: ['Ilmu Pengetahuan Sosial'], homeroomClass: 'VII B', classMap: createDefaultClassMap(['Ilmu Pengetahuan Sosial']), pangkat: 'Penata Tk. I', golongan: 'III/d' },
    { id: 't3', name: 'Moch. Husain Rifai Hamzah, S.Pd.', role: 'guru', nip: '19920316 202012 1 011', phone: '081234567892', subjects: ['Penyasorkes'], homeroomClass: 'VII C', classMap: createDefaultClassMap(['Penyasorkes']), pangkat: 'Penata Muda Tk. I', golongan: 'III/b' },
    { id: 't4', name: 'Rudi Hermawan, S.Pd.I', role: 'guru', nip: '198910292020121003', phone: '-', subjects: ['Pendidikan Agama Islam'], homeroomClass: 'VIII A', classMap: createDefaultClassMap(['Pendidikan Agama Islam']), pangkat: 'Penata Muda', golongan: 'III/a' },
    { id: 't5', name: 'Okha Devi Anggraini, S.Pd.', role: 'guru', nip: '19941002 202012 2 008', phone: '-', subjects: ['Bimbingan Konseling'], homeroomClass: 'VIII B', classMap: createDefaultClassMap(['Bimbingan Konseling']), pangkat: 'Penata Muda', golongan: 'III/a' },
    { id: 't6', name: 'Eka Hariyati, S. Pd.', role: 'guru', nip: '19731129 202421 2 003', phone: '-', subjects: ['PPKn'], homeroomClass: 'VIII C', classMap: createDefaultClassMap(['PPKn']), pangkat: 'Pembina', golongan: 'IV/a' },
    { id: 't7', name: 'Mikoe Wahyudi Putra, ST., S. Pd.', role: 'guru', nip: '198506012024211004', phone: '-', subjects: ['Bimbingan Konseling'], homeroomClass: 'IX A', classMap: createDefaultClassMap(['Bimbingan Konseling']), pangkat: 'Penata', golongan: 'III/c' },
    { id: 't8', name: 'Purnadi, S. Pd.', role: 'guru', nip: '19680705 202421 1 001', phone: '-', subjects: ['Matematika'], homeroomClass: 'IX B', classMap: createDefaultClassMap(['Matematika']), pangkat: 'Pembina Tk. I', golongan: 'IV/b' },
    { id: 't9', name: 'Israfin Maria Ulfa, S.Pd', role: 'guru', nip: '198501312025212004', phone: '-', subjects: ['Ilmu Pengetahuan Sosial'], homeroomClass: 'IX C', classMap: createDefaultClassMap(['Ilmu Pengetahuan Sosial']), pangkat: 'Penata', golongan: 'III/c' },
    { id: 't10', name: 'Syadam Budi Satrianto, S.Pd', role: 'guru', nip: '-', phone: '-', subjects: ['Bahasa Daerah'], classMap: createDefaultClassMap(['Bahasa Daerah']), pangkat: '-', golongan: '-' }, 
    { id: 't11', name: 'Rebby Dwi Prataopu, S.Si', role: 'guru', nip: '-', phone: '-', subjects: ['IPA'], classMap: createDefaultClassMap(['IPA']), pangkat: '-', golongan: '-' },
    { id: 't12', name: 'Mukhamad Yunus, S.Pd', role: 'guru', nip: '-', phone: '-', subjects: ['IPA', 'Informatika'], classMap: createDefaultClassMap(['IPA', 'Informatika']), pangkat: '-', golongan: '-' },
    { id: 't13', name: 'Fahmi Wahyuni, S.Pd', role: 'guru', nip: '-', phone: '-', subjects: ['Bahasa Indonesia'], classMap: createDefaultClassMap(['Bahasa Indonesia']), pangkat: '-', golongan: '-' },
    { id: 't14', name: 'Fakhita Madury, S.Sn', role: 'guru', nip: '-', phone: '-', subjects: ['Seni Budaya', 'Informatika'], classMap: createDefaultClassMap(['Seni Budaya', 'Informatika']), pangkat: '-', golongan: '-' },
    { id: 't15', name: 'Retno Nawangwulan, S. Pd.', role: 'guru', nip: '1985070320252120006', phone: '-', subjects: ['Bahasa Inggris'], classMap: createDefaultClassMap(['Bahasa Inggris']), pangkat: 'Penata Muda', golongan: 'III/a' },
    { id: 't16', name: 'Emilia Kartika Sari, S.Pd', role: 'guru', nip: '200105072025212026', phone: '-', subjects: ['Matematika', 'Informatika'], classMap: createDefaultClassMap(['Matematika', 'Informatika']), pangkat: 'Penata Muda', golongan: 'III/a' },
    { id: 't17', name: 'Akhmad Hariadi, S.Pd', role: 'guru', nip: '19751108 200901 1 001', phone: '-', subjects: ['Bahasa Inggris', 'Informatika'], classMap: createDefaultClassMap(['Bahasa Inggris', 'Informatika']), pangkat: 'Penata', golongan: 'III/c' },
  ];
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(initial));
  return initial;
};

export const saveTeachers = (teachers: Teacher[]) => {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
};

// --- STUDENTS ---
export const getStudents = (): Student[] => {
  const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
  if (data) return JSON.parse(data);
  
  // Seed initial students - IX A Data
  const initial: Student[] = [
    { id: 's1', name: 'ABEL AULIA PASA RAMADANI', role: 'siswa', nis: '1129', nisn: '3101640834', gender: 'P', className: 'IX A' },
    { id: 's2', name: 'ADITYA FIRMANSYAH', role: 'siswa', nis: '1132', nisn: '0105795597', gender: 'L', className: 'IX A' },
    { id: 's3', name: 'AHMAD NIAM IZZI AFKAR', role: 'siswa', nis: '1135', nisn: '0116781615', gender: 'L', className: 'IX A' },
    { id: 's4', name: 'DAFA RISKI EKA SYAHPUTRA', role: 'siswa', nis: '1150', nisn: '0101995193', gender: 'L', className: 'IX A' },
    { id: 's5', name: 'DEA NAYLATUL AFITA', role: 'siswa', nis: '1151', nisn: '0105890815', gender: 'P', className: 'IX A' },
    { id: 's6', name: 'DHEA ZASKIA OLIVIA PUTRI', role: 'siswa', nis: '1153', nisn: '0106746087', gender: 'P', className: 'IX A' },
    { id: 's7', name: 'ENGGELITA REGINA PUTRI', role: 'siswa', nis: '1155', nisn: '0113763727', gender: 'P', className: 'IX A' },
    { id: 's8', name: 'FAREL ANDRIANSAH', role: 'siswa', nis: '1158', nisn: '0106977334', gender: 'L', className: 'IX A' },
    { id: 's9', name: 'FURI ANGELIKA PUTRI', role: 'siswa', nis: '1159', nisn: '0109547032', gender: 'P', className: 'IX A' },
    { id: 's10', name: 'JESICHA PUTRI RAMADHANI', role: 'siswa', nis: '1163', nisn: '3121344348', gender: 'P', className: 'IX A' },
    { id: 's11', name: 'JIHAN DEA VALQOHI', role: 'siswa', nis: '1164', nisn: '0104858504', gender: 'P', className: 'IX A' },
    { id: 's12', name: 'M. FERDY SANTOSO', role: 'siswa', nis: '1169', nisn: '0106488180', gender: 'L', className: 'IX A' },
    { id: 's13', name: 'MICHELIA ANDARA PUTRI AGUSTINA', role: 'siswa', nis: '1171', nisn: '0109831534', gender: 'P', className: 'IX A' },
    { id: 's14', name: 'MUHAMAD ADITIYA SUGIHARTO', role: 'siswa', nis: '1175', nisn: '0104040213', gender: 'L', className: 'IX A' },
    { id: 's15', name: 'MUHAMAD RIFKI AFANDI', role: 'siswa', nis: '1176', nisn: '0104235722', gender: 'L', className: 'IX A' },
    { id: 's16', name: 'MUHAMMAD AL AMIN', role: 'siswa', nis: '1178', nisn: '0106196356', gender: 'L', className: 'IX A' },
    { id: 's17', name: 'MUHAMMAD BAHRUDIN NICOLAS SAPUTRA', role: 'siswa', nis: '1181', nisn: '0103012183', gender: 'L', className: 'IX A' },
    { id: 's18', name: 'MUHAMMAD HAIKAL DWI APRIANSYAH', role: 'siswa', nis: '1183', nisn: '0107525884', gender: 'L', className: 'IX A' },
    { id: 's19', name: 'MUHAMMAD REHAN MEYLANO', role: 'siswa', nis: '1184', nisn: '0113821069', gender: 'L', className: 'IX A' },
    { id: 's20', name: 'MUHAMMAD RIZQI FATKUR ROZI', role: 'siswa', nis: '1186', nisn: '0118100000', gender: 'L', className: 'IX A' },
    { id: 's21', name: 'NABILA SRI WULANDARI', role: 'siswa', nis: '1190', nisn: '0112229604', gender: 'P', className: 'IX A' },
    { id: 's22', name: 'RIFKI ARDIAN SYAPUTRA', role: 'siswa', nis: '1197', nisn: '0113260726', gender: 'L', className: 'IX A' },
    { id: 's23', name: 'SALSABILLA PUTRI RAMADHANI', role: 'siswa', nis: '1202', nisn: '0101966980', gender: 'P', className: 'IX A' },
    { id: 's24', name: 'SASKIA AISYAH AZZAHRA', role: 'siswa', nis: '1203', nisn: '0109241032', gender: 'P', className: 'IX A' },
    { id: 's25', name: 'SHERLIN HERLA AZZAHRA', role: 'siswa', nis: '1204', nisn: '0106468352', gender: 'P', className: 'IX A' },
    { id: 's26', name: 'SLAMET RIZKI GALI RIMBA ANGKASA', role: 'siswa', nis: '1206', nisn: '0116423386', gender: 'L', className: 'IX A' },
    { id: 's27', name: 'VALENSYA DWI PUTRI WIJAYA', role: 'siswa', nis: '1208', nisn: '0104036653', gender: 'P', className: 'IX A' },
    { id: 's28', name: 'WILDAN DIMAS DWI ANANDA', role: 'siswa', nis: '1211', nisn: '0101281770', gender: 'L', className: 'IX A' },
    { id: 's29', name: 'DEFANO HAIKAL RAMADHAN', role: 'siswa', nis: '1217', nisn: '3101245248', gender: 'L', className: 'IX A' },
    { id: 's30', name: 'SAMSUL NURUL HUDA', role: 'siswa', nis: '1330', nisn: '0107745569', gender: 'L', className: 'IX A' },
  ];
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(initial));
  return initial;
};

export const saveStudents = (students: Student[]) => {
  localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
};

// --- CHAPTERS ---
export const getChapters = (): Chapter[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHAPTERS);
  return data ? JSON.parse(data) : [];
};

export const saveChapters = (chapters: Chapter[]) => {
  localStorage.setItem(STORAGE_KEYS.CHAPTERS, JSON.stringify(chapters));
};

// --- GRADES ---
export const getGrades = (): GradeRecord[] => {
  const data = localStorage.getItem(STORAGE_KEYS.GRADES);
  return data ? JSON.parse(data) : [];
};

export const saveGrades = (grades: GradeRecord[]) => {
  localStorage.setItem(STORAGE_KEYS.GRADES, JSON.stringify(grades));
};

// --- TASKS ---
export const getIncompleteTasks = (studentId: string): Task[] => {
  const grades = getGrades();
  const studentGrades = grades.filter(g => g.studentId === studentId);
  
  const tasks: Task[] = [];
  studentGrades.forEach(g => {
    Object.keys(g.grades).forEach(chapId => {
       const chapData = g.grades[chapId];
       // Check if there is a description but low scores (implying incomplete task)
       if (chapData.description && chapData.average < 75) {
         tasks.push({
           id: `${g.id}_${chapId}`,
           studentId,
           subject: g.subject,
           chapter: 'Bab (Terkait)',
           subChapter: 'Materi',
           description: chapData.description,
           completed: false
         });
       }
    });
  });
  return tasks;
};