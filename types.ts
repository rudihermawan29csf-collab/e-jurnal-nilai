export type Role = 'admin' | 'guru' | 'siswa';

export interface User {
  id: string;
  name: string;
  role: Role;
  username?: string; // NIP or NISN
  phone?: string;
}

export interface Teacher extends User {
  nip: string;
  subjects: string[]; // Mapel
  phone: string;
  homeroomClass?: string; // Wali Kelas (e.g., "VII A")
  extracurricular?: string; // Pembina Ekstra (e.g., "Pramuka")
  classMap?: { [className: string]: string[] }; // CHANGED: Now stores array of subjects taught in that class
  pangkat?: string;
  golongan?: string;
}

export interface Student extends User {
  nis: string;
  nisn: string;
  gender: 'L' | 'P';
  className: string; // Kelas like "VII A"
}

export interface SchoolSettings {
  schoolName: string;
  academicYear: string; // "2023/2024"
  semester: 'Ganjil' | 'Genap';
  adminPassword?: string;
  teacherDefaultPassword?: string;
  headmasterName?: string;
  headmasterNip?: string;
}

export interface TeacherConfig {
  activeChapterCount: number; // 1-5
  activeSubject?: string; 
  activeSemester?: 'Ganjil' | 'Genap';
  activeJenjang?: string;
  activeClasses?: string[]; // Array of class names
}

export interface Chapter {
  id: string;
  subject: string;
  className: string;
  semester: string;
  name: string; // Bab 1: ...
  subChapters: string[]; // Sub-bab list
}

export interface GradeRecord {
  id: string;
  studentId: string;
  subject: string;
  semester: string;
  className: string;
  lastUpdated?: string; // ISO Date String
  // Dynamic structure for flexibility
  grades: {
    [chapterId: string]: {
      formatives: number[]; // Array of 5 scores
      summative: number;
      average: number;
      description?: string; // Keterangan Tugas
    }
  };
  sts?: number;
  sas?: number;
  reportGrade?: number;
}

export interface Task {
  id: string;
  studentId: string;
  subject: string;
  chapter: string;
  subChapter: string;
  description: string;
  completed: boolean;
}