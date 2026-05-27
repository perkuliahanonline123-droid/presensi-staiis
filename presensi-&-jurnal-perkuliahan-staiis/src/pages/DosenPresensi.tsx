/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Course, AttendanceSession, Attendance, AttendanceStatus, Journal } from '../types';
import { CustomAlert } from '../components/CustomAlert';
import { ArrowLeft, Calendar, Key, CheckSquare, UserCheck, Edit3, Trash, Edit, BookOpenCheck, Save, FileText, CheckCircle } from 'lucide-react';

interface DosenPresensiProps {
  user: User;
  selectedCourse: Course;
  sessions: AttendanceSession[];
  attendances: Attendance[];
  students: User[];
  enrollments: any[];
  journals: Journal[];
  onBack: () => void;
  onRefresh: () => void;
  t: any;
  initialTab?: 'PRESENSI' | 'JURNAL';
}

export function DosenPresensi({
  user,
  selectedCourse,
  sessions,
  attendances,
  students,
  enrollments,
  journals,
  onBack,
  onRefresh,
  t,
  initialTab = 'PRESENSI'
}: DosenPresensiProps) {
  // Use a synchronized date state that drives both session date and journal date
  const [sessionDate, setSessionDate] = useState(() => {
    const existingOpenSession = sessions.find(
      s => s.kodeMK === selectedCourse.kodeMK && s.status === 'DIBUKA'
    );
    return existingOpenSession ? existingOpenSession.tanggal : new Date().toISOString().split('T')[0];
  });

  const [isCodeEnabled, setIsCodeEnabled] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [attendanceEdits, setAttendanceEdits] = useState<Record<string, AttendanceStatus>>({});
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [busy, setBusy] = useState(false);

  // Journal form inputs
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [journalForm, setJournalForm] = useState({
    judul: '',
    isi: '',
    lampiran: ''
  });

  // Get current students registered in this course
  const currentCourseStudents = students.filter(student =>
    enrollments.some(e => e.kodeMK === selectedCourse.kodeMK && e.idMahasiswa === student.id)
  );

  // Synchrononize active session and journals when course or date changes
  useEffect(() => {
    // 1. Find if there is a session for this course on this selected date
    const foundSession = sessions.find(
      s => s.kodeMK === selectedCourse.kodeMK && s.tanggal === sessionDate
    );

    if (foundSession) {
      setActiveSessionId(foundSession.idSesi);
      if (foundSession.kodeUnik) {
        setIsCodeEnabled(true);
        setSessionCode(foundSession.kodeUnik);
      } else {
        setIsCodeEnabled(false);
        setSessionCode('');
      }

      // Prepopulate student attendance edits with database records
      const sessionAtts = attendances.filter(a => a.idSesi === foundSession.idSesi);
      const tempEdits: Record<string, AttendanceStatus> = {};
      currentCourseStudents.forEach(st => {
        const recorded = sessionAtts.find(a => a.idMahasiswa === st.id);
        tempEdits[st.id] = recorded ? recorded.statusKehadiran : 'Alpa';
      });
      setAttendanceEdits(tempEdits);
    } else {
      setActiveSessionId(null);
      setIsCodeEnabled(false);
      setSessionCode('');
      // Prepopulate all as Alpa
      const tempEdits: Record<string, AttendanceStatus> = {};
      currentCourseStudents.forEach(st => {
        tempEdits[st.id] = 'Alpa';
      });
      setAttendanceEdits(tempEdits);
    }

    // 2. Find if there is a journal for this course on this selected date
    const foundJournal = journals.find(
      j => j.kodeMK === selectedCourse.kodeMK && j.tanggal === sessionDate
    );

    if (foundJournal) {
      setEditingJournalId(foundJournal.idJurnal);
      setJournalForm({
        judul: foundJournal.judul,
        isi: foundJournal.isi,
        lampiran: foundJournal.lampiran || ''
      });
    } else {
      setEditingJournalId(null);
      setJournalForm({
        judul: '',
        isi: '',
        lampiran: ''
      });
    }
  }, [selectedCourse, sessionDate, sessions, attendances, journals]);

  const handleGenerateCode = () => {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setSessionCode(code);
  };

  const handleDeleteJournal = async (idJurnal: string) => {
    if (!window.confirm(t.deleteJournalConfirm || 'Apakah Anda yakin ingin menghapus jurnal ini?')) return;
    setAlert(null);

    try {
      const { ApiClient } = await import('../db');
      await ApiClient.deleteJournal(idJurnal);
      setAlert({ msg: 'Jurnal berhasil dihapus!', type: 'success' });
      onRefresh();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Gagal menghapus jurnal', type: 'error' });
    }
  };

  const handleBulkSetAll = (status: AttendanceStatus) => {
    const temp: Record<string, AttendanceStatus> = { ...attendanceEdits };
    currentCourseStudents.forEach(st => {
      temp[st.id] = status;
    });
    setAttendanceEdits(temp);
  };

  // Single Action Submit Handler that saves Journal and Attendance Session altogether!
  const handleSaveEntireClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!journalForm.judul.trim()) {
      setAlert({ msg: 'Judul Jurnal Pembelajaran wajib diisi.', type: 'error' });
      return;
    }
    if (!journalForm.isi.trim()) {
      setAlert({ msg: 'Isi Ringkasan Jurnal wajib diisi.', type: 'error' });
      return;
    }

    setBusy(true);

    try {
      const { ApiClient } = await import('../db');

      // 1. Save or Update Journal Entry
      const targetJournalId = editingJournalId || `journal-${Math.random().toString(36).substring(2, 9)}`;
      await ApiClient.saveJournal({
        idJurnal: targetJournalId,
        kodeMK: selectedCourse.kodeMK,
        tanggal: sessionDate,
        judul: journalForm.judul.trim(),
        isi: journalForm.isi.trim(),
        lampiran: journalForm.lampiran.trim() || undefined,
        dibuatOleh: user.id
      });

      // 2. Retrieve or Open Class Session
      let finalSessionId = activeSessionId;
      if (!finalSessionId) {
        // Look up if a session is already present for this course and date
        const existingSession = sessions.find(
          s => s.kodeMK === selectedCourse.kodeMK && s.tanggal === sessionDate
        );
        if (existingSession) {
          finalSessionId = existingSession.idSesi;
        } else {
          // Create new session in DB
          finalSessionId = await ApiClient.openSession({
            kodeMK: selectedCourse.kodeMK,
            tanggal: sessionDate,
            jamMulaiPresensi: new Date().toLocaleTimeString('id-ID', { hour12: false }).slice(0, 5),
            jamSelesaiPresensi: new Date(Date.now() + 2 * 60 * 60 * 1000)
              .toLocaleTimeString('id-ID', { hour12: false })
              .slice(0, 5),
            kodeUnik: isCodeEnabled ? sessionCode : '',
            status: 'DIBUKA'
          });
        }
      }

      // 3. Sync Student Attendance Records
      const payloadAtts = currentCourseStudents.map(st => ({
        idMahasiswa: st.id,
        statusKehadiran: attendanceEdits[st.id] || 'Alpa',
        ipAddressMetode: 'Input Terpadu Jurnal & Presensi'
      }));

      await ApiClient.updateAttendanceByDosen(finalSessionId, payloadAtts);

      setAlert({
        msg: 'Sukses menyimpan Jurnal Pembelajaran dan Presensi Mahasiswa!',
        type: 'success'
      });

      onRefresh();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Gagal menyimpan rekaman kelas', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header section toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white p-4.5 rounded-2xl border border-slate-200 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">Kelola Kuliah Terpadu</h3>
            <p className="text-xs text-emerald-700 font-semibold">{selectedCourse.namaMK} ({selectedCourse.kodeMK})</p>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-600 font-bold px-3 py-1.5 rounded-xl">
            {currentCourseStudents.length} Mahasiswa Terdaftar
          </span>
        </div>
      </div>

      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Main unified layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Jurnal + Presensi */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleSaveEntireClass} className="space-y-6">
            
            {/* Card 1: Jurnal Pembelajaran (Di Atas) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-700" />
                Jurnal Pembelajaran Kelas
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Tanggal Perkuliahan / Jurnal</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600">Judul Pembelajaran</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Pertemuan 1: Pengenalan Silabus"
                    value={journalForm.judul}
                    onChange={(e) => setJournalForm({ ...journalForm, judul: e.target.value })}
                    className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-600">Ringkasan Materi & Kegiatan Pembelajaran</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Deskripsikan garis besar materi perkuliahan, bab buku, instruksi tugas, dsb."
                  value={journalForm.isi}
                  onChange={(e) => setJournalForm({ ...journalForm, isi: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white leading-relaxed"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="text-xs font-bold text-slate-600">Tautan File Lampiran Materi (Opsional)</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={journalForm.lampiran}
                  onChange={(e) => setJournalForm({ ...journalForm, lampiran: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
                />
              </div>

              {/* QR / Student Self-Attendance Code Toggle */}
              <div className="pt-3 border-t border-slate-100 text-xs">
                <label className="inline-flex items-center gap-2.5 font-bold text-slate-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isCodeEnabled}
                    onChange={(e) => setIsCodeEnabled(e.target.checked)}
                    className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4.5 h-4.5 cursor-pointer"
                  />
                  Gunakan Kode Unik untuk Presensi Mandiri Mahasiswa
                </label>

                {isCodeEnabled && (
                  <div className="flex gap-2 mt-2 w-full max-w-sm">
                    <input
                      type="text"
                      placeholder="______"
                      maxLength={6}
                      value={sessionCode}
                      onChange={(e) => setSessionCode(e.target.value)}
                      className="w-full text-center tracking-widest text-sm font-bold bg-slate-50 py-2 rounded-xl border border-slate-200 focus:outline-hidden uppercase"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateCode}
                      className="px-3.5 py-2 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 text-emerald-850 rounded-xl font-bold flex items-center gap-1 shrink-0 transition"
                    >
                      <Key className="w-3.5 h-3.5" />
                      Acak Kode
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Presensi Mahasiswa (Di Bawah) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
                  <UserCheck className="w-4.5 h-4.5 text-emerald-700" />
                  Sesi Presensi Mahasiswa
                </h4>

                {activeSessionId ? (
                  <span className="text-[10px] text-emerald-850 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full font-bold">
                    Sesi Aktif Terdaftar
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full font-bold">
                    Sesi Baru Otomatis Dibuat
                  </span>
                )}
              </div>

              {/* Quick Bulk Settings */}
              <div className="flex flex-wrap items-center gap-2 text-xs bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-slate-500 font-bold">{t.bulkSelect}:</span>
                <button
                  type="button"
                  onClick={() => handleBulkSetAll('Hadir')}
                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md font-bold hover:bg-emerald-100 transition cursor-pointer"
                >
                  {t.hadir}
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetAll('Izin')}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-250 rounded-md font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  {t.izin}
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetAll('Sakit')}
                  className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-250 rounded-md font-bold hover:bg-amber-100 transition cursor-pointer"
                >
                  {t.sakit}
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkSetAll('Alpa')}
                  className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-100 rounded-md font-bold hover:bg-rose-100 transition cursor-pointer"
                >
                  {t.alpa}
                </button>
              </div>

              {/* Student Rows */}
              <div className="divide-y divide-slate-100 max-h-[22rem] overflow-y-auto pr-1">
                {currentCourseStudents.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-10">
                    Belum ada mahasiswa terdaftar untuk mata kuliah {selectedCourse.kodeMK}.
                  </p>
                ) : (
                  currentCourseStudents.map(student => {
                    const activeStatus = attendanceEdits[student.id] || 'Alpa';

                    return (
                      <div
                        key={student.id}
                        className="py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <p className="font-extrabold text-slate-800">{student.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {student.nipNim} • {student.programStudi}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 flex-wrap">
                          {(['Hadir', 'Izin', 'Sakit', 'Alpa'] as AttendanceStatus[]).map(st => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setAttendanceEdits({ ...attendanceEdits, [student.id]: st })}
                              className={`px-3 py-1.5 rounded-lg font-bold text-[10px] transition duration-150 cursor-pointer ${
                                activeStatus === st
                                  ? st === 'Hadir'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Izin'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : st === 'Sakit'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-slate-50 border border-slate-100 hover:bg-slate-100 text-slate-500'
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
            </div>

            {/* Card 3: Combined Save Action at bottom */}
            <button
              type="submit"
              disabled={busy}
              className="hover:cursor-pointer w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-2xl transition duration-200 flex items-center justify-center gap-2 shadow-sm text-sm"
            >
              <CheckCircle className="w-5 h-5" />
              {busy ? 'Sedang Menyimpan...' : 'Simpan & Terapkan Perkuliahan'}
            </button>
          </form>
        </div>

        {/* Right Column: History of published journals for quick loading */}
        <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs h-fit space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h4 className="font-extrabold text-slate-850 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              Riwayat Jurnal Terbit
            </h4>
            <p className="text-[10px] text-slate-400 mt-0.5">Klik sunting untuk memuat kembali tanggal tersebut.</p>
          </div>

          <div className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1">
            {journals.filter(j => j.kodeMK === selectedCourse.kodeMK).length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10 leading-relaxed">
                Belum ada jurnal perkuliahan yang diterbitkan untuk mata kuliah ini.
              </p>
            ) : (
              journals
                .filter(j => j.kodeMK === selectedCourse.kodeMK)
                .reverse()
                .map((j) => {
                  const isActive = j.tanggal === sessionDate;

                  return (
                    <div
                      key={j.idJurnal}
                      onClick={() => setSessionDate(j.tanggal)}
                      className={`p-3.5 rounded-xl border flex justify-between gap-3 text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 border-emerald-300 shadow-3xs'
                          : 'bg-slate-50/70 border-slate-150 hover:bg-slate-50'
                      }`}
                    >
                      <div className="space-y-1 w-full min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[9px] text-emerald-800 bg-emerald-100/50 px-2.5 py-0.5 rounded-md font-bold font-mono">
                            {j.tanggal}
                          </span>
                        </div>
                        <h5 className="font-bold text-slate-800 text-xs truncate">{j.judul}</h5>
                        <p className="text-slate-500 text-[10px] line-clamp-2 leading-relaxed whitespace-pre-wrap">
                          {j.isi}
                        </p>
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0 justify-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionDate(j.tanggal);
                          }}
                          className="p-1.5 hover:bg-emerald-50 text-slate-400 hover:text-emerald-700 rounded-lg transition border border-transparent hover:border-emerald-100 cursor-pointer"
                          title="Sunting Jurnal"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteJournal(j.idJurnal);
                          }}
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-650 rounded-lg transition border border-transparent hover:border-rose-100 cursor-pointer"
                          title="Hapus Jurnal"
                        >
                          <Trash className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
