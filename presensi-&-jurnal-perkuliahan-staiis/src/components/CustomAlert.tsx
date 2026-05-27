/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface CustomAlertProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose?: () => void;
}

export function CustomAlert({ message, type, onClose }: CustomAlertProps) {
  if (!message) return null;

  const bgClass =
    type === 'success'
      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
      : type === 'error'
      ? 'bg-rose-50 border-rose-200 text-rose-800'
      : 'bg-amber-50 border-amber-200 text-amber-900';

  const iconColor =
    type === 'success' ? 'text-emerald-600' : type === 'error' ? 'text-rose-600' : 'text-amber-700';

  return (
    <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border shadow-xs animate-fade-in ${bgClass}`}>
      <div className="flex items-center gap-2.5">
        {type === 'success' ? (
          <CheckCircle2 className={`w-4.5 h-4.5 ${iconColor} shrink-0`} />
        ) : type === 'error' ? (
          <AlertCircle className={`w-4.5 h-4.5 ${iconColor} shrink-0`} />
        ) : (
          <Info className={`w-4.5 h-4.5 ${iconColor} shrink-0`} />
        )}
        <p>{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/5 rounded-full text-slate-400 hover:text-slate-600 transition"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
