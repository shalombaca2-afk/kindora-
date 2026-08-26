import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  Home,
  BookOpen,
  Brain,
  PawPrint,
  ShoppingBag,
  User,
  Users,
  Settings,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

const mobileItems: NavItem[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'learn', label: 'Aprender', icon: BookOpen },
  { id: 'memory', label: 'Memoria', icon: Brain },
  { id: 'pet', label: 'Mi mascota', icon: PawPrint },
  { id: 'shop', label: 'Tienda', icon: ShoppingBag },
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'parents', label: 'Padres', icon: Users },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, playSound } = useApp();

  const handleNav = (tab: ActiveTab) => {
    playSound('pop');
    setActiveTab(tab);
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 px-1 py-1.5 shadow-lg overflow-x-auto">
      <div className="flex items-center justify-around min-w-[340px] px-1">
        {mobileItems.slice(0, 5).map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition-all cursor-pointer ${
                isActive
                  ? 'text-[#ea580c] font-black scale-105'
                  : 'text-[#333333] font-semibold hover:text-[#ea580c]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  isActive ? 'bg-orange-100 text-[#ea580c]' : 'text-slate-600'
                }`}
              >
                <Icon className="w-4.5 h-4.5" strokeWidth={isActive ? 2.3 : 1.9} />
              </div>
              <span className="text-[10px] mt-0.5 whitespace-nowrap">{item.label}</span>
              {isActive && <div className="w-1.5 h-1.5 bg-[#f97316] rounded-full mt-0.5" />}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
