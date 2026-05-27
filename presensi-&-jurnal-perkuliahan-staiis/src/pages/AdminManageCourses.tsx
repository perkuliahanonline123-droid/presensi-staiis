/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface AdminManageCoursesProps {
  onBack: () => void;
}

export function AdminManageCourses({ onBack }: AdminManageCoursesProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-2xl mx-auto space-y-6 shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl hover:cursor-pointer transition"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <h3 className="font-extrabold text-slate-800 text-lg">Admin: Kelola Kurikulum & Jadwal</h3>
      </div>

      <div className="text-center py-10 space-y-3">
        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 mx-auto flex items-center justify-center text-slate-400">
          <Shield className="w-6 h-6 text-emerald-600" />
        </div>
        <h4 className="font-bold text-slate-800 text-sm">Panel Kontrol Administratif</h4>
        <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
          Fitur ini memungkinkan administrator institusi UIN Madani untuk mengunci, mengarsipkan, mengubah muatan kurikulum, serta mengesahkan pendaftaran bulk semester secara global via spreadsheets.
        </p>
      </div>
    </div>
  );
}
