/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { KindoraIcon } from './KindoraLogo';
import { Play, Sparkles, Star, GraduationCap, Shield, BookOpen, Brain, PawPrint } from 'lucide-react';

export const HeroLanding: React.FC = () => {
  const { playSound, speak, openLoginModal, openRegisterModal } = useApp();

  const handleStart = () => {
    playSound('pop');
    speak('¡Bienvenidos a Kindora! Donde la imaginación vuela.');
    openLoginModal();
  };

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] flex flex-col justify-center overflow-hidden bg-[#f7fafe]">
      {/* Background Soft Glows & Ambient Floating Bubbles */}
      <div className="absolute top-12 left-10 w-72 h-72 bg-[#cde5ff]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#ffd9e1]/40 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#ffdcbb]/30 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Hero Section Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Typography & Action Controls */}
          <div className="lg:col-span-6 flex flex-col gap-6 sm:gap-8 text-left">
            
            {/* Top Brand Pill Tag */}
            <div className="inline-flex items-center gap-2 self-start px-4 py-1.5 rounded-full bg-white/90 border border-sky-100 shadow-xs backdrop-blur-xs">
              <div className="w-5 h-5 rounded-full bg-sky-100 flex items-center justify-center">
                <KindoraIcon className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#006399]">
                Plataforma Educativa para 3 a 5 años
              </span>
            </div>

            {/* Display Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-extrabold text-[#181c1f] leading-[1.12] tracking-tight font-display">
                Donde la <span className="text-[#006399]">imaginación</span> vuela
              </h1>
              
              <p
                id="hero-description"
                className="text-lg sm:text-xl text-[#3f4851] leading-relaxed max-w-xl font-medium"
              >
                Aprender y jugar se unen en Kindora. Únete a nuestra mascota exploradora en aventuras diseñadas para despertar la curiosidad y la creatividad de los más pequeños.
              </p>
            </div>

            {/* Action Buttons with Bubbly 3D Styling */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                id="hero-cta"
                onClick={handleStart}
                className="px-8 py-4 rounded-full bg-[#006399] hover:bg-[#005380] text-white font-black text-lg sm:text-xl shadow-[0_5px_0_#004a75] hover:shadow-[0_4px_0_#004a75] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                <Play className="w-6 h-6 fill-white group-hover:scale-110 transition-transform" />
                <span>¡Empezar a jugar!</span>
              </button>

              <button
                id="hero-custom-profile-btn"
                onClick={() => {
                  playSound('pop');
                  openRegisterModal();
                }}
                className="px-6 py-4 rounded-full bg-white hover:bg-[#f1f4f8] text-[#181c1f] border-2 border-[#bec7d3]/60 hover:border-[#006399]/50 font-bold text-base sm:text-lg shadow-[0_4px_0_#bec7d3] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <Sparkles className="w-5 h-5 text-[#fe9d00]" />
                <span>Personalizar perfil</span>
              </button>
            </div>

            {/* Interactive Quick Mascot Selector Row */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                Conoce a tus compañeros de aventura:
              </span>
              <div
                id="hero-pets"
                className="flex items-center gap-3"
              >
                {[
                  { icon: '🐼', name: 'Bambú' },
                  { icon: '🦖', name: 'Rexy' },
                  { icon: '🐰', name: 'Copito' },
                  { icon: '🐱', name: 'Misi' },
                ].map((pet) => (
                  <button
                    key={pet.name}
                    onClick={() => {
                      playSound('pop');
                      speak(`¡Hola, soy ${pet.name}!`);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-full shadow-2xs hover:border-sky-300 hover:scale-105 transition-all text-xs font-bold text-slate-700 cursor-pointer"
                    title={`Saludar a ${pet.name}`}
                  >
                    <span className="text-lg">{pet.icon}</span>
                    <span>{pet.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Hero Visual with Ambient Floating Badges */}
          <div className="lg:col-span-6 relative flex justify-center items-center">
            
            {/* Soft Ambient Halo Blur Background */}
            <div className="absolute inset-0 bg-[#cde5ff]/50 rounded-full blur-3xl -z-10 transform scale-110" />

            {/* Main Visual Container */}
            <div className="relative w-full max-w-[560px] rounded-[2.5rem] p-2 bg-white/60 backdrop-blur-xs border-2 border-white shadow-2xl">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBcR3QWkqAc9hQFthHadrY52QzBKU1B2VCVhM1QRY8qT0jrBZZ9Gc0ZyvPnaMednlrmR0K6sKlsd1jQ-AX2qc-dKtGSNfnzv5ml35Y1c69kdaa8JkF3OxNcu42J0U5XkhBpnaYWBJA9bgJXFhaPk2fSFqpaVUGMBzA6NGslCEwD3mllY3xKfovu-k7R84GIgD4sBVgEYL31VKwamXcWSyOtzKzMaTSuRI38aVMNzI2EhnZVlNZ2-ia-u7B5ErysoofA"
                alt="Niños explorando y aprendiendo en Kindora"
                className="w-full h-auto object-cover rounded-[2rem] shadow-md"
              />

              {/* Floating Badge 1: Top-Left "¡Divertido!" */}
              <div className="absolute -top-3 sm:top-6 -left-2 sm:-left-6 bg-white rounded-full px-4 py-2 shadow-lg border border-pink-100 flex items-center gap-2 animate-float">
                <div className="w-7 h-7 rounded-full bg-[#ffd9e1] flex items-center justify-center text-[#ac2a5d]">
                  <Star className="w-4 h-4 fill-[#f96799] text-[#ac2a5d]" strokeWidth={2.2} />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#181c1f]">¡Divertido!</span>
              </div>

              {/* Floating Badge 2: Bottom-Right "Educativo" */}
              <div
                className="absolute -bottom-3 sm:bottom-8 -right-2 sm:-right-6 bg-white rounded-full px-4 py-2 shadow-lg border border-amber-100 flex items-center gap-2 animate-float"
                style={{ animationDelay: '1.8s' }}
              >
                <div className="w-7 h-7 rounded-full bg-[#ffdcbb] flex items-center justify-center text-[#885200]">
                  <GraduationCap className="w-4 h-4 text-[#fe9d00]" strokeWidth={2.2} />
                </div>
                <span className="text-xs sm:text-sm font-black text-[#181c1f]">Educativo</span>
              </div>

              {/* Floating Badge 3: Center Bottom "100% Seguro" */}
              <div className="hidden sm:flex absolute bottom-2 left-8 bg-white/90 backdrop-blur-md rounded-full px-3.5 py-1.5 shadow-md border border-emerald-100 items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-950">100% Seguro y sin anuncios</span>
              </div>
            </div>

          </div>

        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-12 mt-8 border-t border-[#e0e3e7]/80 text-left">
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-sky-100 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-[#006399] flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-[#181c1f]">Vocales y Letras</p>
              <p className="text-xs text-[#3f4851] font-medium">Reconocimiento fonético y visual</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-amber-100 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#fe9d00] flex items-center justify-center shrink-0">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-[#181c1f]">Lógica y Memoria</p>
              <p className="text-xs text-[#3f4851] font-medium">Juegos de cartas y concentración</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-pink-100 shadow-2xs">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 text-[#f96799] flex items-center justify-center shrink-0">
              <PawPrint className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-black text-[#181c1f]">Mascota Virtual</p>
              <p className="text-xs text-[#3f4851] font-medium">Aliméntala, cuídala y vístela</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
