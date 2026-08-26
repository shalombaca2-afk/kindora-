/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { KindoraAvatar } from './KindoraAvatar';
import { getAvatarById } from '../data/avatarsData';
import { User, Mail, Shield, LogOut, Award, Star, CheckCircle2 } from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { user, badges, setShowLogoutModal, playSound } = useApp();

  const avatarInfo = getAvatarById(user?.avatarId || 'avatar_01');

  const getPetEmoji = () => {
    switch (user?.petType) {
      case 'dino':
        return '🦖 Dinosaurio';
      case 'rabbit':
        return '🐰 Conejito';
      case 'cat':
        return '🐱 Gatito';
      default:
        return '🐼 Panda';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 id="profile-section-title" className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
            <span>👤</span> Mi perfil Kindora
          </h1>
          <p className="text-base font-semibold text-slate-500 mt-1">
            Información del explorador, avatar vectorizado y medallas de aprendizaje.
          </p>
        </div>

        <button
          onClick={() => {
            playSound('pop');
            setShowLogoutModal(true);
          }}
          className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-sm rounded-2xl border border-rose-200 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>

      {/* Child Card */}
      <div className="bg-gradient-to-r from-[#006399] via-[#0284c7] to-[#38bdf8] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-100 flex flex-col sm:flex-row items-center gap-6">
        <div className="shrink-0 bg-white/20 p-2 rounded-3xl backdrop-blur-xs border-2 border-white/40">
          <KindoraAvatar avatarId={user?.avatarId || 'avatar_01'} size="xl" />
        </div>
        <div className="space-y-1 text-center sm:text-left">
          <span className="text-xs font-black uppercase tracking-wider text-white bg-white/25 px-3 py-1 rounded-full inline-block">
            Avatar: {avatarInfo.name} ({avatarInfo.id})
          </span>
          <h2 className="text-3xl sm:text-4xl font-black">{user?.childName || 'Pequeño explorador'}</h2>
          <p className="text-white/95 text-sm font-semibold">
            {user?.childAge || 4} años • Mascota compañera: {getPetEmoji()} ({user?.petName || 'Bambú'})
          </p>
        </div>
      </div>

      {/* Family Account Details Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 id="profile-family-heading" className="text-2xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span>👨‍👩‍👧</span> Cuenta del Tutor y Seguridad Cloud
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tutor */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span id="profile-label-tutor" className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#006399]" /> Tutor Responsable:
            </span>
            <span className="text-base font-black text-slate-800">
              {user?.parentName || 'Tutor Responsable'}
            </span>
          </div>

          {/* Email */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span id="profile-label-email" className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#006399]" /> Correo Verificado (OTP):
            </span>
            <span className="text-base font-black text-slate-800 truncate block">
              {user?.parentEmail || 'familia@ejemplo.com'}
            </span>
          </div>

          {/* Auth Provider */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span id="profile-label-auth-provider" className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" /> Método de Autenticación:
            </span>
            <span className="text-base font-black text-slate-800 capitalize flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Firebase Auth ({user?.authProvider || 'Google'})
            </span>
          </div>

          {/* Pet */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span id="profile-label-pet" className="text-xs font-bold text-[#334155] flex items-center gap-1.5">
              🐾 Mascota Virtual:
            </span>
            <span className="text-base font-black text-slate-800">
              {getPetEmoji()} ({user?.petName || 'Bambú'})
            </span>
          </div>
        </div>
      </div>

      {/* Badges Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h3 id="profile-badges-heading" className="text-2xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Award className="w-6 h-6 text-amber-500" />
          <span>Medallas y Logros de {user?.childName || 'Explorador'}</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div
              key={badge.id}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center text-center space-y-2 transition-transform hover:scale-105 ${
                badge.unlocked
                  ? 'bg-amber-50/60 border-amber-200 text-amber-950 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
              }`}
            >
              <div className="text-3xl">{badge.icon}</div>
              <span className="text-xs font-extrabold line-clamp-1">{badge.title}</span>
              <p className="text-[11px] font-medium text-slate-500 line-clamp-2 leading-tight">
                {badge.description}
              </p>
              {badge.unlocked && (
                <span className="text-[10px] font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                  ¡Desbloqueada!
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
