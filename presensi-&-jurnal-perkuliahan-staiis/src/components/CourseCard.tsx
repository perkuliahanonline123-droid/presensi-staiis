/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Course, AttendanceSession, Attendance } from '../types';
import { Calendar, Clock, BookOpenCheck, CheckCircle2, AlertCircle, Key } from 'lucide-react';

interface CourseCardProps {
  key?: string | number;
  course: Course;
  openSesi: AttendanceSession | undefined;
  hasAttended: Attendance | undefined;
  stats: {
    total: number;
    present: number;
    sick: number;
    excuse: number;
    absent: number;
    percentage: number;
  };
  t: any;
  lang: string;
  verificationCode: string;
  onVerificationCodeChange: (code: string) => void;
  onPerformAttendance: (course: Course, session: AttendanceSession) => void;
  onViewJournal: (course: Course) => void;
}

export function CourseCard({
  course,
  openSesi,
  hasAttended,
  stats,
  t,
  lang,
  verificationCode,
  onVerificationCodeChange,
  onPerformAttendance,
  onViewJournal
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md transition duration-250">
      {/* Course header */}
      <div className="p-4.5 border-b border-slate-100">
        <div className="flex justify-between items-start gap-2">
          <span className="text-[10px] font-bold text-emerald-850 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
            {course.kodeMK}
          </span>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
              {stats.percentage}% HR
            </span>
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
          <BookOpenCheck className="w-3.5 h-3.5 text-slate-400 shrink-0 text-emerald-600 shadow-3xs" />
          <span>{course.ruang}</span>
        </div>
      </div>

      {/* Attendance status control bottom block */}
      <div className="p-4 border-t border-slate-100 bg-white">
        {openSesi ? (
          hasAttended ? (
            <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl p-2.5 flex items-center justify-center gap-2 text-xs font-bold shadow-2xs">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
              <span>{t.btnSudahPresensi} ({hasAttended.statusKehadiran})</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-2 text-[11px] text-amber-950 font-semibold flex items-center gap-1.5 leading-tight">
                <AlertCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Sesi presensi dibagikan oleh Dosen!</span>
              </div>

              {openSesi.kodeUnik && (
                <div className="flex gap-1">
                  <input
                    type="text"
                    maxLength={10}
                    placeholder="Masukkan Kode Unik"
                    value={verificationCode}
                    onChange={(e) => onVerificationCodeChange(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-500/20 focus:border-emerald-600 text-center uppercase tracking-widest font-mono font-bold"
                  />
                </div>
              )}

              <button
                onClick={() => onPerformAttendance(course, openSesi)}
                className="hover:cursor-pointer w-full text-xs font-bold py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5 text-white" />
                {t.btnPresensi}
              </button>
            </div>
          )
        ) : (
          <div className="text-[10px] text-slate-400 text-center py-2 bg-slate-50/50 border border-slate-100 rounded-xl font-medium">
            Sesi Presensi Belum Dibuka Dosen
          </div>
        )}

        {/* View Journals Quick Link */}
        <button
          onClick={() => onViewJournal(course)}
          className="w-full mt-2 text-center text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/50 py-1.5 rounded-lg font-bold transition hover:cursor-pointer"
        >
          {t.learningJournal}
        </button>
      </div>
    </div>
  );
}
