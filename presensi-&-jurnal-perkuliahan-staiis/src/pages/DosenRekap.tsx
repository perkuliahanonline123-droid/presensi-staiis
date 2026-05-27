/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Course, AttendanceSession, Attendance } from '../types';
import { AttendanceTable } from '../components/AttendanceTable';
import { CustomAlert } from '../components/CustomAlert';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';

interface DosenRekapProps {
  selectedCourse: Course;
  sessions: AttendanceSession[];
  attendances: Attendance[];
  students: User[];
  enrollments: any[];
  onBack: () => void;
  t: any;
}

export function DosenRekap({
  selectedCourse,
  sessions,
  attendances,
  students,
  enrollments,
  onBack,
  t
}: DosenRekapProps) {
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);

  const getSubscribedStudents = (mkKode: string) => {
    const subscribedStudentIds = enrollments
      .filter(e => e.kodeMK === mkKode)
      .map(e => e.idMahasiswa);
    return students.filter(s => subscribedStudentIds.includes(s.id));
  };

  const currentCourseStudents = getSubscribedStudents(selectedCourse.kodeMK);

  const getCourseRecapList = () => {
    const courseSessions = sessions.filter(s => s.kodeMK === selectedCourse.kodeMK);
    const totalMeetings = courseSessions.length;
    const courseSessionIds = courseSessions.map(s => s.idSesi);

    return currentCourseStudents.map(student => {
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

  const recordsList = getCourseRecapList();

  const handleExportCSV = () => {
    const courseSessionCount = sessions.filter(s => s.kodeMK === selectedCourse.kodeMK).length;

    let csvContent = 'No,NIM,Nama Mahasiswa,Program Studi,Pertemuan Diadakan,Hadir,Izin,Sakit,Alpa,Persentase Kehadiran\n';

    recordsList.forEach((row, idx) => {
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
    setAlert({ msg: 'Ekspor rekapitulasi kelas sukses diunduh.', type: 'success' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
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
          className="hover:cursor-pointer flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-xs transition select-none"
        >
          <FileSpreadsheet className="w-4 h-4 text-white" />
          {t.exportCsv}
        </button>
      </div>

      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <AttendanceTable recapList={recordsList} t={t} />
    </div>
  );
}
