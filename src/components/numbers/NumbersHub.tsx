/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { NumberFactoryGame } from './NumberFactoryGame';
import { TrainAdditionGame } from './TrainAdditionGame';
import { BalloonSubtractionGame } from './BalloonSubtractionGame';
import { TreasureHuntGame } from './TreasureHuntGame';
import {
  Sparkles,
  BookOpen,
  ArrowRight,
  Hash,
  PlusCircle,
  CircleDot,
  Trophy,
} from 'lucide-react';

export type NumberGameType = 'factory' | 'train' | 'balloons' | 'treasure';

export const NumbersHub: React.FC = () => {
  const { addPoints, addCoins, playSound } = useApp();
  const [activeGame, setActiveGame] = useState<NumberGameType | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
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

  const handleStartGame = (game: NumberGameType) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);

    const titles: Record<NumberGameType, string> = {
      factory: 'La Fábrica de Números',
      train: 'El Tren de las Sumas',
      balloons: 'La Fiesta de los Globos',
      treasure: 'La Cacería del Tesoro',
    };

    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // If a minigame is active, render it with back button support
  if (activeGame === 'factory') {
    return (
      <NumberFactoryGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          cancelActiveAudio();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'train') {
    return (
      <TrainAdditionGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          cancelActiveAudio();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'balloons') {
    return (
      <BalloonSubtractionGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          cancelActiveAudio();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'treasure') {
    return (
      <TreasureHuntGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          if (audioRef.current) {
            audioRef.current.pause();
          }
          cancelActiveAudio();
          if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. DASHBOARD HEADER (Purple/Blue Gradient, rounded-3xl) */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              MÓDULO EDUCATIVO OFICIAL
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Aprende los Números y Operaciones
            </h1>
            <p className="text-sky-100 text-sm font-medium leading-relaxed">
              Explora el conteo del 1 al 20, descubre cómo sumar y restar con dinámicas visuales.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shadow-sm">
              <span className="text-2xl font-black text-amber-300 block">
                1 al 20
              </span>
              <span className="text-[11px] font-extrabold text-sky-100 uppercase tracking-wider block mt-0.5">
                Numbers • 1 to 20
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. GRID 2x2 (4 Minigame Cards: white, rounded-2xl, hover shadow, "Jugar ->" button) */}
      <div className="space-y-3">
        <h2 className="text-lg font-extrabold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          📖 Selecciona un Minijuego de Números
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* CARD 1: Icon: Hash | Tag: "Exploración" (cyan) | Title: "1. La Fábrica de Números" */}
          <div
            id="card-number-factory"
            onClick={() => handleStartGame('factory')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-cyan-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Hash className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 bg-cyan-50 text-cyan-700 font-extrabold text-xs rounded-full border border-cyan-200">
                  Exploración
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-cyan-600 transition-colors">
                  1. La Fábrica de Números
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Conteo interactivo del 1 al 20: toca los números para escuchar la pronunciación y arrastra la cantidad exacta de objetos al contenedor.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Conteo Activo</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-cyan-600 group-hover:translate-x-1 transition-transform">
                Jugar -&gt;
              </span>
            </div>
          </div>

          {/* CARD 2: Icon: PlusCircle | Tag: "Adición" (green) | Title: "2. El Tren de las Sumas" */}
          <div
            id="card-train-addition"
            onClick={() => handleStartGame('train')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs rounded-full border border-emerald-200">
                  Adición
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-emerald-600 transition-colors">
                  2. El Tren de las Sumas
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Suma visual: sube pasajeros a los vagones del tren para visualizar la unión de conjuntos y descubrir el total.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Suma Visual</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600 group-hover:translate-x-1 transition-transform">
                Jugar -&gt;
              </span>
            </div>
          </div>

          {/* CARD 3: Icon: CircleDot | Tag: "Sustracción" (orange) | Title: "3. La Fiesta de los Globos" */}
          <div
            id="card-balloon-subtraction"
            onClick={() => handleStartGame('balloons')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-orange-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <CircleDot className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 bg-orange-50 text-orange-700 font-extrabold text-xs rounded-full border border-orange-200">
                  Sustracción
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-orange-600 transition-colors">
                  3. La Fiesta de los Globos
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Resta por acción directa: pincha globos limpios (sin números en los sprites) para actualizar los restantes en tiempo real.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Resta Directa</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-orange-600 group-hover:translate-x-1 transition-transform">
                Jugar -&gt;
              </span>
            </div>
          </div>

          {/* CARD 4: Icon: Trophy | Tag: "Gamificado" (purple) | Title: "4. La Cacería del Tesoro" */}
          <div
            id="card-treasure-hunt"
            onClick={() => handleStartGame('treasure')}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200 shadow-sm hover:shadow-lg hover:border-purple-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Trophy className="w-7 h-7 stroke-[2.5]" />
                </div>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 font-extrabold text-xs rounded-full border border-purple-200">
                  Gamificado
                </span>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                  4. La Cacería del Tesoro
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Desafío mixto gamificado: rondas con tiempo de conteo, suma y resta que recompensan con monedas para el estado global.
                </p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between border-t border-slate-100 mt-4">
              <span className="text-xs font-bold text-slate-400">Desafío Mixto</span>
              <span className="inline-flex items-center gap-1 text-xs font-black text-purple-600 group-hover:translate-x-1 transition-transform">
                Jugar -&gt;
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
