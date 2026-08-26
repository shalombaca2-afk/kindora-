/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EducationalItem, AlphabetLetter } from '../../types/educational';
import {
  ALPHABET_LETTERS,
  ALPHABET_NAMES,
  ALPHABET_COLORS,
} from '../../data/alphabetItemsData';
import {
  getNextAlphabetContentSync,
  generateAlphabetDistractors,
  shuffleArray,
} from '../../services/alphabetContentEngine';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  Puzzle,
  RotateCcw,
  Star,
  Zap,
  HelpCircle,
} from 'lucide-react';

interface BuildWordGameProps {
  onWinExercise?: (xp: number, coins: number, letter: AlphabetLetter) => void;
  onBackToHub?: () => void;
}

export const BuildWordGame: React.FC<BuildWordGameProps> = ({
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, user, triggerConfetti } = useApp();
  const userId = user?.uid || user?.id || 'guest';

  // Level: 1 (Falta Inicial), 2 (Falta Intermedia), 3 (Palabra Desordenada)
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  const [currentItem, setCurrentItem] = useState<EducationalItem | null>(null);
  const [missingIndex, setMissingIndex] = useState<number>(0);
  const [correctLetter, setCorrectLetter] = useState<string>('');

  // For Levels 1 & 2: Multiple Choice Options
  const [choiceOptions, setChoiceOptions] = useState<string[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);

  // For Level 3: Scrambled Tiles & Placed Slots (Supports Hybrid Drag & Drop + Tap)
  const [scrambledPool, setScrambledPool] = useState<{ id: string; letter: string }[]>([]);
  const [placedSlots, setPlacedSlots] = useState<(string | null)[]>([]);

  const [isCompleted, setIsCompleted] = useState(false);
  const [draggedTileId, setDraggedTileId] = useState<string | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const loadNewRound = useCallback(() => {
    cancelActiveAudio();
    setIsCompleted(false);
    setSelectedChoice(null);

    const res = getNextAlphabetContentSync({
      userId,
      gameType: 'buildWord',
      quantity: 1,
      difficulty: level,
    });

    const item = res.items[0];
    if (!item) return;
    setCurrentItem(item);

    const wordChars = item.word.toUpperCase().split('');

    if (level === 1) {
      // Missing initial letter
      setMissingIndex(0);
      const letter = wordChars[0];
      setCorrectLetter(letter);
      const distractors = generateAlphabetDistractors(letter as AlphabetLetter, 3);
      setChoiceOptions(distractors);

      playAudioPromise(`¿Qué letra falta al inicio de ${item.word}?`, {
        speed: 0.85,
        pitch: 1.15,
      });
    } else if (level === 2) {
      // Missing middle letter (index 1 to length-2)
      const midIdx =
        wordChars.length > 2
          ? Math.floor(Math.random() * (wordChars.length - 2)) + 1
          : 1;
      setMissingIndex(midIdx);
      const letter = wordChars[midIdx] || wordChars[0];
      setCorrectLetter(letter);
      const distractors = generateAlphabetDistractors(
        (ALPHABET_LETTERS.includes(letter as AlphabetLetter) ? letter : 'A') as AlphabetLetter,
        3
      );
      setChoiceOptions(distractors);

      playAudioPromise(`¿Qué letra falta en la palabra ${item.word}?`, {
        speed: 0.85,
        pitch: 1.15,
      });
    } else {
      // Level 3: Full Scrambled Tiles
      const initialSlots: (string | null)[] = Array(wordChars.length).fill(null);
      setPlacedSlots(initialSlots);

      const tiles = wordChars.map((letter, idx) => ({
        id: `tile_${idx}_${letter}_${Date.now()}`,
        letter,
      }));
      setScrambledPool(shuffleArray(tiles));

      playAudioPromise(`¡Ordena las letras para formar ${item.word}!`, {
        speed: 0.85,
        pitch: 1.15,
      });
    }
  }, [level, userId]);

  useEffect(() => {
    loadNewRound();
  }, [loadNewRound]);

  // Handle choice selection for Levels 1 & 2
  const handleSelectChoice = (choice: string) => {
    if (isCompleted || !currentItem) return;
    setSelectedChoice(choice);

    if (choice === correctLetter) {
      handleVictory();
    } else {
      playSound('error');
      setTimeout(() => setSelectedChoice(null), 800);
    }
  };

  // Level 3: Tap a tile from the scrambled pool to place it in the next empty slot
  const handleTapPoolTile = (tileId: string) => {
    if (isCompleted || !currentItem) return;

    const tile = scrambledPool.find((t) => t.id === tileId);
    if (!tile) return;

    const firstEmptyIndex = placedSlots.findIndex((s) => s === null);
    if (firstEmptyIndex === -1) return;

    playSound('pop');
    const newPlaced = [...placedSlots];
    newPlaced[firstEmptyIndex] = tile.letter;
    setPlacedSlots(newPlaced);

    setScrambledPool(scrambledPool.filter((t) => t.id !== tileId));

    // Check if word is complete
    checkLevel3Completion(newPlaced);
  };

  // Level 3: Drop a dragged tile on a specific slot
  const handleDropOnSlot = (slotIndex: number, e: React.DragEvent) => {
    e.preventDefault();
    if (isCompleted || !currentItem) return;

    const tileId = e.dataTransfer.getData('text/plain') || draggedTileId;
    if (!tileId) return;

    const tile = scrambledPool.find((t) => t.id === tileId);
    if (!tile) return;

    playSound('pop');
    const newPlaced = [...placedSlots];
    const existingLetter = newPlaced[slotIndex];

    // Place letter
    newPlaced[slotIndex] = tile.letter;
    setPlacedSlots(newPlaced);

    // If there was already a letter in that slot, return it to the pool
    let newPool = scrambledPool.filter((t) => t.id !== tileId);
    if (existingLetter) {
      newPool = [...newPool, { id: `returned_${Date.now()}`, letter: existingLetter }];
    }
    setScrambledPool(newPool);
    setDraggedTileId(null);

    checkLevel3Completion(newPlaced);
  };

  // Level 3: Tap a placed slot to return the letter back to the pool
  const handleTapPlacedSlot = (slotIndex: number) => {
    if (isCompleted || !currentItem) return;

    const letter = placedSlots[slotIndex];
    if (!letter) return;

    playSound('pop');
    const newPlaced = [...placedSlots];
    newPlaced[slotIndex] = null;
    setPlacedSlots(newPlaced);

    setScrambledPool([...scrambledPool, { id: `returned_${Date.now()}`, letter }]);
  };

  const checkLevel3Completion = (slots: (string | null)[]) => {
    if (!currentItem) return;
    if (slots.some((s) => s === null)) return;

    const constructedWord = slots.join('');
    if (constructedWord === currentItem.word.toUpperCase()) {
      handleVictory();
    } else {
      playSound('error');
    }
  };

  const handleVictory = async () => {
    if (!currentItem) return;
    setIsCompleted(true);
    playSound('success');
    triggerConfetti();
    setScore((prev) => prev + 1);

    const xp = level * 10;
    const coins = level * 5;
    const targetLetter = (currentItem.initialLetter || 'A') as AlphabetLetter;

    if (onWinExercise) {
      onWinExercise(xp, coins, targetLetter);
    }

    educationalFirestoreService.recordAnswerResult(userId, targetLetter, true, 'alphabet');

    await playAudioPromise(`¡Excelente! ¡Formaste la palabra ${currentItem.word}!`, {
      speed: 0.88,
      pitch: 1.2,
    });

    setTimeout(() => {
      setRound((prev) => prev + 1);
      loadNewRound();
    }, 1400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Level Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          id="btn-back-hub"
          onClick={() => {
            cancelActiveAudio();
            onBackToHub?.();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-sm cursor-pointer w-fit"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          Volver al Abecedario
        </button>

        {/* Level Selector */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-xs">
          <button
            onClick={() => {
              playSound('pop');
              setLevel(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              level === 1
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Nivel 1: Falta Inicial
          </button>
          <button
            onClick={() => {
              playSound('pop');
              setLevel(2);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              level === 2
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Nivel 2: Falta Intermedia
          </button>
          <button
            onClick={() => {
              playSound('pop');
              setLevel(3);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              level === 3
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Nivel 3: Desordenada
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 font-black text-xs rounded-2xl border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Ronda {round} • Puntos: {score * 10}
          </span>
        </div>
      </div>

      {/* Main Game Card */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#344054]">
              Construye la Palabra
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {level === 1 && 'Elige la letra que completa el inicio de la palabra.'}
              {level === 2 && 'Encuentra la letra que falta en el medio de la palabra.'}
              {level === 3 && 'Toca o arrastra las letras en el orden correcto.'}
            </p>
          </div>

          {/* Visual Presentation Area */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 rounded-3xl border border-slate-100 space-y-6">
            {/* Word Visual */}
            <div className="text-8xl sm:text-9xl animate-in zoom-in duration-200">
              {currentItem.imageUrl}
            </div>

            {/* LEVELS 1 & 2: Word Slot with Missing Gap */}
            {level !== 3 && (
              <div className="flex items-center justify-center gap-2 sm:gap-3">
                {currentItem.word
                  .toUpperCase()
                  .split('')
                  .map((char, idx) => {
                    const isMissing = idx === missingIndex;
                    return (
                      <div
                        key={idx}
                        className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-3 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xs transition-all ${
                          isMissing
                            ? isCompleted
                              ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105'
                              : 'bg-amber-50 border-dashed border-amber-400 text-amber-700 animate-pulse'
                            : 'bg-white border-slate-300 text-slate-800'
                        }`}
                      >
                        {isMissing ? (isCompleted ? correctLetter : '?') : char}
                      </div>
                    );
                  })}
              </div>
            )}

            {/* LEVEL 3: Slots for Scrambled Letters */}
            {level === 3 && (
              <div className="space-y-6 w-full">
                {/* Target Word Slots */}
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {placedSlots.map((char, idx) => (
                    <button
                      key={idx}
                      id={`placed-slot-${idx}`}
                      onClick={() => handleTapPlacedSlot(idx)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => handleDropOnSlot(idx, e)}
                      className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-3 font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xs transition-all cursor-pointer ${
                        char
                          ? isCompleted
                            ? 'bg-emerald-100 border-emerald-500 text-emerald-800'
                            : 'bg-sky-100 border-sky-400 text-sky-800 hover:bg-rose-50 hover:border-rose-300'
                          : 'bg-slate-100 border-dashed border-slate-300 text-slate-400 hover:border-sky-400'
                      }`}
                    >
                      {char || ''}
                    </button>
                  ))}
                </div>

                {/* Scrambled Pool of Letters (Hybrid Drag & Drop / Tap-to-Place) */}
                <div className="space-y-2">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                    Arrastra o toca las letras para colocarlas:
                  </span>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 min-h-[70px]">
                    {scrambledPool.map((tile) => (
                      <button
                        key={tile.id}
                        id={`tile-${tile.id}`}
                        draggable={!isCompleted}
                        onDragStart={(e) => {
                          e.dataTransfer.setData('text/plain', tile.id);
                          setDraggedTileId(tile.id);
                        }}
                        onClick={() => handleTapPoolTile(tile.id)}
                        className="w-14 h-16 sm:w-16 sm:h-18 rounded-2xl bg-white hover:bg-emerald-50 border-3 border-emerald-400 text-emerald-800 font-black text-2xl sm:text-3xl shadow-sm hover:scale-105 active:scale-95 transition-all cursor-grab active:cursor-grabbing flex items-center justify-center"
                      >
                        {tile.letter}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Pronunciation Audio Button */}
            <button
              onClick={() => {
                playSound('pop');
                playAudioPromise(currentItem.audioWordUrl, { speed: 0.85, pitch: 1.15 });
              }}
              className="px-5 py-2 bg-white text-slate-700 hover:bg-slate-100 font-extrabold text-xs rounded-full border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Escuchar palabra ({currentItem.word})</span>
            </button>
          </div>

          {/* Option Selector for Levels 1 & 2 */}
          {level !== 3 && (
            <div className="space-y-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center">
                Selecciona la letra que falta:
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {choiceOptions.map((choice) => {
                  const isSelected = selectedChoice === choice;
                  const isCorrect = choice === correctLetter;

                  let style = 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-800';
                  if (isSelected && isCorrect) {
                    style = 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105';
                  } else if (isSelected && !isCorrect) {
                    style = 'bg-rose-100 border-rose-400 text-rose-800';
                  }

                  return (
                    <button
                      key={choice}
                      id={`btn-build-${choice}`}
                      onClick={() => handleSelectChoice(choice)}
                      className={`p-5 rounded-2xl border-3 font-black text-4xl sm:text-5xl text-center shadow-xs active:scale-95 transition-all cursor-pointer ${style}`}
                    >
                      {choice}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Victory Banner */}
          {isCompleted && (
            <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-center text-emerald-900 font-black text-base flex items-center justify-center gap-2 animate-in zoom-in duration-200">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
              <span>¡Palabra completa! +{level * 10} XP • +{level * 5} Monedas</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
