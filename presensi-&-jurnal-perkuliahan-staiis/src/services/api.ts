/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const API_URL =
  "https://script.google.com/macros/s/AKfycbyXHwbUiHQB1k0QmYDGIlt4T_WidAvqsGKcVjwJANE_BTSzej9kNl1MMWIxxcH4sk9jPw/exec";

export class ApiClient {

  /* ================================
     LOGIN
  ================================ */
  static async login(email: string, password: string) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "login",
        email,
        password,
      }),
    });
    return await response.json();
  }

  /* ================================
     REGISTER (FUNGSI PENDAFTARAN AKUN)
  ================================ */
  static async register(userData: any) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "register",
        ...userData
      }),
    });
    return await response.json();
  }

  /* ================================
     OPEN SESSION (BUKA ABSENSI DOSEN)
  ================================ */
  static async openSession(sessionData: any) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "openSession",
        session: sessionData
      }),
    });
    return await response.json();
  }

  /* ================================
     SAVE JOURNAL (SIMPAN JURNAL DOSEN)
  ================================ */
  static async saveJournal(journalData: any) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "saveJournal",
        journal: journalData
      }),
    });
    return await response.json();
  }

  /* ================================
     UPDATE ATTENDANCE BY DOSEN (ABSEN MANUAL)
  ================================ */
  static async updateAttendanceByDosen(idSesi: string, attendances: any[]) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateAttendanceByDosen",
        idSesi,
        attendances
      }),
    });
    return await response.json();
  }

  /* ================================
     CREATE COURSE (BUAT MATA KULIAH)
  ================================ */
  static async createCourse(courseData: any) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "createCourse",
        course: courseData
      }),
    });
    return await response.json();
  }

  /* ================================
     UPDATE COURSE (PERBARUI MATA KULIAH)
  ================================ */
  static async updateCourse(kodeMK: string, courseData: any) {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "updateCourse",
        kodeMK,
        course: courseData
      }),
    });
    return await response.json();
  }

  /* ================================
     GET DATA (FUNGSI AMBIL DATA)
  ================================ */
  static async getUsers() {
    const response = await fetch(`${API_URL}?action=getUsers`);
    return await response.json();
  }

  static async getUsersDirect() {
    const response = await fetch(`${API_URL}?action=getUserData`);
    return await response.json();
  }

  static async getCourses() {
    const response = await fetch(`${API_URL}?action=getCourses`);
    return await response.json();
  }

  static async getSessions() {
    const response = await fetch(`${API_URL}?action=getSessions`);
    return await response.json();
  }

  static async getAttendances() {
    const response = await fetch(`${API_URL}?action=getAttendances`);
    return await response.json();
  }

  static async getJournals() {
    const response = await fetch(`${API_URL}?action=getJournals`);
    return await response.json();
  }

  static async getEnrollments() {
    const response = await fetch(`${API_URL}?action=getEnrollments`);
    return await response.json();
  }
}
