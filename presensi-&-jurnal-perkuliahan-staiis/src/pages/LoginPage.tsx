/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lang } from '../translations';
import { Mail, Lock, Laptop, User, GraduationCap, BookOpen, ShieldAlert, CheckCircle2, UserCheck } from 'lucide-react';
import { ApiClient } from '../db';

interface LoginPageProps {
  emailInput: string;
  setEmailInput: (val: string) => void;
  passwordInput: string;
  setPasswordInput: (val: string) => void;
  authError: string;
  isSyncing: boolean;
  onLogin: (e: React.FormEvent) => void;
  lang?: Lang;
  t: any;
}

export function LoginPage({
  emailInput,
  setEmailInput,
  passwordInput,
  setPasswordInput,
  authError,
  isSyncing,
  onLogin,
  lang = 'ID',
  t
}: LoginPageProps) {
  const isRTL = lang === 'AR';

  // Toggle state
  const [isRegistering, setIsRegistering] = useState(false);

  // Register Form States
  const [regRole, setRegRole] = useState<'MAHASISWA' | 'DOSEN'>('MAHASISWA');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regProdi, setRegProdi] = useState('');
  const [regNipNim, setRegNipNim] = useState('');
  const [regSemester, setRegSemester] = useState(1);
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // Suggestions for Program Studi
  const prodiSuggestions = [
    'Pendidikan Agama Islam (PAI)',
    'Hukum Keluarga Islam (HKI)',
    'Tadris Bahasa Inggris',
    'Perbankan Syariah'
  ];

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setRegSuccess('');

    // Field validation
    if (!regEmail.trim() || !regPassword || !regConfirmPassword || !regName.trim() || !regProdi.trim() || !regNipNim.trim()) {
      setRegError(t.allFieldsReq || 'Semua kolom pendaftaran wajib diisi!');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegError(t.passwordsDoNotMatch || 'Kata sandi konfirmasi tidak cocok!');
      return;
    }

    setRegLoading(true);
    try {
      // FIX: Menggunakan braket objek bertipe string ["register"] agar compiler Vercel tidak mengubahnya menjadi Ve.register() saat proses minifikasi
      const databaseEngine: any = ApiClient;
      const res = await databaseEngine["register"]({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
        programStudi: regProdi.trim(),
        nipNim: regNipNim.trim(),
        semester: regRole === 'MAHASISWA' ? Number(regSemester) : undefined
      });

      if (res && res.success) {
        setRegSuccess(t.signUpSuccess || 'Registrasi berhasil! Silakan masuk.');
        // Auto pre-fill login credentials for the user
        setEmailInput(regEmail.trim());
        setPasswordInput(regPassword);

        // Reset registration states
        setRegEmail('');
        setRegPassword('');
        setRegConfirmPassword('');
        setRegName('');
        setRegProdi('');
        setRegNipNim('');
        setRegSemester(1);

        // Flip to login view after short delay
        setTimeout(() => {
          setIsRegistering(false);
          setRegSuccess('');
        }, 2200);
      } else {
        setRegError(res?.message || 'Registrasi gagal. Email mungkin sudah terdaftar.');
      }
    } catch (err: any) {
      setRegError(err.message || 'Gagal mendaftar ke server database.');
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-6 sm:my-12">
      {/* Institutional Brand Heading */}
      <div className="text-center mb-8 space-y-2">
        <h2 className="text-xl sm:text-2xl font-black mt-3 text-slate-800 tracking-tight">
          {t.title}
        </h2>
        <p className="text-xs text-slate-500 leading-normal max-w-sm mx-auto">
          {t.subtitle}
        </p>
        <div className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
          <Laptop className="w-3 h-3" />
          {t.tagline}
        </div>
      </div>

      {/* Auth Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        
        {/* VIEW 1: LOGIN FORM */}
        {!isRegistering ? (
          <>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800">{t.loginTitle}</h3>
              <p className="text-xs text-slate-400">{t.loginSubtitle}</p>
            </div>

            {authError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={onLogin} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right pt-2.5 pb-2.5' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right pt-2.5 pb-2.5' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSyncing}
                className="w-full hover:cursor-pointer mt-2 py-3.5 font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition duration-200 shadow-md select-none"
              >
                {isSyncing ? t.loading : t.loginBtn}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => setIsRegistering(true)}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 hover:underline hover:cursor-pointer transition"
              >
                {t.dontHaveAccount || 'Belum punya akun? Daftar Sekarang'} &rarr;
              </button>
            </div>
          </>
        ) : (
          /* VIEW 2: REGISTRATION FORM */
          <>
            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-slate-800">{t.signUpTitle}</h3>
              <p className="text-xs text-slate-400">{t.signUpSubtitle}</p>
            </div>

            {regError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold leading-relaxed flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{regError}</span>
              </div>
            )}

            {regSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{regSuccess}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              
              {/* Role Toggle Switch within Register */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.roleLabel || 'Pilih Peran'}</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setRegRole('MAHASISWA')}
                    className={`py-1.5 text-xs font-extrabold rounded-lg hover:cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      regRole === 'MAHASISWA'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{t.student || 'Mahasiswa'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('DOSEN')}
                    className={`py-1.5 text-xs font-extrabold rounded-lg hover:cursor-pointer transition flex items-center justify-center gap-1.5 ${
                      regRole === 'DOSEN'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{t.lecturer || 'Dosen'}</span>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.fullNameLabel || 'Nama Lengkap'}</label>
                <div className="relative">
                  <User className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={t.fullNamePlaceholder || 'Ketik nama lengkap...'}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={t.emailPlaceholder}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {/* NIP / NIM (Dynamic) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  {regRole === 'MAHASISWA' ? (t.nipNimLabelMahasiswa || 'NIM') : (t.nipNimLabelDosen || 'NIP / NIDN')}
                </label>
                <div className="relative">
                  <UserCheck className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={regNipNim}
                    onChange={(e) => setRegNipNim(e.target.value)}
                    placeholder={t.nipNimPlaceholder || 'Ketik identitas resmi...'}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {/* Program Studi */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-700">{t.programStudiLabel || 'Program Studi / Departemen'}</label>
                </div>
                <div className="relative">
                  <BookOpen className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="text"
                    required
                    value={regProdi}
                    onChange={(e) => setRegProdi(e.target.value)}
                    placeholder={t.programStudiPlaceholder || 'Contoh: Pendidikan Agama Islam'}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {prodiSuggestions.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setRegProdi(p)}
                      className="text-[9px] font-bold bg-slate-50 hover:bg-slate-100 hover:cursor-pointer text-slate-600 border border-slate-200 px-2 py-1 rounded-md transition"
                    >
                      {p.includes('(') ? p.substring(p.indexOf('(') + 1, p.indexOf(')')) : p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Semester (Mahasiswa Only) */}
              {regRole === 'MAHASISWA' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">{t.semesterLabel || 'Semester Aktif'}</label>
                  <select
                    value={regSemester}
                    onChange={(e) => setRegSemester(Number(e.target.value))}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-semibold text-xs"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                      <option key={s} value={s}>
                        {t.semester || 'Semester'} {s}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.passwordLabel}</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder={t.passwordPlaceholder}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">{t.confirmPasswordLabel || 'Konfirmasi Kata Sandi'}</label>
                <div className="relative">
                  <Lock className={`w-4 h-4 text-slate-400 absolute top-3.5 ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder={t.confirmPasswordPlaceholder || 'Ulangi kata sandi Anda...'}
                    className={`w-full px-10 py-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white text-slate-800 font-medium ${
                      isRTL ? 'text-right' : 'text-left'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={regLoading}
                className={`w-full hover:cursor-pointer mt-2 py-3.5 font-extrabold text-white rounded-xl transition duration-200 shadow-md select-none ${
                  regRole === 'MAHASISWA'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {regLoading ? t.loading : (t.registerBtn || 'Daftar Akun Baru')}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  setRegError('');
                  setRegSuccess('');
                }}
                className="text-[11px] font-bold text-slate-500 hover:text-slate-800 hover:underline hover:cursor-pointer transition"
              >
                &lsaquo; {t.alreadyHaveAccount || 'Sudah memiliki akun? Masuk'}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
