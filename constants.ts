import { SchoolSettings } from "./types";

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolName: "SMPN 3 Pacet",
  academicYear: "2024/2025",
  semester: "Ganjil",
  adminPassword: "007007Rh", // Updated password
  teacherDefaultPassword: "guru123", // Updated password
};

export const CLASS_LIST = [
  "VII A", "VII B", "VII C",
  "VIII A", "VIII B", "VIII C",
  "IX A", "IX B", "IX C"
];

export const SUBJECT_LIST = [
  "Matematika",
  "Bahasa Indonesia",
  "Bahasa Inggris",
  "IPA",
  "IPS",
  "PPKn",
  "Penyasorkes",
  "Seni Budaya",
  "Prakarya",
  "Bahasa Daerah",
  "Informatika"
];

export const EXTRACURRICULAR_LIST = [
  "TBTQ",
  "PMR",
  "English Club",
  "Seni",
  "OSN Matematika",
  "OSN Bahasa Indonesia",
  "Pramuka",
  "Futsal",
  "OSN IPA"
];