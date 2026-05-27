/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Lang } from '../translations';
import { GraduationCap, ArrowRight, ShieldCheck, CheckCircle2, Bookmark, Flame } from 'lucide-react';

import { User } from '../types';

interface LandingPageProps {
  onStartLogin: () => void;
  lang: Lang;
  t: any;
  user?: User | null;
}

export function LandingPage({ onStartLogin, lang, t, user }: LandingPageProps) {
  const isRTL = lang === 'AR';

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 border-2 border-emerald-100 px-4 py-1.5 rounded-full text-xs font-bold leading-none shadow-3xs">
          <GraduationCap className="w-4 h-4 text-emerald-700" />
          <span>SIAKAD Universitas Islam Negeri</span>
        </div>

        <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Sistem Informasi Presensi & <span className="bg-gradient-to-r from-emerald-700 to-teal-850 bg-clip-text text-transparent">Jurnal Pembelajaran</span>
        </h2>

        <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-500 leading-relaxed font-medium">
          Media pemantauan kehadiran serta pelaporan perkuliahan real-time. Memungkinkan verifikasi kehadiran mahasiswa dengan kode aman serta pembuatan jurnal mandiri dosen pengampu.
        </p>

        <div className="flex justify-center gap-4 pt-4">
          <button
            onClick={onStartLogin}
            className="hover:cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-6 py-3.5 rounded-xl shadow-md transition duration-200 text-sm"
          >
            {user ? 'Masuk ke Dashboard Anda' : 'Masuk ke Portal Akademik'}
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Feature stats blocks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <h4 className="font-extrabold text-slate-950 text-sm mb-1.5">Presensi Kehadiran Aman</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Dosen dapat melacak presensi harian secara manual atau mengunci absensi dengan Kode Verifikasi 6-digit.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100">
            <Bookmark className="w-5 h-5 text-emerald-700" />
          </div>
          <h4 className="font-extrabold text-slate-950 text-sm mb-1.5">Jurnal Perkuliahan Harian</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Pencatatan materi pengajaran, rincian sub-bahasan harian, evaluasi kelas, dan pengunggahan modul/lampiran.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-sm transition">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center mb-4 border border-emerald-100">
            <Flame className="w-5 h-5 text-emerald-700" />
          </div>
          <h4 className="font-extrabold text-slate-950 text-sm mb-1.5 font-sans">Sinkronisasi Instan</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Terhubung langsung ke Google Sheets (GAS) untuk penyimpanan abadi, aman, dan bisa diakses kapan saja.
          </p>
        </div>
      </div>
    </div>
  );
}
