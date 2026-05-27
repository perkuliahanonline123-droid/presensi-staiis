/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Course, AttendanceSession, Attendance, Journal, AttendanceStatus, Enrollment } from '../types';
import { ApiClient } from '../db';
import { 
  Users, BookOpen, Calendar, Clock, Plus, Edit3, Trash2, 
  ChevronRight, Save, UserCheck, CheckCircle2, AlertCircle, FileSpreadsheet, 
  Trash, ArrowLeft, RefreshCw, Key, ShieldAlert, Check, CheckSquare, Square
} from 'lucide-react';

interface LecturerDashboardProps {
  user: User;
  courses: Course[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  journals: Journal[];
  enrollments: Enrollment[];
  students: User[]; // all users with role 'MAHASISWA'
  onRefresh: () => void;
  lang: 'ID' | 'EN' | 'AR';
  t: any;
}

export function LecturerDashboard({ 
  user, courses, sessions, attendances, journals, enrollments, students, onRefresh, lang, t 
}: LecturerDashboardProps) {
  
  // Navigation / views
  type ViewState = 'LIST' | 'MANAGE_ATTENDANCE' | 'MANAGE_JOURNAL' | 'RECAP' | 'FORM_COURSE';
  const [activeView, setActiveView] = useState<ViewState>('LIST');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Course Form States
  const [courseForm, setCourseForm] = useState<Omit<Course, 'dosenId'>>({
    kodeMK: '',
    namaMK: '',
    hari: 'Senin',
    jamMulai: '08:00',
    jamSelesai: '10:00',
    ruang: 'R.301',
    semester: 'Ganjil 2025/2026'
  });
  const [formMode, setFormMode] = useState<'ADD' | 'EDIT'>('ADD');

  // Attendance Session States
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [isCodeEnabled, setIsCodeEnabled] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [attendanceEdits, setAttendanceEdits] = useState<Record<string, AttendanceStatus>>({}); // mhsId -> status
  
  // Journal Form States
  const [journalForm, setJournalForm] = useState<Omit<Journal, 'idJurnal' | 'dibuatOleh' | 'kodeMK'>>({
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    isi: '',
    lampiran: ''
  });
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);

  // States for alerts
  const [notification, setNotification] = useState<{ type: 'success' | 'err'; msg: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Filter courses diampu dosen ini
  const lecturerCourses = courses.filter(c => c.dosenId === user.id);

  // Quick stat totals
  const totalStudentsEnrolled = enrollments.filter(e => 
    lecturerCourses.map(c => c.kodeMK).includes(e.kodeMK)
  ).length;

  // Render alerts helper
  const triggerNotification = (type: 'success' | 'err', msg: string) => {
    setNotification({ type, msg });
    setTimeout(() => setNotification(null), 4000);
  };

  // Helper: Ambil daftar mahasiswa terdaftar untuk MK tertentu
  const getSubscribedStudents = (kodeMK: string): User[] => {
    const subscribedIdList = enrollments
      .filter(e => e.kodeMK === kodeMK)
      .map(e => e.idMahasiswa);
    return students.filter(s => subscribedIdList.includes(s.id));
  };

  // course CRUD handlers
  const handleOpenAddCourse = () => {
    setCourseForm({
      kodeMK: '',
      namaMK: '',
      hari: 'Senin',
      jamMulai: '08:00',
      jamSelesai: '10:00',
      ruang: 'R.301',
      semester: 'Ganjil 2025/2026'
    });
    setFormMode('ADD');
    setActiveView('FORM_COURSE');
  };

  const handleOpenEditCourse = (course: Course) => {
    setCourseForm({ ...course });
    setFormMode('EDIT');
    setActiveView('FORM_COURSE');
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.kodeMK || !courseForm.namaMK) {
      triggerNotification('err', 'Kode dan Nama MK wajib diisi.');
      return;
    }

    setBusy(true);
    try {
      const fullCourse: Course = {
        ...courseForm,
        dosenId: user.id
      };

      if (formMode === 'ADD') {
        const checkExisting = courses.some(c => c.kodeMK.toLowerCase() === courseForm.kodeMK.toLowerCase());
        if (checkExisting) {
          triggerNotification('err', `Mata kuliah dengan kode ${courseForm.kodeMK} sudah terdaftar!`);
          setBusy(false);
          return;
        }
        await ApiClient.createCourse(fullCourse);
        triggerNotification('success', 'Mata kuliah baru berhasil didaftarkan.');
      } else {
        await ApiClient.updateCourse(courseForm.kodeMK, fullCourse);
        triggerNotification('success', 'Data mata kuliah berhasil diperbarui.');
      }
      onRefresh();
      setActiveView('LIST');
    } catch (err: any) {
      triggerNotification('err', err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCourse = async (kodeMK: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata kuliah ini? Seluruh data enrollment terkait tidak terhapus tapi jadwal akan hilang.')) {
      try {
        await ApiClient.deleteCourse(kodeMK);
        triggerNotification('success', 'Mata kuliah berhasil dihapus.');
        onRefresh();
      } catch (err: any) {
        triggerNotification('err', err.message);
      }
    }
  };

  // --- ATTENDANCE MANAGEMENT ---
  const handleOpenAttendance = (course: Course) => {
    setSelectedCourse(course);
    setActiveView('MANAGE_ATTENDANCE');
    
    // Find if there's already an active session for this course today
    const today = new Date().toISOString().split('T')[0];
    const existing = sessions.find(s => s.kodeMK === course.kodeMK && s.tanggal === today);
    
    if (existing) {
      setActiveSessionId(existing.idSesi);
      setSessionDate(existing.tanggal);
      setIsCodeEnabled(!!existing.kodeUnik);
      setSessionCode(existing.kodeUnik || '');
      
      // Load existing attendance states
      const loaded: Record<string, AttendanceStatus> = {};
      const courseAtts = attendances.filter(a => a.idSesi === existing.idSesi);
      courseAtts.forEach(a => {
        loaded[a.idMahasiswa] = a.statusKehadiran;
      });
      setAttendanceEdits(loaded);
    } else {
      setActiveSessionId(null);
      setSessionDate(today);
      setIsCodeEnabled(false);
      setSessionCode('');
      
      // Pre-fill everyone as 'Hadir' for easily submitting manual sessions!
      const defaults: Record<string, AttendanceStatus> = {};
      getSubscribedStudents(course.kodeMK).forEach(s => {
        defaults[s.id] = 'Hadir';
      });
      setAttendanceEdits(defaults);
    }
  };

  // Generate 6-digit session validation code
  const handleGenerateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setSessionCode(code);
    setIsCodeEnabled(true);
  };

  const handleOpenNewSession = async () => {
    if (!selectedCourse) return;
    setBusy(true);

    try {
      const idSesi = await ApiClient.openSession({
        kodeMK: selectedCourse.kodeMK,
        tanggal: sessionDate,
        jamMulaiPresensi: selectedCourse.jamMulai,
        jamSelesaiPresensi: selectedCourse.jamSelesai,
        kodeUnik: isCodeEnabled ? sessionCode : undefined,
        status: 'DIBUKA'
      });

      setActiveSessionId(idSesi);
      
      // Seed default presensi list for students
      const attendancesPayload = getSubscribedStudents(selectedCourse.kodeMK).map(s => ({
        idMahasiswa: s.id,
        statusKehadiran: attendanceEdits[s.id] || 'Hadir',
        ipAddressMetode: isCodeEnabled ? 'Portal Kode Unik' : 'Manual Dosen'
      }));

      await ApiClient.updateAttendanceByDosen(idSesi, attendancesPayload);
      triggerNotification('success', t.saveSessionSuccess);
      onRefresh();
    } catch (err: any) {
      triggerNotification('err', err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleSaveAttendanceDraft = async () => {
    if (!selectedCourse || !activeSessionId) return;
    setBusy(true);

    try {
      const payload = Object.entries(attendanceEdits).map(([mhsId, status]) => ({
        idMahasiswa: mhsId,
        statusKehadiran: status as AttendanceStatus,
        ipAddressMetode: 'Sistem Manual Dosen'
      }));

      await ApiClient.updateAttendanceByDosen(activeSessionId, payload);
      triggerNotification('success', t.updateSuccess);
      onRefresh();
    } catch (err: any) {
      triggerNotification('err', err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleBulkSetAll = (status: AttendanceStatus) => {
    if (!selectedCourse) return;
    const bulk: Record<string, AttendanceStatus> = { ...attendanceEdits };
    getSubscribedStudents(selectedCourse.kodeMK).forEach(s => {
      bulk[s.id] = status;
    });
    setAttendanceEdits(bulk);
  };

  // --- LEARNING JOURNAL ---
  const handleOpenJournal = (course: Course) => {
    setSelectedCourse(course);
    setActiveView('MANAGE_JOURNAL');
    setJournalForm({
      tanggal: new Date().toISOString().split('T')[0],
      judul: `Pertemuan Ke-${journals.filter(j => j.kodeMK === course.kodeMK).length + 1}`,
      isi: '',
      lampiran: ''
    });
    setEditingJournalId(null);
  };

  const handleEditJournalInput = (journal: Journal) => {
    setJournalForm({
      tanggal: journal.tanggal,
      judul: journal.judul,
      isi: journal.isi,
      lampiran: journal.lampiran || ''
    });
    setEditingJournalId(journal.idJurnal);
  };

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!journalForm.judul || !journalForm.isi) {
      triggerNotification('err', 'Judul dan Rangkuman Isi wajib diisi.');
      return;
    }

    setBusy(true);
    try {
      const payload: Journal = {
        idJurnal: editingJournalId || `journal-${Math.random().toString(36).substring(2, 9)}`,
        kodeMK: selectedCourse.kodeMK,
        tanggal: journalForm.tanggal,
        judul: journalForm.judul,
        isi: journalForm.isi,
        lampiran: journalForm.lampiran,
        dibuatOleh: user.id
      };

      await ApiClient.saveJournal(payload);
      triggerNotification('success', 'Jurnal harian pembelajaran berhasil disimpan.');
      
      // Reset form
      setJournalForm({
        tanggal: new Date().toISOString().split('T')[0],
        judul: `Pertemuan Ke-${journals.filter(j => j.kodeMK === selectedCourse.kodeMK).length + 1}`,
        isi: '',
        lampiran: ''
      });
      setEditingJournalId(null);
      onRefresh();
    } catch (err: any) {
      triggerNotification('err', err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteJournal = async (idJurnal: string) => {
    if (window.confirm(t.deleteJournalConfirm)) {
      try {
        await ApiClient.deleteJournal(idJurnal);
        triggerNotification('success', 'Entri jurnal pembelajaran dihapus.');
        onRefresh();
      } catch (err: any) {
        triggerNotification('err', err.message);
      }
    }
  };

  // --- RECAPITULATION & EXPORTS ---
  const handleOpenRecap = (course: Course) => {
    setSelectedCourse(course);
    setActiveView('RECAP');
  };

  // Calculate stats for students
  const getCourseRecapList = (kodeMK: string) => {
    const courseSessions = sessions.filter(s => s.kodeMK === kodeMK);
    const totalMeetings = courseSessions.length;
    const courseSessionIds = courseSessions.map(s => s.idSesi);

    const subs = getSubscribedStudents(kodeMK);

    return subs.map(student => {
      const studentAtts = attendances.filter(a => 
        a.idMahasiswa === student.id && courseSessionIds.includes(a.idSesi)
      );

      const present = studentAtts.filter(a => a.statusKehadiran === 'Hadir').length;
      const sick = studentAtts.filter(a => a.statusKehadiran === 'Sakit').length;
      const excuse = studentAtts.filter(a => a.statusKehadiran === 'Izin').length;
      const absent = studentAtts.filter(a => a.statusKehadiran === 'Alpa').length + (totalMeetings - studentAtts.length);

      const rate = totalMeetings > 0 ? Math.round((present / totalMeetings) * 100) : 100;

      return {
        id: student.id,
        name: student.name,
        nim: student.nipNim,
        prodi: student.programStudi,
        present,
        sick,
        excuse,
        absent,
        rate
      };
    });
  };

  const handleExportCSV = () => {
    if (!selectedCourse) return;
    const records = getCourseRecapList(selectedCourse.kodeMK);
    const courseSessionCount = sessions.filter(s => s.kodeMK === selectedCourse.kodeMK).length;
    
    // Constructing standard readable CSV
    let csvContent = 'No,NIM,Nama Mahasiswa,Program Studi,Pertemuan Diadakan,Hadir,Izin,Sakit,Alpa,Persentase Kehadiran\n';
    
    records.forEach((row, idx) => {
      csvContent += `${idx + 1},'${row.nim},"${row.name}","${row.prodi}",${courseSessionCount},${row.present},${row.excuse},${row.sick},${row.absent},${row.rate}%\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rekap_Presensi_${selectedCourse.kodeMK}_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotification('success', 'Ekspor rekapitulasi kelas sukses diunduh.');
  };

  const isRTL = lang === 'AR';
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <div dir={direction} className="space-y-6">
      {/* Lecturer Metadata Info Panel */}
      {/* Lecturer Metadata Info Panel */}
      <div className="bg-emerald-900 border-b-4 border-emerald-600 p-6 md:p-8 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <span className="text-emerald-100/90 text-[10px] font-bold tracking-wider uppercase bg-emerald-850 border border-emerald-700/60 px-3 py-1 rounded-full">{t.lecturerDashboard}</span>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1.5">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-emerald-100/90 font-medium font-mono">
            <span>{t.nip}: {user.nipNim}</span>
            <span className="opacity-40">•</span>
            <span>{user.programStudi}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 z-10">
          <div className="bg-emerald-850 border border-emerald-700/50 px-4.5 py-3 rounded-2xl flex flex-col items-center">
            <Users className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] opacity-75 mt-0.5">Total Mahasiswa</span>
            <span className="font-extrabold text-lg text-amber-300">{totalStudentsEnrolled} Orang</span>
          </div>
        </div>
      </div>

      {/* Floating Application Alerts */}
      {notification && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border animate-bounce ${
          notification.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" /> : <AlertCircle className="w-4.5 h-4.5 text-rose-600" />}
          <p>{notification.msg}</p>
        </div>
      )}

      {/* --- WORKSPACE ROUTING MAIN CONTAINER --- */}
      {activeView === 'LIST' && (
        <div className="space-y-4 font-sans">
          <div className="flex justify-between items-center break-words">
            <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              {t.managedCourses}
            </h3>
            <button
              onClick={handleOpenAddCourse}
              className="hover:cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition duration-150 shadow-md select-none"
            >
              <Plus className="w-4 h-4" />
              {t.addCourse}
            </button>
          </div>

          {lecturerCourses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 shadow-xs">
              <Calendar className="w-14 h-14 stroke-1 mx-auto mb-3 opacity-50 text-emerald-600" />
              <p className="text-sm font-medium">{t.noCoursesDosen}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {lecturerCourses.map(course => {
                const totalCourseSesi = sessions.filter(s => s.kodeMK === course.kodeMK).length;
                const mhsCount = enrollments.filter(e => e.kodeMK === course.kodeMK).length;

                return (
                  <div key={course.kodeMK} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden">
                    <div className="p-5 border-b border-slate-100 relative">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">{course.kodeMK}</span>
                        <span className="text-[10px] text-slate-400 font-semibold">{course.semester}</span>
                      </div>
                      
                      <h4 className="font-extrabold text-base text-slate-800 tracking-tight mt-3 line-clamp-2 min-h-[3rem] leading-snug">{course.namaMK}</h4>
                    </div>

                    <div className="px-5 py-4 bg-slate-50/50 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.days[course.hari] || course.hari}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.jamMulai} - {course.jamSelesai} WIB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{mhsCount} Mahasiswa terdaftar</span>
                      </div>
                    </div>

                    {/* Actions and editing widgets */}
                    <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        <button
                          onClick={() => handleOpenAttendance(course)}
                          className="hover:cursor-pointer py-1.5 px-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] text-center transition select-none shadow-xs"
                        >
                          {t.btnManageAttendance}
                        </button>
                        <button
                          onClick={() => handleOpenJournal(course)}
                          className="hover:cursor-pointer py-1.5 px-1 bg-amber-400 hover:bg-amber-500 text-emerald-950 font-black rounded-lg text-[11px] text-center transition select-none shadow-xs"
                        >
                          {t.btnWriteJournal}
                        </button>
                        <button
                          onClick={() => handleOpenRecap(course)}
                          className="hover:cursor-pointer py-1.5 px-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-lg text-[11px] text-center transition select-none shadow-xs"
                        >
                          {t.btnRecap}
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        <span>{totalCourseSesi} Sesi Kelas</span>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditCourse(course)}
                            className="text-indigo-600 hover:text-indigo-800 p-1 bg-white rounded-md border border-slate-100 hover:shadow-xs hover:cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleDeleteCourse(course.kodeMK)}
                            className="text-rose-500 hover:text-rose-700 p-1 bg-white rounded-md border border-slate-100 hover:cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- FORM CREATE / EDIT COURSE --- */}
      {activeView === 'FORM_COURSE' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
            <button 
              onClick={() => setActiveView('LIST')}
              className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h3 className="font-extrabold text-slate-800 text-lg">
              {formMode === 'ADD' ? t.addCourse : t.editCourse}
            </h3>
          </div>

          <form onSubmit={handleSaveCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.courseCode}</label>
                <input
                  type="text"
                  placeholder="Contoh: PAI-402"
                  disabled={formMode === 'EDIT'}
                  value={courseForm.kodeMK}
                  onChange={(e) => setCourseForm({ ...courseForm, kodeMK: e.target.value.toUpperCase() })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.semesterPeriod}</label>
                <input
                  type="text"
                  placeholder="Ganjil 2025/2026"
                  value={courseForm.semester}
                  onChange={(e) => setCourseForm({ ...courseForm, semester: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.courseName}</label>
                <input
                  type="text"
                  placeholder="Contoh: Ulumul Qur'an & Metodologi Tafsir"
                  value={courseForm.namaMK}
                  onChange={(e) => setCourseForm({ ...courseForm, namaMK: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.day}</label>
                <select
                  value={courseForm.hari}
                  onChange={(e) => setCourseForm({ ...courseForm, hari: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                >
                  {Object.keys(t.days).map(day => (
                    <option key={day} value={day}>{t.days[day]}</option>
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
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.startTime}</label>
                <input
                  type="time"
                  value={courseForm.jamMulai}
                  onChange={(e) => setCourseForm({ ...courseForm, jamMulai: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600">{t.endTime}</label>
                <input
                  type="time"
                  value={courseForm.jamSelesai}
                  onChange={(e) => setCourseForm({ ...courseForm, jamSelesai: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveView('LIST')}
                className="hover:cursor-pointer text-xs font-bold px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={busy}
                className="hover:cursor-pointer text-xs font-bold px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-md shrink-0 transition"
              >
                {busy ? t.loading : t.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* --- ATTENDANCE MANAGEMENT (OPEN MEETING & ASSIGN ATTENDANCES) --- */}
      {activeView === 'MANAGE_ATTENDANCE' && selectedCourse && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('LIST')}
                className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{t.sessionList}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{selectedCourse.namaMK}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Create Meeting inputs */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-4 shadow-sm">
              <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-700" />
                {t.openNewSession}
              </h4>

              <div className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{t.selectDate}</label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="inline-flex items-center gap-2.5 font-bold text-slate-700 select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCodeEnabled}
                      onChange={(e) => setIsCodeEnabled(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5 cursor-pointer"
                    />
                    {t.useUniqueCode}
                  </label>

                  {isCodeEnabled && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="______"
                        maxLength={6}
                        value={sessionCode}
                        onChange={(e) => setSessionCode(e.target.value)}
                        className="w-full text-center tracking-widest text-sm font-bold bg-slate-50 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden"
                      />
                      <button
                        onClick={handleGenerateCode}
                        className="px-3.5 py-2.5 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-1 shrink-0 transition"
                      >
                        <Key className="w-4 h-4" />
                        {t.generateCode}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={busy}
                  onClick={handleOpenNewSession}
                  className="hover:cursor-pointer w-full mt-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition duration-200 flex items-center justify-center gap-2"
                >
                  <CheckSquare className="w-4 h-4" />
                  Buat & Terapkan Sesi
                </button>
              </div>
            </div>

            {/* Students roster details */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-50">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-emerald-600" />
                  Presensi Mahasiswa Terdaftar
                </h4>
                
                {activeSessionId && (
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold">
                    Sesi Aktf: {sessionDate} {sessions.find(s => s.idSesi === activeSessionId)?.kodeUnik ? `[Kode: ${sessions.find(s => s.idSesi === activeSessionId)?.kodeUnik}]` : ''}
                  </span>
                )}
              </div>

              {/* Attendance quick control toggles */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-400 font-bold">{t.bulkSelect}:</span>
                <button 
                  onClick={() => handleBulkSetAll('Hadir')} 
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold hover:bg-emerald-100 transition"
                >
                  {t.hadir}
                </button>
                <button 
                  onClick={() => handleBulkSetAll('Izin')} 
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-md font-bold hover:bg-amber-100 transition"
                >
                  {t.izin}
                </button>
                <button 
                  onClick={() => handleBulkSetAll('Sakit')} 
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded-md font-bold hover:bg-amber-100 transition"
                >
                  {t.sakit}
                </button>
                <button 
                  onClick={() => handleBulkSetAll('Alpa')} 
                  className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-md font-bold hover:bg-rose-100 transition"
                >
                  {t.alpa}
                </button>
              </div>

              {/* Roster student grid table */}
              <div className="divide-y divide-slate-100 max-h-[20rem] overflow-y-auto pr-1">
                {getSubscribedStudents(selectedCourse.kodeMK).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">Belum ada mahasiswa terdaftar untuk mata kuliah {selectedCourse.kodeMK}. Silakan periksa tabel enrollment.</p>
                ) : (
                  getSubscribedStudents(selectedCourse.kodeMK).map(student => {
                    const activeStatus = attendanceEdits[student.id] || 'Alpa';

                    return (
                      <div key={student.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-extrabold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400">{student.nipNim} • {student.programStudi}</p>
                        </div>

                        {/* Dropdown status actions */}
                        <div className="flex items-center gap-2">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map(st => (
                            <button
                              key={st}
                              onClick={() => setAttendanceEdits({ ...attendanceEdits, [student.id]: st })}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition duration-150 ${
                                activeStatus === st 
                                  ? st === 'Hadir' ? 'bg-emerald-600 text-white shadow-xs' :
                                    st === 'Izin' ? 'bg-amber-500 text-white shadow-xs' :
                                    st === 'Sakit' ? 'bg-amber-500 text-white shadow-xs' :
                                    'bg-rose-500 text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                              }`}
                            >
                              {st === 'Hadir' ? t.hadir : st === 'Izin' ? t.izin : st === 'Sakit' ? t.sakit : t.alpa}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-4 border-t border-slate-50 flex justify-end">
                <button
                  onClick={handleSaveAttendanceDraft}
                  disabled={busy || !activeSessionId}
                  className="hover:cursor-pointer flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition disabled:opacity-50 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {t.saveAttendance}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- WRITE AND PREVIEW LECTURE JOURNALS --- */}
      {activeView === 'MANAGE_JOURNAL' && selectedCourse && (
        <div className="space-y-6">
          <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('LIST')}
                className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{t.learningJournal}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{selectedCourse.namaMK}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Form Tulis Jurnal */}
            <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-4 shadow-sm">
              <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-50 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-600" />
                {t.writeJournal}
              </h4>

              <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{t.journalDate}</label>
                  <input
                    type="date"
                    value={journalForm.tanggal}
                    onChange={(e) => setJournalForm({ ...journalForm, tanggal: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{t.journalTitle}</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pertemuan 1: Pengenalan Silabus"
                    value={journalForm.judul}
                    onChange={(e) => setJournalForm({ ...journalForm, judul: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{t.journalContent}</label>
                  <textarea
                    rows={4}
                    placeholder={t.journalPlaceholder}
                    value={journalForm.isi}
                    onChange={(e) => setJournalForm({ ...journalForm, isi: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">{t.attachmentUrl}</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={journalForm.lampiran}
                    onChange={(e) => setJournalForm({ ...journalForm, lampiran: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={busy}
                  className="hover:cursor-pointer w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  {editingJournalId ? 'Perbarui Jurnal' : t.saveJournal}
                </button>
              </form>
            </div>

            {/* Right Column: List of existing journals written */}
            <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 space-y-4 shadow-sm">
              <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-50">
                Log Entri Jurnal Terbit
              </h4>

              <div className="space-y-4 max-h-[30rem] overflow-y-auto pr-1">
                {journals.filter(j => j.kodeMK === selectedCourse.kodeMK).length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-12">{t.noJournal}</p>
                ) : (
                  journals
                    .filter(j => j.kodeMK === selectedCourse.kodeMK)
                    .reverse()
                    .map((j) => (
                      <div key={j.idJurnal} className="p-4 bg-slate-50/70 rounded-2xl border border-slate-100 flex justify-between gap-4 text-xs">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">{j.tanggal}</span>
                            <span className="text-[10px] text-slate-400 font-bold">Oleh ID: {j.dibuatOleh}</span>
                          </div>
                          <h5 className="font-extrabold text-slate-800 text-xs">{j.judul}</h5>
                          <p className="text-slate-500 whitespace-pre-wrap leading-relaxed text-[11px] font-medium">{j.isi}</p>
                          {j.lampiran && (
                            <a 
                              href={j.lampiran} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 mt-2 transition"
                            >
                              Drive Lampiran File
                            </a>
                          )}
                        </div>

                        <div className="flex flex-col gap-1.5 shrink-0 justify-start">
                          <button
                            onClick={() => handleEditJournalInput(j)}
                            className="bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 p-1.5 rounded-lg transition hover:cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteJournal(j.idJurnal)}
                            className="bg-white border border-slate-200 hover:bg-rose-50 text-rose-500 p-1.5 rounded-lg transition hover:cursor-pointer"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- CLASS RECAPITULATION & CSV EXPORTS --- */}
      {activeView === 'RECAP' && selectedCourse && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4.5 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveView('LIST')}
                className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h3 className="font-extrabold text-slate-800 text-base">{t.recapTitle}</h3>
                <p className="text-xs text-emerald-700 font-semibold">{selectedCourse.namaMK}</p>
              </div>
            </div>

            <button
              onClick={handleExportCSV}
              className="hover:cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded-xl shadow-xs transition select-none"
            >
              <FileSpreadsheet className="w-4 h-4" />
              {t.exportCsv}
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-500">
                <thead className="text-[10px] font-extrabold uppercase bg-slate-50 border-b border-slate-100 text-slate-700">
                  <tr>
                    <th scope="col" className="px-6 py-4">No</th>
                    <th scope="col" className="px-6 py-4">NIM</th>
                    <th scope="col" className="px-6 py-4">Nama Mahasiswa</th>
                    <th scope="col" className="px-6 py-4">Hadir</th>
                    <th scope="col" className="px-6 py-4">Izin</th>
                    <th scope="col" className="px-6 py-4">Sakit</th>
                    <th scope="col" className="px-6 py-4">Alpa</th>
                    <th scope="col" className="px-6 py-4 text-center">Persentase</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {getCourseRecapList(selectedCourse.kodeMK).length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">
                        {t.emptyRecap}
                      </td>
                    </tr>
                  ) : (
                    getCourseRecapList(selectedCourse.kodeMK).map((row, index) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-3.5 font-bold text-slate-800">{index + 1}</td>
                        <td className="px-6 py-3.5 font-mono">{row.nim}</td>
                        <td className="px-6 py-3.5 font-bold text-slate-800">{row.name}</td>
                        <td className="px-6 py-3.5 text-emerald-700 font-bold">{row.present}</td>
                        <td className="px-6 py-3.5 text-amber-600 font-bold">{row.excuse}</td>
                        <td className="px-6 py-3.5 text-amber-600 font-bold">{row.sick}</td>
                        <td className="px-6 py-3.5 text-rose-500 font-bold">{row.absent}</td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3 justify-center">
                            <span className={`font-extrabold text-right w-10 ${row.rate >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>{row.rate}%</span>
                            <div className="w-20 bg-slate-100 h-2.5 rounded-full overflow-hidden shrink-0 mt-0.5">
                              <div 
                                className={`h-full ${row.rate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                                style={{ width: `${row.rate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
