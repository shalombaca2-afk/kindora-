/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { MagicPaletteGame } from './MagicPaletteGame';
import { ColorLabGame } from './ColorLabGame';
import { ObjectSorterGame } from './ObjectSorterGame';
import { ChameleonGame } from './ChameleonGame';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Palette,
  TestTube,
  Boxes,
  Trophy,
} from 'lucide-react';

export type ColorGameType = 'palette' | 'lab' | 'sorter' | 'chameleon';

export const ColorsHub: React.FC = () => {
  const { addPoints, addCoins, playSound } = useApp();
  const [activeGame, setActiveGame] = useState<ColorGameType | null>(null);

  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleWinExercise = async (xp: number, coins: number) => {
    addPoints(xp);
    addCoins(coins);
  };

  const handleStartGame = (game: ColorGameType) => {
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);

    const titles: Record<ColorGameType, string> = {
      palette: 'La Paleta Mágica',
      lab: 'Laboratorio de Mezclas',
      sorter: 'Clasificador de Objetos',
      chameleon: 'El Camaleón Escondido',
    };

    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // If a minigame is active, render it in full container mode
  if (activeGame === 'palette') {
    return (
      <MagicPaletteGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'lab') {
    return (
      <ColorLabGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'sorter') {
    return (
      <ObjectSorterGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'chameleon') {
    return (
      <ChameleonGame
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
      {/* Hero Welcome Banner for Colors Module (Warm Gradient) */}
      <div className="bg-gradient-to-r from-amber-500 via-rose-500 to-violet-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              MÓDULO EDUCATIVO OFICIAL
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Explora el Mundo de los Colores
            </h1>
            <p className="text-amber-100 text-sm font-medium leading-relaxed">
              Aprende colores primarios, mezclas y clasificacion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shadow-sm">
              <span className="text-2xl font-black text-amber-300 block">
                🎨 ✨
              </span>
              <span className="text-[11px] font-extrabold text-amber-100 uppercase tracking-wider block mt-0.5">
                Colores • Mezclas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Minigames Grid - Directly below banner */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-rose-600" />
          📖 Selecciona un Minijuego de Colores
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Minigame 1: La Paleta Mágica */}
          <div
            onClick={() => handleStartGame('palette')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-cyan-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform font-black">
                  <Palette className="w-7 h-7 text-cyan-600" />
                </div>
                <span className="px-3 py-1 bg-cyan-50 text-cyan-700 font-extrabold text-xs rounded-full border border-cyan-200">
                  Exploración
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors">
                  1. La Paleta Mágica
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Toca colores para escuchar nombres y ver objetos reales de ese color.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Reconocimiento Visual</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 2: Laboratorio de Mezclas */}
          <div
            onClick={() => handleStartGame('lab')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  <TestTube className="w-7 h-7 text-emerald-600" />
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                  Descubrimiento
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  2. Laboratorio de Mezclas
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Mezcla colores primarios en un tubo de ensayo para crear secundarios.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Colores Secundarios</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 3: Clasificador de Objetos */}
          <div
            onClick={() => handleStartGame('sorter')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-orange-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  <Boxes className="w-7 h-7 text-orange-600" />
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 font-extrabold text-xs rounded-full border border-orange-200">
                  Asociación
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                  3. Clasificador de Objetos
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Arrastra objetos a la cesta de su color correspondiente.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Lógica y Clasificación</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-orange-600 group-hover:translate-x-1 transition-transform">
                Jugar <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>

          {/* Minigame 4: El Camaleón Escondido */}
          <div
            onClick={() => handleStartGame('chameleon')}
            className="bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  <Trophy className="w-7 h-7 text-purple-600" />
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full border border-purple-200">
                  Gamificado
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  4. El Camaleón Escondido
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Encuentra al camaleón del color solicitado antes de que expire el tiempo.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Reto de Rapidez</span>
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
