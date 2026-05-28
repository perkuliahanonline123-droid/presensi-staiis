/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { User, Course, Enrollment, AttendanceSession, Attendance, Journal, AttendanceStatus } from './types';

// Let's outline initial high-fidelity academic database data
const initialUsers: User[] = [
  {
    id: 'dosen-1',
    name: 'Prof. Dr. Ahmad Syarif, M.A.',
    email: 'ahmad@siakad.ac.id',
    role: 'DOSEN',
    programStudi: 'Pendidikan Agama Islam (PAI)',
    nipNim: '198012122005011002',
    status: 'AKTIF'
  },
  {
    id: 'dosen-2',
    name: 'Dr. Laila Fitriana, M.Ag.',
    email: 'laila@siakad.ac.id',
    role: 'DOSEN',
    programStudi: 'Hukum Keluarga Islam (HKI)',
    nipNim: '198506152010022004',
    status: 'AKTIF'
  },
  {
    id: 'mhs-1',
    name: 'Muhammad Al-Fatih',
    email: 'fatih@siakad.ac.id',
    role: 'MAHASISWA',
    programStudi: 'Pendidikan Agama Islam (PAI)',
    semester: 4,
    nipNim: '12211045',
    status: 'AKTIF'
  },
  {
    id: 'mhs-2',
    name: 'Aisyah Humaira',
    email: 'aisyah@siakad.ac.id',
    role: 'MAHASISWA',
    programStudi: 'Pendidikan Agama Islam (PAI)',
    semester: 4,
    nipNim: '12211046',
    status: 'AKTIF'
  },
  {
    id: 'mhs-3',
    name: 'Raihan Az-Zahra',
    email: 'raihan@siakad.ac.id',
    role: 'MAHASISWA',
    programStudi: 'Pendidikan Agama Islam (PAI)',
    semester: 2,
    nipNim: '12211054',
    status: 'AKTIF'
  }
];

const initialCourses: Course[] = [
  {
    kodeMK: 'PAI-402',
    namaMK: "Ulumul Qur'an & Metodologi Tafsir",
    hari: 'Senin',
    jamMulai: '08:15',
    jamSelesai: '10:15',
    ruang: 'Gedung Tarbiyah R.304',
    dosenId: 'dosen-1',
    semester: 'Ganjil 2025/2026'
  },
  {
    kodeMK: 'PAI-405',
    namaMK: 'Sejarah Peradaban Islam Nusantara',
    hari: 'Rabu',
    jamMulai: '10:30',
    jamSelesai: '12:30',
    ruang: 'AULA Rusydi Hamka',
    dosenId: 'dosen-1',
    semester: 'Ganjil 2025/2026'
  },
  {
    kodeMK: 'HKI-201',
    namaMK: 'Fikih Munakahat & Perbandingan Madzhab',
    hari: 'Selasa',
    jamMulai: '13:00',
    jamSelesai: '15:00',
    ruang: 'Gedung Syariah R.102',
    dosenId: 'dosen-2',
    semester: 'Ganjil 2025/2026'
  }
];

const initialEnrollments: Enrollment[] = [
  { idMahasiswa: 'mhs-1', kodeMK: 'PAI-402', tahunAkademik: '2025/2026' },
  { idMahasiswa: 'mhs-1', kodeMK: 'PAI-405', tahunAkademik: '2025/2026' },
  { idMahasiswa: 'mhs-2', kodeMK: 'PAI-402', tahunAkademik: '2025/2026' },
  { idMahasiswa: 'mhs-2', kodeMK: 'PAI-405', tahunAkademik: '2025/2026' },
  { idMahasiswa: 'mhs-3', kodeMK: 'PAI-402', tahunAkademik: '2025/2026' }
];

const initialSessions: AttendanceSession[] = [
  {
    idSesi: 'session-demo-1',
    kodeMK: 'PAI-402',
    tanggal: '2026-05-25',
    jamMulaiPresensi: '08:00',
    jamSelesaiPresensi: '10:30',
    kodeUnik: '412098',
    status: 'DIBUKA'
  },
  {
    idSesi: 'session-demo-2',
    kodeMK: 'PAI-405',
    tanggal: '2026-05-20',
    jamMulaiPresensi: '10:15',
    jamSelesaiPresensi: '12:45',
    kodeUnik: '',
    status: 'DITUTUP'
  }
];

const initialAttendances: Attendance[] = [
  // Session 1: PAI-402 (Active)
  {
    idSesi: 'session-demo-1',
    idMahasiswa: 'mhs-1',
    statusKehadiran: 'Hadir',
    waktuPresensi: '2026-05-25T08:18:22Z',
    ipAddressMetode: '180.244.1.92 / Web-Manual'
  },
  // Session 2: PAI-405 (Past session)
  {
    idSesi: 'session-demo-2',
    idMahasiswa: 'mhs-1',
    statusKehadiran: 'Hadir',
    waktuPresensi: '2026-05-20T10:45:11Z',
    ipAddressMetode: '180.244.1.92 / Web-Manual'
  },
  {
    idSesi: 'session-demo-2',
    idMahasiswa: 'mhs-2',
    statusKehadiran: 'Izin',
    waktuPresensi: '2026-05-20T09:30:00Z',
    ipAddressMetode: 'Sakit Surat Resmi / Dosen Manual'
  },
  {
    idSesi: 'session-demo-2',
    idMahasiswa: 'mhs-3',
    statusKehadiran: 'Alpa',
    waktuPresensi: '',
    ipAddressMetode: ''
  }
];

const initialJournals: Journal[] = [
  {
    idJurnal: 'journal-demo-1',
    kodeMK: 'PAI-402',
    tanggal: '2026-05-25',
    judul: 'Pertemuan 1: Pengantar Epistemologi Tafsir',
    isi: 'Melakukan review silabus pembelajaran. Memaparkan tentang letak epistemologi tafsir Al-Qur\'an secara umum serta implikasinya dalam merumuskan pemaknaan sejarah Islam kontemporer.\nTugas mandiri mengulas ringkas Bab I Buku Pegangan Syekh Al-Ghazali.',
    lampiran: 'https://drive.google.com/open?id=demo-handout-epistemology',
    dibuatOleh: 'dosen-1'
  },
  {
    idJurnal: 'journal-demo-2',
    kodeMK: 'PAI-405',
    tanggal: '2026-05-20',
    judul: 'Pertemuan 1: Teori Masuknya Islam di Nusantara',
    isi: 'Pertemuan pertama mengupas 4 teori sejarawan mengenai syiar Islam di Nusantara (Persia, Gujarat, Mekkah, Dawood). Sesi dilanjutkan diskusi panel kecil mengenai peninggalan prasasti Barus Sumatera Utara.',
    lampiran: '',
    dibuatOleh: 'dosen-1'
  }
];

class LocalDatabase {
  private getStorage<T>(key: string, defaultValue: T): T {
    const val = localStorage.getItem(`siakad_${key}`);
    return val ? JSON.parse(val) : defaultValue;
  }

  private setStorage<T>(key: string, value: T): void {
    localStorage.setItem(`siakad_${key}`, JSON.stringify(value));
  }

  getUsers(): User[] {
    return this.getStorage<User[]>('users', initialUsers);
  }

  setUsers(users: User[]): void {
    this.setStorage('users', users);
  }

  getCourses(): Course[] {
    return this.getStorage<Course[]>('courses', initialCourses);
  }

  setCourses(courses: Course[]): void {
    this.setStorage('courses', courses);
  }

  getEnrollments(): Enrollment[] {
    return this.getStorage<Enrollment[]>('enrollments', initialEnrollments);
  }

  setEnrollments(enrollments: Enrollment[]): void {
    this.setStorage('enrollments', enrollments);
  }

  getSessions(): AttendanceSession[] {
    return this.getStorage<AttendanceSession[]>('sessions', initialSessions);
  }

  setSessions(sessions: AttendanceSession[]): void {
    this.setStorage('sessions', sessions);
  }

  getAttendances(): Attendance[] {
    return this.getStorage<Attendance[]>('attendances', initialAttendances);
  }

  setAttendances(attendances: Attendance[]): void {
    this.setStorage('attendances', attendances);
  }

  getJournals(): Journal[] {
    return this.getStorage<Journal[]>('journals', initialJournals);
  }

  setJournals(journals: Journal[]): void {
    this.setStorage('journals', journals);
  }

  resetDemoData(): void {
    this.setStorage('users', initialUsers);
    this.setStorage('courses', initialCourses);
    this.setStorage('enrollments', initialEnrollments);
    this.setStorage('sessions', initialSessions);
    this.setStorage('attendances', initialAttendances);
    this.setStorage('journals', initialJournals);
  }
}

export const localDb = new LocalDatabase();

// ---------------------- REST CLIENT (GOOGLE APPS SCRIPT CONNECTORS) ----------------------

async function requestGAS(url: string, action: string, method: 'GET' | 'POST', body?: any): Promise<any> {
  const fullUrl = method === 'GET' ? `${url}?action=${action}` : url;
  
  const options: RequestInit = {
    method: method,
    mode: 'cors'
  };

  if (method === 'POST') {
    options.headers = {
      'Content-Type': 'text/plain' // avoiding pre-flight OPTIONS issues on GAS Web Apps
    };
    options.body = JSON.stringify({ action, ...body });
  }

  const response = await fetch(fullUrl, options);
  const data = await response.json();
  if (data.success) {
    return data.data;
  } else {
    throw new Error(data.error || 'Terjadi kesalahan sistem Apps Script');
  }
}

function getPropCaseInsensitive(obj: any, keys: string[]): any {
  if (!obj) return undefined;
  for (const k of keys) {
    if (obj[k] !== undefined && obj[k] !== null) return obj[k];
  }
  const lowerKeys = keys.map(k => k.toLowerCase());
  for (const actualKey of Object.keys(obj)) {
    if (lowerKeys.includes(actualKey.toLowerCase())) {
      const val = obj[actualKey];
      if (val !== undefined && val !== null) return val;
    }
  }
  return undefined;
}

export class ApiClient {
  static getGasUrl(): string {
    return localStorage.getItem('siakad_gas_url') || 'https://script.google.com/macros/s/AKfycbyXHwbUiHQB1k0QmYDGIlt4T_WidAvqsGKcVjwJANE_BTSzej9kNl1MMWIxxcH4sk9jPw/exec';
  }

  static setGasUrl(url: string): void {
    localStorage.setItem('siakad_gas_url', url.trim());
  }

  static isLiveMode(): boolean {
    return !!this.getGasUrl();
  }

  // LOGIKA LOGIN UTAMA: VALIDASI MULTI-USER DARI DATA SPREADSHEET SIKAD
  static async login(email: string, pass: string, demoUserOverride?: User): Promise<{ success: boolean; user?: User; message?: string }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Helper to log in using local fallback credentials
    const loginLocalFallback = () => {
      const users = localDb.getUsers();
      const user = users.find(u => u.email.trim().toLowerCase() === cleanEmail);
      if (user) {
        const customPass = localStorage.getItem('siakad_custom_passwords');
        const passwords = customPass ? JSON.parse(customPass) : {};
        const registeredPass = passwords[user.email.toLowerCase()] || '';

        const isCustomMatch = registeredPass && registeredPass.trim() === cleanPass;
        const isSeedMatch = (user.role === 'DOSEN' && cleanPass === 'dosen123') || (user.role === 'MAHASISWA' && cleanPass === 'mhs123');

        if (isCustomMatch || isSeedMatch || demoUserOverride) {
          return { success: true, user };
        }
      }
      return null;
    };

    // 1. Jika URL integrasi Google Sheets belum dimasukkan, gunakan validasi database lokal
    if (!this.isLiveMode()) {
      const fallbackResult = loginLocalFallback();
      if (fallbackResult) return fallbackResult;
      return { success: false, message: 'Email atau kata sandi Anda tidak sesuai! Silakan periksa kembali detail masuk Anda.' };
    }

    // 2. JALUR PRODUKSI: VALIDASI SECURE LEWAT APPS SCRIPT POST ACTION 'login'
    try {
      const res = await requestGAS(this.getGasUrl(), 'login', 'POST', { email: cleanEmail, password: cleanPass });
      if (res && res.success) {
        const u = res.user;
        const mappedUser: User = {
          id: String(getPropCaseInsensitive(u, ["ID", "id"]) || ""),
          name: String(getPropCaseInsensitive(u, ["Nama Lengkap", "name", "nama"]) || ""),
          email: String(getPropCaseInsensitive(u, ["Email", "email"]) || ""),
          role: String(getPropCaseInsensitive(u, ["Role", "role"]) || "") as 'DOSEN' | 'MAHASISWA',
          programStudi: String(getPropCaseInsensitive(u, ["Program Studi", "programStudi", "prodi", "departemen"]) || ""),
          semester: getPropCaseInsensitive(u, ["Semester", "semester"]) ? Number(getPropCaseInsensitive(u, ["Semester", "semester"])) : undefined,
          nipNim: String(getPropCaseInsensitive(u, ["NIP / NIM", "nipNim", "NIP", "NIM", "nip_nim"]) || ""),
          status: (getPropCaseInsensitive(u, ["Status", "status"]) || "AKTIF") as 'AKTIF' | 'NON_AKTIF'
        };

        if (mappedUser.status && mappedUser.status.toUpperCase() === 'NON_AKTIF') {
          return { success: false, message: 'Akun Anda saat ini dinonaktifkan. Silakan hubungi admin.' };
        }

        // Simpan cache sukses secara lokal agar bisa masuk luring di kemudian hari
        const localUsers = localDb.getUsers();
        if (!localUsers.some(usr => usr.id === mappedUser.id || usr.email.trim().toLowerCase() === mappedUser.email.trim().toLowerCase())) {
          localUsers.push(mappedUser);
          localDb.setUsers(localUsers);
        }

        // Simpan sandi ke cache sandi lokal secara aman di localStorage
        const customPass = localStorage.getItem('siakad_custom_passwords');
        const passwords = customPass ? JSON.parse(customPass) : {};
        passwords[mappedUser.email.toLowerCase()] = cleanPass;
        localStorage.setItem('siakad_custom_passwords', JSON.stringify(passwords));

        return { success: true, user: mappedUser };
      } else {
        // Tampilkan pesan error spesifik jika script Apps Script mengembalikan error atau tidak mengenali aksi login
        const errMsg = res?.error || res?.message || 'Kata sandi yang Anda masukkan salah.';
        const customMessage = res?.error 
          ? `${res.error} (Tip: Silakan buka editor Google Apps Script Anda, ganti kodenya dengan template terbaru di tab "Konfigurasi Sheets (GAS)", lalu deploy ulang sebagai Web App baru).`
          : errMsg;

        // Jika Google Sheets menolak kredensial, periksa apakah akun ini ada di luring
        const fallbackResult = loginLocalFallback();
        if (fallbackResult) {
          console.warn('Apps Script menolak, sukses masuk menggunakan cache luring lokal');
          return fallbackResult;
        }
        return { success: false, message: customMessage };
      }
    } catch (err: any) {
      console.warn('Koneksi Google Sheets terganggu, beralih ke luring:', err);
      const fallbackResult = loginLocalFallback();
      if (fallbackResult) {
        return fallbackResult;
      }
      return { success: false, message: `Koneksi Google Sheets Gagal: ${err.message || 'Failed to fetch'}. Pastikan URL Web App Anda aktif dan terinstal dengan benar.` };
    }
  }

  static async register(userData: Omit<User, 'id' | 'status'> & { password?: string }): Promise<{ success: boolean; user?: User; message?: string }> {
    const targetRole = userData.role;
    const prefix = targetRole === 'MAHASISWA' ? 'mhs' : 'dosen';
    const id = `${prefix}-${Math.random().toString(36).substring(2, 9)}`;

    const newUser: User = {
      id,
      name: userData.name,
      email: userData.email.trim().toLowerCase(),
      role: targetRole,
      programStudi: userData.programStudi,
      nipNim: userData.nipNim,
      status: 'AKTIF'
    };

    if (userData.role === 'MAHASISWA') {
      newUser.semester = userData.semester || 1;
    }

    // Always save user data and custom passwords locally as a reliable fallback/cache
    const users = localDb.getUsers();
    if (!users.some(u => u.email.trim().toLowerCase() === newUser.email)) {
      users.push(newUser);
      localDb.setUsers(users);
    }

    if (userData.password) {
      const customPass = localStorage.getItem('siakad_custom_passwords');
      const passwords = customPass ? JSON.parse(customPass) : {};
      passwords[newUser.email] = userData.password.trim();
      localStorage.setItem('siakad_custom_passwords', JSON.stringify(passwords));
    }

    // Auto enroll in some default courses if mahasiswa so they are hydrated immediately
    if (newUser.role === 'MAHASISWA') {
      const courses = localDb.getCourses();
      const enrolls = localDb.getEnrollments();
      courses.forEach(c => {
        if (!enrolls.some(e => e.idMahasiswa === newUser.id && e.kodeMK === c.kodeMK)) {
          enrolls.push({
            idMahasiswa: newUser.id,
            kodeMK: c.kodeMK,
            tahunAkademik: '2025/2026'
          });
        }
      });
      localDb.setEnrollments(enrolls);
    }

    if (this.isLiveMode()) {
      try {
        const defaultPassword = targetRole === 'DOSEN' ? 'dosen123' : 'mhs123';
        const finalPassword = (userData.password || defaultPassword).trim();
        await requestGAS(this.getGasUrl(), 'register', 'POST', {
          // Both camelCase and Indonesian translated keys for comprehensive fallback compatibility
          id,
          ID: id,
          
          name: userData.name,
          "Nama Lengkap": userData.name,
          
          email: userData.email.trim().toLowerCase(),
          Email: userData.email.trim().toLowerCase(),
          
          password: finalPassword,
          Password: finalPassword,
          "Kata Sandi": finalPassword,
          "Sandi": finalPassword,
          
          role: userData.role,
          Role: userData.role,
          
          programStudi: userData.programStudi,
          "Program Studi": userData.programStudi,
          
          semester: userData.semester || '',
          Semester: userData.semester || '',
          
          nipNim: userData.nipNim,
          "NIP / NIM": userData.nipNim,
          "NIP": userData.nipNim,
          "NIM": userData.nipNim,
          
          status: 'AKTIF',
          Status: 'AKTIF'
        });
        return { success: true, user: newUser };
      } catch (err: any) {
        console.warn('Failed syncing registration to spreadsheet, saved locally:', err);
        return { success: true, user: newUser };
      }
    }

    return { success: true, user: newUser };
  }

  static async getCourses(): Promise<Course[]> {
    if (!this.isLiveMode()) {
      return localDb.getCourses();
    }
    try {
      const data = await requestGAS(this.getGasUrl(), 'getCourses', 'GET');
      const coursesList = (data || []).map((c: any) => ({
        kodeMK: String(getPropCaseInsensitive(c, ["Kode MK", "kodeMK", "kode_mk"]) || ""),
        namaMK: String(getPropCaseInsensitive(c, ["Nama MK", "namaMK", "nama_mk"]) || ""),
        hari: String(getPropCaseInsensitive(c, ["Hari", "hari"]) || ""),
        jamMulai: String(getPropCaseInsensitive(c, ["Jam Mulai", "jamMulai", "jam_mulai"]) || ""),
        jamSelesai: String(getPropCaseInsensitive(c, ["Jam Selesai", "jamSelesai", "jam_selesai"]) || ""),
        ruang: String(getPropCaseInsensitive(c, ["Ruang", "ruang"]) || ""),
        dosenId: String(getPropCaseInsensitive(c, ["Dosen Pengampu", "dosenId", "dosen_id"]) || ""),
        semester: String(getPropCaseInsensitive(c, ["Semester", "semester"]) || "")
      }));
      // Sync cache
      localDb.setCourses(coursesList);
      return coursesList;
    } catch (err: any) {
      console.warn('Fetch courses failed. Falling back to localDb:', err.message);
      return localDb.getCourses();
    }
  }

  static async getEnrollments(): Promise<Enrollment[]> {
    if (!this.isLiveMode()) {
      return localDb.getEnrollments();
    }
    try {
      const data = await requestGAS(this.getGasUrl(), 'getEnrollments', 'GET');
      const enrollmentsList = (data || []).map((e: any) => ({
        idMahasiswa: String(getPropCaseInsensitive(e, ["ID Mahasiswa", "idMahasiswa", "id_mahasiswa"]) || ""),
        kodeMK: String(getPropCaseInsensitive(e, ["Kode MK", "kodeMK", "kode_mk"]) || ""),
        tahunAkademik: String(getPropCaseInsensitive(e, ["Tahun Akademik", "tahunAkademik", "tahun_akademik"]) || "")
      }));
      // Sync cache
      localDb.setEnrollments(enrollmentsList);
      return enrollmentsList;
    } catch (err: any) {
      console.warn('Fetch enrollments failed. Falling back to localDb:', err.message);
      return localDb.getEnrollments();
    }
  }

  static async getSessions(): Promise<AttendanceSession[]> {
    if (!this.isLiveMode()) {
      return localDb.getSessions();
    }
    try {
      const data = await requestGAS(this.getGasUrl(), 'getSessions', 'GET');
      const sessionsList = (data || []).map((s: any) => {
        const kodeVal = getPropCaseInsensitive(s, ["Kode Unik", "kodeUnik", "kode_unik"]);
        return {
          idSesi: String(getPropCaseInsensitive(s, ["ID Sesi", "idSesi", "id_sesi"]) || ""),
          kodeMK: String(getPropCaseInsensitive(s, ["Kode MK", "kodeMK", "kode_mk"]) || ""),
          tanggal: String(getPropCaseInsensitive(s, ["Tanggal", "tanggal"]) || ""),
          jamMulaiPresensi: String(getPropCaseInsensitive(s, ["Jam Mulai Presensi", "jamMulaiPresensi", "jam_mulai_presensi"]) || ""),
          jamSelesaiPresensi: String(getPropCaseInsensitive(s, ["Jam Selesai Presensi", "jamSelesaiPresensi", "jam_selesai_presensi"]) || ""),
          kodeUnik: kodeVal !== undefined && kodeVal !== null ? String(kodeVal) : "",
          status: String(getPropCaseInsensitive(s, ["Status", "status"]) || "DIBUKA")
        };
      });
      // Sync cache
      localDb.setSessions(sessionsList);
      return sessionsList;
    } catch (err: any) {
      console.warn('Fetch sessions failed. Falling back to localDb:', err.message);
      return localDb.getSessions();
    }
  }

  static async getAttendances(): Promise<Attendance[]> {
    if (!this.isLiveMode()) {
      return localDb.getAttendances();
    }
    try {
      const data = await requestGAS(this.getGasUrl(), 'getAttendances', 'GET');
      const attendancesList = (data || []).map((a: any) => ({
        idSesi: String(getPropCaseInsensitive(a, ["ID Sesi", "idSesi", "id_sesi"]) || ""),
        idMahasiswa: String(getPropCaseInsensitive(a, ["ID Mahasiswa", "idMahasiswa", "id_mahasiswa"]) || ""),
        statusKehadiran: (getPropCaseInsensitive(a, ["Status Kehadiran", "statusKehadiran", "status_kehadiran", "status"]) || 'Alpa') as AttendanceStatus,
        waktuPresensi: String(getPropCaseInsensitive(a, ["Waktu Presensi", "waktuPresensi", "waktu_presensi"]) || ""),
        ipAddressMetode: String(getPropCaseInsensitive(a, ["IP Address / Metode", "ipAddressMetode", "ip_address_metode", "metode"]) || "")
      }));
      // Sync cache
      localDb.setAttendances(attendancesList);
      return attendancesList;
    } catch (err: any) {
      console.warn('Fetch attendances failed. Falling back to localDb:', err.message);
      return localDb.getAttendances();
    }
  }

  static async getJournals(): Promise<Journal[]> {
    if (!this.isLiveMode()) {
      return localDb.getJournals();
    }
    try {
      const data = await requestGAS(this.getGasUrl(), 'getJournals', 'GET');
      const journalsList = (data || []).map((j: any) => ({
        idJurnal: String(getPropCaseInsensitive(j, ["ID Jurnal", "idJurnal", "id_jurnal"]) || ""),
        kodeMK: String(getPropCaseInsensitive(j, ["Kode MK", "kodeMK", "kode_mk"]) || ""),
        tanggal: String(getPropCaseInsensitive(j, ["Tanggal", "tanggal"]) || ""),
        judul: String(getPropCaseInsensitive(j, ["Judul", "judul"]) || ""),
        isi: String(getPropCaseInsensitive(j, ["Isi", "isi"]) || ""),
        lampiran: String(getPropCaseInsensitive(j, ["Lampiran", "lampiran"]) || ""),
        dibuatOleh: String(getPropCaseInsensitive(j, ["Dibuat oleh", "dibuatOleh", "dibuat_oleh"]) || "")
      }));
      // Sync cache
      localDb.setJournals(journalsList);
      return journalsList;
    } catch (err: any) {
      console.warn('Fetch journals failed. Falling back to localDb:', err.message);
      return localDb.getJournals();
    }
  }

  static async getUsersDirect(): Promise<User[]> {
    if (!this.isLiveMode()) {
      return localDb.getUsers();
    }
    try {
      // Fetch users directly from Web App
      const data = await requestGAS(this.getGasUrl(), 'getUserData', 'GET');
      const usersList = (data || []).map((u: any) => ({
        id: String(getPropCaseInsensitive(u, ["ID", "id"]) || ""),
        name: String(getPropCaseInsensitive(u, ["Nama Lengkap", "name", "nama"]) || ""),
        email: String(getPropCaseInsensitive(u, ["Email", "email"]) || ""),
        role: String(getPropCaseInsensitive(u, ["Role", "role"]) || "") as 'DOSEN' | 'MAHASISWA',
        programStudi: String(getPropCaseInsensitive(u, ["Program Studi", "programStudi", "prodi", "departemen"]) || ""),
        semester: getPropCaseInsensitive(u, ["Semester", "semester"]) ? Number(getPropCaseInsensitive(u, ["Semester", "semester"])) : undefined,
        nipNim: String(getPropCaseInsensitive(u, ["NIP / NIM", "nipNim", "NIP", "NIM", "nip_nim"]) || ""),
        status: (getPropCaseInsensitive(u, ["Status", "status"]) || "AKTIF") as 'AKTIF' | 'NON_AKTIF',
        password: String(getPropCaseInsensitive(u, ["Password", "password", "Kata Sandi", "kata_sandi"]) || "")
      }));
      // Sync cache
      localDb.setUsers(usersList);
      return usersList;
    } catch (err: any) {
      console.warn('Fetch users direct failed. Falling back to localDb:', err.message);
      return localDb.getUsers();
    }
  }

  // Mutation commands
  static async createCourse(course: Course): Promise<void> {
    // Optimistic / Local-first
    const courses = localDb.getCourses();
    if (!courses.some(c => c.kodeMK === course.kodeMK)) {
      courses.push(course);
      localDb.setCourses(courses);
    }
    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'createCourse', 'POST', { course });
    } catch (err: any) {
      console.warn('Sync createCourse to Spreadsheet failed, retained locally:', err.message);
    }
  }

  static async updateCourse(kodeMK: string, updated: Course): Promise<void> {
    // Optimistic / Local-first
    let courses = localDb.getCourses();
    courses = courses.map(c => c.kodeMK === kodeMK ? updated : c);
    localDb.setCourses(courses);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'updateCourse', 'POST', { kodeMK, course: updated });
    } catch (err: any) {
      console.warn('Sync updateCourse to Spreadsheet failed, retained locally:', err.message);
    }
  }

  static async deleteCourse(kodeMK: string): Promise<void> {
    // Optimistic / Local-first
    let courses = localDb.getCourses();
    courses = courses.filter(c => c.kodeMK !== kodeMK);
    localDb.setCourses(courses);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'deleteCourse', 'POST', { kodeMK });
    } catch (err: any) {
      console.warn('Sync deleteCourse to Spreadsheet failed, retained locally:', err.message);
    }
  }

  static async openSession(session: Omit<AttendanceSession, 'idSesi'>): Promise<string> {
    const idSesi = `session-${Math.random().toString(36).substring(2, 9)}`;
    const newSession: AttendanceSession = { ...session, idSesi };
    
    // Always save locally first so offline flow works seamlessly
    const sessions = localDb.getSessions();
    sessions.push(newSession);
    localDb.setSessions(sessions);

    if (!this.isLiveMode()) {
      return idSesi;
    }
    try {
      const result = await requestGAS(this.getGasUrl(), 'openSession', 'POST', { session: newSession });
      return result.idSesi || idSesi;
    } catch (err: any) {
      console.warn('Sync openSession to Spreadsheet failed, using generated ID offline:', err.message);
      return idSesi;
    }
  }

  static async recordAttendance(att: { idSesi: string; idMahasiswa: string; statusKehadiran: AttendanceStatus; kodeMasukkan?: string; ipAddressMetode: string }): Promise<void> {
    // Optimistic / Local-first
    const sessions = localDb.getSessions();
    const targetSession = sessions.find(s => s.idSesi === att.idSesi);
    if (!targetSession || targetSession.status === 'DITUTUP') {
      throw new Error('Sesi presensi sudah ditutup!');
    }

    if (targetSession.kodeUnik && att.kodeMasukkan !== targetSession.kodeUnik) {
      throw new Error('Kode verifikasi 6-digit salah!');
    }

    let list = localDb.getAttendances();
    const existingIdx = list.findIndex(item => item.idSesi === att.idSesi && item.idMahasiswa === att.idMahasiswa);
    
    const newRecord: Attendance = {
      idSesi: att.idSesi,
      idMahasiswa: att.idMahasiswa,
      statusKehadiran: att.statusKehadiran,
      waktuPresensi: new Date().toISOString(),
      ipAddressMetode: att.ipAddressMetode
    };

    if (existingIdx !== -1) {
      list[existingIdx] = newRecord;
    } else {
      list.push(newRecord);
    }
    localDb.setAttendances(list);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'recordAttendance', 'POST', { attendance: att });
    } catch (err: any) {
      console.warn('Sync recordAttendance to Spreadsheet failed, saved locally:', err.message);
    }
  }

  static async updateAttendanceByDosen(idSesi: string, attendancesList: { idMahasiswa: string; statusKehadiran: AttendanceStatus; ipAddressMetode: string }[]): Promise<void> {
    // Optimistic / Local-first
    let list = localDb.getAttendances();
    attendancesList.forEach(att => {
      const existingIdx = list.findIndex(item => item.idSesi === idSesi && item.idMahasiswa === att.idMahasiswa);
      const newRecord: Attendance = {
        idSesi,
        idMahasiswa: att.idMahasiswa,
        statusKehadiran: att.statusKehadiran,
        waktuPresensi: new Date().toISOString(),
        ipAddressMetode: att.ipAddressMetode
      };
      if (existingIdx !== -1) {
        list[existingIdx] = newRecord;
      } else {
        list.push(newRecord);
      }
    });
    localDb.setAttendances(list);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'updateAttendanceByDosen', 'POST', { idSesi, attendances: attendancesList });
    } catch (err: any) {
      console.warn('Sync updateAttendanceByDosen to Spreadsheet failed, updated locally:', err.message);
    }
  }

  static async saveJournal(journal: Journal): Promise<void> {
    // Optimistic / Local-first
    let journals = localDb.getJournals();
    const existingIdx = journals.findIndex(j => j.idJurnal === journal.idJurnal);
    if (existingIdx !== -1) {
      journals[existingIdx] = journal;
    } else {
      journals.push(journal);
    }
    localDb.setJournals(journals);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'saveJournal', 'POST', { journal });
    } catch (err: any) {
      console.warn('Sync saveJournal to Spreadsheet failed, saved locally:', err.message);
    }
  }

  static async deleteJournal(idJurnal: string): Promise<void> {
    // Optimistic / Local-first
    let journals = localDb.getJournals();
    journals = journals.filter(j => j.idJurnal !== idJurnal);
    localDb.setJournals(journals);

    if (!this.isLiveMode()) {
      return;
    }
    try {
      await requestGAS(this.getGasUrl(), 'deleteJournal', 'POST', { idJurnal });
    } catch (err: any) {
      console.warn('Sync deleteJournal to Spreadsheet failed, removed locally:', err.message);
    }
  }
}
