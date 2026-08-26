/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KindoraLogo } from './KindoraLogo';
import { Mail, Shield, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface EmailCaptureScreenProps {
  providerName: string;
  onSubmitEmail: (email: string) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

export const EmailCaptureScreen: React.FC<EmailCaptureScreenProps> = ({
  providerName,
  onSubmitEmail,
  loading,
  errorMessage,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmed = emailInput.trim();
    if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
      setLocalError('Por favor ingresa un correo electrónico válido (ej. tutor@gmail.com)');
      return;
    }

    await onSubmitEmail(trimmed);
  };

  return (
    <div
      id="email-capture-screen"
      className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#f7fafe]"
    >
      <div className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 max-w-md w-full border-2 border-sky-100 shadow-2xl space-y-6 text-left relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-100/70 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <KindoraLogo size="sm" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
            <Shield className="w-3.5 h-3.5" />
            <span>Paso 2 de 3 • Correo del Tutor</span>
          </div>
        </div>

        <div className="space-y-2">
          <h2 id="email-capture-heading" className="text-2xl sm:text-3xl font-extrabold text-[#181c1f]">
            Completa tu <span className="text-[#006399]">correo</span>
          </h2>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Tu cuenta de <strong className="text-slate-800 capitalize">{providerName}</strong> no compartió una dirección de correo electrónico pública. Ingresa el correo donde recibirás el código de seguridad de 6 dígitos.
          </p>
        </div>

        {(localError || errorMessage) && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{localError || errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
              Correo Electrónico del Tutor
            </label>
            <div className="relative">
              <input
                id="tutor-email-input"
                type="email"
                required
                autoFocus
                placeholder="ejemplo@correo.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-[#006399] focus:bg-white text-base font-bold text-slate-800 outline-hidden transition-all shadow-inner"
              />
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <button
            id="submit-tutor-email-btn"
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-extrabold text-base shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Enviando código...</span>
              </>
            ) : (
              <>
                <span>Continuar a verificación OTP</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
