/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { User, Course, AttendanceSession, Attendance, Journal, AttendanceStatus } from '../types';
import { ApiClient } from '../db';
import { BookOpen, Calendar, Clock, CheckCircle2, AlertCircle, Award, UserCheck, BookOpenCheck, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  courses: Course[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  journals: Journal[];
  onRefresh: () => void;
  lang: 'ID' | 'EN' | 'AR';
  t: any;
}

export function StudentDashboard({ user, courses, sessions, attendances, journals, onRefresh, lang, t }: StudentDashboardProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [bypassTimeWindow, setBypassTimeWindow] = useState(true); // Default to true so it is easily reviewable at all times!

  // Helpers to check day mapping
  const dayNamesIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNamesIndonesian[new Date().getDay()];
  
  // Format current minutes for check
  const getMinutesOfDay = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const checkInTimeWindow = (course: Course) => {
    if (bypassTimeWindow) return { active: true, reason: 'Demo Override' };

    // Check day match
    if (course.hari !== currentDayName) {
      return { active: false, reason: `Hari perkuliahan: ${t.days[course.hari] || course.hari}` };
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = getMinutesOfDay(course.jamMulai);
    
    // 15 mins before to 15 mins after schedule
    const windowStart = startMins - 15;
    const windowEnd = startMins + 15;

    if (currentMins >= windowStart && currentMins <= windowEnd) {
      return { active: true, reason: 'Dalam jam presensi' };
    } else {
      return { 
        active: false, 
        reason: `Presensi dibuka pukul ${course.jamMulai} (15 menit sebelum-setelah mulainya jadwal)`
      };
    }
  };

  // Check if student has already checked in this session
  const checkStudentAttendance = (sessionId: string) => {
    return attendances.find(a => a.idSesi === sessionId && a.idMahasiswa === user.id);
  };

  // Find if there is an open session for a course
  const getOpenSessionForCourse = (courseKode: string) => {
    return sessions.find(s => s.kodeMK === courseKode && s.status === 'DIBUKA');
  };

  const handlePerformAttendance = async (course: Course, session: AttendanceSession) => {
    setErrorMsg('');
    setSuccessMsg('');

    const timeCheck = checkInTimeWindow(course);
    if (!timeCheck.active) {
      setErrorMsg(timeCheck.reason);
      return;
    }

    // If session requires a unique code
    if (session.kodeUnik && !verificationCode.trim()) {
      setActiveSession(session);
      setSelectedCourse(course);
      return;
    }

    try {
      await ApiClient.recordAttendance({
        idSesi: session.idSesi,
        idMahasiswa: user.id,
        statusKehadiran: 'Hadir',
        kodeMasukkan: session.kodeUnik ? verificationCode.trim() : undefined,
        ipAddressMetode: '180.244.15.11 / Web Portal'
      });
      setSuccessMsg(t.presensiSukses);
      setVerificationCode('');
      setActiveSession(null);
      setSelectedCourse(null);
      onRefresh();
    } catch (err: any) {
      setErrorMsg(err.message || t.error);
    }
  };

  // Get recap calculations
  const getCourseRecap = (courseKode: string) => {
    const courseSessions = sessions.filter(s => s.kodeMK === courseKode);
    const totalSessions = courseSessions.length;
    
    const attendancesForCourse = attsForUserAndCourse(courseKode);
    const presentCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Hadir').length;
    const sickCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Sakit').length;
    const excuseCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Izin').length;
    const absentCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Alpa').length;

    // Weight attendance: Hadir = 100%, Sakit/Izin = 100% (or count as attended for percentage according to university rules), Alpa = 0%
    // Let's count Hadir, Sakit, Izin as attending, or only Hadir. Let's make: percentage = (Hadir / totalMeetings) * 100
    const percent = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    return {
      total: totalSessions,
      present: presentCount,
      sick: sickCount,
      excuse: excuseCount,
      absent: absentCount + (totalSessions - attendancesForCourse.length), // unrecorded assumes absent
      percentage: percent
    };
  };

  const attsForUserAndCourse = (courseKode: string) => {
    const courseSessionIds = sessions.filter(s => s.kodeMK === courseKode).map(s => s.idSesi);
    return attendances.filter(a => a.idMahasiswa === user.id && courseSessionIds.includes(a.idSesi));
  };

  const isRTL = lang === 'AR';
  const direction = isRTL ? 'rtl' : 'ltr';

  return (
    <div dir={direction} className="space-y-6">
      {/* Student Profile Ribbon */}
      <div className="bg-emerald-900 border-b-4 border-emerald-600 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <span className="text-emerald-100/90 text-[10px] font-bold tracking-wider uppercase bg-emerald-800 border border-emerald-700/60 px-3 py-1 rounded-full">{t.profileCard}</span>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1.5">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-emerald-100/90 font-medium">
            <span className="flex items-center gap-1">
              <span className="opacity-75">{t.nim}:</span><strong>{user.nipNim}</strong>
            </span>
            <span className="opacity-40">•</span>
            <span>{user.programStudi}</span>
            <span className="opacity-40">•</span>
            <span>{t.semester} {user.semester}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 z-10 mt-2 md:mt-0">
          <div className="bg-emerald-800/85 border border-emerald-700/50 px-4.5 py-3 rounded-2xl flex flex-col items-center">
            <Award className="w-5 h-5 text-amber-400" />
            <span className="text-[10px] opacity-75 mt-0.5">{t.attendancePercent}</span>
            <span className="font-extrabold text-lg text-amber-300">
              {courses.length > 0 
                ? `${Math.round(courses.reduce((acc, c) => acc + getCourseRecap(c.kodeMK).percentage, 0) / courses.length)}%` 
                : '100%'}
            </span>
          </div>
        </div>
      </div>

      {/* Demo overrides helper banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span><strong>Tips Demo:</strong> {bypassTimeWindow ? 'Aplikasi mengabaikan window waktu presensi agar tombol selalu aktif untuk kemudahan pengujian.' : 'Aplikasi mewajibkan kehadiran hanya puku -15 min ke +15 min.'}</span>
        </div>
        <label className="inline-flex items-center gap-2 cursor-pointer font-semibold text-slate-700 select-none">
          <input 
            type="checkbox" 
            checked={bypassTimeWindow} 
            onChange={(e) => setBypassTimeWindow(e.target.checked)}
            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
          />
          Bypass Window Absen?
        </label>
      </div>

      {/* Main Grid: Left Side Courses, Right Side Details & Journals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Courses registered */}
        <div className="lg:col-span-12 xl:col-span-7 space-y-4">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            {t.myCourses}
          </h3>

          {courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
              <Calendar className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-60" />
              <p>{t.noCourses}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course) => {
                const openSesi = getOpenSessionForCourse(course.kodeMK);
                const hasAttended = openSesi ? checkStudentAttendance(openSesi.idSesi) : null;
                const stats = getCourseRecap(course.kodeMK);

                return (
                  <div key={course.kodeMK} className="bg-white rounded-2xl border border-slate-100 overflow-hidden flex flex-col justify-between shadow-xs shadow-slate-100 hover:shadow-md transition duration-200">
                    {/* Course header */}
                    <div className="p-4.5 border-b border-slate-50">
                      <div className="flex justify-between items-start gap-2">
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">{course.kodeMK}</span>
                        <div className="text-right">
                          <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">{stats.percentage}% HR</span>
                        </div>
                      </div>
                      <h4 className="font-bold text-sm text-slate-800 tracking-tight mt-2">{course.namaMK}</h4>
                    </div>

                    {/* Course schedule specs */}
                    <div className="p-4.5 bg-slate-50/50 space-y-2 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{t.days[course.hari] || course.hari}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.jamMulai} - {course.jamSelesai} WIB</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BookOpenCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.ruang}</span>
                      </div>
                    </div>

                    {/* Attendance status control bottom block */}
                    <div className="p-4 border-t border-slate-50">
                      {openSesi ? (
                        hasAttended ? (
                          <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs font-bold shadow-2xs">
                            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                            <span>{t.btnSudahPresensi} ({hasAttended.statusKehadiran})</span>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => handlePerformAttendance(course, openSesi)}
                              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs transition duration-200 shadow-sm flex items-center justify-center gap-2 select-none active:scale-98 hover:cursor-pointer"
                            >
                              <UserCheck className="w-4 h-4" />
                              {t.btnPresensi}
                            </button>
                            
                            {activeSession?.idSesi === openSesi.idSesi && (
                              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 mt-2 space-y-2">
                                <label className="block text-[10px] font-bold text-slate-700">{t.enterCode}</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="Format: 123456"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value)}
                                    className="w-full text-xs input px-2.5 py-1.5 rounded-lg border border-slate-300 text-center font-bold tracking-widest bg-white"
                                  />
                                  <button
                                    onClick={() => handlePerformAttendance(course, openSesi)}
                                    className="bg-slate-800 hover:bg-slate-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold"
                                  >
                                    OK
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <p className="text-[11px] text-slate-400 text-center select-none py-1 flex items-center justify-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          Tidak ada sesi presensi aktif
                        </p>
                      )}

                      {/* View Journals Quick Link */}
                      <button
                        onClick={() => setSelectedCourse(course)}
                        className="w-full mt-2.5 text-center text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 py-1.5 rounded-lg font-bold transition hover:cursor-pointer"
                      >
                        {t.learningJournal}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Prompt Messages bar */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4.5 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="font-bold">{errorMsg}</p>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4.5 rounded-2xl text-xs flex items-center gap-3 animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="font-bold">{successMsg}</p>
            </div>
          )}
        </div>

        {/* Right 5 Columns: Course Details, Journals display & Attendance Statistics list */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              {selectedCourse ? selectedCourse.namaMK : t.learningJournal}
            </h3>

            {selectedCourse ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-semibold">{t.courseCode}</span>
                    <span className="text-xs font-bold text-slate-700">{selectedCourse.kodeMK}</span>
                  </div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-[11px] text-slate-500 hover:text-slate-700 font-bold bg-white border border-slate-200 px-2 py-1 rounded-md"
                  >
                    Tutup
                  </button>
                </div>

                {/* Journal posts timeline */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {journals.filter(j => j.kodeMK === selectedCourse.kodeMK).length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-6">{t.noJournal}</p>
                  ) : (
                    journals
                      .filter(j => j.kodeMK === selectedCourse.kodeMK)
                      .reverse()
                      .map((journal) => (
                        <div key={journal.idJurnal} className="p-4 bg-[#fbfcfd] border border-slate-100 rounded-xl space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <h5 className="font-bold text-xs text-slate-800 leading-normal">{journal.judul}</h5>
                            <span className="text-[9px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm shrink-0">{journal.tanggal}</span>
                          </div>
                          
                          <p className="text-xs text-slate-500 whitespace-pre-wrap leading-relaxed">{journal.isi}</p>
                          
                          {journal.lampiran && (
                            <a 
                              href={journal.lampiran} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100 hover:bg-emerald-100"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                              Materi Pembelajaran (Drive)
                            </a>
                          )}
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <BookOpenCheck className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-50 text-emerald-600" />
                <p className="text-xs max-w-xs mx-auto text-slate-400 leading-relaxed">
                  Pilihlah tombol <span className="text-emerald-700 font-bold">Jurnal Pembelajaran</span> di samping kartu mata kuliah untuk meninjau materi dan rangkuman harian kelas yang diunggah oleh Dosen.
                </p>
              </div>
            )}
          </div>

          {/* Overall attendance history detail blocks */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-base border-b border-slate-100 pb-3">
              {t.attendanceHistory}
            </h3>

            <div className="space-y-3">
              {courses.map(course => {
                const stats = getCourseRecap(course.kodeMK);
                return (
                  <div key={course.kodeMK} className="text-xs space-y-1 bg-slate-50/40 p-3 rounded-xl border border-slate-50">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-slate-700 truncate max-w-xs">{course.namaMK}</span>
                      <span className={`${stats.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>{stats.percentage}%</span>
                    </div>
                    {/* Progress Bar meter */}
                    <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-500 ${stats.percentage >= 75 ? 'bg-gradient-to-r from-emerald-500 to-teal-600' : 'bg-gradient-to-r from-rose-500 to-amber-500'}`} 
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Total: {stats.total} Pertemuan</span>
                      <span>Hadir: {stats.present} | Izin: {stats.excuse} | Sakit: {stats.sick} | Alpa: {stats.absent}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
