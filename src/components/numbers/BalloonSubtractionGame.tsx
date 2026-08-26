/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Star,
  Trophy,
} from 'lucide-react';

interface BalloonSubtractionGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface Balloon {
  id: number;
  color: string;
  popped: boolean;
}

const BALLOON_COLORS = [
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#14b8a6', // Teal
];

interface SubtractionProblem {
  totalInitial: number;
  toSubtract: number;
  balloons: Balloon[];
}

function generateSubtractionProblem(level: number): SubtractionProblem {
  let max = 6;
  if (level > 2) max = 8;
  if (level > 4) max = 10;

  const totalInitial = Math.floor(Math.random() * (max - 3)) + 4; // Between 4 and max
  const toSubtract = Math.floor(Math.random() * (totalInitial - 2)) + 1; // At least 1, leaving at least 1

  const balloons: Balloon[] = Array.from({ length: totalInitial }).map((_, i) => ({
    id: i + 1,
    color: BALLOON_COLORS[i % BALLOON_COLORS.length],
    popped: false,
  }));

  return {
    totalInitial,
    toSubtract,
    balloons,
  };
}

export const BalloonSubtractionGame: React.FC<BalloonSubtractionGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [level, setLevel] = useState<number>(1);
  const [problem, setProblem] = useState<SubtractionProblem>(() => generateSubtractionProblem(1));
  const [remainingBalloons, setRemainingBalloons] = useState<number>(() => {
    const initProb = generateSubtractionProblem(1);
    return initProb.totalInitial;
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync remainingBalloons when problem changes
  useEffect(() => {
    setRemainingBalloons(problem.totalInitial);
  }, [problem]);

  // CRITICAL: Cleanup on unmount & audio cancel to prevent lingering audio
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

  // Speak prompt on problem load
  useEffect(() => {
    cancelActiveAudio();
    playAudioPromise(
      `¡La Fiesta de los Globos! Tenemos ${problem.totalInitial} globos flotando. ¡Pincha y explota ${problem.toSubtract} globos para restar!`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [problem]);

  const targetRemaining = problem.totalInitial - problem.toSubtract;
  const poppedCount = problem.balloons.filter((b) => b.popped).length;

  const handlePopBalloon = (id: number) => {
    if (isCompleted) return;

    const target = problem.balloons.find((b) => b.id === id);
    if (!target || target.popped) return;

    playSound('pop');

    const updatedBalloons = problem.balloons.map((b) =>
      b.id === id ? { ...b, popped: true } : b
    );

    const newPoppedCount = updatedBalloons.filter((b) => b.popped).length;
    const newRemaining = problem.totalInitial - newPoppedCount;
    
    // Real-time decrement of remainingBalloons state
    setRemainingBalloons(newRemaining);
    setProblem({ ...problem, balloons: updatedBalloons });

    if (newPoppedCount === problem.toSubtract) {
      // Completed the subtraction! Auto-resolve victory screen
      setIsCompleted(true);
      playSound('victoryFanfare');
      triggerConfetti();
      addPoints(12);
      addCoins(4);
      incrementActivities('numeros');
      if (onWinExercise) {
        onWinExercise(12, 4);
      }
      speak(
        `¡Excelente! ${problem.totalInitial} menos ${problem.toSubtract} es igual a ${targetRemaining}. ¡Quedan ${targetRemaining} globos!`
      );
    } else if (newPoppedCount < problem.toSubtract) {
      speak(`¡Pop! Quedan ${newRemaining} globos.`);
    } else {
      playSound('hit');
      speak(`¡Explotaste más globos de los pedidos! Tenías que explotar ${problem.toSubtract}.`);
    }
  };

  const handleResetRound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setProblem({
      ...problem,
      balloons: problem.balloons.map((b) => ({ ...b, popped: false })),
    });
    setRemainingBalloons(problem.totalInitial);
    setIsCompleted(false);
    speak('¡Globos reiniciados! Vamos a intentar de nuevo.');
  };

  const handleNextRound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setIsCompleted(false);
    const nextLevel = level + 1;
    setLevel(nextLevel);
    const nextProblem = generateSubtractionProblem(nextLevel);
    setProblem(nextProblem);
    setRemainingBalloons(nextProblem.totalInitial);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-numbers-subtraction"
          onClick={() => {
            if (audioRef.current) {
              audioRef.current.pause();
            }
            cancelActiveAudio();
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
              window.speechSynthesis.cancel();
            }
            onBackToHub();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          ← Volver a Números
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-700 font-black text-xs rounded-full border border-amber-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Nivel {level} • Resta por Acción Directa
          </span>
        </div>
      </div>

      {/* Main Balloon Stage */}
      <div className="bg-gradient-to-b from-sky-100/70 via-indigo-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200 shadow-md space-y-6">
        {/* Story Header */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-amber-100 text-amber-900 font-black text-xs rounded-full uppercase tracking-wider">
            ¡Misión de Resta!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            Pincha y haz explotar {problem.toSubtract} {problem.toSubtract === 1 ? 'globo' : 'globos'}
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Toca cualquier globo en el cielo para reventarlo y ver cuántos quedan.
          </p>
        </div>

        {/* Real-time Math Progress Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 bg-white p-4 sm:p-5 rounded-2xl border-2 border-amber-100 max-w-xl mx-auto shadow-sm text-center">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Total inicial:</span>
            <span className="text-2xl font-black text-sky-600">{problem.totalInitial} 🎈</span>
          </div>

          <div className="w-px h-8 bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">A explotar:</span>
            <span className="text-2xl font-black text-amber-600">- {problem.toSubtract} 💥</span>
          </div>

          <div className="w-px h-8 bg-slate-200 hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Quedan:</span>
            <span className="text-2xl font-black text-emerald-600 animate-in zoom-in-75 duration-150">
              {remainingBalloons} 🎈
            </span>
          </div>
        </div>

        {/* Sky with Floating Clean Color Balloons (NO NUMBERS INSIDE) */}
        <div className="relative min-h-[340px] bg-gradient-to-b from-sky-200/60 via-sky-100/40 to-sky-50/30 rounded-3xl p-6 sm:p-10 border-3 border-sky-200 overflow-hidden shadow-inner flex flex-wrap items-center justify-center content-center gap-6 sm:gap-10">
          {/* Cloud background decorations */}
          <div className="absolute top-4 left-6 text-4xl opacity-40 pointer-events-none select-none">
            ☁️
          </div>
          <div className="absolute top-10 right-10 text-5xl opacity-40 pointer-events-none select-none">
            ☁️
          </div>
          <div className="absolute bottom-6 left-1/3 text-3xl opacity-30 pointer-events-none select-none">
            ☁️
          </div>

          {problem.balloons.map((balloon) => {
            if (balloon.popped) {
              return (
                <div
                  key={balloon.id}
                  className="w-16 h-22 sm:w-20 sm:h-26 flex flex-col items-center justify-center animate-in zoom-out-50 duration-200 opacity-60"
                >
                  <span className="text-4xl select-none animate-ping [animation-duration:1s]">💥</span>
                  <span className="text-[11px] font-black text-slate-500 mt-1">¡Pop!</span>
                </div>
              );
            }

            return (
              <button
                key={balloon.id}
                onClick={() => handlePopBalloon(balloon.id)}
                aria-label="Globo para reventar"
                style={{ backgroundColor: balloon.color }}
                className="w-16 h-22 sm:w-20 sm:h-26 rounded-t-[50%] rounded-b-[45%] shadow-lg hover:shadow-xl flex flex-col items-center justify-center text-white font-black hover:scale-115 active:scale-90 transition-transform cursor-pointer relative group animate-bounce [animation-duration:3.2s]"
              >
                {/* 3D Glossy Light Reflection Effect */}
                <div className="absolute top-3 left-3 w-4 h-6 bg-white/40 rounded-full rotate-15 pointer-events-none" />
                <div className="absolute top-2 left-4 w-1.5 h-2 bg-white/60 rounded-full rotate-15 pointer-events-none" />

                {/* Balloon Knot and String */}
                <div
                  style={{ backgroundColor: balloon.color }}
                  className="absolute -bottom-1.5 w-3 h-2 rounded-xs pointer-events-none brightness-90"
                />
                <div className="absolute -bottom-5 w-0.5 h-4 bg-slate-400 pointer-events-none" />
              </button>
            );
          })}
        </div>

        {/* Live Counter & Reset Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 max-w-xl mx-auto">
          <span
            className={`px-4 py-2 rounded-full font-black text-xs border shadow-xs ${
              poppedCount === problem.toSubtract
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-amber-100 text-amber-800 border-amber-300'
            }`}
          >
            Explotados: {poppedCount} / {problem.toSubtract}
          </span>

          <button
            onClick={handleResetRound}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reintentar Ronda
          </button>
        </div>

        {/* Large Equation Solved Banner on Target Reached (e.g. 6 - 4 = 2) */}
        {isCompleted && (
          <div className="max-w-xl mx-auto p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-300 border-2 border-emerald-300">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
              <Trophy className="w-9 h-9 text-amber-300" />
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-3xl sm:text-4xl font-black tracking-tight drop-shadow-sm">
                {problem.totalInitial} - {problem.toSubtract} = {targetRemaining}
              </h3>
              <p className="text-emerald-100 font-bold text-sm">
                Había {problem.totalInitial} globos, explotaste {problem.toSubtract} y quedan exactamente {targetRemaining} globos.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-4 py-1.5 rounded-full text-xs font-black">
              <span>+12 XP</span>
              <span>•</span>
              <span>+4 🪙 Monedas Ganadas</span>
            </div>

            <button
              onClick={handleNextRound}
              className="mt-1 px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Siguiente Nivel →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
