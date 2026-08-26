/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { KindoraLogo } from './KindoraLogo';
import {
  ShieldCheck,
  Mail,
  Clock,
  RefreshCw,
  ArrowRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Inbox,
} from 'lucide-react';

interface OtpVerificationScreenProps {
  email: string;
  expiresAt: number; // 10 minutes expiry timestamp
  onVerify: (code: string) => Promise<boolean>;
  onResendOtp: () => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  email,
  expiresAt,
  onVerify,
  onResendOtp,
  loading,
  errorMessage,
}) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(30);
  const [resending, setResending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // 10-minute countdown calculation
  useEffect(() => {
    const calculateTimeLeft = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [expiresAt]);

  // 30s Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If user pasted or typed multiple digits
      const cleaned = value.replace(/\D/g, '').slice(0, 6);
      if (cleaned.length > 0) {
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = cleaned[i] || '';
        }
        setDigits(newDigits);
        const nextFocus = Math.min(cleaned.length, 5);
        inputRefs.current[nextFocus]?.focus();

        // If all 6 filled, trigger verification
        if (cleaned.length === 6) {
          submitCode(cleaned);
        }
      }
      return;
    }

    // Single digit input
    const cleanedDigit = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanedDigit;
    setDigits(newDigits);

    if (cleanedDigit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    const fullCode = newDigits.join('');
    if (fullCode.length === 6) {
      submitCode(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length > 0) {
      const newDigits = [...digits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pasted[i] || '';
      }
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();

      if (pasted.length === 6) {
        submitCode(pasted);
      }
    }
  };

  const submitCode = async (codeToSubmit?: string) => {
    const code = codeToSubmit || digits.join('');
    if (code.length !== 6) return;

    const ok = await onVerify(code);
    if (ok) {
      setIsSuccess(true);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    try {
      await onResendOtp();
      setResendCooldown(30);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setResending(false);
    }
  };

  return (
    <div
      id="otp-verification-screen"
      className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 bg-[#f7fafe] select-none"
    >
      <div
        id="otp-verification-card"
        className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 max-w-lg w-full border-2 border-sky-100 shadow-2xl space-y-6 text-left relative overflow-hidden"
      >
        {/* Decorative ambient bubble */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#006399]/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Progress Badge */}
        <div className="flex items-center justify-between">
          <KindoraLogo size="sm" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-[#006399] border border-sky-200 text-xs font-black">
            <ShieldCheck className="w-4 h-4 text-[#006399]" />
            <span>Paso 2 de 3 • Verificación OTP</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 id="otp-screen-title" className="text-2xl sm:text-3xl font-extrabold text-[#181c1f] tracking-tight">
            Código de seguridad <span className="text-[#006399]">OTP</span>
          </h2>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Hemos enviado un código aleatorio de 6 dígitos al correo electrónico del tutor:
          </p>
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm max-w-full truncate border border-slate-200">
            <Mail className="w-4 h-4 text-[#006399] shrink-0" />
            <span className="truncate">{email}</span>
          </div>
        </div>

        {/* Informative Email Reminder */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-sky-50/70 border border-sky-100 text-[#006399] text-xs font-semibold">
          <Inbox className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Revisa tu bandeja de entrada o carpeta de correo no deseado (spam). El código tiene una validez de 10 minutos.
          </span>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 6 Digit Input Group */}
        <div className="space-y-3">
          <label className="text-xs font-black text-slate-700 uppercase tracking-wider block">
            Ingresa los 6 dígitos del correo:
          </label>
          <div className="flex justify-between gap-2 sm:gap-3">
            {digits.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                id={`otp-input-digit-${idx + 1}`}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={loading || isSuccess}
                className={`w-11 h-14 sm:w-14 sm:h-16 text-center text-2xl sm:text-3xl font-black rounded-2xl border-2 transition-all outline-hidden ${
                  digit
                    ? 'border-[#006399] bg-sky-50/50 text-[#006399]'
                    : 'border-slate-200 bg-slate-50 text-slate-800'
                } focus:border-[#006399] focus:bg-white focus:ring-4 focus:ring-sky-100 shadow-inner`}
              />
            ))}
          </div>
        </div>

        {/* Expiration Timer & Resend Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <Clock className={`w-4 h-4 ${timeLeft < 60 ? 'text-rose-500 animate-pulse' : 'text-[#006399]'}`} />
            <span>
              Expira en:{' '}
              <strong className={timeLeft < 60 ? 'text-rose-600' : 'text-slate-800'}>
                {formatTime(timeLeft)}
              </strong>
            </span>
          </div>

          <button
            id="otp-resend-button"
            type="button"
            disabled={resendCooldown > 0 || resending || loading}
            onClick={handleResend}
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#006399] hover:text-[#004a75] disabled:text-slate-400 transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
            <span>
              {resendCooldown > 0
                ? `Reenviar en (${resendCooldown}s)`
                : resending
                ? 'Reenviando...'
                : 'Reenviar código por correo'}
            </span>
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          id="otp-verify-submit-btn"
          type="button"
          disabled={digits.join('').length !== 6 || loading || isSuccess}
          onClick={() => submitCode()}
          className="w-full py-4 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-extrabold text-base shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Verificando código...</span>
            </>
          ) : isSuccess ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              <span>¡Código verificado con éxito!</span>
            </>
          ) : (
            <>
              <span>Verificar y continuar al Paso 3</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        {/* Blocking Protection Note */}
        <p className="text-[11px] text-center text-slate-500 font-medium">
          🔒 Paso obligatorio por seguridad infantil: Este bloqueo protege la cuenta familiar antes de configurar el perfil.
        </p>
      </div>
    </div>
  );
};
