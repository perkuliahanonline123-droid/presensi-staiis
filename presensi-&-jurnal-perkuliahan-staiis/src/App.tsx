/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course, AttendanceSession, Attendance, Journal } from './types';
import { translations, Lang } from './translations';
import { SettingsPanel } from './components/SettingsPanel';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
 
// FIX JALUR ALAMAT: Mengarah langsung ke folder komponen asli proyek Anda
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { DashboardMahasiswa } from './components/StudentDashboard';
import { MahasiswaJurnal } from './components/MahasiswaJurnal';
import { MahasiswaRiwayat } from './components/MahasiswaRiwayat';
import { LecturerDashboard } from './components/LecturerDashboard';
import { DosenPresensi } from './components/DosenPresensi';
import { DosenJurnal } from './components/DosenJurnal';
import { DosenRekap } from './components/DosenRekap';
import { AdminManageCourses } from './components/AdminManageCourses';

// FIX MINIFY VERCEL: Membungkus engine API Client agar tidak hancur diringkas menjadi Ve.register
import * as DatabaseEngine from './db';
const ApiClient = DatabaseEngine.ApiClient;

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
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchAllData(true).then(() => setAppInitialized(true));

    const interval = setInterval(() => {
      fetchAllData(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [user]);

  // Handle Login submission (Versi Kebal Braket String Objek)
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
      if (res.success && res.user) {
        setUser(res.user);
        setEmailInput('');
        setPasswordInput('');
        setCurrentView('LANDING'); 
      } else {
        setAuthError(res.message || t.loginError);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error autentikasi.');
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

  // Map Courses to student logged in enrollments
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
          /* Main view router switcher asli pembawa kode lengkap */
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
                  <div className="flex items-center gap-3 border-b
