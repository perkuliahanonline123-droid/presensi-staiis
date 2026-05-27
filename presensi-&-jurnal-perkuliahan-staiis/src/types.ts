/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role = 'DOSEN' | 'MAHASISWA';

export interface User {
  id: string; // dosen-xxx or mhs-xxx
  name: string;
  email: string;
  role: Role;
  programStudi: string;
  semester?: number; // for students
  nipNim: string; // NIP for lecturer, NIM for student
  status: 'AKTIF' | 'NON_AKTIF';
  password?: string;
}

export interface Course {
  kodeMK: string;
  namaMK: string;
  hari: string; // Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu
  jamMulai: string; // HH:MM
  jamSelesai: string; // HH:MM
  ruang: string;
  dosenId: string; // user ID from sheet users (DOSEN)
  semester: string; // e.g. "Ganjil 2025/2026"
}

export interface Enrollment {
  idMahasiswa: string;
  kodeMK: string;
  tahunAkademik: string;
}

export interface AttendanceSession {
  idSesi: string; // e.g., session-xxx
  kodeMK: string;
  tanggal: string; // YYYY-MM-DD
  jamMulaiPresensi?: string; // HH:MM
  jamSelesaiPresensi?: string; // HH:MM
  kodeUnik?: string; // 6-digit verification code
  status: 'DIBUKA' | 'DITUTUP';
}

export type AttendanceStatus = 'Hadir' | 'Izin' | 'Sakit' | 'Alpa';

export interface Attendance {
  idSesi: string;
  idMahasiswa: string;
  statusKehadiran: AttendanceStatus;
  waktuPresensi: string; // timestamp ISO or string
  ipAddressMetode: string; // e.g. "192.168.1.1 / Manual" or "Web / Kode Unik"
}

export interface Journal {
  idJurnal: string;
  kodeMK: string;
  tanggal: string; // YYYY-MM-DD
  judul: string;
  isi: string;
  lampiran?: string; // Drive file url
  dibuatOleh: string; // ID dosen
}

// Translations state interface
export interface LanguageTranslations {
  navTitle: string;
  subTitle: string;
  roleSec: string;
  login: string;
  logout: string;
  username: string;
  password: string;
  loginBtn: string;
  switchLanguage: string;
  student: string;
  lecturer: string;
  loading: string;
  course: string;
  journals: string;
  attendance: string;
  recap: string;
  status: string;
  action: string;
  addCourse: string;
  editCourse: string;
  deleteCourse: string;
  back: string;
  save: string;
  cancel: string;
  present: string;
  permission: string;
  sick: string;
  absent: string;
  success: string;
  error: string;
}
