/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/HomeView';
import { LearnView } from './components/LearnView';
import { MemoryView } from './components/MemoryView';
import { PetView } from './components/PetView';
import { ShopView } from './components/ShopView';
import { ParentsView } from './components/ParentsView';
import { ProfileView } from './components/ProfileView';
import { SettingsView } from './components/SettingsView';
import { HeroLanding } from './components/HeroLanding';
import { SocialLoginModal } from './components/SocialLoginModal';
import { EmailCaptureScreen } from './components/EmailCaptureScreen';
import { OtpVerificationScreen } from './components/OtpVerificationScreen';
import { ChildOnboardingForm } from './components/ChildOnboardingForm';
import { AuthGuard } from './components/AuthGuard';
import { LogOut } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    user,
    logout,
    showLogoutModal,
    setShowLogoutModal,
    showSocialModal,
    setShowSocialModal,
    openLoginModal,
    openRegisterModal,
    onboardingStep,
    pendingTutorEmail,
    pendingProvider,
    otpExpiresAt,
    authLoading,
    authError,
    startSocialLogin,
    submitCapturedEmail,
    verifyOtpCode,
    resendOtp,
    completeChildProfile,
    firebaseUser,
    isAuthInitializing,
  } = useApp();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Loading State while Firestore profile and Auth are initializing
  if (isAuthInitializing) {
    return <AuthGuard>{null}</AuthGuard>;
  }

  // STEP 2a: Intermediate Email Capture Screen (if social provider omitted email)
  if (onboardingStep === 'email_capture') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7fafe] font-sans text-[#181c1f] antialiased">
        <Header onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
        <main className="flex-1">
          <EmailCaptureScreen
            providerName={pendingProvider}
            onSubmitEmail={submitCapturedEmail}
            loading={authLoading}
            errorMessage={authError}
          />
        </main>
      </div>
    );
  }

  // STEP 2b: Blocking 6-digit OTP Verification Screen (10-min expiration)
  if (onboardingStep === 'otp_verify') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7fafe] font-sans text-[#181c1f] antialiased">
        <Header onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
        <main className="flex-1">
          <OtpVerificationScreen
            email={pendingTutorEmail}
            expiresAt={otpExpiresAt}
            onVerify={verifyOtpCode}
            onResendOtp={resendOtp}
            loading={authLoading}
            errorMessage={authError}
          />
        </main>
      </div>
    );
  }

  // STEP 3: Child Profile Registration Form (20 Vector Avatars, Age Group & Companion Pet)
  if (onboardingStep === 'child_profile') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7fafe] font-sans text-[#181c1f] antialiased">
        <Header onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
        <main className="flex-1">
          <ChildOnboardingForm
            tutorEmail={pendingTutorEmail || firebaseUser?.email || 'tutor@ejemplo.com'}
            tutorUid={firebaseUser?.uid || 'uid'}
            onSubmit={completeChildProfile}
            loading={authLoading}
            errorMessage={authError}
          />
        </main>
      </div>
    );
  }

  // STEP 0: Public Hero Landing Page (when not authenticated / completed)
  if (!user || onboardingStep === 'landing') {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7fafe] font-sans text-[#181c1f] antialiased selection:bg-sky-200">
        <Header onOpenLogin={openLoginModal} onOpenRegister={openRegisterModal} />
        <main className="flex-1">
          <HeroLanding />
        </main>

        {/* Exclusive Social Login Modal with Google and Facebook */}
        <SocialLoginModal
          isOpen={showSocialModal}
          onClose={() => setShowSocialModal(false)}
          onSelectProvider={startSocialLogin}
          loading={authLoading}
          errorMessage={authError}
        />
      </div>
    );
  }

  // STEP 4: Authenticated & Verified Interactive Educational Game Shell
  return (
    <div className="min-h-screen flex bg-[#f7fafe] font-sans text-[#181c1f] antialiased selection:bg-orange-200">
      {/* Lateral Sidebar Navigation Panel */}
      <Sidebar isOpen={mobileSidebarOpen} onClose={() => setMobileSidebarOpen(false)} />

      {/* Backdrop overlay for mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
          aria-hidden="true"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        {/* Top Header */}
        <Header
          onOpenLogin={openLoginModal}
          onOpenRegister={openRegisterModal}
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* View Switcher with Age and Progress Adaptation */}
        <main className="flex-1 w-full animate-in fade-in duration-200">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'learn' && <LearnView />}
          {activeTab === 'memory' && <MemoryView />}
          {activeTab === 'pet' && <PetView />}
          {activeTab === 'shop' && <ShopView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'parents' && <ParentsView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-sm w-full border-2 border-slate-200 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto text-2xl">
              <LogOut className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-slate-800">¿Cerrar sesión?</h3>
              <p className="text-xs text-slate-500 font-medium">
                Tu progreso y medallas quedan guardados de forma segura en tu cuenta de {user.childName}.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                id="modal-confirm-logout-button"
                onClick={logout}
                className="flex-1 py-3 px-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-xs rounded-full shadow-[0_3px_0_#c2410c] active:translate-y-0.5 transition-all cursor-pointer"
              >
                Cerrar sesión
              </button>
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-full transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
};

export default App;
