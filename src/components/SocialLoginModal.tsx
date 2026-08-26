/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SocialProviderType } from '../types';
import { KindoraLogo } from './KindoraLogo';
import {
  Shield,
  AlertCircle,
  Loader2,
  Lock,
  ChevronRight,
  Info,
} from 'lucide-react';

interface SocialLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProvider: (provider: SocialProviderType) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

export const SocialLoginModal: React.FC<SocialLoginModalProps> = ({
  isOpen,
  onClose,
  onSelectProvider,
  loading,
  errorMessage,
}) => {
  const [selectedProvider, setSelectedProvider] = useState<SocialProviderType | null>(null);

  if (!isOpen) return null;

  const handleProviderClick = async (provider: SocialProviderType) => {
    setSelectedProvider(provider);
    await onSelectProvider(provider);
  };

  const isOperationNotAllowed =
    errorMessage &&
    (errorMessage.toLowerCase().includes('aún no está habilitado') ||
      errorMessage.toLowerCase().includes('operation-not-allowed') ||
      errorMessage.toLowerCase().includes('firebase authentication console'));

  return (
    <div
      id="social-login-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="social-login-modal-card"
        className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full border-2 border-sky-100 shadow-2xl relative overflow-hidden space-y-6"
      >
        {/* Decorative ambient bubble */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-sky-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between">
          <KindoraLogo size="sm" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black">
            <Shield className="w-3.5 h-3.5" />
            <span>Paso 1 de 3 • Acceso Tutor</span>
          </div>
        </div>

        {/* Modal Headline */}
        <div className="text-left space-y-2">
          <h2 id="social-auth-heading" className="text-2xl sm:text-3xl font-extrabold text-[#181c1f] tracking-tight">
            Acceso seguro para <span className="text-[#006399]">tutores</span>
          </h2>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Para proteger a los pequeños, el acceso a Kindora se realiza mediante autenticación social verificada por Firebase.
          </p>
        </div>

        {/* Friendly Error / Notice Banner */}
        {errorMessage && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-semibold flex items-start gap-3 animate-in fade-in ${
              isOperationNotAllowed
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-rose-50 border-rose-200 text-rose-700'
            }`}
          >
            {isOperationNotAllowed ? (
              <Info className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            )}
            <div className="space-y-2 flex-1 text-left">
              <p className="font-bold leading-snug">{errorMessage}</p>
              {isOperationNotAllowed && selectedProvider !== 'google' && (
                <button
                  type="button"
                  onClick={() => handleProviderClick('google')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#006399] text-white rounded-xl text-xs font-extrabold shadow-xs hover:bg-[#005380] transition-colors cursor-pointer"
                >
                  <span>Continuar con Google</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Exclusively 2 Social Auth Providers (Google & Facebook) */}
        <div className="space-y-3 pt-1">
          {/* 1. Google Auth */}
          <button
            id="auth-provider-google"
            disabled={loading}
            onClick={() => handleProviderClick('google')}
            className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-[#006399] rounded-2xl font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer disabled:opacity-60 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <span className="font-extrabold text-slate-700 group-hover:text-[#006399]">
                Continuar con Google
              </span>
            </div>
            {loading && selectedProvider === 'google' ? (
              <Loader2 className="w-5 h-5 animate-spin text-[#006399]" />
            ) : (
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>

          {/* 2. Facebook Auth */}
          <button
            id="auth-provider-facebook"
            disabled={loading}
            onClick={() => handleProviderClick('facebook')}
            className="w-full py-3.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-2xl font-bold text-sm shadow-xs hover:shadow-md transition-all flex items-center justify-between cursor-pointer disabled:opacity-60 group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center">
                <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="font-extrabold text-white">Continuar con Facebook</span>
            </div>
            {loading && selectedProvider === 'facebook' ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : (
              <ChevronRight className="w-5 h-5 text-white/80 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>

        {/* Footer Security Notice */}
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Datos protegidos con Firebase</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
