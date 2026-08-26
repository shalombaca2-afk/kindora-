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
  ALPHABET_SIMILAR_MAP,
} from '../../data/alphabetItemsData';
import {
  getNextAlphabetContentSync,
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
  Target,
  Star,
  Award,
  Layers,
  Search,
} from 'lucide-react';

interface LetterHunterGameProps {
  onWinExercise?: (xp: number, coins: number, letter: AlphabetLetter) => void;
  onBackToHub?: () => void;
}

interface LetterTile {
  id: string;
  letter: AlphabetLetter;
  isTarget: boolean;
  isFound: boolean;
}

export const LetterHunterGame: React.FC<LetterHunterGameProps> = ({
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, user, triggerConfetti } = useApp();
  const userId = user?.uid || user?.id || 'guest';

  // Game Mode: 'bubbles' (Nivel 1: Grilla de Burbujas) vs 'intraWord' (Nivel 2: Búsqueda Intra-Palabra)
  const [mode, setMode] = useState<'bubbles' | 'intraWord'>('bubbles');
  const [targetLetter, setTargetLetter] = useState<AlphabetLetter>('M');
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);

  // Bubbles mode tiles
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Intra-Word mode data
  const [wordItem, setWordItem] = useState<EducationalItem | null>(null);
  const [wordLetterTokens, setWordLetterTokens] = useState<
    { index: number; char: string; isTarget: boolean; isFound: boolean }[]
  >([]);

  // Initialize a new round
  const loadNewRound = useCallback(() => {
    cancelActiveAudio();
    setIsCompleted(false);

    // Pick a target letter
    const availableLetters = shuffleArray([...ALPHABET_LETTERS]);
    const chosenLetter = availableLetters[0];
    setTargetLetter(chosenLetter);

    if (mode === 'bubbles') {
      // Create 12 tiles: 4 target letters + 8 smart distractors
      const targetCount = 4;
      const similarDistractors = (ALPHABET_SIMILAR_MAP[chosenLetter] || []).filter(
        (l) => l !== chosenLetter
      );
      const remainingLetters = ALPHABET_LETTERS.filter(
        (l) => l !== chosenLetter && !similarDistractors.includes(l)
      );

      const tileList: LetterTile[] = [];

      // Add target tiles
      for (let i = 0; i < targetCount; i++) {
        tileList.push({
          id: `target_${i}_${Date.now()}`,
          letter: chosenLetter,
          isTarget: true,
          isFound: false,
        });
      }

      // Add similar distractors
      for (let i = 0; i < 4; i++) {
        const d = similarDistractors[i % similarDistractors.length] || remainingLetters[0];
        tileList.push({
          id: `sim_${i}_${Date.now()}`,
          letter: d as AlphabetLetter,
          isTarget: false,
          isFound: false,
        });
      }

      // Add random letters
      const shuffledRem = shuffleArray(remainingLetters);
      for (let i = 0; i < 4; i++) {
        tileList.push({
          id: `rand_${i}_${Date.now()}`,
          letter: shuffledRem[i],
          isTarget: false,
          isFound: false,
        });
      }

      setTiles(shuffleArray(tileList));

      // Audio prompt
      playAudioPromise(`¡Cazador de letras! Encuentra todas las letras ${chosenLetter}, ${ALPHABET_NAMES[chosenLetter]}.`, {
        speed: 0.85,
        pitch: 1.15,
      });
    } else {
      // Intra-word mode: Find a word containing the target letter
      const res = getNextAlphabetContentSync({
        userId,
        gameType: 'letterHunter',
        quantity: 1,
        letter: chosenLetter,
      });

      const item = res.items[0] || getNextAlphabetContentSync({ userId, gameType: 'letterHunter', quantity: 1 }).items[0];
      if (item) {
        setWordItem(item);
        const chars = item.word.toUpperCase().split('');
        const actualTarget = chars.includes(chosenLetter) ? chosenLetter : (chars[0] as AlphabetLetter);
        setTargetLetter(actualTarget);

        const tokens = chars.map((char, index) => ({
          index,
          char,
          isTarget: char === actualTarget,
          isFound: false,
        }));
        setWordLetterTokens(tokens);

        playAudioPromise(
          `Encuentra todas las letras ${actualTarget} en la palabra ${item.word}.`,
          { speed: 0.85, pitch: 1.15 }
        );
      }
    }
  }, [mode, userId]);

  useEffect(() => {
    loadNewRound();
  }, [loadNewRound]);

  // Handle clicking a bubble tile
  const handleTileClick = (tile: LetterTile) => {
    if (tile.isFound || isCompleted) return;

    if (tile.isTarget) {
      playSound('pop');
      const updated = tiles.map((t) => (t.id === tile.id ? { ...t, isFound: true } : t));
      setTiles(updated);

      // Check if all targets found
      const remainingTargets = updated.filter((t) => t.isTarget && !t.isFound);
      if (remainingTargets.length === 0) {
        handleRoundVictory();
      }
    } else {
      playSound('error');
    }
  };

  // Handle clicking an intra-word letter token
  const handleTokenClick = (tokenIndex: number) => {
    if (isCompleted) return;
    const targetToken = wordLetterTokens.find((t) => t.index === tokenIndex);
    if (!targetToken || targetToken.isFound) return;

    if (targetToken.isTarget) {
      playSound('pop');
      const updated = wordLetterTokens.map((t) =>
        t.index === tokenIndex ? { ...t, isFound: true } : t
      );
      setWordLetterTokens(updated);

      const remainingTargets = updated.filter((t) => t.isTarget && !t.isFound);
      if (remainingTargets.length === 0) {
        handleRoundVictory();
      }
    } else {
      playSound('error');
    }
  };

  const handleRoundVictory = async () => {
    setIsCompleted(true);
    playSound('success');
    triggerConfetti();
    setScore((prev) => prev + 1);

    const xp = 10;
    const coins = 5;
    if (onWinExercise) {
      onWinExercise(xp, coins, targetLetter);
    }

    educationalFirestoreService.recordAnswerResult(userId, targetLetter, true, 'alphabet');

    await playAudioPromise(`¡Excelente cazador! ¡Las encontraste todas!`, {
      speed: 0.9,
      pitch: 1.2,
    });

    setTimeout(() => {
      setRound((prev) => prev + 1);
      loadNewRound();
    }, 1200);
  };

  const colorConfig = ALPHABET_COLORS[targetLetter] || {
    bg: '#e0f2fe',
    text: '#0284c7',
    border: '#bae6fd',
  };

  const totalTargets =
    mode === 'bubbles'
      ? tiles.filter((t) => t.isTarget).length
      : wordLetterTokens.filter((t) => t.isTarget).length;

  const foundTargets =
    mode === 'bubbles'
      ? tiles.filter((t) => t.isTarget && t.isFound).length
      : wordLetterTokens.filter((t) => t.isTarget && t.isFound).length;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Navigation & Mode Switch */}
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

        {/* Mode Switcher */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-xs">
          <button
            onClick={() => {
              playSound('pop');
              setMode('bubbles');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'bubbles'
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Nivel 1: Burbujas Mixtas
          </button>
          <button
            onClick={() => {
              playSound('pop');
              setMode('intraWord');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
              mode === 'intraWord'
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            Nivel 2: Búsqueda en Palabra
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

      {/* Main Game Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
        {/* Mission Goal Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-4 sm:p-6 rounded-3xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div
              style={{
                backgroundColor: colorConfig.bg,
                borderColor: colorConfig.border,
                color: colorConfig.text,
              }}
              className="w-16 h-16 rounded-2xl border-2 flex items-center justify-center text-4xl font-black shadow-xs"
            >
              {targetLetter}
            </div>
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-extrabold uppercase text-slate-400">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                Misión de Caza
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#344054]">
                ¡Encuentra todas las letras {targetLetter}!
              </h2>
            </div>
          </div>

          {/* Target Counter Pill */}
          <div className="bg-white px-5 py-3 rounded-2xl border-2 border-slate-200 shadow-2xs text-center">
            <div className="text-xl font-black text-emerald-600">
              {foundTargets} / {totalTargets}
            </div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Encontradas
            </span>
          </div>
        </div>

        {/* MODE 1: Bubbles Grid */}
        {mode === 'bubbles' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
              {tiles.map((tile) => {
                const letterColor = ALPHABET_COLORS[tile.letter] || {
                  bg: '#f8fafc',
                  text: '#334155',
                  border: '#cbd5e1',
                };
                return (
                  <button
                    key={tile.id}
                    id={`tile-${tile.id}`}
                    onClick={() => handleTileClick(tile)}
                    disabled={tile.isFound || isCompleted}
                    style={{
                      backgroundColor: tile.isFound ? '#dcfce7' : '#ffffff',
                      borderColor: tile.isFound ? '#22c55e' : '#e2e8f0',
                      color: tile.isFound ? '#15803d' : letterColor.text,
                    }}
                    className={`h-24 sm:h-28 rounded-3xl border-3 font-black text-3xl sm:text-4xl flex items-center justify-center transition-all transform cursor-pointer shadow-xs active:scale-90 ${
                      tile.isFound
                        ? 'scale-95 opacity-90 shadow-none'
                        : 'hover:scale-105 hover:shadow-md'
                    }`}
                  >
                    {tile.letter}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 2: Intra-Word Token Hunt */}
        {mode === 'intraWord' && wordItem && (
          <div className="space-y-6 py-4 text-center">
            {/* Word Visual Illustration */}
            <div className="text-8xl sm:text-9xl animate-in zoom-in duration-200">
              {wordItem.imageUrl}
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">
                Toca cada letra {targetLetter} en la palabra:
              </span>

              {/* Interactive Letter Tokens */}
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                {wordLetterTokens.map((token) => {
                  return (
                    <button
                      key={token.index}
                      id={`token-${token.index}`}
                      onClick={() => handleTokenClick(token.index)}
                      disabled={token.isFound || isCompleted}
                      className={`w-14 h-16 sm:w-18 sm:h-20 rounded-2xl border-3 font-black text-2xl sm:text-4xl flex items-center justify-center transition-all transform cursor-pointer shadow-xs active:scale-95 ${
                        token.isFound
                          ? 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105 animate-pulse'
                          : 'bg-white border-slate-300 text-slate-700 hover:border-sky-400 hover:scale-105'
                      }`}
                    >
                      {token.char}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Victory Celebration Box */}
        {isCompleted && (
          <div className="p-4 bg-emerald-100 border-2 border-emerald-300 rounded-2xl text-center text-emerald-900 font-black text-base flex items-center justify-center gap-2 animate-in zoom-in duration-200">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
            <span>¡Misión cumplida! +10 XP • +5 Monedas</span>
          </div>
        )}
      </div>
    </div>
  );
};
