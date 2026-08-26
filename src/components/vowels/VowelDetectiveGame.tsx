/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EducationalItem, VowelLetter } from '../../types/educational';
import { getNextVowelContent } from '../../services/contentEngine';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { playAudioPromise, playEducationalRetry, cancelActiveAudio } from '../../utils/audioPromises';
import { useApp } from '../../context/AppContext';
import { VOWEL_COLORS } from '../../data/educationalItemsData';
import { Volume2, Search, ChevronLeft, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';

interface VowelDetectiveGameProps {
  difficultyLevel?: number;
  onWinExercise?: (xp: number, coins: number, vowel: VowelLetter) => void;
  onBackToHub?: () => void;
}

interface LetterTile {
  index: number;
  char: string; // Uppercase
  isTargetVowel: boolean;
  selected: boolean;
}

export const VowelDetectiveGame: React.FC<VowelDetectiveGameProps> = ({
  difficultyLevel = 1,
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, triggerConfetti, user } = useApp();
  const [level, setLevel] = useState<number>(difficultyLevel);
  const [currentItem, setCurrentItem] = useState<EducationalItem | null>(null);
  const [targetVowel, setTargetVowel] = useState<VowelLetter>('A');
  const [tiles, setTiles] = useState<LetterTile[]>([]);
  const [feedback, setFeedback] = useState<'idle' | 'evaluating' | 'correct' | 'retry'>('idle');
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load a new detective challenge from the Central Content Engine
  const loadNextChallenge = useCallback(async () => {
    setLoading(true);
    setFeedback('idle');

    try {
      const res = await getNextVowelContent({
        userId: user?.uid || user?.id || 'guest',
        gameType: 'vowelDetective',
        quantity: 1,
        difficulty: level,
      });

      if (res.items.length === 0) return;
      const item = res.items[0];

      // Pick target vowel from the item's vowel list
      const availableVowels = item.vowels;
      const pickedVowel = availableVowels[Math.floor(Math.random() * availableVowels.length)] || item.initialVowel;

      const normalizedChars = item.normalizedWord.toUpperCase().split('');
      const newTiles: LetterTile[] = normalizedChars.map((ch, idx) => ({
        index: idx,
        char: ch,
        isTargetVowel: ch === pickedVowel,
        selected: false,
      }));

      setCurrentItem(item);
      setTargetVowel(pickedVowel);
      setTiles(newTiles);

      // Prompt audio
      playAudioPromise(
        `Detective: ¡Encuentra todas las letras ${pickedVowel} en ${item.word}!`,
        { speed: 0.85, pitch: 1.15 }
      );
    } finally {
      setLoading(false);
    }
  }, [level, user]);

  useEffect(() => {
    loadNextChallenge();
  }, [loadNextChallenge]);

  const handleTileClick = (index: number) => {
    if (feedback === 'correct' || feedback === 'evaluating') return;
    playSound('card');

    setTiles((prev) =>
      prev.map((tile) => (tile.index === index ? { ...tile, selected: !tile.selected } : tile))
    );
  };

  const handleCheckAnswers = async () => {
    if (!currentItem || feedback === 'evaluating' || feedback === 'correct') return;

    setFeedback('evaluating');
    playSound('pop');

    // Count how many target vowels exist and how many user correctly selected
    const totalTargets = tiles.filter((t) => t.isTargetVowel).length;
    const correctlySelected = tiles.filter((t) => t.isTargetVowel && t.selected).length;
    const incorrectlySelected = tiles.filter((t) => !t.isTargetVowel && t.selected).length;

    const isAllCorrect = correctlySelected === totalTargets && incorrectlySelected === 0;

    // Record answer result
    await educationalFirestoreService.recordAnswerResult(
      user?.uid || user?.id || 'guest',
      targetVowel,
      isAllCorrect,
      'vowels'
    );

    if (isAllCorrect) {
      setFeedback('correct');
      playSound('success');
      triggerConfetti();
      setStreak((prev) => prev + 1);

      if (onWinExercise) {
        onWinExercise(6, 1, targetVowel);
      }

      await playAudioPromise(
        `¡Caso resuelto, gran detective! Encontraste todas las ${targetVowel} en ${currentItem.word}.`,
        { speed: 0.85, pitch: 1.2 }
      );

      setTimeout(() => {
        loadNextChallenge();
      }, 1600);
    } else {
      setFeedback('retry');
      playSound('pop');

      if (incorrectlySelected > 0) {
        await playAudioPromise(
          `Cuidado: seleccionaste una letra que no es la ${targetVowel}. ¡Revísalas bien!`,
          { speed: 0.85, pitch: 1.15 }
        );
      } else {
        await playAudioPromise(
          `¡Aún faltan letras ${targetVowel} por descubrir! Cuenta bien.`,
          { speed: 0.85, pitch: 1.15 }
        );
      }

      setFeedback('idle');
    }
  };

  const handlePronounceWord = () => {
    if (!currentItem) return;
    playSound('pop');
    playAudioPromise(currentItem.word, { speed: 0.85, pitch: 1.15 });
  };

  const targetCount = tiles.filter((t) => t.isTargetVowel).length;
  const currentSelectedCount = tiles.filter((t) => t.selected).length;
  const colorConfig = VOWEL_COLORS[targetVowel];

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          Volver a Minijuegos
        </button>

        {/* Level Controls */}
        <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-sm">
          <span className="text-xs font-bold text-slate-500 px-2">Dificultad:</span>
          {[1, 2, 3, 4, 5].map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`w-7 h-7 rounded-xl font-black text-xs transition-all cursor-pointer ${
                level === lvl
                  ? 'bg-purple-500 text-white shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Detective Stage */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg text-center space-y-6">
          {/* Mission Header */}
          <div className="flex items-center justify-between">
            <span className="px-3.5 py-1.5 bg-purple-100 text-purple-800 font-extrabold text-xs rounded-full flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-purple-600" />
              Misión Detective • Nivel {level}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Racha de casos: <strong className="text-purple-600">{streak} ⭐</strong>
            </span>
          </div>

          {/* Visual Asset & Clue */}
          <div className="flex justify-center">
            <div
              onClick={handlePronounceWord}
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-purple-50 border-3 border-purple-200 flex items-center justify-center text-7xl sm:text-8xl shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Toca para escuchar"
            >
              {currentItem.imageUrl}
            </div>
          </div>

          {/* Detective Prompt */}
          <div className="space-y-1">
            <div className="text-lg sm:text-xl font-extrabold text-slate-700 flex items-center justify-center gap-2 flex-wrap">
              <span>¡Encuentra todas las letras</span>
              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-xl ${colorConfig.bg} text-white font-black text-xl shadow-xs`}>
                {targetVowel}
              </span>
              <span>en la palabra!</span>
            </div>
            <p className="text-xs font-bold text-slate-400">
              Hay exactamente <strong className="text-purple-600">{targetCount}</strong> {targetCount === 1 ? 'vocal' : 'vocales'} {targetVowel} escondidas.
            </p>
          </div>

          {/* Interactive Letter Tiles Token Grid */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 py-2 max-w-lg mx-auto">
            {tiles.map((tile) => {
              const isSelected = tile.selected;
              const isCorrectSuccess = feedback === 'correct' && tile.isTargetVowel;

              return (
                <button
                  key={tile.index}
                  onClick={() => handleTileClick(tile.index)}
                  disabled={feedback === 'correct' || feedback === 'evaluating'}
                  className={`w-12 h-16 sm:w-16 sm:h-20 rounded-2xl font-black text-2xl sm:text-3xl transition-all cursor-pointer select-none flex items-center justify-center ${
                    isCorrectSuccess
                      ? 'bg-emerald-500 text-white shadow-lg scale-105 ring-4 ring-emerald-200 animate-bounce'
                      : isSelected
                      ? `${colorConfig.bg} text-white shadow-md scale-105 ring-4 ring-offset-1 ring-purple-200`
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-2 border-slate-200 shadow-xs'
                  }`}
                >
                  {tile.char}
                </button>
              );
            })}
          </div>

          {/* Formative Feedback */}
          {feedback === 'retry' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-xs font-bold animate-in fade-in flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Revisa las letras seleccionadas y prueba de nuevo.</span>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-black animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Caso resuelto con éxito! (+6 XP)</span>
            </div>
          )}

          {/* Verification Action Button */}
          <div className="pt-2">
            <button
              onClick={handleCheckAnswers}
              disabled={currentSelectedCount === 0 || feedback === 'correct' || feedback === 'evaluating'}
              className="px-8 py-3.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mx-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verificar ({currentSelectedCount} seleccionadas)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
