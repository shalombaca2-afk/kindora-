/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Trophy,
  Timer,
  Star,
  RotateCcw,
  Coins,
} from 'lucide-react';

interface TreasureHuntGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

type ChallengeType = 'count' | 'addition' | 'subtraction';

interface TreasureChallenge {
  id: string;
  type: ChallengeType;
  question: string;
  subQuestion?: string;
  visualItems: string[];
  correctAnswer: number;
  options: number[];
}

function generateRandomChallenge(): TreasureChallenge {
  const types: ChallengeType[] = ['count', 'addition', 'subtraction'];
  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'count') {
    const emojis = ['💎', '🪙', '👑', '🗝️', '⭐', '💍'];
    const selectedEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    const count = Math.floor(Math.random() * 9) + 3; // 3 to 11
    const visualItems = Array.from({ length: count }).map(() => selectedEmoji);

    const optionsSet = new Set<number>([count]);
    while (optionsSet.size < 3) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const val = count + delta;
      if (val > 0 && val !== count) {
        optionsSet.add(val);
      }
    }

    return {
      id: `c_${Date.now()}_${Math.random()}`,
      type: 'count',
      question: '¡Cuenta el tesoro pirata!',
      subQuestion: `¿Cuántos ${selectedEmoji} hay en el cofre?`,
      visualItems,
      correctAnswer: count,
      options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    };
  }

  if (type === 'addition') {
    const a = Math.floor(Math.random() * 5) + 1;
    const b = Math.floor(Math.random() * 5) + 1;
    const sum = a + b;

    const visualItems = [
      ...Array.from({ length: a }).map(() => '💎'),
      '+',
      ...Array.from({ length: b }).map(() => '🪙'),
    ];

    const optionsSet = new Set<number>([sum]);
    while (optionsSet.size < 3) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
      const val = sum + delta;
      if (val > 0 && val !== sum) {
        optionsSet.add(val);
      }
    }

    return {
      id: `a_${Date.now()}_${Math.random()}`,
      type: 'addition',
      question: '¡Suma las riquezas del tesoro!',
      subQuestion: `${a} gemas + ${b} monedas = ¿Total de tesoros?`,
      visualItems,
      correctAnswer: sum,
      options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    };
  }

  // Subtraction
  const initial = Math.floor(Math.random() * 6) + 4; // 4 to 9
  const subtract = Math.floor(Math.random() * (initial - 2)) + 1;
  const result = initial - subtract;

  const visualItems = [
    ...Array.from({ length: initial }).map(() => '🗝️'),
    '-',
    ...Array.from({ length: subtract }).map(() => '🗝️'),
  ];

  const optionsSet = new Set<number>([result]);
  while (optionsSet.size < 3) {
    const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 3) + 1);
    const val = result + delta;
    if (val >= 0 && val !== result) {
      optionsSet.add(val);
    }
  }

  return {
    id: `s_${Date.now()}_${Math.random()}`,
    type: 'subtraction',
    question: '¡Gasta llaves para abrir cofres!',
    subQuestion: `Tenías ${initial} llaves y usaste ${subtract}. ¿Cuántas te quedan?`,
    visualItems,
    correctAnswer: result,
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
  };
}

export const TreasureHuntGame: React.FC<TreasureHuntGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [gameState, setGameState] = useState<'ready' | 'playing' | 'gameover'>('ready');
  const [timeLeft, setTimeLeft] = useState<number>(45);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [coinsWon, setCoinsWon] = useState<number>(0);
  const [currentChallenge, setCurrentChallenge] = useState<TreasureChallenge>(() =>
    generateRandomChallenge()
  );
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CRITICAL: Cleanup audio & timer on unmount
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

  // Countdown timer
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleGameOver();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  const handleStartGame = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setGameState('playing');
    setTimeLeft(45);
    setScore(0);
    setCombo(0);
    setCoinsWon(0);
    setFeedback(null);
    setSelectedAnswer(null);
    setCurrentChallenge(generateRandomChallenge());
    playAudioPromise('¡Comienza la Cacería del Tesoro! Resuelve los desafíos antes de que se acabe el tiempo.', {
      speed: 0.85,
      pitch: 1.15,
    });
  };

  const handleGameOver = () => {
    setGameState('gameover');
    playSound('victoryFanfare');
    triggerConfetti();
    speak(`¡Tiempo cumplido! Conseguiste ${score} puntos y ganaste monedas para tu mascota.`);
  };

  const handleSelectAnswer = (ans: number) => {
    if (feedback !== null || gameState !== 'playing') return;

    setSelectedAnswer(ans);
    if (ans === currentChallenge.correctAnswer) {
      playSound('pop');
      setFeedback('correct');
      const pts = 10 + combo * 2;
      const coinsGain = combo >= 2 ? 2 : 1;
      setScore((prev) => prev + pts);
      setCombo((prev) => prev + 1);
      setCoinsWon((prev) => prev + coinsGain);
      addPoints(pts);
      addCoins(coinsGain);
      incrementActivities('numeros');
      if (onWinExercise) {
        onWinExercise(pts, coinsGain);
      }

      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
        setCurrentChallenge(generateRandomChallenge());
      }, 600);
    } else {
      playSound('hit');
      setFeedback('wrong');
      setCombo(0);
      setTimeout(() => {
        setFeedback(null);
        setSelectedAnswer(null);
      }, 700);
    }
  };

  // Calculate Stars (1 to 3 stars based on score)
  const starsEarned = score >= 80 ? 3 : score >= 40 ? 2 : score > 0 ? 1 : 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-numbers-treasure"
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

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-purple-600" />
            La Cacería del Tesoro
          </span>

          {gameState === 'playing' && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full font-black text-xs">
              <Timer className="w-3.5 h-3.5 text-amber-600 animate-spin [animation-duration:4s]" />
              {timeLeft}s
            </div>
          )}
        </div>
      </div>

      {/* READY SCREEN */}
      {gameState === 'ready' && (
        <div className="bg-gradient-to-b from-purple-600 via-indigo-600 to-sky-600 rounded-3xl p-8 sm:p-12 text-white text-center shadow-xl space-y-6 max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-md rounded-3xl mx-auto flex items-center justify-center text-5xl shadow-lg border border-white/30">
            🏴‍☠️
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-black">
              ¡La Cacería del Tesoro Pirata!
            </h2>
            <p className="text-purple-100 text-sm font-medium leading-relaxed max-w-lg mx-auto">
              Tienes 45 segundos para resolver la mayor cantidad de retos mixtos: cuenta gemas, suma monedas y abre cofres con llaves.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black">
            <span className="bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              ⏱️ 45 Segundos
            </span>
            <span className="bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              🔥 Racha con Combo
            </span>
            <span className="bg-white/20 px-3.5 py-1.5 rounded-full backdrop-blur-xs">
              🪙 Monedas para tu Mascota
            </span>
          </div>

          <button
            onClick={handleStartGame}
            className="px-8 py-4 bg-amber-400 hover:bg-amber-500 text-purple-950 font-black text-lg rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            ¡Empezar Aventura! ⚔️
          </button>
        </div>
      )}

      {/* PLAYING SCREEN */}
      {gameState === 'playing' && (
        <div className="bg-gradient-to-b from-purple-50/70 to-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md space-y-6">
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-purple-100 shadow-xs">
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Puntos
                </span>
                <span className="text-2xl font-black text-purple-700">{score}</span>
              </div>

              {combo > 1 && (
                <div className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-black text-xs border border-amber-300 animate-pulse">
                  ¡Combo x{combo}! 🔥
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 px-3 py-1.5 rounded-xl border border-amber-200 font-black text-sm">
                <Coins className="w-4 h-4 text-amber-600" />
                +{coinsWon} 🪙
              </div>

              <div className="text-right">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Tiempo
                </span>
                <span
                  className={`text-2xl font-black ${
                    timeLeft <= 10 ? 'text-red-600 animate-ping' : 'text-slate-800'
                  }`}
                >
                  {timeLeft}s
                </span>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-sm text-center space-y-6">
            <div className="space-y-1">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 font-black text-xs rounded-full uppercase tracking-wider">
                {currentChallenge.type === 'count'
                  ? 'Conteo Rápido'
                  : currentChallenge.type === 'addition'
                  ? 'Suma de Riquezas'
                  : 'Resta de Llaves'}
              </span>
              <h3 className="text-2xl font-black text-slate-800 pt-2">
                {currentChallenge.question}
              </h3>
              <p className="text-sm text-slate-500 font-semibold">
                {currentChallenge.subQuestion}
              </p>
            </div>

            {/* Visual Treasure Box Container */}
            <div className="p-6 bg-slate-50 rounded-2xl border-2 border-purple-100 min-h-[140px] flex flex-wrap items-center justify-center content-center gap-3">
              {currentChallenge.visualItems.map((item, idx) => {
                if (item === '+' || item === '-') {
                  return (
                    <span
                      key={idx}
                      className="w-10 h-10 rounded-xl bg-purple-600 text-white font-black text-xl flex items-center justify-center shadow-xs"
                    >
                      {item}
                    </span>
                  );
                }
                return (
                  <span
                    key={idx}
                    className="text-4xl sm:text-5xl hover:scale-125 transition-transform select-none"
                  >
                    {item}
                  </span>
                );
              })}
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {currentChallenge.options.map((opt) => {
                const isSelected = selectedAnswer === opt;
                let btnClass =
                  'bg-white hover:bg-purple-50 text-slate-800 border-slate-200 hover:border-purple-400';

                if (feedback === 'correct' && opt === currentChallenge.correctAnswer) {
                  btnClass =
                    'bg-emerald-500 text-white border-emerald-600 shadow-lg ring-4 ring-emerald-200 scale-105';
                } else if (feedback === 'wrong' && isSelected) {
                  btnClass = 'bg-red-500 text-white border-red-600';
                }

                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectAnswer(opt)}
                    disabled={feedback !== null}
                    className={`py-5 rounded-3xl border-3 text-3xl font-black transition-all transform active:scale-95 shadow-md flex items-center justify-center cursor-pointer ${btnClass}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* GAME OVER SCREEN */}
      {gameState === 'gameover' && (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-purple-200 shadow-xl text-center space-y-6 max-w-lg mx-auto animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 bg-amber-100 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner border border-amber-300">
            🏆
          </div>

          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-800">
              ¡Aventura Completada!
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              Has explorado los tesoros matemáticos de Kindora.
            </p>
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((star) => (
              <Star
                key={star}
                className={`w-10 h-10 ${
                  star <= starsEarned
                    ? 'text-amber-400 fill-amber-400 animate-bounce'
                    : 'text-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Rewards breakdown */}
          <div className="grid grid-cols-2 gap-3 p-4 bg-purple-50 rounded-2xl border border-purple-100">
            <div>
              <span className="text-xs font-bold text-slate-500 block">Puntaje Total</span>
              <span className="text-2xl font-black text-purple-700">{score} XP</span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-500 block">Monedas Ganadas</span>
              <span className="text-2xl font-black text-amber-600">+{coinsWon} 🪙</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleStartGame}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" /> Jugar de Nuevo
            </button>

            <button
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
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-sm rounded-2xl transition-all cursor-pointer"
            >
              ← Volver a Números
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
