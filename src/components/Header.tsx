/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { KindoraLogo } from './KindoraLogo';
import { KindoraAvatar } from './KindoraAvatar';
import {
  Home,
  BookOpen,
  Brain,
  PawPrint,
  ShoppingBag,
  User,
  Users,
  Settings,
  Star,
  Coins,
  Volume2,
  VolumeX,
  Menu,
  X,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  onOpenRegister?: () => void;
  onOpenLogin?: () => void;
  onToggleSidebar?: () => void;
}

const navItemsList: { id: ActiveTab; label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }> }[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'learn', label: 'Aprender', icon: BookOpen },
  { id: 'memory', label: 'Memoria', icon: Brain },
  { id: 'pet', label: 'Mi mascota', icon: PawPrint },
  { id: 'shop', label: 'Tienda', icon: ShoppingBag },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'parents', label: 'Padres', icon: Users },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export const Header: React.FC<HeaderProps> = ({
  onOpenRegister,
  onOpenLogin,
  onToggleSidebar,
}) => {
  const {
    activeTab,
    setActiveTab,
    points,
    coins,
    activitiesCount,
    settings,
    updateSettings,
    user,
    openLoginModal,
    openRegisterModal,
    setShowLogoutModal,
    playSound,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (tab: ActiveTab) => {
    playSound('pop');
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const getActiveTabTitle = () => {
    const found = navItemsList.find((i) => i.id === activeTab);
    return found ? found.label : 'Kindora';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#e5e9f0] shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Left: Mobile Toggle & Brand in Header */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                id="header-sidebar-toggle"
                onClick={() => {
                  if (onToggleSidebar) {
                    onToggleSidebar();
                  } else {
                    setMobileMenuOpen(!mobileMenuOpen);
                  }
                }}
                className="lg:hidden p-2 text-slate-700 hover:text-[#ea580c] hover:bg-orange-50 rounded-2xl transition-colors cursor-pointer border border-slate-200"
                aria-label="Abrir menú de navegación"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            {/* Brand Logo */}
            <div className={user ? 'lg:hidden' : 'flex items-center'}>
              <KindoraLogo
                variant="horizontal"
                size="sm"
                showSlogan={false}
                onClick={() => handleNav('home')}
              />
            </div>

            {/* Desktop Active Module Indicator for logged in users */}
            {user && (
              <div className="hidden lg:flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Módulo actual:
                </span>
                <span className="text-base font-black text-slate-800 flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-xl">
                  <span className="w-2 h-2 rounded-full bg-[#006399]" />
                  {getActiveTabTitle()}
                </span>
              </div>
            )}
          </div>

          {/* Right Section: Metrics & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                {/* Points (Amber-Orange) */}
                <div
                  id="metric-points-label"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/90 border border-amber-200 text-amber-900 rounded-2xl font-black text-xs sm:text-sm shadow-2xs"
                  title="Puntos acumulados"
                >
                  <Star className="w-4 h-4 text-amber-600 fill-amber-500" strokeWidth={2} />
                  <span>{points}</span>
                  <span className="hidden sm:inline text-[11px] font-bold text-amber-700 opacity-80">pts</span>
                </div>

                {/* Coins (Warm Amber) */}
                <div
                  id="metric-coins-label"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50/90 border border-orange-200 text-orange-950 rounded-2xl font-black text-xs sm:text-sm shadow-2xs"
                  title="Monedas para la tienda"
                >
                  <Coins className="w-4 h-4 text-[#f97316]" strokeWidth={2} />
                  <span>{coins}</span>
                </div>

                {/* Activities (Sky Blue) */}
                <div
                  id="metric-activities-label"
                  className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-sky-50/90 border border-sky-200 text-sky-950 rounded-2xl font-black text-xs sm:text-sm shadow-2xs"
                  title="Actividades completadas"
                >
                  <BookOpen className="w-4 h-4 text-[#006399]" strokeWidth={2} />
                  <span>{activitiesCount}</span>
                </div>

                {/* Sound audio toggle */}
                <button
                  id="header-sound-toggle"
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className="p-2 text-slate-500 hover:text-[#006399] bg-slate-100/90 hover:bg-sky-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
                  title={settings.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4.5 h-4.5 text-[#006399]" />
                  ) : (
                    <VolumeX className="w-4.5 h-4.5 text-slate-400" />
                  )}
                </button>

                {/* Profile Pill & Quick Logout */}
                <button
                  id="header-user-profile-button"
                  onClick={() => handleNav('profile')}
                  className="hidden sm:flex items-center gap-2 p-1.5 pr-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl transition-all cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-xl shrink-0">
                    <KindoraAvatar avatarId={user.avatarId || 'avatar_01'} size="sm" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-black text-slate-800 leading-tight truncate max-w-[100px]">
                      {user.childName}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 leading-none">
                      {user.childAge} años
                    </span>
                  </div>
                </button>
              </>
            ) : (
              /* Unauthenticated: Clean Kindora Design System buttons */
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Audio sound toggle */}
                <button
                  onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
                  className="p-2 text-slate-500 hover:text-[#006399] bg-slate-100 hover:bg-sky-50 border border-slate-200 rounded-full transition-colors cursor-pointer"
                  title={settings.soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-[#006399]" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Iniciar sesión Button */}
                <button
                  id="header-login-button"
                  onClick={() => {
                    if (onOpenLogin) onOpenLogin();
                    else openLoginModal();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#ebeef2] hover:bg-[#e0e3e7] text-[#181c1f] font-bold text-xs sm:text-sm transition-all active:translate-y-0.5 cursor-pointer"
                >
                  Iniciar sesión
                </button>

                {/* Registro Button */}
                <button
                  id="header-register-button"
                  onClick={() => {
                    if (onOpenRegister) onOpenRegister();
                    else openRegisterModal();
                  }}
                  className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-bold text-xs sm:text-sm shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  Registro
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && user && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5 px-1">
            Menú de navegación
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItemsList.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all text-left cursor-pointer border ${
                    isActive
                      ? 'bg-sky-50 text-[#006399] border-sky-200 font-black shadow-2xs'
                      : 'bg-slate-50/80 text-[#333333] border-slate-100 hover:bg-sky-50/50 hover:text-[#006399]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isActive ? 'bg-[#006399] text-white' : 'bg-white text-slate-600 border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" strokeWidth={isActive ? 2.2 : 1.8} />
                  </div>
                  <span className="text-[13px] tracking-tight">{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <span className="text-base">{user.avatar}</span> {user.childName} ({user.childAge} años)
            </span>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setShowLogoutModal(true);
              }}
              className="text-rose-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
