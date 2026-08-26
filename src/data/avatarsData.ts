/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface VectorAvatar {
  id: string; // avatar_01 to avatar_20
  name: string;
  category: 'animals' | 'fantasy' | 'kids';
  bgGradient: string;
  borderColor: string;
  badge: string;
}

export const KINDORA_AVATARS: VectorAvatar[] = [
  // Animals (7)
  {
    id: 'avatar_01',
    name: 'Leo el León',
    category: 'animals',
    bgGradient: 'from-amber-300 to-orange-400',
    borderColor: '#f59e0b',
    badge: '🦁',
  },
  {
    id: 'avatar_02',
    name: 'Copito el Conejito',
    category: 'animals',
    bgGradient: 'from-pink-200 to-rose-300',
    borderColor: '#f43f5e',
    badge: '🐰',
  },
  {
    id: 'avatar_03',
    name: 'Bambú el Panda',
    category: 'animals',
    bgGradient: 'from-emerald-200 to-teal-400',
    borderColor: '#10b981',
    badge: '🐼',
  },
  {
    id: 'avatar_04',
    name: 'Rexy el Dinosaurio',
    category: 'animals',
    bgGradient: 'from-green-300 to-emerald-500',
    borderColor: '#059669',
    badge: '🦖',
  },
  {
    id: 'avatar_05',
    name: 'Zorro Astuto',
    category: 'animals',
    bgGradient: 'from-orange-300 to-amber-500',
    borderColor: '#ea580c',
    badge: '🦊',
  },
  {
    id: 'avatar_06',
    name: 'Búho Sabio',
    category: 'animals',
    bgGradient: 'from-sky-300 to-indigo-400',
    borderColor: '#0284c7',
    badge: '🦉',
  },
  {
    id: 'avatar_07',
    name: 'Koko el Koala',
    category: 'animals',
    bgGradient: 'from-slate-200 to-stone-400',
    borderColor: '#78716c',
    badge: '🐨',
  },

  // Fantasy Characters (5)
  {
    id: 'avatar_08',
    name: 'Dragón Chispa',
    category: 'fantasy',
    bgGradient: 'from-red-400 to-orange-500',
    borderColor: '#dc2626',
    badge: '🐲',
  },
  {
    id: 'avatar_09',
    name: 'Unicornio Estrella',
    category: 'fantasy',
    bgGradient: 'from-purple-300 to-pink-400',
    borderColor: '#c084fc',
    badge: '🦄',
  },
  {
    id: 'avatar_10',
    name: 'Astro Cosmonauta',
    category: 'fantasy',
    bgGradient: 'from-blue-400 to-indigo-600',
    borderColor: '#3b82f6',
    badge: '🚀',
  },
  {
    id: 'avatar_11',
    name: 'Hada Mágica',
    category: 'fantasy',
    bgGradient: 'from-fuchsia-300 to-purple-400',
    borderColor: '#d946ef',
    badge: '🧚',
  },
  {
    id: 'avatar_12',
    name: 'Capitán Pirata',
    category: 'fantasy',
    bgGradient: 'from-amber-400 to-yellow-600',
    borderColor: '#d97706',
    badge: '🏴‍☠️',
  },

  // Diverse Children (8)
  {
    id: 'avatar_13',
    name: 'Maya Exploradora',
    category: 'kids',
    bgGradient: 'from-amber-200 to-orange-300',
    borderColor: '#f59e0b',
    badge: '👧🏽',
  },
  {
    id: 'avatar_14',
    name: 'Lucas Risitas',
    category: 'kids',
    bgGradient: 'from-sky-200 to-blue-400',
    borderColor: '#0284c7',
    badge: '👦🏼',
  },
  {
    id: 'avatar_15',
    name: 'Sofía con Tiara',
    category: 'kids',
    bgGradient: 'from-rose-200 to-pink-400',
    borderColor: '#f43f5e',
    badge: '👧🏻',
  },
  {
    id: 'avatar_16',
    name: 'Diego con Gorra',
    category: 'kids',
    bgGradient: 'from-teal-200 to-cyan-400',
    borderColor: '#0d9488',
    badge: '👦🏽',
  },
  {
    id: 'avatar_17',
    name: 'Aaliyah con Coletas',
    category: 'kids',
    bgGradient: 'from-violet-200 to-purple-400',
    borderColor: '#9333ea',
    badge: '👧🏾',
  },
  {
    id: 'avatar_18',
    name: 'Kenji Científico',
    category: 'kids',
    bgGradient: 'from-emerald-200 to-lime-400',
    borderColor: '#16a34a',
    badge: '👦🏻',
  },
  {
    id: 'avatar_19',
    name: 'Chloe Aventurera',
    category: 'kids',
    bgGradient: 'from-amber-100 to-rose-300',
    borderColor: '#e11d48',
    badge: '👧🏼',
  },
  {
    id: 'avatar_20',
    name: 'Noah con Capucha',
    category: 'kids',
    bgGradient: 'from-cyan-300 to-blue-500',
    borderColor: '#006399',
    badge: '👦🏾',
  },
];

export const getAvatarById = (avatarId?: string): VectorAvatar => {
  if (!avatarId) return KINDORA_AVATARS[0];
  const found = KINDORA_AVATARS.find((a) => a.id === avatarId);
  return found || KINDORA_AVATARS[0];
};
