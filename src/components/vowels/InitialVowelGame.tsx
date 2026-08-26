/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { EducationalItem, VowelLetter } from '../../types/educational';
import { getNextVowelContent, generateVowelDistractors } from '../../services/contentEngine';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { playAudioPromise, playEducationalRetry, cancelActiveAudio } from '../../utils/audioPromises';
import { useApp } from '../../context/AppContext';
import { VOWEL_COLORS } from '../../data/educationalItemsData';
import { Volume2, Sparkles, ChevronLeft, CheckCircle2, RotateCcw, EyeOff, Ear } from 'lucide-react';

interface InitialVowelGameProps {
  difficultyLevel?: number;
  onWinExercise?: (xp: number, coins: number, vowel: VowelLetter) => void;
  onBackToHub?: () => void;
}

export const InitialVowelGame: React.FC<InitialVowelGameProps> = ({
  difficultyLevel = 2,
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, triggerConfetti, user } = useApp();
  const [level, setLevel] = useState<number>(difficultyLevel);
  const [currentItem, setCurrentItem] = useState<EducationalItem | null>(null);
  const [options, setOptions] = useState<VowelLetter[]>([]);
  const [selectedOption, setSelectedOption] = useState<VowelLetter | null>(null);
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

  // Load challenge from Content Selection Engine
  const loadNextChallenge = useCallback(async () => {
    setLoading(true);
    setSelectedOption(null);
    setFeedback('idle');

    try {
      const res = await getNextVowelContent({
        userId: user?.uid || user?.id || 'guest',
        gameType: 'initialVowel',
        quantity: 1,
        difficulty: level,
      });

      if (res.items.length === 0) return;
      const item = res.items[0];
      const vowelOptions = generateVowelDistractors(item.initialVowel, 3);

      setCurrentItem(item);
      setOptions(vowelOptions);

      // Auditory cue prompt
      playAudioPromise(`¿Con qué vocal empieza ${item.word}?`, { speed: 0.85, pitch: 1.15 });
    } finally {
      setLoading(false);
    }
  }, [level, user]);

  useEffect(() => {
    loadNextChallenge();
  }, [loadNextChallenge]);

  const handlePlayAudio = () => {
    if (!currentItem) return;
    playSound('pop');
    playAudioPromise(currentItem.word, { speed: 0.85, pitch: 1.15 });
  };

  const handleSelectOption = async (option: VowelLetter) => {
    if (!currentItem || feedback === 'evaluating' || feedback === 'correct') return;

    setSelectedOption(option);
    setFeedback('evaluating');
    playSound('card');

    const isCorrect = option === currentItem.initialVowel;

    // Record progress
    await educationalFirestoreService.recordAnswerResult(
      user?.uid || user?.id || 'guest',
      currentItem.initialVowel,
      isCorrect,
      'vowels'
    );

    if (isCorrect) {
      setFeedback('correct');
      playSound('success');
      triggerConfetti();
      setStreak((prev) => prev + 1);

      if (onWinExercise) {
        onWinExercise(5, 1, currentItem.initialVowel);
      }

      await playAudioPromise(
        `¡Correcto! ${currentItem.word} empieza con la vocal ${option}.`,
        { speed: 0.85, pitch: 1.2 }
      );

      setTimeout(() => {
        loadNextChallenge();
      }, 1500);
    } else {
      setFeedback('retry');
      playSound('pop');
      await playEducationalRetry(
        currentItem.initialVowel,
        currentItem.word,
        currentItem.pronunciation
      );
      setFeedback('idle');
      setSelectedOption(null);
    }
  };

  const hideWrittenWord = level >= 2;

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
                  ? 'bg-sky-500 text-white shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Arena */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg text-center space-y-6">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-sky-100 text-sky-800 font-extrabold text-xs rounded-full flex items-center gap-1">
              <Ear className="w-3.5 h-3.5 text-sky-600" />
              {hideWrittenWord ? 'Discriminación Auditiva Pura' : 'Lectura y Sonido'} • Nivel {level}
            </span>
            <span className="text-xs font-bold text-slate-400">
              Aciertos seguidos: <strong className="text-sky-600">{streak} ⭐</strong>
            </span>
          </div>

          {/* Visual Asset Clue */}
          <div className="flex justify-center">
            <div
              onClick={handlePlayAudio}
              className="w-36 h-36 sm:w-44 sm:h-44 rounded-3xl bg-sky-50 border-3 border-sky-200 flex items-center justify-center text-7xl sm:text-8xl shadow-inner cursor-pointer hover:scale-105 active:scale-95 transition-transform"
              title="Toca para escuchar"
            >
              {currentItem.imageUrl}
            </div>
          </div>

          {/* Word Presentation (Hidden if Difficulty >= 2 for pure auditory discrimination) */}
          <div className="space-y-2">
            {hideWrittenWord ? (
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-bold bg-slate-50 py-2 px-4 rounded-2xl max-w-xs mx-auto border border-slate-200">
                <EyeOff className="w-4 h-4 text-slate-400" />
                <span>Palabra oculta para agudizar el oído</span>
              </div>
            ) : (
              <div className="text-3xl font-black text-slate-800">
                {feedback === 'correct' ? (
                  <span className="text-emerald-600">{currentItem.word}</span>
                ) : (
                  currentItem.word
                )}
              </div>
            )}

            <div>
              <button
                onClick={handlePlayAudio}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs rounded-full shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Toca para escuchar la palabra</span>
              </button>
            </div>
          </div>

          {/* Formative Feedback Banners */}
          {feedback === 'retry' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-xs font-bold animate-in fade-in flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Escucha cómo suena al inicio: "{currentItem.word.charAt(0)}..." ¡Inténtalo de nuevo!</span>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-black animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Muy bien! Empieza con la vocal {currentItem.initialVowel} (+5 XP)</span>
            </div>
          )}

          {/* 4 Options Grid */}
          <div className="pt-2">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              ¿Con qué vocal empieza?
            </p>
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
              {options.map((opt) => {
                const c = VOWEL_COLORS[opt];
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectOption(opt)}
                    disabled={feedback === 'correct' || feedback === 'evaluating'}
                    className={`py-4 sm:py-5 rounded-2xl font-black text-2xl sm:text-3xl transition-all cursor-pointer select-none active:scale-95 shadow-md ${
                      isSelected && feedback === 'correct'
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-200'
                        : `${c.bg} text-white hover:brightness-110 shadow-[0_4px_0_rgba(0,0,0,0.15)]`
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
