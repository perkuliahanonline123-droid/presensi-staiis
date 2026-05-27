/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Course, AttendanceSession, Attendance, Journal } from '../types';
import { CourseCard } from '../components/CourseCard';
import { CustomAlert } from '../components/CustomAlert';
import { BookOpen, Calendar, Award, HelpCircle } from 'lucide-react';

interface DashboardMahasiswaProps {
  user: User;
  courses: Course[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  journals: Journal[];
  onRefresh: () => void;
  lang: 'ID' | 'EN' | 'AR';
  t: any;
  onNavigateToJournal: (course: Course) => void;
  onNavigateToHistory: () => void;
}

export function DashboardMahasiswa({
  user,
  courses,
  sessions,
  attendances,
  journals,
  onRefresh,
  lang,
  t,
  onNavigateToJournal,
  onNavigateToHistory
}: DashboardMahasiswaProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [bypassTimeWindow, setBypassTimeWindow] = useState(true);

  // Time-window checking helpers
  const dayNamesIndonesian = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const currentDayName = dayNamesIndonesian[new Date().getDay()];

  const getMinutesOfDay = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const checkInTimeWindow = (course: Course) => {
    if (bypassTimeWindow) return { active: true, reason: 'Demo Override' };

    if (course.hari !== currentDayName) {
      return { active: false, reason: `Hari perkuliahan: ${t.days[course.hari] || course.hari}` };
    }

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    const startMins = getMinutesOfDay(course.jamMulai);

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

  const checkStudentAttendance = (sessionId: string) => {
    return attendances.find(a => a.idSesi === sessionId && a.idMahasiswa === user.id);
  };

  const getOpenSessionForCourse = (courseKode: string) => {
    return sessions.find(s => s.kodeMK === courseKode && s.status === 'DIBUKA');
  };

  const getCourseRecap = (courseKode: string) => {
    const courseSessions = sessions.filter(s => s.kodeMK === courseKode);
    const totalSessions = courseSessions.length;

    const attendancesForCourse = attsForUserAndCourse(courseKode);
    const presentCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Hadir').length;
    const sickCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Sakit').length;
    const excuseCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Izin').length;
    const absentCount = attendancesForCourse.filter(a => a.statusKehadiran === 'Alpa').length;

    const percent = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

    return {
      total: totalSessions,
      present: presentCount,
      sick: sickCount,
      excuse: excuseCount,
      absent: absentCount + (totalSessions - attendancesForCourse.length),
      percentage: percent
    };
  };

  const attsForUserAndCourse = (courseKode: string) => {
    const courseSessionIds = sessions.filter(s => s.kodeMK === courseKode).map(s => s.idSesi);
    return attendances.filter(a => a.idMahasiswa === user.id && courseSessionIds.includes(a.idSesi));
  };

  const handlePerformAttendance = async (course: Course, session: AttendanceSession) => {
    setAlert(null);

    const timeCheck = checkInTimeWindow(course);
    if (!timeCheck.active) {
      setAlert({ msg: timeCheck.reason, type: 'error' });
      return;
    }

    // Direct Lazy Api client load
    const { ApiClient } = await import('../db');

    try {
      await ApiClient.recordAttendance({
        idSesi: session.idSesi,
        idMahasiswa: user.id,
        statusKehadiran: 'Hadir',
        kodeMasukkan: session.kodeUnik ? verificationCode.trim() : undefined,
        ipAddressMetode: '180.244.15.11 / Web Portal'
      });
      setAlert({ msg: t.presensiSukses, type: 'success' });
      setVerificationCode('');
      onRefresh();
    } catch (err: any) {
      setAlert({ msg: err.message || t.error, type: 'error' });
    }
  };

  const isRTL = lang === 'AR';
  const direction = isRTL ? 'rtl' : 'ltr';

  const avgAttendance = courses.length > 0
    ? Math.round(courses.reduce((acc, c) => acc + getCourseRecap(c.kodeMK).percentage, 0) / courses.length)
    : 100;

  return (
    <div dir={direction} className="space-y-6">
      {/* Student Profile Ribbon */}
      <div className="bg-emerald-900 border-b-4 border-emerald-600 p-6 md:p-8 rounded-2xl text-white shadow-md relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <span className="text-emerald-100/90 text-[10px] font-bold tracking-wider uppercase bg-emerald-800 border border-emerald-700/60 px-3 py-1 rounded-full">
            {t.profileCard}
          </span>
          <h2 className="text-xl md:text-3xl font-extrabold tracking-tight mt-1.5">{user.name}</h2>
          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-1 text-xs text-emerald-100/90 font-medium">
            <span className="flex items-center gap-1 font-mono">
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
              {avgAttendance}%
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={onNavigateToHistory}
          className="hover:cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-200 transition"
        >
          🔍 Lihat Riwayat Kehadiran Lengkap
        </button>
      </div>

      {/* Demo overrides helper banner */}
      <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
          <span>
            <strong>Tips Demo:</strong>{' '}
            {bypassTimeWindow
              ? 'Aplikasi mengabaikan window waktu presensi agar tombol selalu aktif untuk kemudahan pengujian.'
              : 'Aplikasi mewajibkan kehadiran hanya pukul -15 min ke +15 min.'}
          </span>
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

      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Main Grid: Left Side Courses */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          {t.myCourses}
        </h3>

        {courses.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400">
            <Calendar className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-60" />
            <p>{t.noCourses}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => {
              const openSesi = getOpenSessionForCourse(course.kodeMK);
              const hasAttended = openSesi ? checkStudentAttendance(openSesi.idSesi) : undefined;
              const stats = getCourseRecap(course.kodeMK);

              return (
                <CourseCard
                  key={course.kodeMK}
                  course={course}
                  openSesi={openSesi}
                  hasAttended={hasAttended}
                  stats={stats}
                  t={t}
                  lang={lang}
                  verificationCode={verificationCode}
                  onVerificationCodeChange={setVerificationCode}
                  onPerformAttendance={handlePerformAttendance}
                  onViewJournal={onNavigateToJournal}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
