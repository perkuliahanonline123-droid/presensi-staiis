/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, Course, AttendanceSession, Attendance } from '../types';
import { BookOpen, Plus, Calendar, Users, Edit } from 'lucide-react';

interface DashboardDosenProps {
  user: User;
  courses: Course[];
  sessions: AttendanceSession[];
  attendances: Attendance[];
  enrollments: any[];
  onRefresh: () => void;
  lang: 'ID' | 'EN' | 'AR';
  t: any;
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onManageAttendance: (course: Course) => void;
  onWriteJournal: (course: Course) => void;
  onShowRecap: (course: Course) => void;
}

export function DashboardDosen({
  user,
  courses,
  sessions,
  attendances,
  enrollments,
  onRefresh,
  lang,
  t,
  onAddCourse,
  onEditCourse,
  onManageAttendance,
  onWriteJournal,
  onShowRecap
}: DashboardDosenProps) {
  const isRTL = lang === 'AR';
  const direction = isRTL ? 'rtl' : 'ltr';

  // Calculations for dashboard indicators
  const lecturerCourses = courses.filter(c => c.dosenId === user.id);
  const totalStudentsEnrolled = enrollments.filter(e =>
    lecturerCourses.some(c => c.kodeMK === e.kodeMK)
  ).length;

  return (
    <div dir={direction} className="space-y-6">
      {/* Lecturer Metadata Info Panel */}
      <div className="bg-emerald-900 border-b-4 border-emerald-600 p-6 md:p-8 rounded-2xl text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div className="space-y-1 z-10">
          <span className="text-emerald-100/90 text-[10px] font-bold tracking-wider uppercase bg-emerald-850 border border-emerald-700/60 px-3 py-1 rounded-full">
            {t.lecturerDashboard}
          </span>
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

      <div className="space-y-4">
        <div className="flex justify-between items-center break-words">
          <h3 className="font-extrabold text-slate-800 text-lg flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600 animate-pulse" />
            {t.managedCourses}
          </h3>
          <button
            onClick={onAddCourse}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lecturerCourses.map((course) => {
              const mhsCount = enrollments.filter(e => e.kodeMK === course.kodeMK).length;
              const totalCourseSesi = sessions.filter(s => s.kodeMK === course.kodeMK).length;

              return (
                <div
                  key={course.kodeMK}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition duration-200 flex flex-col justify-between overflow-hidden"
                >
                  <div className="p-5 border-b border-slate-100 relative">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md">
                        {course.kodeMK}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold">{course.semester}</span>
                    </div>

                    <h4 className="font-extrabold text-sm text-slate-800 tracking-tight mt-3">
                      {course.namaMK}
                    </h4>
                    <p className="text-[11px] text-slate-450 mt-1">
                      {t.days[course.hari] || course.hari} • {course.jamMulai} - {course.jamSelesai} Class • {course.ruang}
                    </p>

                    {/* Meta stats badges */}
                    <div className="flex gap-2.5 mt-4">
                      <div className="px-3 py-1 bg-slate-50 border border-slate-100 rounded text-[10px] font-bold text-slate-500">
                        👥 {mhsCount} Mahasiswa
                      </div>
                    </div>
                  </div>

                  {/* Core action buttons toolbar */}
                  <div className="p-4 bg-slate-50/50 flex flex-col gap-2">
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => onManageAttendance(course)}
                        className="hover:cursor-pointer col-span-2 py-1.5 px-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] text-center transition select-none shadow-xs"
                      >
                        Input Presensi dan Jurnal Perkuliahan
                      </button>
                      <button
                        onClick={() => onShowRecap(course)}
                        className="hover:cursor-pointer col-span-1 py-1.5 px-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-705 font-bold rounded-lg text-[11px] text-center transition select-none shadow-xs"
                      >
                        {t.btnRecap}
                      </button>
                    </div>

                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                      <span>{totalCourseSesi} Sesi Kelas</span>
                      <button
                        onClick={() => onEditCourse(course)}
                        className="flex items-center gap-1 text-emerald-700 font-bold hover:underline hover:cursor-pointer"
                      >
                        <Edit className="w-3 h-3" />
                        Sunting MK
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
