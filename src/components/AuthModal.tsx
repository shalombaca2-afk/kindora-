/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AuthModalMode, PetType, RegisterFormData } from '../types';
import { KindoraLogo } from './KindoraLogo';
import { authStorage } from '../utils/authStorage';
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  KeyRound,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
  Heart,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthModalMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const {
    login,
    register,
    resetPassword,
    authModalMode,
    setAuthModalMode,
    playSound,
  } = useApp();

  // Mode state sync
  useEffect(() => {
    if (initialMode && isOpen) {
      setAuthModalMode(initialMode);
    }
  }, [initialMode, isOpen, setAuthModalMode]);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Register Form States
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState<number>(4);
  const [avatar, setAvatar] = useState('🧒');
  const [petType, setPetType] = useState<PetType>('panda');
  const [petName, setPetName] = useState('Bambú');
  const [username, setUsername] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState('¿Nombre de tu primera mascota?');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Password Recovery States
  const [recoveryIdentifier, setRecoveryIdentifier] = useState('');
  const [recoveryModeType, setRecoveryModeType] = useState<'code' | 'answer'>('code');
  const [recoveryCodeInput, setRecoveryCodeInput] = useState('');
  const [recoveryAnswerInput, setRecoveryAnswerInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [recoveryHintCode, setRecoveryHintCode] = useState<string | null>(null);
  const [recoveryQuestionFound, setRecoveryQuestionFound] = useState<string | null>(null);
  const [recoveryStep, setRecoveryStep] = useState<'request' | 'reset'>('request');

  // UI state
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Reset errors on mode switch
  useEffect(() => {
    setErrorMessage(null);
    setSuccessMessage(null);
  }, [authModalMode]);

  if (!isOpen) return null;

  const avatarOptions = ['🧒', '👧', '👶', '🧑', '🦸‍♂️', '🧚‍♀️', '🎨', '🚀', '🦁', '🐬'];

  const petOptions: { type: PetType; label: string; icon: string; defaultName: string; desc: string }[] = [
    { type: 'panda', label: 'Panda', icon: '🐼', defaultName: 'Bambú', desc: 'Cariñoso y calmado' },
    { type: 'dino', label: 'Dino', icon: '🦖', defaultName: 'Rexy', desc: 'Fuerte y valiente' },
    { type: 'rabbit', label: 'Conejito', icon: '🐰', defaultName: 'Copito', desc: 'Rápido y curioso' },
    { type: 'cat', label: 'Gatito', icon: '🐱', defaultName: 'Misi', desc: 'Juguetón y tierno' },
  ];

  // 1. Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Por favor ingresa tu usuario o correo electrónico.');
      playSound('pop');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Por favor ingresa tu contraseña.');
      playSound('pop');
      return;
    }

    setLoading(true);
    try {
      const res = await login(loginIdentifier.trim(), loginPassword);
      if (!res.success) {
        setErrorMessage(res.error || 'Credenciales no válidas.');
        playSound('pop');
      } else {
        onClose();
      }
    } catch {
      setErrorMessage('Ocurrió un error al procesar el inicio de sesión.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!childName.trim()) {
      setErrorMessage('Ingresa el nombre del niño o niña.');
      playSound('pop');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Elige un nombre de usuario para tu cuenta.');
      playSound('pop');
      return;
    }
    if (!parentEmail.trim()) {
      setErrorMessage('Ingresa el correo del tutor para la cuenta.');
      playSound('pop');
      return;
    }
    if (regPassword.length < 6) {
      setErrorMessage('La contraseña debe tener al menos 6 caracteres.');
      playSound('pop');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      playSound('pop');
      return;
    }

    setLoading(true);
    try {
      const formData: RegisterFormData = {
        childName: childName.trim(),
        childAge,
        username: username.trim().toLowerCase(),
        parentName: parentName.trim() || 'Familia Kindora',
        parentEmail: parentEmail.trim().toLowerCase(),
        password: regPassword,
        passwordConfirm: regPasswordConfirm,
        avatar,
        petType,
        petName: petName.trim() || 'Bambú',
        securityQuestion,
        securityAnswer: securityAnswer.trim() || petName.trim() || 'mascota',
      };

      const res = await register(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo crear la cuenta.');
        playSound('pop');
      } else {
        onClose();
      }
    } catch {
      setErrorMessage('Error al registrar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Password Recovery: Request Step
  const handleRecoveryRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!recoveryIdentifier.trim()) {
      setErrorMessage('Ingresa tu nombre de usuario o correo electrónico.');
      playSound('pop');
      return;
    }

    const info = authStorage.getAccountRecoveryInfo(recoveryIdentifier);
    if (!info.success || !info.account) {
      setErrorMessage(info.error || 'No encontramos ninguna cuenta con esos datos.');
      playSound('pop');
      return;
    }

    setRecoveryHintCode(info.recoveryCode || null);
    setRecoveryQuestionFound(info.question || '¿Nombre de tu primera mascota?');
    setRecoveryStep('reset');
    playSound('pop');
  };

  // 4. Handle Password Recovery: Reset Step
  const handleRecoveryReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const verificationVal = recoveryModeType === 'code' ? recoveryCodeInput : recoveryAnswerInput;
    if (!verificationVal.trim()) {
      setErrorMessage(
        recoveryModeType === 'code'
          ? 'Por favor ingresa el código de 6 dígitos.'
          : 'Por favor responde la pregunta de seguridad.'
      );
      playSound('pop');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('La nueva contraseña debe tener al menos 6 caracteres.');
      playSound('pop');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setErrorMessage('Las nuevas contraseñas no coinciden.');
      playSound('pop');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(
        recoveryIdentifier,
        verificationVal,
        newPassword,
        newPasswordConfirm,
        recoveryModeType
      );

      if (!res.success) {
        setErrorMessage(res.error || 'No se pudo restablecer la contraseña.');
        playSound('pop');
      } else {
        onClose();
      }
    } catch {
      setErrorMessage('Error al restablecer la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  // 5. Quick Demo Account Login
  const handleQuickDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await login('mateo_explorador', 'kindora123');
      if (res.success) {
        onClose();
      } else {
        // Fallback: create fresh demo account
        const demoData: RegisterFormData = {
          childName: 'Mateo',
          childAge: 4,
          username: `explorador_${Math.floor(100 + Math.random() * 900)}`,
          parentName: 'Familia Kindora',
          parentEmail: `familia_${Math.floor(100 + Math.random() * 900)}@kindora.app`,
          password: 'password123',
          passwordConfirm: 'password123',
          avatar: '🧒',
          petType: 'panda',
          petName: 'Bambú',
          securityQuestion: '¿Nombre de tu primera mascota?',
          securityAnswer: 'bambu',
        };
        await register(demoData);
        onClose();
      }
    } catch {
      setErrorMessage('Error al iniciar sesión de prueba.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="kindora-auth-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-lg bg-[#f7fafe] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border-2 border-[#ebeef2] overflow-hidden my-4 sm:my-8 text-left">
        
        {/* Playful Ambient Halos */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#f96799]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-[#1da1f2]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          id="auth-modal-close-button"
          onClick={() => {
            playSound('pop');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-white hover:bg-slate-100 rounded-full shadow-2xs transition-colors z-20 cursor-pointer border border-slate-200"
          aria-label="Cerrar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 sm:p-7 pb-4 bg-white border-b border-[#e0e3e7] relative z-10 flex flex-col items-center text-center">
          <KindoraLogo variant="horizontal" size="md" showSlogan={false} />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-[#ebeef2] rounded-full mt-4 w-full max-w-xs shadow-inner">
            <button
              id="tab-btn-login"
              type="button"
              onClick={() => {
                playSound('pop');
                setAuthModalMode('login');
              }}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                authModalMode === 'login'
                  ? 'bg-[#006399] text-white shadow-[0_2px_0_#004a75]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              id="tab-btn-register"
              type="button"
              onClick={() => {
                playSound('pop');
                setAuthModalMode('register');
              }}
              className={`flex-1 py-2 px-3 rounded-full text-xs font-bold transition-all cursor-pointer ${
                authModalMode === 'register'
                  ? 'bg-[#006399] text-white shadow-[0_2px_0_#004a75]'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registro
            </button>
          </div>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs font-bold animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 border-2 border-emerald-200 rounded-2xl flex items-start gap-2.5 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">{successMessage}</div>
          </div>
        )}

        {/* Main Body */}
        <div className="p-6 sm:p-7 pt-4 max-h-[75vh] overflow-y-auto custom-scrollbar">

          {/* ========================================================================= */}
          {/* MODE 1: LOGIN (INICIAR SESIÓN)                                            */}
          {/* ========================================================================= */}
          {authModalMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-display-lg text-2xl font-extrabold text-[#181c1f]">
                  ¡Hola de nuevo! 👋
                </h3>
                <p className="text-xs text-[#3f4851] font-medium mt-0.5">
                  Ingresa con tu usuario o correo para continuar jugando.
                </p>
              </div>

              {/* Username or Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-[#181c1f]">
                  Usuario o Correo del Tutor
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    id="login-input-identifier"
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Ej. mateo_explorador o correo@ejemplo.com"
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-2 border-[#bec7d3] focus:border-[#006399] focus:ring-2 focus:ring-[#cde5ff] focus:outline-none text-sm font-semibold text-[#181c1f] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#181c1f]">
                    Contraseña
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      playSound('pop');
                      setAuthModalMode('recovery');
                    }}
                    className="text-[11px] font-bold text-[#006399] hover:underline cursor-pointer"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="login-input-password"
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-11 py-3 bg-white rounded-2xl border-2 border-[#bec7d3] focus:border-[#006399] focus:ring-2 focus:ring-[#cde5ff] focus:outline-none text-sm font-semibold text-[#181c1f] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showLoginPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  id="login-remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded-md text-[#006399] border-slate-300 focus:ring-[#006399] cursor-pointer"
                />
                <label htmlFor="login-remember-me" className="text-xs font-semibold text-slate-600 cursor-pointer">
                  Recordar mi cuenta en este dispositivo
                </label>
              </div>

              {/* Submit Button (Pill & Tactile) */}
              <button
                id="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-bold text-sm shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>

              {/* Separator */}
              <div className="relative flex items-center justify-center my-3">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-[#f7fafe] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  o acceso rápido
                </span>
              </div>

              {/* Demo Account 1-Click login */}
              <button
                id="demo-account-login-button"
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-3 px-4 rounded-full bg-white hover:bg-slate-50 text-[#181c1f] font-bold text-xs border-2 border-[#e0e3e7] hover:border-[#006399] shadow-2xs active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>🐼 Entrar con cuenta de Mateo (Demo)</span>
              </button>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <span className="text-xs text-slate-500 font-medium">
                  ¿No tienes una cuenta aún?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    setAuthModalMode('register');
                  }}
                  className="text-xs font-bold text-[#006399] hover:underline cursor-pointer"
                >
                  Regístrate aquí
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: REGISTER (REGISTRO COMPLETO)                                      */}
          {/* ========================================================================= */}
          {authModalMode === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-5">
              <div className="text-center">
                <h3 className="font-display-lg text-2xl font-extrabold text-[#181c1f]">
                  Crea la cuenta de tu pequeño 🚀
                </h3>
                <p className="text-xs text-[#3f4851] font-medium mt-0.5">
                  Personaliza su avatar, mascota virtual y datos de acceso seguro.
                </p>
              </div>

              {/* Section 1: Child Information */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#e0e3e7] space-y-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#006399] uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-[#006399]" />
                  <span>1. Perfil del Pequeño Explorador</span>
                </div>

                {/* Child Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181c1f]">
                    Nombre del niño o niña *
                  </label>
                  <input
                    id="register-input-child-name"
                    type="text"
                    required
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Ej. Mateo, Valentina, Lucas..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#006399] focus:outline-none text-sm font-semibold text-slate-800"
                  />
                </div>

                {/* Age Selector */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#181c1f]">
                    Edad (Kindora adapta las actividades) *
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 4, 5, 6].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => {
                          playSound('pop');
                          setChildAge(age);
                        }}
                        className={`py-2 px-1 rounded-xl font-bold text-xs transition-all border-2 cursor-pointer text-center ${
                          childAge === age
                            ? 'bg-[#006399] text-white border-[#004a75] shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-sky-300'
                        }`}
                      >
                        {age} {age === 6 ? 'años +' : 'años'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Avatar Picker */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-[#181c1f]">
                    Elige un avatar divertido
                  </label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {avatarOptions.map((av) => (
                      <button
                        key={av}
                        type="button"
                        onClick={() => {
                          playSound('pop');
                          setAvatar(av);
                        }}
                        className={`p-2 rounded-xl text-xl transition-all border-2 cursor-pointer flex items-center justify-center ${
                          avatar === av
                            ? 'bg-amber-100 border-[#fe9d00] scale-105 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {av}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 2: Virtual Mascot Selection */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#e0e3e7] space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-black text-[#885200] uppercase tracking-wider">
                    <span>🐾 2. Mascota Virtual de Acompañamiento</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {petOptions.map((opt) => (
                    <button
                      key={opt.type}
                      type="button"
                      onClick={() => {
                        playSound('pet');
                        setPetType(opt.type);
                        setPetName(opt.defaultName);
                      }}
                      className={`p-2.5 rounded-2xl flex flex-col items-center gap-1 border-2 cursor-pointer transition-all ${
                        petType === opt.type
                          ? 'bg-amber-50 border-[#fe9d00] shadow-xs ring-2 ring-amber-200'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <span className="text-xs font-extrabold text-slate-800">{opt.label}</span>
                      <span className="text-[9px] text-slate-500 text-center leading-tight">{opt.desc}</span>
                    </button>
                  ))}
                </div>

                {/* Pet Name input */}
                <div className="space-y-1 pt-1">
                  <label className="block text-[11px] font-bold text-slate-600">
                    Nombre personalizado para la mascota:
                  </label>
                  <input
                    id="register-input-pet-name"
                    type="text"
                    value={petName}
                    onChange={(e) => setPetName(e.target.value)}
                    placeholder="Ej. Bambú, Rexy..."
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 focus:border-[#fe9d00] focus:outline-none text-xs font-semibold text-slate-700"
                  />
                </div>
              </div>

              {/* Section 3: Parent & Account Security */}
              <div className="p-4 bg-white rounded-2xl border-2 border-[#e0e3e7] space-y-3 shadow-2xs">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#006399] uppercase tracking-wider">
                  <Shield className="w-3.5 h-3.5 text-[#006399]" />
                  <span>3. Datos de Acceso y Tutor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#181c1f]">
                      Nombre de Usuario *
                    </label>
                    <input
                      id="register-input-username"
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      placeholder="Ej. lucas_123"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#006399] focus:outline-none text-xs font-semibold text-slate-800"
                    />
                  </div>

                  {/* Parent Name */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#181c1f]">
                      Nombre del Tutor
                    </label>
                    <input
                      id="register-input-parent-name"
                      type="text"
                      value={parentName}
                      onChange={(e) => setParentName(e.target.value)}
                      placeholder="Ej. María García"
                      className="w-full px-3 py-2 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#006399] focus:outline-none text-xs font-semibold text-slate-800"
                    />
                  </div>
                </div>

                {/* Parent Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#181c1f]">
                    Correo electrónico del tutor *
                  </label>
                  <input
                    id="register-input-parent-email"
                    type="email"
                    required
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="correo.tutor@ejemplo.com"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#006399] focus:outline-none text-xs font-semibold text-slate-800"
                  />
                </div>

                {/* Password & Password Confirm */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#181c1f]">
                      Contraseña (mín 6) *
                    </label>
                    <div className="relative">
                      <input
                        id="register-input-password"
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 rounded-xl border-2 border-slate-200 focus:border-[#006399] focus:outline-none text-xs font-semibold text-slate-800"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-[#181c1f]">
                        Confirmar *
                      </label>
                      {regPasswordConfirm && (
                        <span
                          className={`text-[10px] font-bold ${
                            regPassword === regPasswordConfirm ? 'text-emerald-600' : 'text-rose-500'
                          }`}
                        >
                          {regPassword === regPasswordConfirm ? '✓ Coinciden' : '✗ Distintas'}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="register-input-password-confirm"
                        type={showRegPasswordConfirm ? 'text' : 'password'}
                        required
                        value={regPasswordConfirm}
                        onChange={(e) => setRegPasswordConfirm(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full pl-3 pr-8 py-2 bg-slate-50 rounded-xl border-2 focus:outline-none text-xs font-semibold text-slate-800 ${
                          regPasswordConfirm && regPassword !== regPasswordConfirm
                            ? 'border-rose-300 focus:border-rose-500'
                            : 'border-slate-200 focus:border-[#006399]'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
                        className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showRegPasswordConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security Question for Password Recovery */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Pregunta de seguridad (para recuperar tu contraseña)
                  </label>
                  <select
                    value={securityQuestion}
                    onChange={(e) => setSecurityQuestion(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                  >
                    <option value="¿Nombre de tu primera mascota?">¿Nombre de tu primera mascota?</option>
                    <option value="¿Ciudad donde nació tu hijo?">¿Ciudad donde nació tu hijo?</option>
                    <option value="¿Color favorito de la familia?">¿Color favorito de la familia?</option>
                  </select>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="Respuesta secreta"
                    className="w-full px-3 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                id="register-submit-button"
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 rounded-full bg-[#f97316] hover:bg-[#ea580c] text-white font-extrabold text-sm shadow-[0_4px_0_#c2410c] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-yellow-200" />
                    <span>¡Crear Cuenta y Empezar a Jugar!</span>
                  </>
                )}
              </button>

              {/* Switch back to Login */}
              <div className="text-center pt-1">
                <span className="text-xs text-slate-500 font-medium">
                  ¿Ya tienes una cuenta registrada?{' '}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    setAuthModalMode('login');
                  }}
                  className="text-xs font-bold text-[#006399] hover:underline cursor-pointer"
                >
                  Inicia sesión aquí
                </button>
              </div>
            </form>
          )}

          {/* ========================================================================= */}
          {/* MODE 3: PASSWORD RECOVERY (RECUPERACIÓN DE CONTRASEÑA)                    */}
          {/* ========================================================================= */}
          {authModalMode === 'recovery' && (
            <div className="space-y-4">
              <div className="text-center mb-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-2">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h3 className="font-display-lg text-2xl font-extrabold text-[#181c1f]">
                  Recuperación de Contraseña 🔐
                </h3>
                <p className="text-xs text-[#3f4851] font-medium mt-0.5">
                  Restablece el acceso a la cuenta familiar de Kindora.
                </p>
              </div>

              {recoveryStep === 'request' && (
                <form onSubmit={handleRecoveryRequest} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#181c1f]">
                      Ingresa tu usuario o correo electrónico registrado:
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        id="recovery-input-identifier"
                        type="text"
                        required
                        value={recoveryIdentifier}
                        onChange={(e) => setRecoveryIdentifier(e.target.value)}
                        placeholder="mateo_explorador o correo@ejemplo.com"
                        className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border-2 border-slate-300 focus:border-[#006399] focus:outline-none text-sm font-semibold text-slate-800"
                      />
                    </div>
                  </div>

                  <button
                    id="recovery-request-button"
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-bold text-sm shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Buscar Cuenta y Continuar</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {recoveryStep === 'reset' && (
                <form onSubmit={handleRecoveryReset} className="space-y-4">
                  {/* Account Found Banner & Simulation Helper */}
                  <div className="p-3.5 bg-sky-50 border-2 border-sky-200 rounded-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between font-black text-[#006399]">
                      <span>Cuenta identificada: {recoveryIdentifier}</span>
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                    </div>
                    {recoveryHintCode && (
                      <div className="p-2 bg-white rounded-xl border border-sky-200 flex items-center justify-between text-[11px]">
                        <span className="text-slate-600">Código de seguridad generado:</span>
                        <span className="font-black text-sky-800 tracking-wider bg-sky-100 px-2 py-0.5 rounded-md">
                          {recoveryHintCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Mode selector: Code vs Question */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setRecoveryModeType('code')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                        recoveryModeType === 'code'
                          ? 'bg-[#006399] text-white border-[#004a75]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Usar Código (6 dígitos)
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecoveryModeType('answer')}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl border-2 transition-all cursor-pointer ${
                        recoveryModeType === 'answer'
                          ? 'bg-[#006399] text-white border-[#004a75]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Pregunta de Seguridad
                    </button>
                  </div>

                  {/* Verification Input */}
                  {recoveryModeType === 'code' ? (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Código de recuperación (6 dígitos):
                      </label>
                      <input
                        id="recovery-input-code"
                        type="text"
                        maxLength={6}
                        required
                        value={recoveryCodeInput}
                        onChange={(e) => setRecoveryCodeInput(e.target.value)}
                        placeholder="Ej. 748291"
                        className="w-full px-4 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-center font-black tracking-widest text-lg focus:border-[#006399] focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        {recoveryQuestionFound || 'Pregunta de seguridad:'}
                      </label>
                      <input
                        id="recovery-input-answer"
                        type="text"
                        required
                        value={recoveryAnswerInput}
                        onChange={(e) => setRecoveryAnswerInput(e.target.value)}
                        placeholder="Escribe tu respuesta"
                        className="w-full px-3.5 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-xs font-semibold focus:border-[#006399] focus:outline-none"
                      />
                    </div>
                  )}

                  {/* New Password & Confirmation */}
                  <div className="space-y-2 pt-1 border-t border-slate-200">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Nueva Contraseña (mín 6 caracteres):
                      </label>
                      <div className="relative">
                        <input
                          id="recovery-input-new-pass"
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-3 pr-8 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-xs font-semibold focus:border-[#006399] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400"
                        >
                          {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Confirmar Nueva Contraseña:
                      </label>
                      <input
                        id="recovery-input-new-pass-confirm"
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPasswordConfirm}
                        onChange={(e) => setNewPasswordConfirm(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2.5 bg-white rounded-xl border-2 border-slate-300 text-xs font-semibold focus:border-[#006399] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Submit Reset */}
                  <button
                    id="recovery-reset-button"
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-bold text-sm shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    {loading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-yellow-300" />
                        <span>Guardar Contraseña y Entrar</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Back to Login */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound('pop');
                    setRecoveryStep('request');
                    setAuthModalMode('login');
                  }}
                  className="text-xs font-bold text-[#006399] hover:underline cursor-pointer"
                >
                  ← Volver a Iniciar sesión
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
