/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course, Attendance, AttendanceSession } from '../types';
import { ArrowLeft, Award, HelpCircle, Activity } from 'lucide-react';

interface MahasiswaRiwayatProps {
  user: { id: string; name: string; nipNim: string };
  courses: Course[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  onBack: () => void;
  t: any;
}

export function MahasiswaRiwayat({
  user,
  courses,
  sessions,
  attendances,
  onBack,
  t
}: MahasiswaRiwayatProps) {
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
      percentage: percent,
      details: courseSessions.map(cs => {
        const attendanceRecord = attendancesForCourse.find(a => a.idSesi === cs.idSesi);
        return {
          sessionDate: cs.tanggal,
          status: attendanceRecord ? attendanceRecord.statusKehadiran : 'Alpa',
          method: attendanceRecord ? attendanceRecord.ipAddressMetode : '-',
          time: attendanceRecord ? attendanceRecord.waktuPresensi : '-'
        };
      })
    };
  };

  const attsForUserAndCourse = (courseKode: string) => {
    const courseSessionIds = sessions.filter(s => s.kodeMK === courseKode).map(s => s.idSesi);
    return attendances.filter(a => a.idMahasiswa === user.id && courseSessionIds.includes(a.idSesi));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h3 className="font-extrabold text-slate-800 text-lg">Riwayat Kehadiran Semester Ini</h3>
          <p className="text-xs text-slate-500">Transparansi tracking kehadiran perkuliahan mandiri mahasiswa.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Summary Bars */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4 h-fit">
          <h4 className="font-extrabold text-slate-805 text-sm pb-2 border-b border-slate-150 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-emerald-600" />
            Persentase Kehadiran Kelas
          </h4>

          <div className="space-y-4">
            {courses.map(course => {
              const stats = getCourseRecap(course.kodeMK);
              return (
                <div key={course.kodeMK} className="text-xs space-y-1.5 bg-slate-50/40 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800 truncate max-w-[200px]">{course.namaMK}</span>
                    <span className={`${stats.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {stats.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        stats.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${stats.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                    <span>{stats.total} Sesi</span>
                    <span>
                      H: {stats.present} | I: {stats.excuse} | S: {stats.sick} | A: {stats.absent}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right column: Details roster and dates */}
        <div className="lg:col-span-7 space-y-4">
          {courses.map(course => {
            const stats = getCourseRecap(course.kodeMK);
            return (
              <div key={course.kodeMK} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="flex justify-between items-start gap-2 border-b border-slate-105 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-extrabold tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded">
                      {course.kodeMK}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-800 mt-1">{course.namaMK}</h4>
                  </div>
                  <span className={`text-xs font-black bg-slate-100 border px-3 py-1 rounded-md shrink-0 flex items-center gap-1 ${
                    stats.percentage >= 75 ? 'border-emerald-200/60 text-emerald-850' : 'border-rose-200/60 text-rose-800'
                  }`}>
                    <Activity className="w-3.5 h-3.5" />
                    {stats.percentage}% Kehadiran
                  </span>
                </div>

                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                  {stats.details.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">Belum ada sesi pertemuan yang dibuka.</p>
                  ) : (
                    stats.details.map((sess, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs p-3 bg-slate-50/50 border border-slate-100 rounded-xl">
                        <div>
                          <p className="font-extrabold text-slate-700">Pertemuan ke-{idx + 1}</p>
                          <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{sess.sessionDate}</p>
                        </div>
                        <div className="text-right flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-md text-[10px] font-black ${
                            sess.status === 'Hadir' ? 'bg-emerald-100/70 text-emerald-800 border-emerald-100 border' :
                            sess.status === 'Izin' ? 'bg-amber-100/70 text-amber-800 border-amber-100 border' :
                            sess.status === 'Sakit' ? 'bg-amber-100/70 text-amber-800 border-amber-100 border' :
                            'bg-rose-100/70 text-rose-800 border-rose-100 border'
                          }`}>
                            {sess.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
