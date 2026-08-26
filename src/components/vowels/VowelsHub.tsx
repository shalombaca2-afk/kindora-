/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { VowelGameType, VowelLetter } from '../../types/educational';
import { PureVowelsGame } from './PureVowelsGame';
import { CompleteWordGame } from './CompleteWordGame';
import { InitialVowelGame } from './InitialVowelGame';
import { VowelDetectiveGame } from './VowelDetectiveGame';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

export const VowelsHub: React.FC = () => {
  const { user, addPoints, addCoins, playSound } = useApp();
  const [activeGame, setActiveGame] = useState<VowelGameType | null>(null);

  // Warm up cache and bank
  const loadProgress = () => {
    const userId = user?.uid || user?.id || 'guest';
    educationalFirestoreService.preloadDomainBank('vowels');
    educationalFirestoreService.preloadUserData(userId, 'vowels');
  };

  useEffect(() => {
    loadProgress();
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [user]);

  const handleWinExercise = async (xp: number, coins: number, _vowel: VowelLetter) => {
    addPoints(xp);
    addCoins(coins);
  };

  const handleStartGame = (game: VowelGameType) => {
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);
    const titles: Record<VowelGameType, string> = {
      pureVowels: 'Vocales Puras',
      completeWord: 'Completa la Palabra',
      initialVowel: '¿Con qué Vocal Empieza?',
      vowelDetective: 'Detective de Vocales',
    };
    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // If a minigame is active, render it
  if (activeGame === 'pureVowels') {
    return (
      <PureVowelsGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'completeWord') {
    return (
      <CompleteWordGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'initialVowel') {
    return (
      <InitialVowelGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'vowelDetective') {
    return (
      <VowelDetectiveGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome Banner for Vocales Module */}
      <div className="bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Módulo Educativo Oficial
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Aprende las 5 Vocales Mágicas
            </h1>
            <p className="text-sky-100 text-sm font-medium leading-relaxed">
              Explora sonidos, completa palabras y entrena tu discriminación auditiva con 4 minijuegos interactivos.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shadow-sm">
              <span className="text-2xl font-black text-amber-300 block">
                5 Vocales
              </span>
              <span className="text-[11px] font-extrabold text-sky-100 uppercase tracking-wider block mt-0.5">
                A • E • I • O • U
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Minigames Grid - Directly below banner */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          Selecciona un Minijuego de Vocales
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Minigame 1: Vocales Puras */}
          <div
            onClick={() => handleStartGame('pureVowels')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-sky-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  🔤
                </div>
                <span className="px-3 py-1 bg-sky-50 text-sky-700 font-extrabold text-xs rounded-full border border-sky-200">
                  Exploración
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-sky-600 transition-colors">
                  1. Vocales Puras
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Reconocimiento fonético, articulación silábica y asociación auditiva directa palabra por palabra.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">5 Vocales • Sílabas</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-sky-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 2: Completa la Palabra */}
          <div
            onClick={() => handleStartGame('completeWord')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-amber-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  🧩
                </div>
                <span className="px-3 py-1 bg-amber-50 text-amber-700 font-extrabold text-xs rounded-full border border-amber-200">
                  5 Niveles
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                  2. Completa la Palabra
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Descubre qué vocal falta (inicial, intermedia o final) y rellena los huecos con distractores válidos.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Reintento Formativo</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-amber-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 3: ¿Con qué Vocal Empieza? */}
          <div
            onClick={() => handleStartGame('initialVowel')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  🎯
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                  Oído Agudo
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  3. ¿Con qué Vocal Empieza?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Discriminación auditiva de sonido inicial con palabra oculta en niveles avanzados para entrenar el oído.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Entrenamiento Auditivo</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 4: Detective de Vocales */}
          <div
            onClick={() => handleStartGame('vowelDetective')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  🕵️
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full border border-purple-200">
                  Multi-Selección
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  4. Detective de Vocales
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Busca e identifica todas las vocales objetivo ocultas dentro de las letras de cada palabra.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Tokens Interactivos</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-purple-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
