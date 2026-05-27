/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, AttendanceSession, Attendance, Course, Journal } from '../types';
import { Lang } from '../translations';
import { ApiClient } from '../db';
import { GraduationCap, RefreshCw, Settings, LogOut } from 'lucide-react';

interface NavbarProps {
  user: User | null;
  lang: Lang;
  onLanguageToggle: (lang: Lang) => void;
  activeTab: 'DASHBOARD' | 'SETTINGS';
  onActiveTabToggle: () => void;
  onLogout: () => void;
  t: any;
  isSyncing: boolean;
}

export function Navbar({
  user,
  lang,
  onLanguageToggle,
  activeTab,
  onActiveTabToggle,
  onLogout,
  t,
  isSyncing
}: NavbarProps) {
  const isRTL = lang === 'AR';

  return (
    <header className="sticky top-0 z-40 bg-emerald-900 text-white flex items-center justify-between px-4 sm:px-8 border-b-4 border-emerald-600 shadow-md">
      <div className="max-w-7xl w-full mx-auto h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-900 shadow-sm shrink-0">
            <GraduationCap className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight text-base sm:text-lg leading-none italic text-white">
              {t.logoText}
            </h1>
            <span className="text-[10px] uppercase tracking-widest opacity-80 font-semibold block mt-1">
              Portal Akademik Terintegrasi UIN Madani
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          {/* Sync connection network lights */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800/80 rounded-md text-[10px] font-bold border border-emerald-700/60">
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin mr-0.5 text-amber-300" />
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${ApiClient.isLiveMode() ? 'bg-amber-400' : 'bg-amber-400 animate-pulse'}`} />
            )}
            {ApiClient.isLiveMode() ? t.liveMode : t.demoMode}
          </div>

          {/* Language Selector Picker */}
          <div className="flex bg-emerald-950/80 p-1 rounded-md border border-emerald-800">
            {(['ID', 'EN', 'AR'] as Lang[]).map(item => (
              <button
                key={item}
                onClick={() => onLanguageToggle(item)}
                className={`px-3 py-1 rounded text-xs font-bold transition cursor-pointer ${
                  lang === item 
                    ? 'bg-emerald-600 text-white shadow-xs' 
                    : 'text-emerald-300 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Settings Button always available */}
          <button
            onClick={onActiveTabToggle}
            className={`p-2 rounded-lg transition cursor-pointer ${
              activeTab === 'SETTINGS' ? 'bg-emerald-700 text-white font-bold' : 'text-emerald-200 hover:text-white hover:bg-emerald-850'
            }`}
            title={t.gasUrlSetup || 'Pengaturan Endpoint URL'}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Authenticated Controls */}
          {user && (
            <div className="flex items-center gap-2 sm:gap-3 border-l border-emerald-700 pl-2 sm:pl-4">
              <div className="hidden sm:text-right sm:block">
                <p className="text-xs font-bold leading-tight text-white">{user.name}</p>
                <p className="text-[9px] opacity-75 uppercase tracking-wider">{user.role === 'DOSEN' ? 'Dosen Pengampu' : 'Mahasiswa'}</p>
              </div>

              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center font-bold text-emerald-900 shadow-inner text-xs shrink-0" title={user.name}>
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>

              <button
                onClick={onLogout}
                className="p-2 hover:bg-rose-900/40 text-rose-200 hover:text-white rounded-lg transition cursor-pointer"
                title={t.logout}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
