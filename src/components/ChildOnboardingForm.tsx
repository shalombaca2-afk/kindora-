/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KindoraLogo } from './KindoraLogo';
import { KINDORA_AVATARS, getAvatarById } from '../data/avatarsData';
import { KindoraAvatar } from './KindoraAvatar';
import { PetType } from '../types';
import {
  Sparkles,
  User,
  Heart,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Smile,
  Flame,
  Star,
} from 'lucide-react';

interface ChildOnboardingFormProps {
  tutorEmail: string;
  tutorUid: string;
  onSubmit: (childData: {
    name: string;
    ageGroup: string;
    avatarId: string;
    petType: PetType;
    petCustomName: string;
  }) => Promise<void>;
  loading: boolean;
  errorMessage: string | null;
}

export const ChildOnboardingForm: React.FC<ChildOnboardingFormProps> = ({
  tutorEmail,
  tutorUid,
  onSubmit,
  loading,
  errorMessage,
}) => {
  const [childName, setChildName] = useState('');
  const [ageGroup, setAgeGroup] = useState<string>('4_anos');
  const [selectedAvatarId, setSelectedAvatarId] = useState<string>('avatar_01');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'animals' | 'fantasy' | 'kids'>('all');
  const [petType, setPetType] = useState<PetType>('panda');
  const [petCustomName, setPetCustomName] = useState('Bambú');
  const [validationError, setValidationError] = useState<string | null>(null);

  const filteredAvatars = KINDORA_AVATARS.filter((av) => {
    if (selectedCategory === 'all') return true;
    return av.category === selectedCategory;
  });

  const selectedAvatarData = getAvatarById(selectedAvatarId);

  const handlePetSelect = (type: PetType, defaultName: string) => {
    setPetType(type);
    if (!petCustomName || ['Bambú', 'Rexy', 'Copito', 'Misi'].includes(petCustomName)) {
      setPetCustomName(defaultName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const trimmedName = childName.trim();
    if (!trimmedName) {
      setValidationError('Por favor ingresa el nombre o apodo del pequeño explorador.');
      return;
    }

    if (!petCustomName.trim()) {
      setValidationError('Por favor asigna un nombre a la mascota compañera.');
      return;
    }

    await onSubmit({
      name: trimmedName,
      ageGroup,
      avatarId: selectedAvatarId,
      petType,
      petCustomName: petCustomName.trim(),
    });
  };

  return (
    <div
      id="child-onboarding-screen"
      className="min-h-[85vh] py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-[#f7fafe]"
    >
      <div
        id="child-onboarding-card"
        className="bg-white rounded-3xl sm:rounded-[2.5rem] p-6 sm:p-10 max-w-3xl w-full border-2 border-sky-100 shadow-2xl space-y-8 text-left relative overflow-hidden"
      >
        {/* Ambient Top Glows */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#fe9d00]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-[#006399]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <KindoraLogo size="sm" />
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-black">
            <Sparkles className="w-4 h-4 text-[#fe9d00]" />
            <span>Paso 3 de 3 • Perfil del Explorador</span>
          </div>
        </div>

        {/* Headline */}
        <div className="space-y-2">
          <h2 id="child-onboarding-title" className="text-3xl sm:text-4xl font-extrabold text-[#181c1f] tracking-tight">
            ¡Personaliza el perfil de <span className="text-[#006399]">tu pequeño</span>!
          </h2>
          <p className="text-sm font-semibold text-slate-500 leading-relaxed">
            Configura el avatar vectorizado exclusivo, el grupo de edad y la mascota virtual que lo acompañará en sus aventuras de aprendizaje.
          </p>
        </div>

        {(validationError || errorMessage) && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
            <span>{validationError || errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SECTION 1: Child Name & Age */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 bg-slate-50/80 p-5 rounded-3xl border border-slate-200">
            {/* Child Name */}
            <div className="sm:col-span-7 space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#006399]" />
                Nombre del Niño o Niña *
              </label>
              <input
                id="child-name-input"
                type="text"
                required
                maxLength={30}
                placeholder="Ej. Mateo, Sofía, Lucas..."
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#006399] text-base font-bold text-slate-800 outline-hidden shadow-inner transition-all"
              />
            </div>

            {/* Age Group */}
            <div className="sm:col-span-5 space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider block flex items-center gap-1.5">
                <Star className="w-4 h-4 text-[#fe9d00]" />
                Edad del Explorador
              </label>
              <select
                id="child-age-group-select"
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl bg-white border-2 border-slate-200 focus:border-[#006399] text-sm font-bold text-slate-800 outline-hidden shadow-inner transition-all cursor-pointer"
              >
                <option value="3_anos">3 años (Nivel Inicial)</option>
                <option value="4_anos">4 años (Nivel Intermedio)</option>
                <option value="5_anos">5 años (Nivel Preescolar)</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: 20 Vector Avatars Selection Grid */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="text-sm font-black text-slate-800 uppercase tracking-wider block flex items-center gap-2">
                  <Smile className="w-4 h-4 text-[#006399]" />
                  Selecciona uno de los 20 Avatares Vectoriales
                </label>
                <span className="text-xs font-semibold text-slate-500">
                  Animalitos, personajes de fantasía y niños diversos
                </span>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-white text-[#006399] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos (20)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('animals')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategory === 'animals'
                      ? 'bg-white text-[#006399] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Animales (7)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('fantasy')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategory === 'fantasy'
                      ? 'bg-white text-[#006399] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Fantasía (5)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('kids')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    selectedCategory === 'kids'
                      ? 'bg-white text-[#006399] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Niños (8)
                </button>
              </div>
            </div>

            {/* Selected Avatar Highlight Banner */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-sky-50 border border-sky-200">
              <KindoraAvatar avatarId={selectedAvatarId} size="lg" selected />
              <div>
                <span className="text-[11px] font-black uppercase text-[#006399] tracking-wider">
                  Avatar seleccionado:
                </span>
                <h4 className="text-base font-black text-slate-800">
                  {selectedAvatarData.name} ({selectedAvatarData.id})
                </h4>
              </div>
            </div>

            {/* 20 Avatar Interactive Grid */}
            <div
              id="avatars-selection-grid"
              className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-3 p-3 bg-slate-50 rounded-3xl border border-slate-200 max-h-64 overflow-y-auto"
            >
              {filteredAvatars.map((av) => (
                <button
                  type="button"
                  key={av.id}
                  id={`select-avatar-${av.id}`}
                  onClick={() => setSelectedAvatarId(av.id)}
                  title={`${av.name} (${av.id})`}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all cursor-pointer ${
                    selectedAvatarId === av.id
                      ? 'bg-white ring-3 ring-[#006399] shadow-md scale-105'
                      : 'hover:bg-white/80 hover:scale-105 opacity-80 hover:opacity-100'
                  }`}
                >
                  <KindoraAvatar avatarId={av.id} size="md" />
                  <span className="text-[10px] font-black text-slate-700 mt-1 truncate w-full text-center">
                    {av.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 3: Virtual Companion Pet Selection */}
          <div className="space-y-4">
            <div>
              <label className="text-sm font-black text-slate-800 uppercase tracking-wider block flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                Elige la Mascota Virtual de Acompañamiento
              </label>
              <span className="text-xs font-semibold text-slate-500">
                Tu mascota te dará pistas, celebrará tus logros y podrás cuidarla y vestirla
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Panda */}
              <button
                type="button"
                id="select-pet-panda"
                onClick={() => handlePetSelect('panda', 'Bambú')}
                className={`p-4 rounded-3xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  petType === 'panda'
                    ? 'border-[#006399] bg-sky-50 shadow-md ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-3xl shadow-inner">
                  🐼
                </div>
                <span className="text-sm font-extrabold text-slate-800">Panda</span>
                <span className="text-[11px] font-semibold text-slate-500">Tranquilo y comilón</span>
              </button>

              {/* Dino */}
              <button
                type="button"
                id="select-pet-dino"
                onClick={() => handlePetSelect('dino', 'Rexy')}
                className={`p-4 rounded-3xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  petType === 'dino'
                    ? 'border-[#006399] bg-sky-50 shadow-md ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-3xl shadow-inner">
                  🦖
                </div>
                <span className="text-sm font-extrabold text-slate-800">Dinosaurio</span>
                <span className="text-[11px] font-semibold text-slate-500">Curioso y fuerte</span>
              </button>

              {/* Rabbit */}
              <button
                type="button"
                id="select-pet-rabbit"
                onClick={() => handlePetSelect('rabbit', 'Copito')}
                className={`p-4 rounded-3xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  petType === 'rabbit'
                    ? 'border-[#006399] bg-sky-50 shadow-md ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl shadow-inner">
                  🐰
                </div>
                <span className="text-sm font-extrabold text-slate-800">Conejito</span>
                <span className="text-[11px] font-semibold text-slate-500">Rápido y alegre</span>
              </button>

              {/* Cat */}
              <button
                type="button"
                id="select-pet-cat"
                onClick={() => handlePetSelect('cat', 'Misi')}
                className={`p-4 rounded-3xl border-2 text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                  petType === 'cat'
                    ? 'border-[#006399] bg-sky-50 shadow-md ring-2 ring-sky-100'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-3xl shadow-inner">
                  🐱
                </div>
                <span className="text-sm font-extrabold text-slate-800">Gatito</span>
                <span className="text-[11px] font-semibold text-slate-500">Juguetón y tierno</span>
              </button>
            </div>

            {/* Custom Pet Name Input */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider sm:w-48 shrink-0">
                Nombre de la mascota:
              </label>
              <input
                id="custom-pet-name-input"
                type="text"
                required
                maxLength={20}
                value={petCustomName}
                onChange={(e) => setPetCustomName(e.target.value)}
                placeholder="Ej. Bambú, Rexy, Pelusa..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-white border-2 border-slate-200 focus:border-[#006399] text-sm font-bold text-slate-800 outline-hidden shadow-inner"
              />
            </div>
          </div>

          {/* Submit Profile Button */}
          <div className="pt-4 border-t border-slate-100">
            <button
              id="save-child-profile-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-black text-lg shadow-[0_5px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Guardando perfil...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-6 h-6 text-[#fe9d00]" />
                  <span>¡Listo! Entrar al Mundo Kindora</span>
                  <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
