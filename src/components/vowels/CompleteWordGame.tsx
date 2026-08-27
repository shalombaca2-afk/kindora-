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
import { Volume2, Sparkles, ChevronLeft, CheckCircle2, RotateCcw } from 'lucide-react';
import { GameCard, ProgressDots, VowelSelector, AnimatedIllustration } from '../../design-system';

interface CompleteWordGameProps {
  difficultyLevel?: number;
  onWinExercise?: (xp: number, coins: number, vowel: VowelLetter) => void;
  onBackToHub?: () => void;
}

interface BlankChallenge {
  item: EducationalItem;
  missingVowel: VowelLetter;
  missingIndex: number; // Character index in normalizedWord
  displayTokens: { char: string; isBlank: boolean; index: number }[];
  options: VowelLetter[];
  difficulty: number;
}

export const CompleteWordGame: React.FC<CompleteWordGameProps> = ({
  difficultyLevel = 1,
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, triggerConfetti, user } = useApp();
  const [level, setLevel] = useState<number>(difficultyLevel);
  const [challenge, setChallenge] = useState<BlankChallenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<VowelLetter | null>(null);
  const [feedback, setFeedback] = useState<'idle' | 'evaluating' | 'correct' | 'retry'>('idle');
  const [scoreStreak, setScoreStreak] = useState(0);
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

  // Generate a fresh challenge using the central Content Engine
  const loadNextChallenge = useCallback(async () => {
    setLoading(true);
    setSelectedOption(null);
    setFeedback('idle');

    try {
      const res = await getNextVowelContent({
        userId: user?.uid || user?.id || 'guest',
        gameType: 'completeWord',
        quantity: 1,
        difficulty: level,
      });

      if (res.items.length === 0) return;
      const item = res.items[0];
      const wordChars = item.normalizedWord.toUpperCase().split('');

      // Find vowel positions in the word
      const vowelPositions: { vowel: VowelLetter; index: number }[] = [];
      wordChars.forEach((ch, idx) => {
        if (['A', 'E', 'I', 'O', 'U'].includes(ch)) {
          vowelPositions.push({ vowel: ch as VowelLetter, index: idx });
        }
      });

      if (vowelPositions.length === 0) return;

      // Select which vowel to hide based on current difficulty level
      let targetVowelObj = vowelPositions[0]; // Level 1 default: initial vowel
      if (level === 2 && vowelPositions.length > 1) {
        // Intermediate vowel
        targetVowelObj = vowelPositions[Math.floor(vowelPositions.length / 2)] || vowelPositions[0];
      } else if (level === 3 && vowelPositions.length > 1) {
        // Final vowel
        targetVowelObj = vowelPositions[vowelPositions.length - 1];
      } else if (level >= 4 && vowelPositions.length > 0) {
        // Random / advanced
        targetVowelObj = vowelPositions[Math.floor(Math.random() * vowelPositions.length)];
      }

      const displayTokens = wordChars.map((ch, idx) => ({
        char: ch,
        isBlank: idx === targetVowelObj.index,
        index: idx,
      }));

      const options = generateVowelDistractors(targetVowelObj.vowel, 3);

      setChallenge({
        item,
        missingVowel: targetVowelObj.vowel,
        missingIndex: targetVowelObj.index,
        displayTokens,
        options,
        difficulty: level,
      });

      // Level 4 Pre-auditory challenge auto-pronounces prompt
      if (level >= 4) {
        playAudioPromise(`¿Qué vocal falta en ${item.word}?`, { speed: 0.85, pitch: 1.15 });
      }
    } finally {
      setLoading(false);
    }
  }, [level, user]);

  useEffect(() => {
    loadNextChallenge();
  }, [loadNextChallenge]);

  const handlePlayWordAudio = () => {
    if (!challenge) return;
    playSound('pop');
    playAudioPromise(challenge.item.word, { speed: 0.85, pitch: 1.15 });
  };

  const handleSelectVowelOption = async (option: VowelLetter) => {
    if (!challenge || feedback === 'evaluating' || feedback === 'correct') return;

    setSelectedOption(option);
    setFeedback('evaluating');
    playSound('card');

    const isCorrect = option === challenge.missingVowel;

    // Record answer result into Firebase / Local storage
    await educationalFirestoreService.recordAnswerResult(
      user?.uid || user?.id || 'guest',
      challenge.missingVowel,
      isCorrect,
      'vowels'
    );

    if (isCorrect) {
      // Success flow
      setFeedback('correct');
      playSound('success');
      triggerConfetti();
      setScoreStreak((prev) => prev + 1);

      if (onWinExercise) {
        onWinExercise(5, 1, challenge.missingVowel);
      }

      await playAudioPromise(`¡Excelente! La vocal correcta es ${option}. ¡${challenge.item.word}!`, {
        speed: 0.85,
        pitch: 1.2,
      });

      // Auto advance to next challenge
      setTimeout(() => {
        loadNextChallenge();
      }, 1500);
    } else {
      // Educational Retry Pattern (Non-punitive)
      setFeedback('retry');
      playSound('pop');
      await playEducationalRetry(
        challenge.missingVowel,
        challenge.item.word,
        challenge.item.pronunciation
      );
      // Allow student to retry freely
      setFeedback('idle');
      setSelectedOption(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Top Bar Navigation & Level Selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm"
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
                  ? 'bg-amber-500 text-white shadow-sm scale-105'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Main Game Arena - wrapped in GameCard */}
      {challenge && (
        <GameCard className="text-center space-y-6">
          {/* Top Instruction Banner */}
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Nivel {level}: {level === 1 ? 'Vocal Inicial' : level === 2 ? 'Vocal Intermedia' : level === 3 ? 'Vocal Final' : 'Desafío Fonético'}
            </span>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">
                Racha actual: <strong className="text-amber-600">{scoreStreak} ⭐</strong>
              </span>
              {/* Visual streak as small progress dots (purely visual) */}
              <ProgressDots total={5} activeIndex={Math.min(scoreStreak, 4)} size={8} gap={6} />
            </div>
          </div>

          {/* Visual Clue Card - use AnimatedIllustration if available, otherwise keep markup */}
          <div className="flex justify-center">
            {/* AnimatedIllustration is used for presentation; it receives children as illustration content */}
            <AnimatedIllustration onClick={handlePlayWordAudio} className="w-32 h-32 sm:w-40 sm:h-40">
              {/* fallback content is the image URL or text provided by the item */}
              <div
                title="Toca para escuchar"
                className="w-full h-full rounded-3xl bg-amber-50 border-3 border-amber-200 flex items-center justify-center text-7xl sm:text-8xl shadow-inner cursor-pointer"
              >
                {challenge.item.imageUrl}
              </div>
            </AnimatedIllustration>
          </div>

          {/* Audio Prompt Button */}
          <div>
            <button
              onClick={handlePlayWordAudio}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-full transition-colors cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-amber-500" />
              <span>Escuchar palabra: </span>
              <span className="text-slate-900 font-black">{challenge.item.word}</span>
            </button>
          </div>

          {/* Word Blank Fill Display */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 my-4">
            {challenge.displayTokens.map((token, idx) => {
              if (token.isBlank) {
                const filled = feedback === 'correct' ? challenge.missingVowel : selectedOption;
                const c = filled ? VOWEL_COLORS[filled] : null;
                return (
                  <div
                    key={idx}
                    className={`w-12 h-16 sm:w-16 sm:h-20 rounded-2xl border-3 flex items-center justify-center text-3xl sm:text-4xl font-black transition-all ${
                      filled
                        ? `${c?.bgLight} ${c?.border} ${c?.text} animate-bounce`
                        : 'border-dashed border-amber-400 bg-amber-50 text-amber-500 animate-pulse'
                    }`}
                  >
                    {filled || '?'}
                  </div>
                );
              }
              return (
                <div
                  key={idx}
                  className="w-12 h-16 sm:w-16 sm:h-20 rounded-2xl bg-slate-100 border-2 border-slate-200 flex items-center justify-center text-3xl sm:text-4xl font-black text-slate-700 shadow-xs"
                >
                  {token.char}
                </div>
              );
            })}
          </div>

          {/* Formative Feedback Message Banner */}
          {feedback === 'retry' && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl text-amber-800 text-xs font-bold animate-in fade-in flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 animate-spin" />
              <span>¡Casi! Escucha el sonido de la palabra y prueba con otra vocal.</span>
            </div>
          )}

          {feedback === 'correct' && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-800 text-xs font-black animate-in fade-in flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>¡Fantástico! Completaste la palabra con éxito (+5 XP)</span>
            </div>
          )}

          {/* Vowel Options Selector Grid (keeps original behavior) */}
          <div className="pt-2">
            <p className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3">
              ¿Qué vocal falta para completar la palabra?
            </p>
            <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-md mx-auto">
              {challenge.options.map((opt) => {
                const c = VOWEL_COLORS[opt];
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleSelectVowelOption(opt)}
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
        </GameCard>
      )}
    </div>
  );
};
