/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  Course,
  Enrollment,
  AttendanceSession,
  Attendance,
  Journal,
  AttendanceStatus
} from './types';

/* ================================
   DEMO DATA
================================ */

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
  }
];

const initialEnrollments: Enrollment[] = [
  {
    idMahasiswa: 'mhs-1',
    kodeMK: 'PAI-402',
    tahunAkademik: '2025/2026'
  }
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
  }
];

const initialAttendances: Attendance[] = [];

const initialJournals: Journal[] = [];

/* ================================
   LOCAL DATABASE
================================ */

class LocalDatabase {
  private safeParse<T>(value: string | null, fallback: T): T {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  private getStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;

    const value = localStorage.getItem(`siakad_${key}`);
    return this.safeParse<T>(value, fallback);
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(`siakad_${key}`, JSON.stringify(value));
  }

  getUsers(): User[] {
    return this.getStorage('users', initialUsers);
  }

  setUsers(users: User[]): void {
    this.setStorage('users', users);
  }

  getCourses(): Course[] {
    return this.getStorage('courses', initialCourses);
  }

  setCourses(courses: Course[]): void {
    this.setStorage('courses', courses);
  }

  getEnrollments(): Enrollment[] {
    return this.getStorage('enrollments', initialEnrollments);
  }

  setEnrollments(data: Enrollment[]): void {
    this.setStorage('enrollments', data);
  }

  getSessions(): AttendanceSession[] {
    return this.getStorage('sessions', initialSessions);
  }

  setSessions(data: AttendanceSession[]): void {
    this.setStorage('sessions', data);
  }

  getAttendances(): Attendance[] {
    return this.getStorage('attendances', initialAttendances);
  }

  setAttendances(data: Attendance[]): void {
    this.setStorage('attendances', data);
  }

  getJournals(): Journal[] {
    return this.getStorage('journals', initialJournals);
  }

  setJournals(data: Journal[]): void {
    this.setStorage('journals', data);
  }

  resetDemoData(): void {
    this.setUsers(initialUsers);
    this.setCourses(initialCourses);
    this.setEnrollments(initialEnrollments);
    this.setSessions(initialSessions);
    this.setAttendances(initialAttendances);
    this.setJournals(initialJournals);
  }
}

export const localDb = new LocalDatabase();

/* ================================
   HELPERS
================================ */

function getPropCaseInsensitive(obj: any, keys: string[]) {
  if (!obj) return undefined;

  for (const key of keys) {
    if (obj[key] !== undefined) return obj[key];
  }

  const lower = keys.map(k => k.toLowerCase());

  for (const actual of Object.keys(obj)) {
    if (lower.includes(actual.toLowerCase())) {
      return obj[actual];
    }
  }

  return undefined;
}

async function requestGAS(
  url: string,
  action: string,
  method: 'GET' | 'POST',
  body?: any
): Promise<any> {
  const fullUrl =
    method === 'GET'
      ? `${url}?action=${encodeURIComponent(action)}`
      : url;

  const response = await fetch(fullUrl, {
    method,
    mode: 'cors',
    headers:
      method === 'POST'
        ? {
            'Content-Type': 'application/json'
          }
        : undefined,
    body:
      method === 'POST'
        ? JSON.stringify({
            action,
            ...body
          })
        : undefined
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data?.success) {
    throw new Error(data?.error || 'Apps Script Error');
  }

  return data.data;
}

/* ================================
   API CLIENT
================================ */

export class ApiClient {
  static DEFAULT_GAS_URL =
    'https://script.google.com/macros/s/AKfycbyXHwbUiHQB1k0QmYDGIlt4T_WidAvqsGKcVjwJANE_BTSzej9kNl1MMWIxxcH4sk9jPw/exec';

  static getGasUrl(): string {
    if (typeof window === 'undefined') {
      return this.DEFAULT_GAS_URL;
    }

    return (
      localStorage.getItem('siakad_gas_url') ||
      this.DEFAULT_GAS_URL
    );
  }

  static setGasUrl(url: string): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem('siakad_gas_url', url.trim());
  }

  static isLiveMode(): boolean {
    return Boolean(this.getGasUrl());
  }

  /* ================================
     LOGIN
  ================================ */

  static async login(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: User;
    message?: string;
  }> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const loginLocal = () => {
      const users = localDb.getUsers();

      const user = users.find(
        u => u.email.toLowerCase() === cleanEmail
      );

      if (!user) return null;

      const saved =
        typeof window !== 'undefined'
          ? JSON.parse(
              localStorage.getItem(
                'siakad_custom_passwords'
              ) || '{}'
            )
          : {};

      const savedPass = saved[cleanEmail];

      const defaultPass =
        user.role === 'DOSEN'
          ? 'dosen123'
          : 'mhs123';

      if (
        cleanPass === savedPass ||
        cleanPass === defaultPass
      ) {
        return {
          success: true,
          user
        };
      }

      return null;
    };

    if (!this.isLiveMode()) {
      return (
        loginLocal() || {
          success: false,
          message: 'Login gagal'
        }
      );
    }

    try {
      const res = await requestGAS(
        this.getGasUrl(),
        'login',
        'POST',
        {
          email: cleanEmail,
          password: cleanPass
        }
      );

      const u = res.user || res;

      const mappedUser: User = {
        id: String(getPropCaseInsensitive(u, ['id', 'ID']) || ''),
        name: String(
          getPropCaseInsensitive(u, [
            'name',
            'Nama Lengkap'
          ]) || ''
        ),
        email: String(
          getPropCaseInsensitive(u, [
            'email',
            'Email'
          ]) || ''
        ),
        role: getPropCaseInsensitive(u, [
          'role',
          'Role'
        ]) as 'DOSEN' | 'MAHASISWA',
        programStudi: String(
          getPropCaseInsensitive(u, [
            'programStudi',
            'Program Studi'
          ]) || ''
        ),
        semester: Number(
          getPropCaseInsensitive(u, [
            'semester',
            'Semester'
          ]) || 0
        ),
        nipNim: String(
          getPropCaseInsensitive(u, [
            'nipNim',
            'NIP / NIM'
          ]) || ''
        ),
        status: (
          getPropCaseInsensitive(u, [
            'status',
            'Status'
          ]) || 'AKTIF'
        ) as 'AKTIF' | 'NON_AKTIF'
      };

      return {
        success: true,
        user: mappedUser
      };
    } catch (err: any) {
      console.error(err);

      return (
        loginLocal() || {
          success: false,
          message: err.message
        }
      );
    }
  }

  /* ================================
     GET COURSES
  ================================ */

  static async getCourses(): Promise<Course[]> {
    if (!this.isLiveMode()) {
      return localDb.getCourses();
    }

    try {
      const data = await requestGAS(
        this.getGasUrl(),
        'getCourses',
        'GET'
      );

      const courses: Course[] = (data || []).map((c: any) => ({
        kodeMK: String(
          getPropCaseInsensitive(c, ['kodeMK', 'Kode MK']) || ''
        ),
        namaMK: String(
          getPropCaseInsensitive(c, ['namaMK', 'Nama MK']) || ''
        ),
        hari: String(
          getPropCaseInsensitive(c, ['hari', 'Hari']) || ''
        ),
        jamMulai: String(
          getPropCaseInsensitive(c, [
            'jamMulai',
            'Jam Mulai'
          ]) || ''
        ),
        jamSelesai: String(
          getPropCaseInsensitive(c, [
            'jamSelesai',
            'Jam Selesai'
          ]) || ''
        ),
        ruang: String(
          getPropCaseInsensitive(c, ['ruang', 'Ruang']) || ''
        ),
        dosenId: String(
          getPropCaseInsensitive(c, [
            'dosenId',
            'Dosen Pengampu'
          ]) || ''
        ),
        semester: String(
          getPropCaseInsensitive(c, [
            'semester',
            'Semester'
          ]) || ''
        )
      }));

      localDb.setCourses(courses);

      return courses;
    } catch (err) {
      console.error(err);
      return localDb.getCourses();
    }
  }

  /* ================================
     CREATE COURSE
  ================================ */

  static async createCourse(course: Course): Promise<void> {
    const courses = localDb.getCourses();

    const exists = courses.some(
      c => c.kodeMK === course.kodeMK
    );

    if (!exists) {
      courses.push(course);
      localDb.setCourses(courses);
    }

    if (!this.isLiveMode()) return;

    try {
      await requestGAS(
        this.getGasUrl(),
        'createCourse',
        'POST',
        { course }
      );
    } catch (err) {
      console.error(err);
    }
  }

  /* ================================
     RECORD ATTENDANCE
  ================================ */

  static async recordAttendance(params: {
    idSesi: string;
    idMahasiswa: string;
    statusKehadiran: AttendanceStatus;
    kodeMasukkan?: string;
    ipAddressMetode: string;
  }): Promise<void> {
    const sessions = localDb.getSessions();

    const session = sessions.find(
      s => s.idSesi === params.idSesi
    );

    if (!session) {
      throw new Error('Sesi tidak ditemukan');
    }

    if (session.status === 'DITUTUP') {
      throw new Error('Sesi sudah ditutup');
    }

    if (
      session.kodeUnik &&
      session.kodeUnik !== params.kodeMasukkan
    ) {
      throw new Error('Kode unik salah');
    }

    const attendances = localDb.getAttendances();

    const attendance: Attendance = {
      idSesi: params.idSesi,
      idMahasiswa: params.idMahasiswa,
      statusKehadiran: params.statusKehadiran,
      waktuPresensi: new Date().toISOString(),
      ipAddressMetode: params.ipAddressMetode
    };

    const index = attendances.findIndex(
      a =>
        a.idSesi === params.idSesi &&
        a.idMahasiswa === params.idMahasiswa
    );

    if (index >= 0) {
      attendances[index] = attendance;
    } else {
      attendances.push(attendance);
    }

    localDb.setAttendances(attendances);

    if (!this.isLiveMode()) return;

    try {
      await requestGAS(
        this.getGasUrl(),
        'recordAttendance',
        'POST',
        {
          attendance
        }
      );
    } catch (err) {
      console.error(err);
    }
  }
}
