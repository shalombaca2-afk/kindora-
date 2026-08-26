/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { shuffleArray } from '../../utils/shuffle';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  RotateCcw,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  Trophy,
  Compass,
} from 'lucide-react';

interface AnimalMazeGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface MazeScenario {
  id: string;
  animalName: string;
  animalEmoji: string;
  targetName: string;
  targetEmoji: string;
  targetType: 'habitat' | 'food';
  prompt: string;
  successMessage: string;
  funFact: string;
  gridSize: { rows: number; cols: number };
  start: { r: number; c: number };
  goal: { r: number; c: number };
  // 1 = wall, 0 = path
  layout: number[][];
  themeBg: string;
  themeBorder: string;
  themeAccent: string;
}

const MAZE_SCENARIOS: MazeScenario[] = [
  {
    id: 'mono_selva',
    animalName: 'Mono Titi',
    animalEmoji: '🐒',
    targetName: 'Racimo de Plátanos en la Selva',
    targetEmoji: '🍌',
    targetType: 'food',
    prompt: '¡Ayuda al monito a cruzar las ramas para llegar a sus deliciosos plátanos!',
    successMessage: '¡Ñam ñam! El monito comió sus plátanos y saltó feliz entre las lianas.',
    funFact: 'Los monos usan su cola como una quinta mano para sostenerse de las ramas.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 4 },
    layout: [
      [0, 0, 1, 0, 0],
      [1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 1],
      [0, 0, 0, 1, 0],
    ],
    themeBg: 'from-emerald-50 to-teal-50',
    themeBorder: 'border-emerald-300',
    themeAccent: 'bg-emerald-500',
  },
  {
    id: 'pinguino_glaciar',
    animalName: 'Pingüino Pip',
    animalEmoji: '🐧',
    targetName: 'Océano Helado con Peces',
    targetEmoji: '🧊',
    targetType: 'habitat',
    prompt: '¡Guía al pingüino resbalando por el hielo hasta el agua cristalina!',
    successMessage: '¡Splash! El pingüino nada veloz como un torpedo bajo el hielo.',
    funFact: 'Los pingüinos tienen plumas muy apretadas que funcionan como un traje impermeable.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 0, c: 4 },
    goal: { r: 4, c: 0 },
    layout: [
      [1, 0, 0, 0, 0],
      [0, 0, 1, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 1],
      [0, 1, 0, 0, 0],
    ],
    themeBg: 'from-cyan-50 to-sky-50',
    themeBorder: 'border-cyan-300',
    themeAccent: 'bg-cyan-500',
  },
  {
    id: 'rana_estanque',
    animalName: 'Ranita René',
    animalEmoji: '🐸',
    targetName: 'Nenúfar Florido en el Estanque',
    targetEmoji: '🪷',
    targetType: 'habitat',
    prompt: '¡Ayuda a la ranita a saltar por el laberinto de juncos hasta su nenúfar!',
    successMessage: '¡Croac croac! La ranita llegó a salvo a su flor favorita.',
    funFact: 'Las ranas pueden absorber agua directamente a través de su piel.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 4, c: 0 },
    goal: { r: 0, c: 4 },
    layout: [
      [0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 1, 1, 0],
      [1, 0, 0, 0, 0],
      [0, 0, 1, 0, 1],
    ],
    themeBg: 'from-lime-50 to-emerald-50',
    themeBorder: 'border-lime-300',
    themeAccent: 'bg-lime-600',
  },
  {
    id: 'leon_sabana',
    animalName: 'Leoncito Leo',
    animalEmoji: '🦁',
    targetName: 'Roca del Rey en la Sabana',
    targetEmoji: '👑',
    targetType: 'habitat',
    prompt: '¡Guía al joven león a través de los pastizales hasta la gran roca!',
    successMessage: '¡Rooaaar! Leo trepó a la roca y observa orgulloso toda la sabana.',
    funFact: 'El rugido de un león adulto se puede escuchar hasta a 8 kilómetros de distancia.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 0, c: 2 },
    goal: { r: 4, c: 2 },
    layout: [
      [1, 0, 0, 0, 1],
      [0, 0, 1, 0, 0],
      [0, 1, 0, 1, 0],
      [0, 0, 0, 0, 0],
      [1, 1, 0, 1, 1],
    ],
    themeBg: 'from-amber-50 to-orange-50',
    themeBorder: 'border-amber-300',
    themeAccent: 'bg-amber-500',
  },
  {
    id: 'conejo_zanahoria',
    animalName: 'Conejito Tambor',
    animalEmoji: '🐰',
    targetName: 'Huerto de Zanahorias Crujientes',
    targetEmoji: '🥕',
    targetType: 'food',
    prompt: '¡Ayuda al conejito a esquivar las vallas del jardín para comer zanahorias!',
    successMessage: '¡Ñam! El conejito mastica feliz sus zanahorias anaranjadas.',
    funFact: 'Los dientes de los conejos nunca dejan de crecer, por eso les encanta roer vegetales.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 0, c: 0 },
    goal: { r: 4, c: 3 },
    layout: [
      [0, 0, 0, 1, 0],
      [1, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 1, 0, 0],
      [0, 0, 0, 0, 1],
    ],
    themeBg: 'from-orange-50 to-amber-50',
    themeBorder: 'border-orange-300',
    themeAccent: 'bg-orange-500',
  },
  {
    id: 'ardilla_bellota',
    animalName: 'Ardillita Chip',
    animalEmoji: '🐿️',
    targetName: 'Gran Bellota Dorada del Roble',
    targetEmoji: '🌰',
    targetType: 'food',
    prompt: '¡Acompaña a la ardillita por las copas de los árboles hasta la gran bellota!',
    successMessage: '¡Encontrada! La ardillita guardará la bellota en su escondite secreto.',
    funFact: 'Las ardillas plantan miles de árboles cada año al olvidar dónde enterraron sus nueces.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 4, c: 4 },
    goal: { r: 0, c: 0 },
    layout: [
      [0, 0, 1, 0, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 1, 0],
      [1, 0, 1, 0, 0],
      [0, 0, 0, 0, 0],
    ],
    themeBg: 'from-yellow-50 to-amber-50',
    themeBorder: 'border-yellow-300',
    themeAccent: 'bg-yellow-600',
  },
  {
    id: 'delfin_arrecife',
    animalName: 'Delfín Dardo',
    animalEmoji: '🐬',
    targetName: 'Arrecife de Coral Tropical',
    targetEmoji: '🪸',
    targetType: 'habitat',
    prompt: '¡Nada con el delfín sorteando las rocas marinas hasta el hermoso arrecife!',
    successMessage: '¡Chof! El delfín da una pirueta en el agua celebrando su llegada.',
    funFact: 'Los delfines duermen con un ojo abierto y la mitad de su cerebro despierto.',
    gridSize: { rows: 5, cols: 5 },
    start: { r: 2, c: 0 },
    goal: { r: 2, c: 4 },
    layout: [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0],
    ],
    themeBg: 'from-sky-50 to-indigo-50',
    themeBorder: 'border-sky-300',
    themeAccent: 'bg-sky-500',
  },
];

export const AnimalMazeGame: React.FC<AnimalMazeGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  // No-Repeat Engine: track played scenario IDs with >= 70% threshold
  const playedScenariosRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectNextScenario = useCallback((): MazeScenario => {
    const history = playedScenariosRef.current;
    const threshold = Math.ceil(MAZE_SCENARIOS.length * 0.7);

    let candidatePool = MAZE_SCENARIOS.filter((s) => !history.includes(s.id));
    if (candidatePool.length === 0 || history.length >= threshold) {
      playedScenariosRef.current = history.slice(-1);
      candidatePool = MAZE_SCENARIOS.filter((s) => !playedScenariosRef.current.includes(s.id));
    }

    const shuffled = shuffleArray(candidatePool);
    const selected = shuffled[0] || MAZE_SCENARIOS[0];
    playedScenariosRef.current.push(selected.id);
    return selected;
  }, []);

  const [currentScenario, setCurrentScenario] = useState<MazeScenario>(() => MAZE_SCENARIOS[0]);
  const [playerPos, setPlayerPos] = useState<{ r: number; c: number }>(() => MAZE_SCENARIOS[0].start);
  const [stepsTaken, setStepsTaken] = useState<number>(0);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [streak, setStreak] = useState<number>(0);
  const [wallBump, setWallBump] = useState<boolean>(false);

  // CRITICAL Audio Cleanup
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

  // Initialize first scenario
  useEffect(() => {
    const first = selectNextScenario();
    setCurrentScenario(first);
    setPlayerPos(first.start);
    setStepsTaken(0);
    setIsVictory(false);

    cancelActiveAudio();
    playAudioPromise(
      `${first.prompt} Usa las flechas para mover al ${first.animalName}.`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [selectNextScenario]);

  const handleMove = useCallback((dr: number, dc: number) => {
    if (isVictory) return;

    const nr = playerPos.r + dr;
    const nc = playerPos.c + dc;

    // Check bounds
    if (
      nr < 0 ||
      nr >= currentScenario.gridSize.rows ||
      nc < 0 ||
      nc >= currentScenario.gridSize.cols
    ) {
      playSound('hit');
      setWallBump(true);
      setTimeout(() => setWallBump(false), 300);
      return;
    }

    // Check wall
    if (currentScenario.layout[nr][nc] === 1) {
      playSound('hit');
      setWallBump(true);
      setTimeout(() => setWallBump(false), 300);
      return;
    }

    // Valid move
    playSound('pop');
    setStepsTaken((s) => s + 1);
    setPlayerPos({ r: nr, c: nc });

    // Check Goal
    if (nr === currentScenario.goal.r && nc === currentScenario.goal.c) {
      setIsVictory(true);
      playSound('victoryFanfare');
      triggerConfetti();
      const xp = 15;
      const coins = 2;
      addPoints(xp);
      addCoins(coins);
      incrementActivities('animales');
      setStreak((prev) => prev + 1);
      if (onWinExercise) {
        onWinExercise(xp, coins);
      }
      speak(`¡Excelente! ${currentScenario.successMessage} ${currentScenario.funFact}`);
    }
  }, [playerPos, currentScenario, isVictory, playSound, triggerConfetti, addPoints, addCoins, incrementActivities, onWinExercise, speak]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleMove(1, 0);
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        handleMove(0, -1);
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        handleMove(0, 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  // Touch gestures swipe handling with touch-action: none
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 25) {
      if (absX > absY) {
        handleMove(0, dx > 0 ? 1 : -1);
      } else {
        handleMove(dy > 0 ? 1 : -1, 0);
      }
    }
    touchStartRef.current = null;
  };

  const handleNextLevel = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    playSound('pop');
    const next = selectNextScenario();
    setCurrentScenario(next);
    setPlayerPos(next.start);
    setStepsTaken(0);
    setIsVictory(false);

    playAudioPromise(
      `${next.prompt} Guía al ${next.animalName}.`,
      { speed: 0.85, pitch: 1.15 }
    );
  };

  const handleResetMaze = () => {
    playSound('pop');
    setPlayerPos(currentScenario.start);
    setStepsTaken(0);
    setIsVictory(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-animals-maze"
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
          ← Volver a Animales
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-cyan-50 text-cyan-700 font-black text-xs rounded-full border border-cyan-200 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-500" />
            Racha de Explorador: {streak} 🔥
          </span>
          <span className="px-3 py-1.5 bg-slate-100 text-slate-600 font-black text-xs rounded-full border border-slate-200">
            Pasos: {stepsTaken}
          </span>
        </div>
      </div>

      {/* Main Maze Stage */}
      <div className={`bg-gradient-to-b ${currentScenario.themeBg} rounded-3xl p-6 sm:p-8 border-2 ${currentScenario.themeBorder} shadow-md space-y-6`}>
        {/* Scenario Heading */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="px-3.5 py-1 bg-white/80 text-cyan-800 font-black text-xs rounded-full uppercase tracking-wider border border-cyan-200">
            Laberinto de Hábitats
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
            <span>{currentScenario.animalEmoji}</span> {currentScenario.animalName}
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            {currentScenario.prompt}
          </p>

          <button
            onClick={() => {
              playSound('pop');
              cancelActiveAudio();
              playAudioPromise(
                `${currentScenario.prompt} Llegarás a ${currentScenario.targetName}.`,
                { speed: 0.85, pitch: 1.15 }
              );
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-black text-xs rounded-full border border-slate-200 shadow-2xs transition-all cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5 text-cyan-600" /> Escuchar Misión
          </button>
        </div>

        {/* Maze Grid Display with touch-action: none */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            id="animal-maze-grid-container"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className={`relative p-3 sm:p-4 bg-white/95 rounded-3xl border-3 ${currentScenario.themeBorder} shadow-xl select-none transition-transform ${
              wallBump ? 'animate-shake' : ''
            }`}
          >
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: `repeat(${currentScenario.gridSize.cols}, minmax(0, 1fr))`,
              }}
            >
              {currentScenario.layout.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const isPlayer = playerPos.r === rIdx && playerPos.c === cIdx;
                  const isGoal =
                    currentScenario.goal.r === rIdx &&
                    currentScenario.goal.c === cIdx;
                  const isStart =
                    currentScenario.start.r === rIdx &&
                    currentScenario.start.c === cIdx;
                  const isWall = cell === 1;

                  let cellBg = 'bg-slate-50/80 border-slate-200';
                  if (isWall) {
                    cellBg = 'bg-slate-700 border-slate-800 shadow-inner';
                  } else if (isGoal) {
                    cellBg = 'bg-amber-100 border-amber-300 animate-pulse';
                  }

                  return (
                    <div
                      key={`${rIdx}-${cIdx}`}
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl border-2 flex items-center justify-center text-2xl sm:text-3xl relative transition-all duration-150 ${cellBg}`}
                    >
                      {isWall && <span className="text-sm select-none opacity-40">🧱</span>}

                      {isGoal && !isPlayer && (
                        <span className="animate-bounce select-none">
                          {currentScenario.targetEmoji}
                        </span>
                      )}

                      {isPlayer && (
                        <span className="scale-125 filter drop-shadow-md z-10 select-none animate-in zoom-in duration-100">
                          {currentScenario.animalEmoji}
                        </span>
                      )}

                      {isStart && !isPlayer && !isGoal && (
                        <span className="text-[10px] font-black text-slate-400 select-none">
                          INICIO
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* D-Pad Touch Controls */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <button
              id="btn-maze-up"
              onClick={() => handleMove(-1, 0)}
              disabled={isVictory}
              aria-label="Arriba"
              className="w-14 h-14 bg-white hover:bg-cyan-50 active:bg-cyan-100 border-2 border-slate-300 active:scale-95 rounded-2xl shadow-md flex items-center justify-center text-slate-700 font-black cursor-pointer transition-all disabled:opacity-50"
            >
              <ArrowUp className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3">
              <button
                id="btn-maze-left"
                onClick={() => handleMove(0, -1)}
                disabled={isVictory}
                aria-label="Izquierda"
                className="w-14 h-14 bg-white hover:bg-cyan-50 active:bg-cyan-100 border-2 border-slate-300 active:scale-95 rounded-2xl shadow-md flex items-center justify-center text-slate-700 font-black cursor-pointer transition-all disabled:opacity-50"
              >
                <ArrowLeftIcon className="w-6 h-6" />
              </button>

              <button
                id="btn-maze-reset"
                onClick={handleResetMaze}
                aria-label="Reiniciar posición"
                className="w-12 h-12 bg-slate-100 hover:bg-slate-200 active:scale-95 border-2 border-slate-300 rounded-2xl shadow-sm flex items-center justify-center text-slate-500 font-black cursor-pointer transition-all"
                title="Reiniciar Posición"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                id="btn-maze-right"
                onClick={() => handleMove(0, 1)}
                disabled={isVictory}
                aria-label="Derecha"
                className="w-14 h-14 bg-white hover:bg-cyan-50 active:bg-cyan-100 border-2 border-slate-300 active:scale-95 rounded-2xl shadow-md flex items-center justify-center text-slate-700 font-black cursor-pointer transition-all disabled:opacity-50"
              >
                <ArrowRightIcon className="w-6 h-6" />
              </button>
            </div>

            <button
              id="btn-maze-down"
              onClick={() => handleMove(1, 0)}
              disabled={isVictory}
              aria-label="Abajo"
              className="w-14 h-14 bg-white hover:bg-cyan-50 active:bg-cyan-100 border-2 border-slate-300 active:scale-95 rounded-2xl shadow-md flex items-center justify-center text-slate-700 font-black cursor-pointer transition-all disabled:opacity-50"
            >
              <ArrowDown className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Victory Celebration Card */}
        {isVictory && (
          <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-300">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-base font-black">
                  ¡Meta Alcanzada! +15 XP • +2 🪙
                </h4>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {currentScenario.funFact}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextLevel}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Laberinto →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
