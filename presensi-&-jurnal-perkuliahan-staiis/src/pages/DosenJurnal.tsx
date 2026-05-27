/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { User, Course, Journal } from '../types';
import { CustomAlert } from '../components/CustomAlert';
import { ArrowLeft, Edit3, Save, Trash, Edit } from 'lucide-react';

interface DosenJurnalProps {
  user: User;
  selectedCourse: Course;
  journals: Journal[];
  onBack: () => void;
  onRefresh: () => void;
  t: any;
}

export function DosenJurnal({
  user,
  selectedCourse,
  journals,
  onBack,
  onRefresh,
  t
}: DosenJurnalProps) {
  const [editingJournalId, setEditingJournalId] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [busy, setBusy] = useState(false);

  const [journalForm, setJournalForm] = useState({
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    isi: '',
    lampiran: ''
  });

  const handleSaveJournal = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlert(null);

    if (!journalForm.judul.trim() || !journalForm.isi.trim()) {
      setAlert({ msg: 'Judul dan isi jurnal wajib disi.', type: 'error' });
      return;
    }

    setBusy(true);

    try {
      const { ApiClient } = await import('../db');

      const idJurnal = editingJournalId || `journal-${Math.random().toString(36).substring(2, 9)}`;
      await ApiClient.saveJournal({
        idJurnal,
        kodeMK: selectedCourse.kodeMK,
        tanggal: journalForm.tanggal,
        judul: journalForm.judul.trim(),
        isi: journalForm.isi.trim(),
        lampiran: journalForm.lampiran.trim() || undefined,
        dibuatOleh: user.id
      });

      setAlert({
        msg: editingJournalId ? 'Model jurnal berhasil diperbarui!' : 'Model jurnal baru berhasil diterbitkan!',
        type: 'success'
      });

      // Clear form
      setJournalForm({
        tanggal: new Date().toISOString().split('T')[0],
        judul: '',
        isi: '',
        lampiran: ''
      });
      setEditingJournalId(null);
      onRefresh();
    } catch (err: any) {
      setAlert({ msg: err.message || 'Gagal menyimpan catatan jurnal', type: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const handleEditJournalInit = (j: Journal) => {
    setEditingJournalId(j.idJurnal);
    setJournalForm({
      tanggal: j.tanggal,
      judul: j.judul,
      isi: j.isi,
      lampiran: j.lampiran || ''
    });
  };

  const handleDeleteJournal = async (idJurnal: string) => {
    if (!window.confirm(t.deleteJournalConfirm)) return;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <div>
            <h3 className="font-extrabold text-slate-800 text-base">{t.learningJournal}</h3>
            <p className="text-xs text-emerald-700 font-semibold">{selectedCourse.namaMK}</p>
          </div>
        </div>
      </div>

      {alert && (
        <CustomAlert
          message={alert.msg}
          type={alert.type}
          onClose={() => setAlert(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Tulis Jurnal */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 h-fit space-y-4 shadow-sm">
          <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-emerald-600 shadow-3xs" />
            {t.writeJournal}
          </h4>

          <form onSubmit={handleSaveJournal} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-605 text-slate-600">{t.journalDate}</label>
              <input
                type="date"
                value={journalForm.tanggal}
                onChange={(e) => setJournalForm({ ...journalForm, tanggal: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-605 text-slate-600">{t.journalTitle}</label>
              <input
                type="text"
                placeholder="Contoh: Pertemuan 1: Pengenalan Silabus"
                value={journalForm.judul}
                onChange={(e) => setJournalForm({ ...journalForm, judul: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white text-slate-800 font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-605 text-slate-600">{t.journalContent}</label>
              <textarea
                rows={4}
                placeholder={t.journalPlaceholder}
                value={journalForm.isi}
                onChange={(e) => setJournalForm({ ...journalForm, isi: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white text-slate-800 font-medium leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-605 text-slate-600">{t.attachmentUrl}</label>
              <input
                type="url"
                placeholder="https://drive.google.com/..."
                value={journalForm.lampiran}
                onChange={(e) => setJournalForm({ ...journalForm, lampiran: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden bg-white text-slate-800 font-medium"
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
          <h4 className="font-extrabold text-slate-800 text-sm pb-2 border-b border-slate-100">
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
                  <div
                    key={j.idJurnal}
                    className="p-4 bg-slate-50/70 rounded-2xl border border-slate-105 flex justify-between gap-4 text-xs hover:bg-slate-50 transition"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md font-bold">
                          {j.tanggal}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold font-mono">
                          ID: {j.idJurnal}
                        </span>
                      </div>
                      <h5 className="font-extrabold text-slate-800 text-xs">{j.judul}</h5>
                      <p className="text-slate-550 whitespace-pre-wrap leading-relaxed text-[11px] font-medium">
                        {j.isi}
                      </p>
                      {j.lampiran && (
                        <a
                          href={j.lampiran}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 border border-emerald-110 border-emerald-100 px-3 py-1.5 rounded-lg font-bold hover:bg-emerald-100 mt-2 transition"
                        >
                          Drive Lampiran File
                        </a>
                      )}
                    </div>

                    <div className="flex flex-col gap-1.5 shrink-0 justify-start">
                      <button
                        onClick={() => handleEditJournalInit(j)}
                        className="p-2 hover:bg-emerald-50 text-slate-500 hover:text-emerald-700 rounded-lg transition border border-transparent hover:border-emerald-100 cursor-pointer"
                        title="Sunting Jurnal"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJournal(j.idJurnal)}
                        className="p-2 hover:bg-rose-50 text-slate-500 hover:text-rose-600 rounded-lg transition border border-transparent hover:border-rose-100 cursor-pointer"
                        title="Hapus Jurnal"
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
  );
}
