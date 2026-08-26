/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Star,
  Timer,
  CheckCircle2,
} from 'lucide-react';

interface ChameleonGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface ChameleonTarget {
  id: string;
  colorName: string;
  hex: string;
  isTarget: boolean;
}

const CHAMELEON_PALETTE = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Morado', hex: '#8b5cf6' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Celeste', hex: '#38bdf8' },
];

const TOTAL_ROUNDS = 5;
const TIME_PER_ROUND = 12; // 12 seconds per round

export const ChameleonGame: React.FC<ChameleonGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(TIME_PER_ROUND);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'timeout'>('playing');
  const [targetColor, setTargetColor] = useState<{ name: string; hex: string }>(CHAMELEON_PALETTE[0]);
  const [chameleons, setChameleons] = useState<ChameleonTarget[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Setup a round
  const setupRound = useCallback((currentRound: number) => {
    cancelActiveAudio();
    setTimeLeft(TIME_PER_ROUND);

    // Pick 1 target color
    const shuffledPalette = [...CHAMELEON_PALETTE].sort(() => 0.5 - Math.random());
    const target = shuffledPalette[0];
    setTargetColor(target);

    // Create 4-6 chameleon options including the target
    const distractors = shuffledPalette.slice(1, 5);
    const options: ChameleonTarget[] = [
      { id: 'target', colorName: target.name, hex: target.hex, isTarget: true },
      ...distractors.map((d, i) => ({
        id: `distractor-${i}`,
        colorName: d.name,
        hex: d.hex,
        isTarget: false,
      })),
    ].sort(() => 0.5 - Math.random());

    setChameleons(options);
    setGameState('playing');

    playAudioPromise(`¡Ronda ${currentRound}! Encuentra al camaleón de color ${target.name}.`, {
      speed: 0.85,
      pitch: 1.15,
    });
  }, []);

  useEffect(() => {
    setupRound(round);
  }, [round, setupRound]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
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

  // Timer countdown
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setGameState('timeout');
            playSound('hit');
            speak('¡Se acabó el tiempo! Vamos a intentarlo de nuevo.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, round]);

  const handleChameleonClick = (chameleon: ChameleonTarget) => {
    if (gameState !== 'playing') return;

    if (chameleon.isTarget) {
      playSound('pop');
      const newScore = score + 1;
      setScore(newScore);

      if (round < TOTAL_ROUNDS) {
        speak(`¡Muy bien! Encontraste al camaleón ${chameleon.colorName}.`);
        setRound((r) => r + 1);
      } else {
        // Game Won!
        setGameState('won');
        playSound('victoryFanfare');
        triggerConfetti();
        addPoints(15);
        addCoins(5);
        incrementActivities('colores');
        if (onWinExercise) {
          onWinExercise(15, 5);
        }
        speak(`¡Extraordinario! Has encontrado a todos los camaleones escondidos. ¡Ganaste el reto de rapidez!`);
      }
    } else {
      playSound('hit');
      speak(`Ese camaleón es de color ${chameleon.colorName}. Busca el de color ${targetColor.name}.`);
    }
  };

  const handleRestart = () => {
    cancelActiveAudio();
    playSound('pop');
    setRound(1);
    setScore(0);
    setupRound(1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          onClick={() => {
            cancelActiveAudio();
            onBackToHub();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Colores
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-purple-600" />
            Ronda {round} / {TOTAL_ROUNDS} • Puntos: {score}
          </span>
        </div>
      </div>

      {/* Main Chameleon Jungle Stage */}
      <div className="bg-gradient-to-b from-purple-900/90 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 border-2 border-purple-400 shadow-2xl text-white space-y-6 relative overflow-hidden">
        {/* Decorative jungle lights */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Story Header */}
        <div className="text-center space-y-2 relative z-10">
          <span className="px-3.5 py-1 bg-purple-500/30 text-purple-200 font-black text-xs rounded-full uppercase tracking-wider border border-purple-400/40 inline-block">
            Reto de Rapidez & Percepción
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            4. El Camaleón Escondido
          </h2>
          <p className="text-sm text-purple-200 font-medium">
            ¡Encuentra al camaleón que cambió al color solicitado antes de que se acabe el tiempo!
          </p>
        </div>

        {/* Target Color & Timer Bar */}
        <div className="max-w-xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/20 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: targetColor.hex }}
              className="w-12 h-12 rounded-2xl shadow-lg border-2 border-white flex items-center justify-center text-2xl animate-pulse"
            >
              🦎
            </div>
            <div>
              <span className="text-[11px] font-bold text-purple-200 uppercase tracking-wider block">
                Color buscado:
              </span>
              <h3 className="text-2xl font-black text-amber-300">
                ¡{targetColor.name.toUpperCase()}!
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-black/40 px-3.5 py-2 rounded-xl border border-white/10">
              <Timer className="w-4 h-4 text-amber-300 animate-spin [animation-duration:8s]" />
              <span
                className={`font-black text-base ${
                  timeLeft <= 3 ? 'text-rose-400 animate-ping' : 'text-white'
                }`}
              >
                {timeLeft}s
              </span>
            </div>
          </div>
        </div>

        {/* Jungle Foliage with Chameleons */}
        <div className="relative min-h-[300px] bg-emerald-950/60 rounded-3xl p-6 sm:p-8 border-2 border-emerald-500/30 overflow-hidden shadow-inner flex flex-wrap items-center justify-center gap-6 sm:gap-8 content-center">
          {/* Foliage emoji backdrop */}
          <div className="absolute top-3 left-4 text-4xl opacity-40 pointer-events-none select-none">
            🌿
          </div>
          <div className="absolute bottom-3 right-4 text-4xl opacity-40 pointer-events-none select-none">
            🌴
          </div>
          <div className="absolute top-1/2 left-8 text-3xl opacity-30 pointer-events-none select-none">
            🍃
          </div>
          <div className="absolute top-6 right-12 text-3xl opacity-30 pointer-events-none select-none">
            🎋
          </div>

          {chameleons.map((chameleon) => (
            <button
              key={chameleon.id}
              onClick={() => handleChameleonClick(chameleon)}
              style={{ backgroundColor: chameleon.hex }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-2xl flex flex-col items-center justify-center text-white border-3 border-white/80 hover:scale-115 active:scale-95 transition-all transform cursor-pointer group relative hover:brightness-110"
              aria-label={`Camaleón de color ${chameleon.colorName}`}
            >
              <span className="text-4xl sm:text-5xl group-hover:rotate-12 transition-transform">
                🦎
              </span>
              <span className="text-[11px] font-black drop-shadow-md bg-black/40 px-2 py-0.5 rounded-full mt-1">
                {chameleon.colorName}
              </span>
            </button>
          ))}
        </div>

        {/* Timeout State */}
        {gameState === 'timeout' && (
          <div className="max-w-md mx-auto p-6 bg-rose-950/80 border-2 border-rose-500 rounded-3xl text-center space-y-4 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-rose-300">¡Tiempo agotado!</h3>
            <p className="text-xs text-rose-200">
              El camaleón se escapó entre los árboles. ¡Inténtalo de nuevo!
            </p>
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-lg transition-transform active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Reintentar Reto
            </button>
          </div>
        )}

        {/* Victory State */}
        {gameState === 'won' && (
          <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-purple-600 to-indigo-600 border-2 border-purple-300 rounded-3xl text-center space-y-4 animate-in zoom-in-95 shadow-2xl">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
              <Trophy className="w-9 h-9 text-amber-300" />
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-white">¡Gran Cazador de Camaleones!</h3>
              <p className="text-purple-100 font-bold text-sm">
                Has completado las {TOTAL_ROUNDS} rondas a máxima velocidad.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black">
              <span>+15 XP</span>
              <span>•</span>
              <span>+5 🪙 Monedas Ganadas</span>
            </div>

            <button
              onClick={handleRestart}
              className="px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Jugar de Nuevo →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
