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
  private safeParse<T>(value: string | null, fallback: T): T {
    try {
      if (!value) return fallback;
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  private getStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    const storageKey = 'siakad_' + key;
    const value = localStorage.getItem(storageKey);
    return this.safeParse<T>(value, fallback);
  }

  private setStorage<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    const storageKey = 'siakad_' + key;
    localStorage.setItem(storageKey, JSON.stringify(value));
  }

  getUsers(): User[] { return this.getStorage<User[]>('users', initialUsers); }
  setUsers(data: User[]): void { this.setStorage<User[]>('users', data); }
  getCourses(): Course[] { return this.getStorage<Course[]>('courses', initialCourses); }
  setCourses(data: Course[]): void { this.setStorage<Course[]>('courses', data); }
  getEnrollments(): Enrollment[] { return this.getStorage<Enrollment[]>('enrollments', initialEnrollments); }
  setEnrollments(data: Enrollment[]): void { this.setStorage<Enrollment[]>('enrollments', data); }
  getSessions(): AttendanceSession[] { return this.getStorage<AttendanceSession[]>('sessions', initialSessions); }
  setSessions(data: AttendanceSession[]): void { this.setStorage<AttendanceSession[]>('sessions', data); }
  getAttendances(): Attendance[] { return this.getStorage<Attendance[]>('attendances', initialAttendances); }
  setAttendances(data: Attendance[]): void { this.setStorage<Attendance[]>('attendances', data); }
  getJournals(): Journal[] { return this.getStorage<Journal[]>('journals', initialJournals); }
  setJournals(data: Journal[]): void { this.setStorage<Journal[]>('journals', data); }
}

export const localDb = new LocalDatabase();

/* ================================
   HELPERS
================================ */

function getPropCaseInsensitive(obj: any, keys: string[]) {
  if (!obj) return undefined;
  for (const key of keys) {
    if (obj[key] !== undefined && obj[key] !== null) {
      return obj[key];
    }
  }
  const lowerKeys = keys.map(k => k.toLowerCase());
  for (const actualKey of Object.keys(obj)) {
    if (lowerKeys.includes(actualKey.toLowerCase())) {
      return obj[actualKey];
    }
  }
  return undefined;
}

async function requestGAS(url: string, action: string, method: 'GET' | 'POST', body?: any): Promise<any> {
  try {
    const fullUrl = method === 'GET' ? url + '?action=' + encodeURIComponent(action) : url;
    
    const response = await fetch(fullUrl, {
      method: method,
      mode: 'cors',
      headers: method === 'POST' ? { 'Content-Type': 'text/plain' } : undefined,
      body: method === 'POST' ? JSON.stringify({ action: action, ...body }) : undefined
    });

    if (!response.ok) {
      throw new Error('HTTP status ' + response.status);
    }

    const data = await response.json();
    return data;
  } catch (err: any) {
    console.error("GAS Request Error:", err);
    return { success: false, error: err.message || "Koneksi terputus" };
  }
}

/* ================================
   API CLIENT
================================ */

export class ApiClient {
  static DEFAULT_GAS_URL = '
