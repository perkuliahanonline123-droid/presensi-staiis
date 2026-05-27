/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ApiClient } from '../db';

export function Footer() {
  const isLive = ApiClient.isLiveMode();

  return (
    <footer className="h-12 bg-slate-100 border-t border-slate-200 px-4 sm:px-8 mt-12 flex items-center justify-between text-[10px] text-slate-500 font-medium shrink-0">
      <div>© {new Date().getFullYear()} IT Development • Universitas Islam Indonesia SIAKAD</div>
      <div className="flex items-center gap-4 italic">
        <span>Version 4.11-stable</span>
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
          {isLive ? 'Terhubung ke GAS API (Live)' : 'Berjalan dalam Mode Simulasi Demo'}
        </span>
      </div>
    </footer>
  );
}
