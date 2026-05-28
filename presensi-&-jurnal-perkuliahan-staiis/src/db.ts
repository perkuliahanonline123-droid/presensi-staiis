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

const initialCourses: Course[] = [];
const initialEnrollments: Enrollment[] = [];
const initialSessions: AttendanceSession[] = [];
const initialAttendances: Attendance[] = [];
const initialJournals: Journal[] = [];

/* ================================
   LOCAL DATABASE
================================ */

class LocalDatabase {

  private safeParse<T>(
    value: string | null,
    fallback: T
  ): T {

    try {
      if (!value) {
        return fallback;
      }

      return JSON.parse(value);

    } catch {
      return fallback;
    }
  }

  private getStorage<T>(
    key: string,
    fallback: T
  ): T {

    if (typeof window === 'undefined') {
      return fallback;
    }

    const storageKey = 'siakad_' + key;

    const value = localStorage.getItem(
      storageKey
    );

    return this.safeParse<T>(
      value,
      fallback
    );
  }

  private setStorage<T>(
    key: string,
    value: T
  ): void {

    if (typeof window === 'undefined') {
      return;
    }

    const storageKey = 'siakad_' + key;

    localStorage.setItem(
      storageKey,
      JSON.stringify(value)
    );
  }

  getUsers(): User[] {
    return this.getStorage<User[]>(
      'users',
      initialUsers
    );
  }

  setUsers(data: User[]): void {
    this.setStorage<User[]>(
      'users',
      data
    );
  }

  getCourses(): Course[] {
    return this.getStorage<Course[]>(
      'courses',
      initialCourses
    );
  }

  setCourses(data: Course[]): void {
    this.setStorage<Course[]>(
      'courses',
      data
    );
  }

  getEnrollments(): Enrollment[] {
    return this.getStorage<Enrollment[]>(
      'enrollments',
      initialEnrollments
    );
  }

  setEnrollments(
    data: Enrollment[]
  ): void {

    this.setStorage<Enrollment[]>(
      'enrollments',
      data
    );
  }

  getSessions(): AttendanceSession[] {
    return this.getStorage<AttendanceSession[]>(
      'sessions',
      initialSessions
    );
  }

  setSessions(
    data: AttendanceSession[]
  ): void {

    this.setStorage<AttendanceSession[]>(
      'sessions',
      data
    );
  }

  getAttendances(): Attendance[] {
    return this.getStorage<Attendance[]>(
      'attendances',
      initialAttendances
    );
  }

  setAttendances(
    data: Attendance[]
  ): void {

    this.setStorage<Attendance[]>(
      'attendances',
      data
    );
  }

  getJournals(): Journal[] {
    return this.getStorage<Journal[]>(
      'journals',
      initialJournals
    );
  }

  setJournals(
    data: Journal[]
  ): void {

    this.setStorage<Journal[]>(
      'journals',
      data
    );
  }
}

export const localDb =
  new LocalDatabase();

/* ================================
   HELPERS
================================ */

function getPropCaseInsensitive(
  obj: any,
  keys: string[]
) {

  if (!obj) {
    return undefined;
  }

  for (const key of keys) {

    if (
      obj[key] !== undefined &&
      obj[key] !== null
    ) {
      return obj[key];
    }
  }

  const lowerKeys = keys.map(
    function(k) {
      return k.toLowerCase();
    }
  );

  for (const actualKey of Object.keys(obj)) {

    if (
      lowerKeys.includes(
        actualKey.toLowerCase()
      )
    ) {
      return obj[actualKey];
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
      ? url + '?action=' + encodeURIComponent(action)
      : url;

  const response = await fetch(
    fullUrl,
    {
      method: method,
      mode: 'cors',

      headers:
        method === 'POST'
          ? {
              'Content-Type': 'text/plain'
            }
          : undefined,

      body:
        method === 'POST'
          ? JSON.stringify({
              action: action,
              ...body
            })
          : undefined
    }
  );

  if (!response.ok) {
    throw new Error(
      'HTTP ' + response.status
    );
  }

  const data = await response.json();

  if (!data.success) {
    throw new Error(
      data.error ||
      'Apps Script Error'
    );
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
      return '';
    }

    const saved =
      localStorage.getItem(
        'siakad_gas_url'
      );

    return saved || this.DEFAULT_GAS_URL;
  }

  static isLiveMode(): boolean {
    return true;
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

    try {

      const res = await requestGAS(
        this.getGasUrl(),
        'login',
        'POST',
        {
          email: email,
          password: password
        }
      );

      const u = res.user || res;

      const mappedUser: User = {
        id: String(
          getPropCaseInsensitive(
            u,
            ['id', 'ID']
          ) || ''
        ),

        name: String(
          getPropCaseInsensitive(
            u,
            [
              'name',
              'Nama Lengkap'
            ]
          ) || ''
        ),

        email: String(
          getPropCaseInsensitive(
            u,
            ['email', 'Email']
          ) || ''
        ),

        role:
          getPropCaseInsensitive(
            u,
            ['role', 'Role']
          ) as 'DOSEN' | 'MAHASISWA',

        programStudi: String(
          getPropCaseInsensitive(
            u,
            [
              'programStudi',
              'Program Studi'
            ]
          ) || ''
        ),

        semester: Number(
          getPropCaseInsensitive(
            u,
            [
              'semester',
              'Semester'
            ]
          ) || 0
        ),

        nipNim: String(
          getPropCaseInsensitive(
            u,
            [
              'nipNim',
              'NIP / NIM'
            ]
          ) || ''
        ),

        status:
          getPropCaseInsensitive(
            u,
            ['status', 'Status']
          ) as 'AKTIF' | 'NON_AKTIF'
      };

      return {
        success: true,
        user: mappedUser
      };

    } catch (err: any) {

      return {
        success: false,
        message:
          err.message ||
          'Login gagal'
      };
    }
  }

  /* ================================
     GET COURSES
  ================================ */

  static async getCourses():
    Promise<Course[]> {

    try {

      const data = await requestGAS(
        this.getGasUrl(),
        'getCourses',
        'GET'
      );

      return (data || []).map(
        function(c: any) {

          return {
            kodeMK: String(
              getPropCaseInsensitive(
                c,
                ['kodeMK', 'Kode MK']
              ) || ''
            ),

            namaMK: String(
              getPropCaseInsensitive(
                c,
                ['namaMK', 'Nama MK']
              ) || ''
            ),

            hari: String(
              getPropCaseInsensitive(
                c,
                ['hari', 'Hari']
              ) || ''
            ),

            jamMulai: String(
              getPropCaseInsensitive(
                c,
                [
                  'jamMulai',
                  'Jam Mulai'
                ]
              ) || ''
            ),

            jamSelesai: String(
              getPropCaseInsensitive(
                c,
                [
                  'jamSelesai',
                  'Jam Selesai'
                ]
              ) || ''
            ),

            ruang: String(
              getPropCaseInsensitive(
                c,
                ['ruang', 'Ruang']
              ) || ''
            ),

            dosenId: String(
              getPropCaseInsensitive(
                c,
                [
                  'dosenId',
                  'Dosen Pengampu'
                ]
              ) || ''
            ),

            semester: String(
              getPropCaseInsensitive(
                c,
                ['semester', 'Semester']
              ) || ''
            )
          };
        }
      );

    } catch {

      return [];
    }
  }

  /* ================================
     CREATE COURSE
  ================================ */

  static async createCourse(
    course: Course
  ): Promise<void> {

    await requestGAS(
      this.getGasUrl(),
      'createCourse',
      'POST',
      {
        course: course
      }
    );
  }

  /* ================================
     RECORD ATTENDANCE
  ================================ */

  static async recordAttendance(
    params: {
      idSesi: string;
      idMahasiswa: string;
      statusKehadiran:
        AttendanceStatus;
      kodeMasukkan?: string;
      ipAddressMetode: string;
    }
  ): Promise<void> {

    const attendance: Attendance = {
      idSesi: params.idSesi,
      idMahasiswa:
        params.idMahasiswa,
      statusKehadiran:
        params.statusKehadiran,
      waktuPresensi:
        new Date().toISOString(),
      ipAddressMetode:
        params.ipAddressMetode
    };

    await requestGAS(
      this.getGasUrl(),
      'recordAttendance',
      'POST',
      {
        attendance: attendance
      }
    );
  }
}
