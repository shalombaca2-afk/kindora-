import React from 'react';
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
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface NavItemConfig {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string;
}

export const navItems: NavItemConfig[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'learn', label: 'Aprender', icon: BookOpen },
  { id: 'memory', label: 'Memoria', icon: Brain },
  { id: 'pet', label: 'Mi mascota', icon: PawPrint },
  { id: 'shop', label: 'Tienda', icon: ShoppingBag },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'parents', label: 'Padres', icon: Users },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const {
    activeTab,
    setActiveTab,
    points,
    coins,
    activitiesCount,
    settings,
    updateSettings,
    user,
    playSound,
  } = useApp();

  const handleNavClick = (tabId: ActiveTab) => {
    playSound('pop');
    setActiveTab(tabId);
    if (onClose) {
      onClose();
    }
  };

  return (
    <aside
      className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-[#e5e9f0] shadow-sm flex flex-col justify-between transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Top Section: Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-100 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <KindoraLogo
            variant="horizontal"
            size="md"
            showSlogan={true}
            onClick={() => handleNavClick('home')}
          />
        </div>

        {/* Compact Currency & Progress Stats Pill */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <div
            id="sidebar-metric-points"
            className="flex items-center gap-2 px-3 py-2 bg-amber-50/90 border border-amber-200/80 rounded-2xl"
            title="Puntos de aprendizaje"
          >
            <div className="w-7 h-7 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-xs shadow-2xs">
              <Star className="w-4 h-4 fill-amber-950/20 text-amber-950" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider leading-tight">Puntos</span>
              <span className="text-sm font-black text-amber-950 leading-none truncate">{points}</span>
            </div>
          </div>

          <div
            id="sidebar-metric-coins"
            className="flex items-center gap-2 px-3 py-2 bg-orange-50/90 border border-orange-200/80 rounded-2xl"
            title="Monedas para premios"
          >
            <div className="w-7 h-7 rounded-xl bg-[#f97316] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              <Coins className="w-4 h-4 text-white" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider leading-tight">Monedas</span>
              <span className="text-sm font-black text-orange-950 leading-none truncate">{coins}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Section: Navigation Modules List */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-1.5 custom-scrollbar">
        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 font-sans">
          Módulos de navegación
        </div>

        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group cursor-pointer ${
                isActive
                  ? 'bg-orange-50 text-[#ea580c] border border-orange-200 shadow-2xs font-black'
                  : 'text-[#333333] hover:bg-orange-50/60 hover:text-[#ea580c] border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-[#f97316] text-white shadow-xs shadow-orange-300/40'
                      : 'bg-slate-100/90 text-slate-600 group-hover:bg-orange-100 group-hover:text-[#ea580c]'
                  }`}
                >
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.3 : 1.9} />
                </div>
                <span className="tracking-tight text-[15px]">{item.label}</span>
              </div>

              {isActive && (
                <div className="w-2 h-2 rounded-full bg-[#f97316] ring-4 ring-orange-100" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section: Active Profile & Sound Toggle */}
      <div className="p-3.5 border-t border-slate-100 bg-slate-50/60 space-y-2.5">
        {/* Child Profile Card */}
        <button
          onClick={() => handleNavClick('profile')}
          className="w-full flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-2xl hover:border-sky-300 transition-colors text-left cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-10 h-10 rounded-xl shrink-0 group-hover:scale-105 transition-transform">
              <KindoraAvatar avatarId={user?.avatarId || 'avatar_01'} size="sm" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-black text-slate-800 truncate">
                {user?.childName || 'Pequeño Explorador'}
              </span>
              <span className="text-[11px] font-medium text-slate-500 truncate">
                {user?.petName ? `Mascota: ${user.petName}` : 'Cuenta activa'}
              </span>
            </div>
          </div>

          <Sparkles className="w-4 h-4 text-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />
        </button>

        {/* Quick Audio & Settings bar */}
        <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-500 font-semibold">
          <span>Audio educativo</span>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
              settings.soundEnabled
                ? 'bg-sky-50 text-[#0284c7] border-sky-200'
                : 'bg-slate-100 text-slate-400 border-slate-200'
            }`}
          >
            {settings.soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Activado</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Silenciado</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
};
