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
  Trophy,
  Puzzle,
  Lightbulb,
} from 'lucide-react';

interface AnimalPuzzleGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface AnimalPuzzleData {
  id: string;
  name: string;
  emoji: string;
  soundText: string;
  onomatopoeia: string;
  habitat: string;
  funFact: string;
  accentColor: string;
  bgGradient: string;
  svgBadge: string;
}

const PUZZLE_ANIMALS: AnimalPuzzleData[] = [
  {
    id: 'leon',
    name: 'León Majestuoso',
    emoji: '🦁',
    soundText: '¡Rrrroooaaarr!',
    onomatopoeia: 'Rugido poderoso',
    habitat: 'Sabana Africana',
    funFact: 'La melena del león se vuelve más oscura a medida que envejece y lo protege durante las luchas.',
    accentColor: '#f59e0b',
    bgGradient: 'from-amber-100 to-orange-100',
    svgBadge: '🦁',
  },
  {
    id: 'elefante',
    name: 'Elefante Sabio',
    emoji: '🐘',
    soundText: '¡Barritooo fffffrrr!',
    onomatopoeia: 'Barrito con su trompa',
    habitat: 'Selvas y Sabanas',
    funFact: 'Tienen una memoria prodigiosa y se saludan entrelazando sus trompas con mucho afecto.',
    accentColor: '#8b5cf6',
    bgGradient: 'from-purple-100 to-indigo-100',
    svgBadge: '🐘',
  },
  {
    id: 'pinguino',
    name: 'Pingüino Emperador',
    emoji: '🐧',
    soundText: '¡Cuac graznido polar!',
    onomatopoeia: 'Graznido sobre el hielo',
    habitat: 'Antártida',
    funFact: 'Los papás pingüinos cuidan el huevo sobre sus patitas durante dos meses sin comer para mantenerlo tibio.',
    accentColor: '#06b6d4',
    bgGradient: 'from-cyan-100 to-sky-100',
    svgBadge: '🐧',
  },
  {
    id: 'mono',
    name: 'Mono Curioso',
    emoji: '🐵',
    soundText: '¡Uu uu aa aa!',
    onomatopoeia: 'Gritos alegres de selva',
    habitat: 'Bosques Tropicales',
    funFact: 'Utilizan herramientas como ramas y piedras para conseguir comida y abrir frutos duros.',
    accentColor: '#10b981',
    bgGradient: 'from-emerald-100 to-teal-100',
    svgBadge: '🐵',
  },
  {
    id: 'jirafa',
    name: 'Jirafa Curiosa',
    emoji: '🦒',
    soundText: '¡Zumbido suave!',
    onomatopoeia: 'Zumbido de cuello largo',
    habitat: 'Sabana Africana',
    funFact: 'Tienen una lengua azul muy larga de casi medio metro que les permite comer hojas sin pincharse.',
    accentColor: '#eab308',
    bgGradient: 'from-yellow-100 to-amber-100',
    svgBadge: '🦒',
  },
  {
    id: 'buho',
    name: 'Búho Sabio',
    emoji: '🦉',
    soundText: '¡Uuuh uuuh!',
    onomatopoeia: 'Canto nocturno',
    habitat: 'Bosques Templados',
    funFact: 'Pueden girar su cabeza 270 grados para ver casi todo a su alrededor sin mover el cuerpo.',
    accentColor: '#6366f1',
    bgGradient: 'from-indigo-100 to-blue-100',
    svgBadge: '🦉',
  },
  {
    id: 'delfin',
    name: 'Delfín Saltarín',
    emoji: '🐬',
    soundText: '¡Chirrido y chasquidos!',
    onomatopoeia: 'Ecolocalización marina',
    habitat: 'Océanos del Mundo',
    funFact: 'Cada delfín tiene un silbido propio y único, ¡como si fuera su propio nombre!',
    accentColor: '#0ea5e9',
    bgGradient: 'from-sky-100 to-cyan-100',
    svgBadge: '🐬',
  },
  {
    id: 'tigre',
    name: 'Tigre de Bengala',
    emoji: '🐯',
    soundText: '¡Grrr rugido felino!',
    onomatopoeia: 'Rugido rayado',
    habitat: 'Selvas Asiáticas',
    funFact: 'Las rayas de cada tigre son totalmente únicas, como nuestras huellas dactilares.',
    accentColor: '#ea580c',
    bgGradient: 'from-orange-100 to-rose-100',
    svgBadge: '🐯',
  },
];

// Progressive Puzzle Configurations
interface LevelConfig {
  level: number;
  name: string;
  rows: number;
  cols: number;
  totalPieces: number;
  xpReward: number;
  coinReward: number;
}

const PUZZLE_LEVELS: LevelConfig[] = [
  { level: 1, name: 'Nivel 1: Principiante (4 Piezas)', rows: 2, cols: 2, totalPieces: 4, xpReward: 10, coinReward: 1 },
  { level: 2, name: 'Nivel 2: Explorador (6 Piezas)', rows: 2, cols: 3, totalPieces: 6, xpReward: 15, coinReward: 2 },
  { level: 3, name: 'Nivel 3: Maestro (9 Piezas)', rows: 3, cols: 3, totalPieces: 9, xpReward: 20, coinReward: 3 },
  { level: 4, name: 'Nivel 4: Gran Safari (12 Piezas)', rows: 3, cols: 4, totalPieces: 12, xpReward: 30, coinReward: 5 },
];

interface PuzzlePiece {
  id: number;
  correctIndex: number;
  currentSlot: number;
}

export const AnimalPuzzleGame: React.FC<AnimalPuzzleGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const currentConfig = PUZZLE_LEVELS[currentLevelIndex];

  // No-repeat engine
  const playedAnimalsRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectNextAnimal = useCallback((): AnimalPuzzleData => {
    const history = playedAnimalsRef.current;
    const threshold = Math.ceil(PUZZLE_ANIMALS.length * 0.7);

    let candidates = PUZZLE_ANIMALS.filter((a) => !history.includes(a.id));
    if (candidates.length === 0 || history.length >= threshold) {
      playedAnimalsRef.current = history.slice(-1);
      candidates = PUZZLE_ANIMALS.filter((a) => !playedAnimalsRef.current.includes(a.id));
    }

    const shuffled = shuffleArray(candidates);
    const chosen = shuffled[0] || PUZZLE_ANIMALS[0];
    playedAnimalsRef.current.push(chosen.id);
    return chosen;
  }, []);

  const [currentAnimal, setCurrentAnimal] = useState<AnimalPuzzleData>(() => PUZZLE_ANIMALS[0]);
  const [pieces, setPieces] = useState<PuzzlePiece[]>([]);
  const [selectedPieceIndex, setSelectedPieceIndex] = useState<number | null>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [showSilhouette, setShowSilhouette] = useState<boolean>(true);

  // Audio cleanup on unmount
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

  // Initialize or reset puzzle pieces for current animal & level
  const initPuzzle = useCallback(
    (animal: AnimalPuzzleData, config: LevelConfig) => {
      const total = config.totalPieces;
      const pieceArray: PuzzlePiece[] = Array.from({ length: total }, (_, i) => ({
        id: i,
        correctIndex: i,
        currentSlot: i,
      }));

      // Shuffle slots until not fully solved initially
      let shuffledSlots = shuffleArray(Array.from({ length: total }, (_, i) => i));
      let isAlreadySolved = shuffledSlots.every((slot, idx) => slot === idx);
      while (isAlreadySolved && total > 1) {
        shuffledSlots = shuffleArray(Array.from({ length: total }, (_, i) => i));
        isAlreadySolved = shuffledSlots.every((slot, idx) => slot === idx);
      }

      const randomizedPieces = pieceArray.map((p, idx) => ({
        ...p,
        currentSlot: shuffledSlots[idx],
      }));

      setPieces(randomizedPieces);
      setSelectedPieceIndex(null);
      setIsCompleted(false);

      cancelActiveAudio();
      playAudioPromise(
        `¡Rompecabezas de ${animal.name}! ${config.name}. Toca dos piezas para intercambiarlas y completar la figura.`,
        { speed: 0.85, pitch: 1.15 }
      );
    },
    []
  );

  useEffect(() => {
    const nextAnimal = selectNextAnimal();
    setCurrentAnimal(nextAnimal);
    initPuzzle(nextAnimal, currentConfig);
  }, [currentLevelIndex, initPuzzle, selectNextAnimal]);

  const handlePieceClick = (clickedSlot: number) => {
    if (isCompleted) return;

    playSound('pop');

    if (selectedPieceIndex === null) {
      // First piece selected
      setSelectedPieceIndex(clickedSlot);
    } else if (selectedPieceIndex === clickedSlot) {
      // Deselect if tapping the same piece
      setSelectedPieceIndex(null);
    } else {
      // Swap the pieces occupying selectedPieceIndex and clickedSlot
      const updatedPieces = pieces.map((p) => {
        if (p.currentSlot === selectedPieceIndex) {
          return { ...p, currentSlot: clickedSlot };
        }
        if (p.currentSlot === clickedSlot) {
          return { ...p, currentSlot: selectedPieceIndex };
        }
        return p;
      });

      setPieces(updatedPieces);
      setSelectedPieceIndex(null);

      // Check if all pieces are in their correct slots
      const allCorrect = updatedPieces.every((p) => p.currentSlot === p.correctIndex);
      if (allCorrect) {
        setIsCompleted(true);
        playSound('victoryFanfare');
        triggerConfetti();
        addPoints(currentConfig.xpReward);
        addCoins(currentConfig.coinReward);
        incrementActivities('animales');
        if (onWinExercise) {
          onWinExercise(currentConfig.xpReward, currentConfig.coinReward);
        }
        speak(
          `¡Increíble! Armaste el rompecabezas del ${currentAnimal.name}. Sonido: ${currentAnimal.soundText}. ${currentAnimal.funFact}`
        );
      }
    }
  };

  const handleNextPuzzle = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    playSound('pop');

    // If completed level, advance level if possible
    if (currentLevelIndex < PUZZLE_LEVELS.length - 1) {
      setCurrentLevelIndex((prev) => prev + 1);
    } else {
      // Loop: restart progression with next animal from level 1
      setCurrentLevelIndex(0);
      const nextAnimal = selectNextAnimal();
      setCurrentAnimal(nextAnimal);
      initPuzzle(nextAnimal, PUZZLE_LEVELS[0]);
    }
  };

  const handleRestartCurrent = () => {
    playSound('pop');
    initPuzzle(currentAnimal, currentConfig);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-animals-puzzle"
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Puzzle className="w-3.5 h-3.5 text-emerald-500" />
            {currentConfig.name}
          </span>
          <button
            onClick={() => setShowSilhouette((prev) => !prev)}
            className={`px-3 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer flex items-center gap-1 ${
              showSilhouette
                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            {showSilhouette ? 'Guía Activa' : 'Sin Guía'}
          </button>
        </div>
      </div>

      {/* Main Puzzle Stage */}
      <div className="bg-gradient-to-b from-emerald-50/70 via-teal-50/30 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md space-y-6">
        {/* Title and Animal Info */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-900 font-black text-xs rounded-full uppercase tracking-wider">
            Rompecabezas Progresivo
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
            <span>{currentAnimal.emoji}</span> {currentAnimal.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Hábitat: <strong className="text-emerald-700">{currentAnimal.habitat}</strong> • {currentAnimal.onomatopoeia}
          </p>

          <button
            onClick={() => {
              playSound('pop');
              cancelActiveAudio();
              playAudioPromise(
                `${currentAnimal.name}. Su sonido es ${currentAnimal.soundText}. ${currentAnimal.funFact}`,
                { speed: 0.85, pitch: 1.15 }
              );
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-800 font-black text-xs rounded-full border border-emerald-200 shadow-2xs transition-all"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-600" /> Escuchar Animal
          </button>
        </div>

        {/* Puzzle Board Container */}
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            id="animal-puzzle-board"
            className="relative p-4 sm:p-6 bg-white rounded-3xl border-3 border-emerald-300 shadow-xl overflow-hidden max-w-md w-full"
            style={{ minHeight: '280px' }}
          >
            {/* Optional Silhouette Backdrop / Guide */}
            {showSilhouette && !isCompleted && (
              <div className="absolute inset-0 flex items-center justify-center opacity-15 pointer-events-none select-none">
                <span className="text-9xl filter blur-2xs">{currentAnimal.emoji}</span>
              </div>
            )}

            {/* Puzzle Pieces Grid */}
            <div
              className="grid gap-2 relative z-10"
              style={{
                gridTemplateColumns: `repeat(${currentConfig.cols}, minmax(0, 1fr))`,
                gridTemplateRows: `repeat(${currentConfig.rows}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: currentConfig.totalPieces }).map((_, slotIdx) => {
                const pieceAtSlot = pieces.find((p) => p.currentSlot === slotIdx);
                if (!pieceAtSlot) return null;

                const isPieceCorrect = pieceAtSlot.currentSlot === pieceAtSlot.correctIndex;
                const isSelected = selectedPieceIndex === slotIdx;

                // Slice visuals calculation
                const row = Math.floor(pieceAtSlot.correctIndex / currentConfig.cols);
                const col = pieceAtSlot.correctIndex % currentConfig.cols;
                const bgPosX = currentConfig.cols > 1 ? (col / (currentConfig.cols - 1)) * 100 : 50;
                const bgPosY = currentConfig.rows > 1 ? (row / (currentConfig.rows - 1)) * 100 : 50;

                let borderStyle = 'border-slate-200 hover:border-emerald-400 bg-emerald-50/50';
                if (isSelected) {
                  borderStyle = 'border-amber-400 ring-4 ring-amber-300 bg-amber-100 scale-105 z-20';
                } else if (isPieceCorrect && isCompleted) {
                  borderStyle = 'border-emerald-500 bg-emerald-100 ring-2 ring-emerald-300';
                }

                return (
                  <button
                    key={slotIdx}
                    onClick={() => handlePieceClick(slotIdx)}
                    disabled={isCompleted}
                    className={`h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all transform active:scale-95 cursor-pointer relative overflow-hidden shadow-sm ${borderStyle}`}
                  >
                    {/* Visual Segment representation */}
                    <div
                      className="w-full h-full rounded-xl flex items-center justify-center text-3xl sm:text-4xl select-none"
                      style={{
                        background: `linear-gradient(135deg, ${currentAnimal.accentColor}22, ${currentAnimal.accentColor}55)`,
                      }}
                    >
                      <span className="filter drop-shadow-xs transform transition-transform group-hover:scale-110">
                        {currentAnimal.emoji}
                      </span>
                    </div>

                    {/* Corner piece index watermark */}
                    <span className="absolute bottom-1 right-2 text-[10px] font-black text-slate-400 select-none">
                      #{pieceAtSlot.id + 1}
                    </span>

                    {/* Checkmark icon if piece is in place */}
                    {isPieceCorrect && (
                      <span className="absolute top-1 right-1 text-emerald-600 text-xs font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRestartCurrent}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Barajar de Nuevo
            </button>
          </div>
        </div>

        {/* Victory Celebration Card */}
        {isCompleted && (
          <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-400">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-base font-black">
                  ¡Rompecabezas Completo! +{currentConfig.xpReward} XP • +{currentConfig.coinReward} 🪙
                </h4>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {currentAnimal.funFact}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextPuzzle}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Rompecabezas →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
