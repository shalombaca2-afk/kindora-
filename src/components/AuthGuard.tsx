/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';
import { KindoraLogo } from './KindoraLogo';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * ProtectedRoute / AuthGuard
 * Provides an authentic loading state while fetching Firestore user & child profile.
 * When the profile exists, keeps the user on their active view / dashboard without kicking back to landing (/),
 * or renders children seamlessly.
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ children, fallback = null }) => {
  const { user, isAuthInitializing, authLoading, onboardingStep } = useApp();

  // 1. Loading State while Firebase Auth initializes and Firestore profile is fetched
  if (isAuthInitializing) {
    return (
      <div
        id="auth-guard-loading-container"
        className="min-h-screen flex flex-col items-center justify-center bg-[#f7fafe] p-4 text-center select-none"
      >
        <div className="bg-white/90 backdrop-blur-md p-8 sm:p-10 rounded-3xl border-2 border-sky-100 shadow-xl max-w-sm w-full flex flex-col items-center space-y-5 animate-in fade-in zoom-in duration-300">
          <div className="relative">
            <KindoraLogo size="lg" />
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-amber-900 rounded-full p-1.5 shadow-md animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Cargando tu aventura...
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Obteniendo tu perfil de Kindora
            </p>
          </div>

          {/* Animated bouncy dots */}
          <div className="flex items-center gap-2 pt-2">
            <div className="w-3 h-3 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]" />
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-bounce [animation-delay:-0.15s]" />
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  // 2. If profile exists and user is authenticated in completed state, render protected content
  if (user && onboardingStep === 'completed') {
    return <>{children}</>;
  }

  // 3. Unauthenticated / onboarding fallback
  return <>{fallback}</>;
};

export const ProtectedRoute = AuthGuard;
export default AuthGuard;
