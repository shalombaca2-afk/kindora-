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
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

interface TrainAdditionGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface AdditionProblem {
  id: string;
  numA: number;
  numB: number;
  emojiA: string;
  emojiB: string;
  labelA: string;
  labelB: string;
  options: number[];
}

const PASSENGER_TYPES = [
  { emoji: '🐱', label: 'gatitos' },
  { emoji: '🐶', label: 'perritos' },
  { emoji: '🐰', label: 'conejitos' },
  { emoji: '🐼', label: 'panditas' },
  { emoji: '🐻', label: 'ositos' },
  { emoji: '🦁', label: 'leoncitos' },
  { emoji: '🐸', label: 'ranitas' },
  { emoji: '🐵', label: 'monitos' },
];

function generateAdditionProblem(level: number): AdditionProblem {
  let max = 5;
  if (level > 2) max = 8;
  if (level > 4) max = 10;

  const numA = Math.floor(Math.random() * (max - 1)) + 1;
  const numB = Math.floor(Math.random() * (max - 1)) + 1;
  const sum = numA + numB;

  const typeA = PASSENGER_TYPES[Math.floor(Math.random() * PASSENGER_TYPES.length)];
  let typeB = PASSENGER_TYPES[Math.floor(Math.random() * PASSENGER_TYPES.length)];
  if (typeB.emoji === typeA.emoji) {
    typeB = PASSENGER_TYPES[(PASSENGER_TYPES.indexOf(typeA) + 1) % PASSENGER_TYPES.length];
  }

  // Generate 3 unique options including the correct sum
  const optionsSet = new Set<number>([sum]);
  while (optionsSet.size < 3) {
    const offset = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    const candidate = sum + offset;
    if (candidate > 0 && candidate !== sum) {
      optionsSet.add(candidate);
    }
  }

  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return {
    id: `add_${Date.now()}_${Math.random()}`,
    numA,
    numB,
    emojiA: typeA.emoji,
    emojiB: typeB.emoji,
    labelA: typeA.label,
    labelB: typeB.label,
    options,
  };
}

export const TrainAdditionGame: React.FC<TrainAdditionGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [level, setLevel] = useState<number>(1);
  const [problem, setProblem] = useState<AdditionProblem>(() => generateAdditionProblem(1));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSum = problem.numA + problem.numB;

  // CRITICAL: Cleanup audio on unmount & cancel speech
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
      `¡El Tren de las Sumas! En el primer vagón hay ${problem.numA} ${problem.labelA}, y en el segundo hay ${problem.numB} ${problem.labelB}. ¿Cuántos pasajeros hay en total?`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [problem]);

  const handleSelectOption = (opt: number) => {
    if (isAnswered) return;
    setSelectedOption(opt);
    setIsAnswered(true);

    if (opt === totalSum) {
      playSound('victoryFanfare');
      triggerConfetti();
      addPoints(12);
      addCoins(4);
      incrementActivities('numeros');
      setStreak((prev) => prev + 1);
      if (onWinExercise) {
        onWinExercise(12, 4);
      }
      speak(`¡Correcto! ${problem.numA} más ${problem.numB} es igual a ${totalSum}. ¡Todos a bordo del tren!`);
    } else {
      playSound('hit');
      setStreak(0);
      speak(`Casi. ${problem.numA} más ${problem.numB} no es ${opt}. ¡Contemos todos los pasajeros juntos!`);
    }
  };

  const handleNextProblem = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setSelectedOption(null);
    setIsAnswered(false);
    const nextLevel = level + 1;
    setLevel(nextLevel);
    setProblem(generateAdditionProblem(nextLevel));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-numbers-addition"
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
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Nivel {level} • Racha: {streak} 🔥
          </span>
        </div>
      </div>

      {/* Main Train Stage */}
      <div className="bg-gradient-to-b from-sky-50 via-emerald-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md space-y-6">
        {/* Header Question */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 font-black text-xs rounded-full uppercase tracking-wider">
            Suma Visual e Interactiva
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            ¿Cuántos pasajeros viajan en el tren en total?
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Toca a los pasajeros para contarlos individualmente.
          </p>
        </div>

        {/* Visual Train Display */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="min-w-[640px] flex items-center justify-center gap-3">
            {/* Locomotive */}
            <div className="flex flex-col items-center">
              <div className="w-24 h-24 bg-red-500 rounded-3xl border-4 border-red-700 shadow-lg flex flex-col items-center justify-center text-white relative">
                <span className="text-4xl">🚂</span>
                <span className="text-[10px] font-black uppercase mt-1 tracking-widest">Kindora</span>
              </div>
              <div className="flex gap-4 mt-1">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 shadow-xs" />
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600 shadow-xs" />
              </div>
            </div>

            {/* Wagon A */}
            <div className="flex flex-col items-center">
              <div className="w-44 min-h-[96px] bg-sky-400 rounded-3xl border-4 border-sky-600 shadow-lg p-3 flex flex-col items-center justify-between text-white">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {Array.from({ length: problem.numA }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playSound('pop');
                        speak(`${i + 1}`);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center text-lg hover:scale-125 transition-transform shadow-xs cursor-pointer"
                      title={`${i + 1}`}
                    >
                      {problem.emojiA}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black bg-sky-600/80 px-3 py-0.5 rounded-full mt-1">
                  Vagón 1: {problem.numA} {problem.labelA}
                </span>
              </div>
              <div className="flex gap-6 mt-1">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
              </div>
            </div>

            {/* Plus Symbol */}
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
              +
            </div>

            {/* Wagon B */}
            <div className="flex flex-col items-center">
              <div className="w-44 min-h-[96px] bg-amber-400 rounded-3xl border-4 border-amber-600 shadow-lg p-3 flex flex-col items-center justify-between text-white">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  {Array.from({ length: problem.numB }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        playSound('pop');
                        speak(`${problem.numA + i + 1}`);
                      }}
                      className="w-8 h-8 bg-white/90 rounded-xl flex items-center justify-center text-lg hover:scale-125 transition-transform shadow-xs cursor-pointer"
                      title={`${problem.numA + i + 1}`}
                    >
                      {problem.emojiB}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-black bg-amber-600/80 px-3 py-0.5 rounded-full mt-1">
                  Vagón 2: {problem.numB} {problem.labelB}
                </span>
              </div>
              <div className="flex gap-6 mt-1">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
              </div>
            </div>

            {/* Equals Sign */}
            <div className="w-12 h-12 rounded-2xl bg-indigo-500 text-white font-black text-2xl flex items-center justify-center shadow-md">
              =
            </div>

            {/* Caboose Total */}
            <div className="flex flex-col items-center">
              <div className="w-28 min-h-[96px] bg-purple-500 rounded-3xl border-4 border-purple-700 shadow-lg p-3 flex flex-col items-center justify-center text-white">
                <span className="text-3xl font-black">
                  {isAnswered && selectedOption === totalSum ? totalSum : '?'}
                </span>
                <span className="text-[10px] font-black uppercase mt-1">Total</span>
              </div>
              <div className="flex gap-4 mt-1">
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
                <div className="w-4 h-4 rounded-full bg-slate-800 border border-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Math Formula Display Box */}
        <div className="bg-white p-4 rounded-2xl border-2 border-emerald-100 max-w-md mx-auto text-center shadow-sm flex items-center justify-center gap-3">
          <span className="text-3xl font-black text-sky-600">{problem.numA}</span>
          <span className="text-2xl font-black text-emerald-600">+</span>
          <span className="text-3xl font-black text-amber-600">{problem.numB}</span>
          <span className="text-2xl font-black text-indigo-600">=</span>
          <span className="text-3xl font-black text-purple-600">
            {isAnswered && selectedOption === totalSum ? totalSum : '?'}
          </span>
        </div>

        {/* Options Buttons */}
        <div className="space-y-3 max-w-lg mx-auto">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-wider">
            Selecciona la respuesta correcta:
          </p>
          <div className="grid grid-cols-3 gap-4">
            {problem.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === totalSum;

              let btnStyle = 'bg-white hover:bg-emerald-50 border-slate-200 text-slate-800 hover:border-emerald-400';
              if (isAnswered) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-200';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-red-500 border-red-600 text-white';
                } else {
                  btnStyle = 'bg-slate-50 border-slate-200 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(opt)}
                  disabled={isAnswered}
                  className={`py-5 rounded-3xl border-3 text-3xl font-black transition-all transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result & Next Button Banner */}
        {isAnswered && (
          <div className="max-w-lg mx-auto p-4 bg-white rounded-3xl border-2 border-emerald-200 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              {selectedOption === totalSum ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              ) : (
                <RefreshCw className="w-8 h-8 text-amber-500 shrink-0" />
              )}
              <div>
                <h4 className="text-sm font-black text-slate-800">
                  {selectedOption === totalSum
                    ? '¡Excelente respuesta! +12 XP • +4 🪙'
                    : `La respuesta era ${totalSum}`}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {problem.numA} + {problem.numB} = {totalSum} pasajeros
                </p>
              </div>
            </div>

            <button
              onClick={handleNextProblem}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Suma →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
