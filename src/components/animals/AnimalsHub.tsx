/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ANIMALES_DATA } from '../../data/learningData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { AnimalMazeGame } from './AnimalMazeGame';
import { AnimalPuzzleGame } from './AnimalPuzzleGame';
import { AnimalCamouflageGame } from './AnimalCamouflageGame';
import { AnimalSafariGame } from './AnimalSafariGame';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Compass,
  Puzzle,
  Eye,
  Backpack,
  Volume2,
} from 'lucide-react';

export type AnimalGameType = 'maze' | 'puzzle' | 'camouflage' | 'safari';

export const AnimalsHub: React.FC = () => {
  const { addPoints, addCoins, playSound, speak, incrementActivities } = useApp();
  const [activeGame, setActiveGame] = useState<AnimalGameType | null>(null);

  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleWinExercise = async (_xp: number, _coins: number) => {
    // Points and coins are awarded directly within each subgame component
  };

  const handleStartGame = (game: AnimalGameType) => {
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);

    const titles: Record<AnimalGameType, string> = {
      maze: 'Laberinto de Hábitats',
      puzzle: 'Rompecabezas Animal',
      camouflage: '¿Dónde está el Animal?',
      safari: 'Safari de Explorador',
    };

    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // If a subgame is active, render it in full container mode
  if (activeGame === 'maze') {
    return (
      <AnimalMazeGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'puzzle') {
    return (
      <AnimalPuzzleGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'camouflage') {
    return (
      <AnimalCamouflageGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'safari') {
    return (
      <AnimalSafariGame
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
      {/* 1. DASHBOARD HEADER (Amber/Emerald Gradient, rounded-3xl) */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                MÓDULO EDUCATIVO OFICIAL
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide">
                Animales • Hábitats
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              La Gran Aventura Animal
            </h1>
            <p className="text-amber-100 text-sm sm:text-base font-medium leading-relaxed">
              Explora hábitats, resuelve rompecabezas, descubre animales ocultos y supera el safari de preguntas.
            </p>
          </div>

          {/* Quick Animal Visual Strip */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-inner">
            {['🦁', '🐘', '🐧', '🐒', '🐬', '🦉'].map((emoji) => (
              <span
                key={emoji}
                className="text-2xl hover:scale-125 transition-transform select-none"
              >
                {emoji}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRID 2x2 (4 Minigame Cards) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            📖 Selecciona un Minijuego de Animales
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* CARD 1: Laberinto de Hábitats */}
          <div
            id="card-animal-game-maze"
            onClick={() => handleStartGame('maze')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-cyan-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full font-black text-xs">
                  Exploración
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors">
                  1. Laberinto de Hábitats
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Guide animals through dynamic mazes (d-pad/touch) to reach their matching biomes or foods (e.g., monkey -&gt; jungle, penguin -&gt; ice).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Navegación y Hábitats
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 group-hover:bg-cyan-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 2: Rompecabezas Animal */}
          <div
            id="card-animal-game-puzzle"
            onClick={() => handleStartGame('puzzle')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-emerald-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Puzzle className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs">
                  Asociación
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  2. Rompecabezas Animal
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Progressive puzzle assembly (4, 6, 9, 12 pieces) featuring silhouette teasers, animal TTS names, realistic sounds, and fun facts.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Motricidad y Formas
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 group-hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 3: ¿Dónde está el Animal? */}
          <div
            id="card-animal-game-camouflage"
            onClick={() => handleStartGame('camouflage')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Eye className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-black text-xs">
                  Observación
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                  3. ¿Dónde está el Animal?
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Visual camouflage search: locate hidden animals in dense biomes using progressive voice hints.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Percepción Visual
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 group-hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 4: Safari de Explorador */}
          <div
            id="card-animal-game-safari"
            onClick={() => handleStartGame('safari')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Backpack className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-black text-xs">
                  Gamificado
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  4. Safari de Explorador
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Combined challenge: pack backpack classification quests (e.g., &apos;pack 3 sea animals&apos;) + fast-paced trivia racing to earn coins.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Desafío Completo
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 group-hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Animal Encyclopedia Sound Gallery */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>🐾</span> Enciclopedia y Sonidos Animales
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Toca cada animal para escuchar su sonido real, hábitat y curiosidad.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ANIMALES_DATA.map((a) => (
            <button
              key={a.name}
              onClick={() => {
                playSound('pop');
                speak(`Animal: ${a.name}. Sonido: ${a.soundText}. Vive ${a.habitat}. ${a.funFact}`);
                addPoints(1);
                incrementActivities('animales');
              }}
              style={{ backgroundColor: a.bgColor }}
              className="rounded-2xl p-4 border-2 border-slate-200 hover:border-emerald-400 text-center transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-between gap-2.5 cursor-pointer shadow-2xs group"
            >
              <div className="text-4xl sm:text-5xl group-hover:scale-125 transition-transform">
                {a.emoji}
              </div>

              <div className="space-y-0.5">
                <span className="block font-black text-base text-slate-800 group-hover:text-emerald-700">
                  {a.name}
                </span>
                <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  {a.habitat}
                </span>
                <span className="block text-[11px] text-slate-600 font-semibold italic">
                  &quot;{a.soundText}&quot;
                </span>
              </div>

              <div className="w-7 h-7 bg-white text-emerald-700 rounded-full flex items-center justify-center shadow-xs group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
