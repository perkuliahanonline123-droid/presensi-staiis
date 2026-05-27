/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { googleAppsScriptCode } from '../gasTemplate';
import { ApiClient, localDb } from '../db';
import { Copy, Check, Database, HelpCircle, Code, Save, RefreshCw } from 'lucide-react';

interface SettingsPanelProps {
  onSaved: () => void;
  lang: 'ID' | 'EN' | 'AR';
  t: any;
}

export function SettingsPanel({ onSaved, lang, t }: SettingsPanelProps) {
  const [url, setUrl] = useState(ApiClient.getGasUrl());
  const [copied, setCopied] = useState(false);
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({ status: 'idle', message: '' });

  const activeMode = ApiClient.isLiveMode();

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(googleAppsScriptCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Gagal menyalin text', err);
    }
  };

  const handleSave = async () => {
    setTestResult({ status: 'testing', message: t.loading });
    
    const formattedUrl = url.trim();
    if (!formattedUrl) {
      ApiClient.setGasUrl('');
      setTestResult({ status: 'success', message: 'Mengubah ke Mode Simulasi / Demo Lokal.' });
      onSaved();
      return;
    }

    try {
      // Test connectivity by querying courses
      const response = await fetch(`${formattedUrl}?action=getCourses`, {
        method: 'GET',
        mode: 'cors'
      });
      const data = await response.json();
      if (data.success) {
        ApiClient.setGasUrl(formattedUrl);
        setTestResult({ status: 'success', message: 'Tersambung! Berhasil sinkronisasi dengan Google Sheets.' });
        onSaved();
      } else {
        setTestResult({ status: 'error', message: 'Gagal terkoneksi. Respons sistem tidak sesuai.' });
      }
    } catch (err: any) {
      setTestResult({ 
        status: 'error', 
        message: 'Gagal menghubungi Endpoint. Pastikan URL benar, Google Apps Script telah dideploy sebagai Web App dengan akses "Anyone" (Siapa Saja) dan CORS aktif.' 
      });
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Apakah Anda ingin memulihkan data demo awal (reset semua data simulasi)?')) {
      localDb.resetDemoData();
      alert('Data simulasi berhasil dikembalikan ke sedia kala.');
      onSaved();
    }
  };

  const direction = lang === 'AR' ? 'rtl' : 'ltr';

  return (
    <div dir={direction} className="space-y-6">
      {/* Dynamic Status Banner */}
      <div className={`p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border ${
        activeMode 
          ? 'bg-emerald-50 border-emerald-100 text-emerald-900' 
          : 'bg-amber-50 border-amber-250 text-amber-950'
      }`}>
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl ${activeMode ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100/80 text-amber-800'}`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-base mb-0.5">{t.activeBackendMode}</h3>
            <p className="text-xs opacity-85">
              {activeMode 
                ? `${t.liveMode}: ${ApiClient.getGasUrl().substring(0, 50)}...`
                : `${t.demoMode} - Menyimpan data pada local browser sandboxed storage.`
              }
            </p>
          </div>
        </div>
        {!activeMode && (
          <button 
            onClick={handleResetDemo}
            className="mt-3 md:mt-0 text-xs text-amber-800 hover:text-amber-950 bg-white font-bold border border-amber-200 px-3.5 py-1.5 rounded-lg hover:bg-amber-50 transition"
          >
            Reset Data Simulasi
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Connection URL input */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-700" />
              {t.gasUrlSetup}
            </h4>
            
            <p className="text-xs text-slate-500 leading-relaxed">
              {t.gasInstruction}
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">URL Web App Apps Script</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.gasInputPlaceholder}
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 bg-white"
              />
              <span className="text-[10px] text-slate-400 block">Kosongkan URL untuk beralih kembali ke Mode Demo Lokal.</span>
            </div>

            {testResult.status !== 'idle' && (
              <div className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                testResult.status === 'testing' ? 'bg-amber-50 text-amber-800 border border-amber-100' :
                testResult.status === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' :
                'bg-rose-50 text-rose-800 border-rose-100 border'
              }`}>
                {testResult.status === 'testing' && <RefreshCw className="w-4.5 h-4.5 animate-spin shrink-0 mt-0.5" />}
                <p className="font-medium text-[11px] leading-relaxed">{testResult.message}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={testResult.status === 'testing'}
            className="w-full hover:cursor-pointer mt-6 inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {t.saveConfig}
          </button>
        </div>

        {/* Right Instructions & Apps Script Code to Copy */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-500" />
              Petunjuk Deploy Google Sheets
            </h4>

            <div className="space-y-2.5 text-[11px] text-slate-600 leading-relaxed max-h-52 overflow-y-auto pr-1">
              <p>{t.gasStep1}</p>
              <p>{t.gasStep2}</p>
              <p>{t.gasStep3}</p>
              <p>{t.gasStep4}</p>
              <p>{t.gasStep5}</p>
            </div>
          </div>

          <button
            onClick={handleCopyCode}
            className={`w-full hover:cursor-pointer mt-4 inline-flex items-center justify-center gap-2 font-semibold py-2.5 px-4 rounded-xl text-xs transition ${
              copied 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {copied ? <Check className="w-4 h-4 animate-bounce" /> : <Copy className="w-4 h-4" />}
            {copied ? t.copiedSuccess : t.copyCodeBtn}
          </button>
        </div>
      </div>
    </div>
  );
}
