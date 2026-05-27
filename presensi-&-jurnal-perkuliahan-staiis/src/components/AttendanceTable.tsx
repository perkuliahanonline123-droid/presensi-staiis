/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface AttendanceRow {
  id: string;
  nim: string;
  name: string;
  present: number;
  excuse: number;
  sick: number;
  absent: number;
  rate: number;
}

interface AttendanceTableProps {
  recapList: AttendanceRow[];
  t: any;
}

export function AttendanceTable({ recapList, t }: AttendanceTableProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-500">
          <thead className="text-[10px] font-extrabold uppercase bg-slate-50 border-b border-slate-100 text-slate-700">
            <tr>
              <th scope="col" className="px-6 py-4">No</th>
              <th scope="col" className="px-6 py-4">NIM</th>
              <th scope="col" className="px-6 py-4">Nama Mahasiswa</th>
              <th scope="col" className="px-6 py-4">Hadir</th>
              <th scope="col" className="px-6 py-4">Izin</th>
              <th scope="col" className="px-6 py-4">Sakit</th>
              <th scope="col" className="px-6 py-4">Alpa</th>
              <th scope="col" className="px-6 py-4 text-center">Persentase</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recapList.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-medium">
                  {t.emptyRecap || 'Belum ada data kehadiran terekam.'}
                </td>
              </tr>
            ) : (
              recapList.map((row, index) => (
                <tr key={row.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-3.5 font-bold text-slate-800">{index + 1}</td>
                  <td className="px-6 py-3.5 font-mono">{row.nim}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-800">{row.name}</td>
                  <td className="px-6 py-3.5 text-emerald-700 font-bold">{row.present}</td>
                  <td className="px-6 py-3.5 text-amber-600 font-bold">{row.excuse}</td>
                  <td className="px-6 py-3.5 text-amber-600 font-bold">{row.sick}</td>
                  <td className="px-6 py-3.5 text-rose-500 font-bold">{row.absent}</td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-3 justify-center">
                      <span className={`font-extrabold text-right w-10 ${row.rate >= 75 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {row.rate}%
                      </span>
                      <div className="w-20 bg-slate-100 h-2.5 rounded-full overflow-hidden shrink-0 mt-0.5">
                        <div
                          className={`h-full ${row.rate >= 75 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${row.rate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
