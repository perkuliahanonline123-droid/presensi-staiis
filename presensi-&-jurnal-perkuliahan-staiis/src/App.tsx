/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course, AttendanceSession, Attendance, Journal } from './types';
import { translations, Lang } from './translations';

// FIX: Membungkus seluruh impor module database agar kebal dari minifikasi paksa Vercel (Anti-Ve.register)
import * as DatabaseEngine from './db';
const ApiClient = DatabaseEngine.ApiClient;

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardMahasiswa } from './pages/DashboardMahasiswa';
import { MahasiswaJurnal } from './pages/MahasiswaJurnal';
import { DashboardDosen } from './pages/DashboardDosen';
import { DosenPresensi } from './pages/DosenPresensi';
import { DosenRekap } from './pages/DosenRekap';
import { AdminManageCourses } from './pages/AdminManageCourses';

export default function App() {
  // Localization States
  const [lang, setLang] = useState<Lang>('ID');
  const t = translations[lang];

  // Global Session States
  const [user, setUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Core Sync Data States
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);

  // Routing State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SETTINGS'>('DASHBOARD');
  const [currentView, setCurrentView] = useState<
    'LANDING' | 'LOGIN' | 'MAHASISWA_JURNAL' | 'MAHASISWA_RIWAYAT' | 'DOSEN_PRESENSI' | 'DOSEN_JURNAL' | 'DOSEN_REKAP' | 'ADMIN_COURSES'
  >('LANDING');

  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [appInitialized, setAppInitialized] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Add / Edit Course form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [courseFormMode, setCourseFormMode] = useState<'ADD' | 'EDIT'>('ADD');
  const [courseForm, setCourseForm] = useState({
    kodeMK: '',
    namaMK: '',
    semester: 'Semester Ganjil 2025/2026',
    hari: 'Senin',
    ruang: 'R.304 / Gedung Tarbiyah',
    jamMulai: '08:00',
    jamSelesai: '09:40'
  });

  // Synchronize all data from API/Simulated Database
  const fetchAllData = async (showLoader = false) => {
    if (showLoader) setIsSyncing(true);
    try {
      const loadedCourses = await ApiClient.getCourses();
      const loadedSessions = await ApiClient.getSessions();
      const loadedAttendances = await ApiClient.getAttendances();
      const loadedJournals = await ApiClient.getJournals();
      const loadedUsers = await ApiClient.getUsersDirect();
      const loadedEnrollments = await ApiClient.getEnrollments();

      setCourses(loadedCourses);
      setSessions(loadedSessions);
      setAttendances(loadedAttendances);
      setJournals(loadedJournals);
      setEnrollments(loadedEnrollments);
      setStudents(loadedUsers.filter(u => u.role === 'MAHASISWA'));

      if (user) {
        const refreshedUser = loadedUsers.find(u => u.id === user.id);
        if (refreshedUser) {
          setUser(refreshedUser);
        }
      }
    } catch (err) {
      console.error('Failed syncing system data', err);
    } finally {
      if (showLoader) setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData(true).then(() => setAppInitialized(true));

    const interval = setInterval(() => {
      fetchAllData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle Login submission (Versi Aman - Anti Crash Undefined)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsSyncing(true);

    if (!emailInput || !passwordInput) {
      setAuthError('Email dan password wajib diisi');
      setIsSyncing(false);
      return;
    }

    try {
      const loginEngine: any = ApiClient;
      const res = await loginEngine["login"](emailInput, passwordInput);
      
      if (res && res.success && res.user) {
        setUser(res.user);
        setEmailInput('');
        setPasswordInput('');
        setCurrentView('LANDING'); 
      } else {
        setAuthError(res?.message || t.loginError || 'Kredensial salah atau tidak cocok!');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error autentikasi jaringan.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('LANDING');
    setActiveTab('DASHBOARD');
  };

  // Save new or updated course (Dosen management)
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.kodeMK.trim() || !courseForm.namaMK.trim()) {
      alert('Kode MK dan Nama MK wajib diisi.');
      return;
    }

    try {
      if (courseFormMode === 'ADD') {
        await ApiClient.createCourse({
          kodeMK: courseForm.kodeMK.trim().toUpperCase(),
          namaMK: courseForm.namaMK.trim(),
          hari: courseForm.hari,
          jamMulai: courseForm.jamMulai,
          jamSelesai: courseForm.jamSelesai,
          ruang: courseForm.ruang,
          semester: courseForm.semester,
          dosenId: user?.id || 'dosen-1'
        });
      } else {
        await ApiClient.updateCourse(courseForm.kodeMK, {
          kodeMK: courseForm.kodeMK.trim().toUpperCase(),
          namaMK: courseForm.namaMK.trim(),
          hari: courseForm.hari,
          jamMulai: courseForm.jamMulai,
          jamSelesai: courseForm.jamSelesai,
          ruang: courseForm.ruang,
          semester: courseForm.semester,
          dosenId: user?.id || 'dosen-1'
        });
      }

      setShowCourseForm(false);
      fetchAllData(true);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan mata kuliah');
    }
  };

  const initiateEditCourse = (course: Course) => {
    setCourseFormMode('EDIT');
    setCourseForm({
      kodeMK: course.kodeMK,
      namaMK: course.namaMK,
      semester: course.semester,
      hari: course.hari,
      ruang: course.ruang,
      jamMulai: course.jamMulai,
      jamSelesai: course.jamSelesai
    });
    setShowCourseForm(true);
  };

  const initiateAddCourse = () => {
    setCourseFormMode('ADD');
    setCourseForm({
      kodeMK: '',
      namaMK: '',
      semester: 'Semester Ganjil 2025/2026',
      hari: 'Senin',
      ruang: 'R.304 / Gedung Tarbiyah',
      jamMulai: '08:00',
      jamSelesai: '09:40'
    });
    setShowCourseForm(true);
  };

  const studentCourses = courses.filter(course =>
    enrollments.some(e => e.kodeMK === course.kodeMK && e.idMahasiswa === user?.id)
  );

  return (
    <div
      dir={lang === 'AR' ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans text-slate-800"
    >
      <Navbar
        user={user}
        lang={lang}
        onLanguageToggle={setLang}
        activeTab={activeTab}
        onActiveTabToggle={() => setActiveTab(activeTab === 'SETTINGS' ? 'DASHBOARD' : 'SETTINGS')}
        onLogout={handleLogout}
        t={t}
        isSyncing={isSyncing}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'SETTINGS' ? (
          <SettingsPanel
            onSaved={() => {
              fetchAllData(true);
              setActiveTab('DASHBOARD');
            }}
            lang={lang}
            t={t}
          />
        ) : (
          (() => {
            if (!user) {
              if (currentView === 'LOGIN') {
                return (
                  <LoginPage
                    emailInput={emailInput}
                    setEmailInput={setEmailInput}
                    passwordInput={passwordInput}
                    setPasswordInput={setPasswordInput}
                    authError={authError}
                    isSyncing={isSyncing}
                    onLogin={handleLogin}
                    lang={lang}
                    t={t}
                  />
                );
              }
              return (
                <LandingPage
                  onStartLogin={() => setCurrentView('LOGIN')}
                  lang={lang}
                  t={t}
                />
              );
            }

            if (showCourseForm) {
              return (
                <div className="bg-white rounded-2xl border border-slate-250 p-6 max-w-2xl mx-auto space-y-6 shadow-sm">
                  <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                    <button
                      type="button"
                      onClick={() => setShowCourseForm(false)}
                      className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                    </button>
                    <h3 className="font-extrabold text-slate-800 text-lg">
                      {courseFormMode === 'ADD' ? t.addCourse : t.editCourse}
                    </h3>
                  </div>

                  <form onSubmit={handleSaveCourse} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.courseCode}</label>
                        <input
                          type="text"
                          placeholder="Contoh: PAI-402"
                          disabled={courseFormMode === 'EDIT'}
                          value={courseForm.kodeMK}
                          onChange={(e) => setCourseForm({ ...courseForm, kodeMK: e.target.value.toUpperCase() })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.semesterPeriod}</label>
                        <input
                          type="text"
                          placeholder="Ganjil 2025/2026"
                          value={courseForm.semester}
                          onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="md:col-span-2 space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.courseName}</label>
                        <input
                          type="text"
                          placeholder="Contoh: Ulumul Qur'an & Metodologi Tafsir"
                          value={courseForm.namaMK}
                          onChange={(e) => setCourseForm({ ...courseForm, namaMK: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.day}</label>
                        <select
                          value={courseForm.hari}
                          onChange={(e) => setCourseForm({ ...courseForm, hari: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        >
                          {Object.keys(t.days).map(day => (
                            <option key={day} value={day}>
                              {t.days[day]}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.room}</label>
                        <input
                          type="text"
                          placeholder="Contoh: R.304 / Gedung Tarbiyah"
                          value={courseForm.ruang}
                          onChange={(e) => setCourseForm({ ...courseForm, ruang: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.startTime}</label>
                        <input
                          type="time"
                          value={courseForm.jamMulai}
                          onChange={(e) => setCourseForm({ ...courseForm, jamMulai: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-600">{t.endTime}</label>
                        <input
                          type="time"
                          value={courseForm.jamSelesai}
                          onChange={(e) => setCourseForm({ ...courseForm, jamSelesai: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setShowCourseForm(false)}
                        className="hover:cursor-pointer text-xs font-bold px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="hover:cursor-pointer text-xs font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md shrink-0 flex items-center gap-2 transition"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
                        Simpan MK
                      </button>
                    </div>
                  </form>
                </div>
              );
            }

            if (currentView === 'LANDING') {
              return (
                <LandingPage
                  onStartLogin={() => setCurrentView('DASHBOARD')}
                  user={user}
                  lang={lang}
                  t={t}
                />
              );
            }

            if (user.role === 'MAHASISWA') {
              if (currentView === 'MAHASISWA_JURNAL') {
                return (
                  <MahasiswaJurnal
                    user={user}
                    courses={studentCourses}
                    journals={journals}
                    sessions={sessions}
                    attendances={attendances}
                    initialCourse={selectedCourse}
                    onBack={() => setCurrentView('DASHBOARD')}
                    t={t}
                    initialTab="JURNAL"
                  />
                );
              }

              if (currentView === 'MAHASISWA_RIWAYAT') {
                return (
                  <MahasiswaJurnal
                    user={user}
                    courses={studentCourses}
                    journals={journals}
                    sessions={sessions}
                    attendances={attendances}
                    initialCourse={selectedCourse}
                    onBack={() => setCurrentView('DASHBOARD')}
                    t={t}
                    initialTab="RIWAYAT"
                  />
                );
              }

              return (
                <DashboardMahasiswa
                  user={user}
                  courses={studentCourses}
                  sessions={sessions}
                  attendances={attendances}
                  journals={journals}
                  onRefresh={() => fetchAllData(false)}
                  lang={lang}
                  t={t}
                  onNavigateToJournal={(c) => {
                    setSelectedCourse(c);
                    setCurrentView('MAHASISWA_JURNAL');
                  }}
                  onNavigateToHistory={() => {
                    setCurrentView('MAHASISWA_RIWAYAT');
                  }}
                />
              );
            }

            if (user.role === 'DOSEN') {
              if (currentView === 'DOSEN_PRESENSI' && selectedCourse) {
                return (
                  <DosenPresensi
                    user={user}
                    selectedCourse={selectedCourse}
                    sessions={sessions}
                    attendances={attendances}
                    students={students}
                    enrollments={enrollments}
                    journals={journals}
                    onBack={() => setCurrentView('DASHBOARD')}
                    onRefresh={() => fetchAllData(false)}
                    t={t}
                    initialTab="PRESENSI"
                  />
                );
              }

              if (currentView === 'DOSEN_JURNAL' && selectedCourse) {
                return (
                  <DosenPresensi
                    user={user}
                    selectedCourse={selectedCourse}
                    sessions={sessions}
                    attendances={attendances}
                    students={students}
                    enrollments={enrollments}
                    journals={journals}
                    onBack={() => setCurrentView('DASHBOARD')}
                    onRefresh={() => fetchAllData(false)}
                    t={t}
                    initialTab="JURNAL"
                  />
                );
              }

              if (currentView === 'DOSEN_REKAP' && selectedCourse) {
                return (
                  <DosenRekap
                    selectedCourse={selectedCourse}
                    sessions={sessions}
                    attendances={attendances}
                    students={students}
                    enrollments={enrollments}
                    onBack={() => setCurrentView('DASHBOARD')}
                    t={t}
                  />
                );
              }

              if (currentView === 'ADMIN_COURSES') {
                return <AdminManageCourses onBack={() => setCurrentView('DASHBOARD')} />;
              }

              return (
                <DashboardDosen
                  user={user}
                  courses={courses}
                  sessions={sessions}
                  attendances={attendances}
                  enrollments={enrollments}
                  onRefresh={() => fetchAllData(false)}
                  lang={lang}
                  t={t}
                  onAddCourse={initiateAddCourse}
                  onEditCourse={initiateEditCourse}
                  onManageAttendance={(c) => {
                    setSelectedCourse(c);
                    setCurrentView('DOSEN_PRESENSI');
                  }}
                  onWriteJournal={(c) => {
                    setSelectedCourse(c);
                    setCurrentView('DOSEN_JURNAL');
                  }}
                  onShowRecap={(c) => {
                    setSelectedCourse(c);
                    setCurrentView('DOSEN_REKAP');
                  }}
                />
              );
            }

            return null;
          })()
        )}
      </main>

      <Footer />
    </div>
  );
}
