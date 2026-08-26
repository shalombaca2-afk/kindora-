/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { getAvatarById } from '../data/avatarsData';

interface KindoraAvatarProps {
  avatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBadge?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export const KindoraAvatar: React.FC<KindoraAvatarProps> = ({
  avatarId = 'avatar_01',
  size = 'md',
  className = '',
  showBadge = false,
  selected = false,
  onClick,
}) => {
  const avatar = getAvatarById(avatarId);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
    '2xl': 'w-28 h-28 text-5xl',
  }[size];

  const renderSvgArtwork = () => {
    switch (avatar.id) {
      // 01: Lion
      case 'avatar_01':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#F59E0B" />
            <circle cx="50" cy="50" r="38" fill="#FBBF24" />
            {/* Mane fluff */}
            <path d="M50 8C30 8 16 22 16 42C16 62 30 76 50 76C70 76 84 62 84 42C84 22 70 8 50 8Z" fill="#D97706" opacity="0.4" />
            {/* Ears */}
            <circle cx="28" cy="28" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
            <circle cx="28" cy="28" r="5" fill="#FDE68A" />
            <circle cx="72" cy="28" r="10" fill="#F59E0B" stroke="#D97706" strokeWidth="2.5" />
            <circle cx="72" cy="28" r="5" fill="#FDE68A" />
            {/* Face base */}
            <circle cx="50" cy="52" r="30" fill="#FEF3C7" />
            {/* Eyes */}
            <circle cx="40" cy="48" r="4.5" fill="#1E293B" />
            <circle cx="41.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            <circle cx="60" cy="48" r="4.5" fill="#1E293B" />
            <circle cx="61.5" cy="46.5" r="1.5" fill="#FFFFFF" />
            {/* Nose & Mouth */}
            <polygon points="50,56 44,52 56,52" fill="#B45309" />
            <path d="M44 60Q50 66 56 60" stroke="#B45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Cheeks */}
            <ellipse cx="34" cy="56" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />
            <ellipse cx="66" cy="56" rx="4" ry="2.5" fill="#FCA5A5" opacity="0.6" />
          </svg>
        );

      // 02: Bunny
      case 'avatar_02':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FCE7F3" />
            {/* Ears */}
            <ellipse cx="36" cy="24" rx="7" ry="18" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
            <ellipse cx="36" cy="24" rx="3.5" ry="12" fill="#FBCFE8" />
            <ellipse cx="64" cy="24" rx="7" ry="18" fill="#FFFFFF" stroke="#F472B6" strokeWidth="2" />
            <ellipse cx="64" cy="24" rx="3.5" ry="12" fill="#FBCFE8" />
            {/* Face */}
            <circle cx="50" cy="56" r="32" fill="#FFFFFF" stroke="#F472B6" strokeWidth="1.5" />
            {/* Eyes */}
            <circle cx="39" cy="52" r="4" fill="#831843" />
            <circle cx="40.5" cy="50.5" r="1.5" fill="#FFFFFF" />
            <circle cx="61" cy="52" r="4" fill="#831843" />
            <circle cx="62.5" cy="50.5" r="1.5" fill="#FFFFFF" />
            {/* Nose */}
            <polygon points="50,60 46,56 54,56" fill="#F472B6" />
            <path d="M46 64Q50 68 54 64" stroke="#F472B6" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Cheeks */}
            <circle cx="33" cy="59" r="4.5" fill="#FDA4AF" opacity="0.7" />
            <circle cx="67" cy="59" r="4.5" fill="#FDA4AF" opacity="0.7" />
          </svg>
        );

      // 03: Panda
      case 'avatar_03':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#E2E8F0" />
            {/* Ears */}
            <circle cx="28" cy="26" r="11" fill="#1E293B" />
            <circle cx="72" cy="26" r="11" fill="#1E293B" />
            {/* Face */}
            <circle cx="50" cy="54" r="34" fill="#FFFFFF" />
            {/* Eye Patches */}
            <ellipse cx="37" cy="50" rx="8" ry="11" fill="#1E293B" transform="rotate(-15 37 50)" />
            <circle cx="37" cy="50" r="3.5" fill="#FFFFFF" />
            <circle cx="38" cy="49" r="1.5" fill="#1E293B" />
            <ellipse cx="63" cy="50" rx="8" ry="11" fill="#1E293B" transform="rotate(15 63 50)" />
            <circle cx="63" cy="50" r="3.5" fill="#FFFFFF" />
            <circle cx="62" cy="49" r="1.5" fill="#1E293B" />
            {/* Nose & Smile */}
            <ellipse cx="50" cy="62" rx="4" ry="2.5" fill="#1E293B" />
            <path d="M46 67Q50 71 54 67" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Cheeks */}
            <ellipse cx="30" cy="62" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
            <ellipse cx="70" cy="62" rx="4" ry="2" fill="#F472B6" opacity="0.6" />
          </svg>
        );

      // 04: Dino
      case 'avatar_04':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#D1FAE5" />
            {/* Crest spikes */}
            <polygon points="50,14 44,24 56,24" fill="#059669" />
            <polygon points="34,22 30,32 40,30" fill="#059669" />
            <polygon points="66,22 60,30 70,32" fill="#059669" />
            {/* Head */}
            <rect x="22" y="26" width="56" height="54" rx="24" fill="#10B981" />
            {/* Snout belly */}
            <path d="M30 54Q50 76 70 54" fill="#6EE7B7" opacity="0.8" />
            {/* Eyes */}
            <circle cx="38" cy="44" r="5" fill="#FFFFFF" />
            <circle cx="38" cy="44" r="2.5" fill="#064E3B" />
            <circle cx="62" cy="44" r="5" fill="#FFFFFF" />
            <circle cx="62" cy="44" r="2.5" fill="#064E3B" />
            {/* Nostrils & Smile */}
            <circle cx="45" cy="58" r="1.5" fill="#047857" />
            <circle cx="55" cy="58" r="1.5" fill="#047857" />
            <path d="M42 66Q50 72 58 66" stroke="#047857" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Little tooth */}
            <polygon points="46,66 48,70 50,66" fill="#FFFFFF" />
          </svg>
        );

      // 05: Fox
      case 'avatar_05':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FFEDD5" />
            {/* Ears */}
            <polygon points="24,40 18,16 42,28" fill="#EA580C" />
            <polygon points="26,36 22,22 38,30" fill="#1E293B" />
            <polygon points="76,40 82,16 58,28" fill="#EA580C" />
            <polygon points="74,36 78,22 62,30" fill="#1E293B" />
            {/* Head */}
            <circle cx="50" cy="52" r="32" fill="#F97316" />
            {/* White face patches */}
            <path d="M22 56C22 56 34 68 50 78C66 68 78 56 78 56C78 72 66 82 50 82C34 82 22 72 22 56Z" fill="#FFFFFF" />
            {/* Eyes */}
            <ellipse cx="38" cy="48" rx="4" ry="3" fill="#1E293B" />
            <ellipse cx="62" cy="48" rx="4" ry="3" fill="#1E293B" />
            {/* Nose */}
            <circle cx="50" cy="68" r="3.5" fill="#1E293B" />
          </svg>
        );

      // 06: Owl
      case 'avatar_06':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
            {/* Body */}
            <circle cx="50" cy="52" r="36" fill="#0284C7" />
            {/* Tuft ears */}
            <polygon points="26,24 38,32 28,40" fill="#0369A1" />
            <polygon points="74,24 62,32 72,40" fill="#0369A1" />
            {/* Big glasses eye circles */}
            <circle cx="38" cy="48" r="14" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
            <circle cx="38" cy="48" r="6" fill="#1E293B" />
            <circle cx="40" cy="46" r="2" fill="#FFFFFF" />
            <circle cx="62" cy="48" r="14" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2.5" />
            <circle cx="62" cy="48" r="6" fill="#1E293B" />
            <circle cx="64" cy="46" r="2" fill="#FFFFFF" />
            <line x1="50" y1="48" x2="50" y2="48" stroke="#F59E0B" strokeWidth="3" />
            {/* Beak */}
            <polygon points="50,60 45,54 55,54" fill="#F59E0B" />
          </svg>
        );

      // 07: Koala
      case 'avatar_07':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#F1F5F9" />
            {/* Big fluffy ears */}
            <circle cx="22" cy="36" r="15" fill="#94A3B8" />
            <circle cx="22" cy="36" r="9" fill="#E2E8F0" />
            <circle cx="78" cy="36" r="15" fill="#94A3B8" />
            <circle cx="78" cy="36" r="9" fill="#E2E8F0" />
            {/* Head */}
            <circle cx="50" cy="54" r="32" fill="#CBD5E1" />
            {/* Big Oval Nose */}
            <ellipse cx="50" cy="56" rx="9" ry="13" fill="#334155" />
            <ellipse cx="48" cy="52" rx="2.5" ry="4" fill="#64748B" opacity="0.6" />
            {/* Eyes */}
            <circle cx="34" cy="46" r="3.5" fill="#1E293B" />
            <circle cx="66" cy="46" r="3.5" fill="#1E293B" />
            {/* Cheeks */}
            <circle cx="29" cy="58" r="4" fill="#FDA4AF" opacity="0.6" />
            <circle cx="71" cy="58" r="4" fill="#FDA4AF" opacity="0.6" />
          </svg>
        );

      // 08: Dragon
      case 'avatar_08':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FEE2E2" />
            {/* Horns */}
            <path d="M30 36Q24 14 36 18" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M70 36Q76 14 64 18" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Head */}
            <circle cx="50" cy="54" r="32" fill="#EF4444" />
            <path d="M36 68Q50 82 64 68" fill="#FCD34D" />
            {/* Eyes */}
            <circle cx="38" cy="46" r="4.5" fill="#FEF08A" stroke="#B91C1C" strokeWidth="1" />
            <circle cx="38" cy="46" r="2.5" fill="#1E293B" />
            <circle cx="62" cy="46" r="4.5" fill="#FEF08A" stroke="#B91C1C" strokeWidth="1" />
            <circle cx="62" cy="46" r="2.5" fill="#1E293B" />
            {/* Cute mini puff of smoke/spark */}
            <circle cx="50" cy="64" r="2" fill="#991B1B" />
            <circle cx="44" cy="64" r="2" fill="#991B1B" />
            <circle cx="56" cy="64" r="2" fill="#991B1B" />
          </svg>
        );

      // 09: Unicorn
      case 'avatar_09':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#F3E8FF" />
            {/* Golden Horn */}
            <polygon points="50,6 44,28 56,28" fill="#F59E0B" stroke="#D97706" strokeWidth="1" />
            <line x1="47" y1="14" x2="53" y2="14" stroke="#FDE68A" strokeWidth="1.5" />
            <line x1="45" y1="21" x2="55" y2="21" stroke="#FDE68A" strokeWidth="1.5" />
            {/* Rainbow mane strands */}
            <path d="M26 30C26 30 30 18 42 22" stroke="#EC4899" strokeWidth="3" strokeLinecap="round" />
            <path d="M74 30C74 30 70 18 58 22" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
            {/* Head */}
            <circle cx="50" cy="54" r="32" fill="#FFFFFF" stroke="#E9D5FF" strokeWidth="2" />
            {/* Sweet eyes */}
            <path d="M34 50Q40 44 44 50" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M56 50Q60 44 66 50" stroke="#4C1D95" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Stars & Cheeks */}
            <circle cx="34" cy="58" r="4" fill="#F472B6" opacity="0.6" />
            <circle cx="66" cy="58" r="4" fill="#F472B6" opacity="0.6" />
            <path d="M46 66Q50 70 54 66" stroke="#EC4899" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 10: Astro Cosmonaut
      case 'avatar_10':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#DBEAFE" />
            {/* Helmet */}
            <circle cx="50" cy="50" r="36" fill="#F8FAFC" stroke="#94A3B8" strokeWidth="2.5" />
            {/* Visor */}
            <rect x="24" y="32" width="52" height="36" rx="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
            {/* Visor cosmic reflection */}
            <path d="M30 42C38 36 62 36 70 42" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
            <circle cx="64" cy="46" r="3" fill="#FCD34D" />
            {/* Cute antenna */}
            <line x1="50" y1="14" x2="50" y2="4" stroke="#94A3B8" strokeWidth="3" strokeLinecap="round" />
            <circle cx="50" cy="4" r="3.5" fill="#EF4444" />
          </svg>
        );

      // 11: Fairy
      case 'avatar_11':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FAE8FF" />
            {/* Magic wings */}
            <ellipse cx="22" cy="44" rx="14" ry="18" fill="#E879F9" opacity="0.4" transform="rotate(-20 22 44)" />
            <ellipse cx="78" cy="44" rx="14" ry="18" fill="#E879F9" opacity="0.4" transform="rotate(20 78 44)" />
            {/* Hair */}
            <circle cx="50" cy="46" r="32" fill="#D946EF" />
            {/* Face */}
            <circle cx="50" cy="54" r="24" fill="#FED7AA" />
            {/* Tiara */}
            <polygon points="50,26 44,34 56,34" fill="#FDE047" />
            <circle cx="50" cy="25" r="2" fill="#EC4899" />
            {/* Eyes */}
            <circle cx="42" cy="52" r="3" fill="#701A75" />
            <circle cx="58" cy="52" r="3" fill="#701A75" />
            <path d="M46 62Q50 66 54 62" stroke="#C026D3" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 12: Pirate
      case 'avatar_12':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
            {/* Pirate Hat */}
            <path d="M16 38C16 38 30 18 50 18C70 18 84 38 84 38C84 38 68 32 50 32C32 32 16 38 16 38Z" fill="#1E293B" />
            <circle cx="50" cy="26" r="3" fill="#F59E0B" />
            {/* Face */}
            <circle cx="50" cy="56" r="28" fill="#FCD34D" />
            {/* Eye patch */}
            <circle cx="38" cy="52" r="4" fill="#1E293B" />
            <line x1="22" y1="42" x2="52" y2="58" stroke="#1E293B" strokeWidth="2" />
            {/* Normal eye */}
            <circle cx="62" cy="52" r="4" fill="#1E293B" />
            <circle cx="63" cy="50" r="1.5" fill="#FFFFFF" />
            {/* Smirk */}
            <path d="M44 68Q54 70 60 64" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 13: Maya Explorer Girl
      case 'avatar_13':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FEF3C7" />
            {/* Braids */}
            <circle cx="20" cy="56" r="9" fill="#451A03" />
            <circle cx="80" cy="56" r="9" fill="#451A03" />
            <circle cx="50" cy="46" r="32" fill="#451A03" />
            {/* Face */}
            <circle cx="50" cy="54" r="26" fill="#D97706" opacity="0.9" />
            {/* Explorer Hat */}
            <ellipse cx="50" cy="28" rx="28" ry="8" fill="#B45309" />
            <rect x="32" y="16" width="36" height="14" rx="6" fill="#D97706" />
            {/* Eyes */}
            <circle cx="41" cy="54" r="3.5" fill="#1E293B" />
            <circle cx="59" cy="54" r="3.5" fill="#1E293B" />
            <path d="M44 64Q50 68 56 64" stroke="#451A03" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 14: Lucas Curly Boy
      case 'avatar_14':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
            {/* Curly hair bubbles */}
            <circle cx="30" cy="30" r="12" fill="#B45309" />
            <circle cx="50" cy="24" r="14" fill="#B45309" />
            <circle cx="70" cy="30" r="12" fill="#B45309" />
            <circle cx="24" cy="44" r="10" fill="#B45309" />
            <circle cx="76" cy="44" r="10" fill="#B45309" />
            {/* Face */}
            <circle cx="50" cy="54" r="26" fill="#FFEDD5" />
            {/* Eyes */}
            <circle cx="40" cy="52" r="3.5" fill="#1E293B" />
            <circle cx="60" cy="52" r="3.5" fill="#1E293B" />
            <path d="M42 64Q50 72 58 64" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <circle cx="34" cy="58" r="3" fill="#FDA4AF" opacity="0.6" />
            <circle cx="66" cy="58" r="3" fill="#FDA4AF" opacity="0.6" />
          </svg>
        );

      // 15: Sofia Headband Girl
      case 'avatar_15':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FFE4E6" />
            {/* Hair */}
            <circle cx="50" cy="52" r="32" fill="#1C1917" />
            {/* Headband */}
            <path d="M22 46C22 28 78 28 78 46" stroke="#F43F5E" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="32" cy="28" r="4" fill="#FB7185" />
            {/* Face */}
            <circle cx="50" cy="56" r="24" fill="#FED7AA" />
            {/* Eyes */}
            <circle cx="42" cy="54" r="3.5" fill="#1C1917" />
            <circle cx="58" cy="54" r="3.5" fill="#1C1917" />
            <path d="M45 64Q50 68 55 64" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 16: Diego with Cap
      case 'avatar_16':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#CCFBF1" />
            {/* Cap */}
            <path d="M22 36C22 20 78 20 78 36Z" fill="#0D9488" />
            <path d="M50 36L86 38" stroke="#14B8A6" strokeWidth="5" strokeLinecap="round" />
            {/* Face */}
            <circle cx="50" cy="56" r="26" fill="#FDBA74" />
            {/* Hair sideburns */}
            <rect x="22" y="44" width="6" height="12" rx="3" fill="#18181B" />
            <rect x="72" y="44" width="6" height="12" rx="3" fill="#18181B" />
            {/* Eyes */}
            <circle cx="40" cy="54" r="3.5" fill="#18181B" />
            <circle cx="60" cy="54" r="3.5" fill="#18181B" />
            <path d="M42 66Q50 72 58 66" stroke="#9A3412" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 17: Aaliyah Ponytail
      case 'avatar_17':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#EDE9FE" />
            {/* High bun ponytail */}
            <circle cx="50" cy="18" r="14" fill="#18181B" />
            <circle cx="50" cy="26" r="5" fill="#A855F7" />
            {/* Face */}
            <circle cx="50" cy="54" r="26" fill="#78350F" opacity="0.9" />
            {/* Hair outline */}
            <circle cx="50" cy="48" r="30" fill="#18181B" />
            <circle cx="50" cy="56" r="24" fill="#92400E" />
            {/* Eyes */}
            <circle cx="41" cy="54" r="3.5" fill="#FFFFFF" />
            <circle cx="41" cy="54" r="2" fill="#18181B" />
            <circle cx="59" cy="54" r="3.5" fill="#FFFFFF" />
            <circle cx="59" cy="54" r="2" fill="#18181B" />
            <path d="M44 66Q50 70 56 66" stroke="#451A03" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 18: Kenji Scientist Glasses
      case 'avatar_18':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#DCFCE7" />
            {/* Hair */}
            <path d="M22 46C22 24 78 24 78 46Z" fill="#1E293B" />
            {/* Face */}
            <circle cx="50" cy="54" r="26" fill="#FFEDD5" />
            {/* Round Glasses */}
            <circle cx="39" cy="52" r="9" stroke="#16A34A" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.7" />
            <circle cx="39" cy="52" r="3" fill="#1E293B" />
            <circle cx="61" cy="52" r="9" stroke="#16A34A" strokeWidth="2.5" fill="#FFFFFF" fillOpacity="0.7" />
            <circle cx="61" cy="52" r="3" fill="#1E293B" />
            <line x1="48" y1="52" x2="52" y2="52" stroke="#16A34A" strokeWidth="2.5" />
            <path d="M44 66Q50 70 56 66" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 19: Chloe Beanie
      case 'avatar_19':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#FFE4E6" />
            {/* Beanie Hat */}
            <circle cx="50" cy="16" r="6" fill="#E11D48" />
            <path d="M22 40C22 18 78 18 78 40Z" fill="#F43F5E" />
            <rect x="20" y="36" width="60" height="8" rx="4" fill="#BE123C" />
            {/* Blonde Hair */}
            <circle cx="26" cy="54" r="8" fill="#FBBF24" />
            <circle cx="74" cy="54" r="8" fill="#FBBF24" />
            {/* Face */}
            <circle cx="50" cy="56" r="24" fill="#FFEDD5" />
            {/* Eyes */}
            <circle cx="41" cy="54" r="3.5" fill="#1E293B" />
            <circle cx="59" cy="54" r="3.5" fill="#1E293B" />
            <path d="M44 66Q50 70 56 66" stroke="#9A3412" strokeWidth="2" strokeLinecap="round" fill="none" />
          </svg>
        );

      // 20: Noah Hoodie
      case 'avatar_20':
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="46" fill="#E0F2FE" />
            {/* Hoodie rim */}
            <circle cx="50" cy="52" r="34" fill="#0284C7" />
            {/* Face */}
            <circle cx="50" cy="54" r="24" fill="#78350F" opacity="0.95" />
            {/* Eyes */}
            <circle cx="41" cy="52" r="3.5" fill="#FFFFFF" />
            <circle cx="41" cy="52" r="2" fill="#1E293B" />
            <circle cx="59" cy="52" r="3.5" fill="#FFFFFF" />
            <circle cx="59" cy="52" r="2" fill="#1E293B" />
            <path d="M43 64Q50 70 57 64" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Hoodie strings */}
            <line x1="42" y1="76" x2="42" y2="86" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
            <line x1="58" y1="76" x2="58" y2="86" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-2xl sm:rounded-3xl transition-all select-none ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${
        selected
          ? 'ring-4 ring-[#006399] shadow-md scale-105'
          : 'hover:shadow-xs'
      } ${className}`}
    >
      <div className="w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xs">
        {renderSvgArtwork()}
      </div>

      {showBadge && (
        <span className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md text-xs border border-slate-200">
          {avatar.badge}
        </span>
      )}
    </div>
  );
};
