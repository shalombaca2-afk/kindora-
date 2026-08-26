/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FIGURAS_DATA } from '../../data/learningData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { FindShapeGame } from './FindShapeGame';
import { MatchShapesGame } from './MatchShapesGame';
import { RealWorldShapesGame } from './RealWorldShapesGame';
import { PaintShapeGame } from './PaintShapeGame';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Shapes,
  Puzzle,
  Compass,
  Paintbrush,
  Volume2,
} from 'lucide-react';

export type ShapeGameType = 'find' | 'match' | 'realworld' | 'paint';

export const ShapesHub: React.FC = () => {
  const { addPoints, addCoins, playSound, speak, incrementActivities } = useApp();
  const [activeGame, setActiveGame] = useState<ShapeGameType | null>(null);

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

  const handleStartGame = (game: ShapeGameType) => {
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);

    const titles: Record<ShapeGameType, string> = {
      find: 'Encuentra la Figura',
      match: 'Une las Figuras',
      realworld: 'Formas del Entorno',
      paint: 'Pinta tu Figura',
    };

    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // If a minigame is active, render it in full container mode
  if (activeGame === 'find') {
    return (
      <FindShapeGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'match') {
    return (
      <MatchShapesGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'realworld') {
    return (
      <RealWorldShapesGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'paint') {
    return (
      <PaintShapeGame
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
      {/* 1. DASHBOARD HEADER (Pink/Purple Gradient, rounded-3xl) */}
      <div className="bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                MÓDULO EDUCATIVO OFICIAL
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide">
                Figuras • Formas
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Jugando con las Figuras
            </h1>
            <p className="text-pink-100 text-sm sm:text-base font-medium leading-relaxed">
              Reconoce formas geométricas básicas, asócialas con el entorno y diviértete pintando.
            </p>
          </div>

          {/* Quick Shape Visual Carousel Badge */}
          <div className="flex items-center gap-2 bg-white/15 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-inner">
            {['⭕', '🟧', '🔺', '🔲', '⭐', '💖'].map((s) => (
              <span
                key={s}
                className="text-2xl hover:scale-125 transition-transform select-none"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. GRID 2x2 (4 Minigame Cards) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <BookOpen className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            📖 Selecciona un Minijuego de Figuras
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* CARD 1: Encuentra la Figura */}
          <div
            id="card-shape-game-find"
            onClick={() => handleStartGame('find')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-cyan-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Shapes className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full font-black text-xs">
                  Exploración
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors">
                  1. Encuentra la Figura
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Audio-guided game: Listen to TTS prompts and tap target 2D shapes (circle, square, triangle, rectangle) among distractors.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Discriminación Auditiva
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-cyan-500 group-hover:bg-cyan-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 2: Une las Figuras */}
          <div
            id="card-shape-game-match"
            onClick={() => handleStartGame('match')}
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
                  2. Une las Figuras
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Drag-and-drop matching game pairing identical 2D geometric shapes into target slots with celebration animations.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Encaje y Motricidad
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 group-hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 3: Formas del Entorno */}
          <div
            id="card-shape-game-realworld"
            onClick={() => handleStartGame('realworld')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-orange-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Compass className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full font-black text-xs">
                  Reconocimiento
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                  3. Formas del Entorno
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Identify geometric shapes within real-world objects (pizza=circle, window=square, mountain=triangle).
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Geometría Real
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 group-hover:bg-orange-600 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>

          {/* CARD 4: Pinta tu Figura */}
          <div
            id="card-shape-game-paint"
            onClick={() => handleStartGame('paint')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:border-purple-400 hover:shadow-xl transition-all flex flex-col justify-between gap-5 group cursor-pointer"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Paintbrush className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-black text-xs">
                  Creatividad
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  4. Pinta tu Figura
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Interactive SVG canvas to fill large shapes with dynamic color selections and educational TTS audio.
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">
                Expresión Artística
              </span>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 group-hover:bg-purple-700 text-white font-black text-xs rounded-xl shadow-xs transition-all">
                Jugar →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shapes Interactive Exploration Gallery (Dictionary) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>📐</span> Galería de Figuras Básicas
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Toca cada figura para escuchar sus propiedades, lados y ejemplos cotidianos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FIGURAS_DATA.map((s) => (
            <button
              key={s.name}
              onClick={() => {
                playSound('pop');
                speak(`Figura ${s.name}. ${s.description}. Ejemplo: ${s.realWorldExample}.`);
                addPoints(1);
                incrementActivities('figuras');
              }}
              className="bg-slate-50 hover:bg-purple-50 rounded-2xl p-4 border-2 border-slate-200 hover:border-purple-300 text-center transition-all transform hover:-translate-y-1 active:scale-95 flex flex-col items-center justify-between gap-3 cursor-pointer group"
            >
              <div className="text-4xl group-hover:scale-125 transition-transform">
                {s.icon}
              </div>

              <div className="space-y-0.5">
                <span className="block font-black text-sm text-slate-800 group-hover:text-purple-700">
                  {s.name}
                </span>
                <span className="inline-block text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  {s.sides > 0 ? `${s.sides} lados` : 'Sin esquinas'}
                </span>
                <span className="block text-[11px] text-slate-400 font-medium truncate max-w-[130px]">
                  {s.realWorldExample}
                </span>
              </div>

              <div className="w-7 h-7 bg-white text-purple-600 rounded-full flex items-center justify-center shadow-xs group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
