/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Course, Journal, Attendance, AttendanceSession } from '../types';
import { ArrowLeft, BookOpen, BookOpenCheck, ExternalLink, ShieldCheck, Calendar } from 'lucide-react';

interface MahasiswaJurnalProps {
  user: { id: string; name: string; nipNim: string };
  courses: Course[];
  journals: Journal[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  initialCourse?: Course | null;
  onBack: () => void;
  t: any;
  initialTab?: 'JURNAL' | 'RIWAYAT';
}

export function MahasiswaJurnal({
  user,
  courses,
  journals,
  sessions,
  attendances,
  initialCourse = null,
  onBack,
  t,
  initialTab = 'JURNAL'
}: MahasiswaJurnalProps) {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(initialCourse || (courses.length > 0 ? courses[0] : null));
  const [activeTab, setActiveTab ] = useState<'JURNAL' | 'RIWAYAT'>(initialTab);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Portal Akademik Mahasiswa</h3>
            <p className="text-xs text-slate-500 leading-normal">Pantau Riwayat Kehadiran dan Jurnal Perkuliahan.</p>
          </div>
        </div>

        {/* Tab selector */}
        <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 w-full sm:max-w-[320px]">
          <button
            onClick={() => setActiveTab('RIWAYAT')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all hover:cursor-pointer select-none ${
              activeTab === 'RIWAYAT' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📋 Riwayat Presensi
          </button>
          <button
            onClick={() => setActiveTab('JURNAL')}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all hover:cursor-pointer select-none ${
              activeTab === 'JURNAL' ? 'bg-white text-emerald-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            📘 Jurnal Perkuliahan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Course Select side panel */}
        <div className="lg:col-span-4 space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block pb-1 border-b border-slate-100 mb-2">
            PILIH MATA KULIAH
          </span>
          {courses.map(course => (
            <button
              key={course.kodeMK}
              onClick={() => setSelectedCourse(course)}
              className={`w-full text-left p-3.5 rounded-xl border transition ${
                selectedCourse?.kodeMK === course.kodeMK
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                  : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-extrabold tracking-wider bg-emerald-100/45 text-emerald-800 px-2 py-0.5 rounded">
                  {course.kodeMK}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{course.hari}</span>
              </div>
              <h5 className="text-xs font-bold mt-1.5 leading-snug line-clamp-1">{course.namaMK}</h5>
            </button>
          ))}
        </div>

        {/* Dynamic Right Column Content (Jurnal or Riwayat Presensi) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-850 text-base border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            {selectedCourse ? selectedCourse.namaMK : t.learningJournal}
          </h3>

          {selectedCourse ? (
            <div className="space-y-4">
              <div className="bg-slate-50/80 p-3.5 rounded-xl text-xs space-y-1">
                <span className="text-[9px] text-slate-400 block font-semibold">{t.courseCode}</span>
                <span className="font-bold text-slate-700">{selectedCourse.kodeMK} • {selectedCourse.namaMK}</span>
              </div>

              {activeTab === 'JURNAL' ? (
                /* Journal Timeline View */
                <div className="space-y-4">
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-2">
                    {journals.filter(j => j.kodeMK === selectedCourse.kodeMK).length === 0 ? (
                      <div className="text-center py-12 text-slate-400">
                        <BookOpenCheck className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-40 text-emerald-600" />
                        <p className="text-xs">{t.noJournal}</p>
                      </div>
                    ) : (
                      journals
                        .filter(j => j.kodeMK === selectedCourse.kodeMK)
                        .reverse()
                        .map((journal) => (
                          <div key={journal.idJurnal} className="p-4 bg-slate-50/40 border border-slate-100 rounded-xl space-y-3">
                            <div className="flex justify-between items-start gap-1">
                              <h5 className="font-bold text-xs text-slate-800 leading-normal">{journal.judul}</h5>
                              <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-100 font-bold px-2.5 py-1 rounded shrink-0">
                                {journal.tanggal}
                              </span>
                            </div>

                            <p className="text-xs text-slate-550 whitespace-pre-wrap leading-relaxed">{journal.isi}</p>

                            {journal.lampiran && (
                              <a
                                href={journal.lampiran}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 text-[10px] text-emerald-850 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-md border border-emerald-100 hover:bg-emerald-100 transition"
                              >
                                <ExternalLink className="w-3.5 h-3.5 text-emerald-800" />
                                Materi Pembelajaran (Drive)
                              </a>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                /* Attendance History View */
                <div className="space-y-4">
                  {(() => {
                    const stats = getCourseRecap(selectedCourse.kodeMK);
                    return (
                      <div className="space-y-4">
                        {/* Progress Bar and Summary Cards */}
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-xs font-bold">
                            <span className="text-slate-700">Persentase Kehadiran</span>
                            <span className={stats.percentage >= 75 ? 'text-emerald-700' : 'text-rose-600'}>
                              {stats.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                stats.percentage >= 75 ? 'bg-emerald-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${stats.percentage}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-slate-500 font-semibold pt-1 border-t border-slate-200/55">
                            <span>Total Pertemuan: {stats.total} Sesi</span>
                            <span className="text-slate-600">
                              H:{' '}
                              <strong className="text-emerald-700">
                                {stats.present}
                              </strong>{' '}
                              | I:{' '}
                              <strong className="text-amber-600">
                                {stats.excuse}
                              </strong>{' '}
                              | S:{' '}
                              <strong className="text-amber-600">
                                {stats.sick}
                              </strong>{' '}
                              | A: <strong className="text-rose-600">{stats.absent}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Session details table representation */}
                        <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                          {stats.details.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-8">Belum ada sesi pertemuan yang dibuka.</p>
                          ) : (
                            stats.details.map((sess, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs p-3.5 bg-slate-50/40 border border-slate-100 rounded-xl hover:bg-slate-50 transition"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-extrabold text-slate-700">Pertemuan ke-{idx + 1}</p>
                                  <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                                    <Calendar className="w-3 h-3 text-slate-300" />
                                    {sess.sessionDate}
                                  </p>
                                </div>
                                <div className="text-right flex items-center gap-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                                      sess.status === 'Hadir'
                                        ? 'bg-emerald-50 text-emerald-850 border-emerald-100'
                                        : sess.status === 'Izin'
                                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                                        : sess.status === 'Sakit'
                                        ? 'bg-amber-50 text-amber-805 border-amber-200'
                                        : 'bg-rose-50 text-rose-800 border-rose-100'
                                    }`}
                                  >
                                    {sess.status === 'Hadir' ? t.hadir : sess.status === 'Izin' ? t.izin : sess.status === 'Sakit' ? t.sakit : t.alpa}
                                  </span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <BookOpen className="w-12 h-12 stroke-1 mx-auto mb-3 opacity-50 text-slate-300" />
              <p className="text-xs">Silakan pilih salah satu mata kuliah di panel sebelah kiri.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
