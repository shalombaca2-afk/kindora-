/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EducationalItem, AlphabetLetter, EducationalFeedbackState } from '../../types/educational';
import {
  ALPHABET_LETTERS,
  ALPHABET_NAMES,
  ALPHABET_COLORS,
} from '../../data/alphabetItemsData';
import {
  getNextAlphabetContentSync,
  generateAlphabetDistractors,
} from '../../services/alphabetContentEngine';
import {
  playAudioPromise,
  playEducationalAlphabetRetry,
  cancelActiveAudio,
} from '../../utils/audioPromises';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { useApp } from '../../context/AppContext';
import {
  Volume2,
  ChevronLeft,
  Sparkles,
  CheckCircle,
  HelpCircle,
  RotateCcw,
  Star,
  Award,
  Ear,
  Eye,
  Zap,
} from 'lucide-react';

interface InitialLetterGameProps {
  onWinExercise?: (xp: number, coins: number, letter: AlphabetLetter) => void;
  onBackToHub?: () => void;
}

export const InitialLetterGame: React.FC<InitialLetterGameProps> = ({
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, user, triggerConfetti } = useApp();
  const userId = user?.uid || user?.id || 'guest';

  // Game difficulty level: 1 (Fácil), 2 (Intermedio), 3 (Desafío)
  const [level, setLevel] = useState<1 | 2 | 3>(1);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(1);
  const [currentItem, setCurrentItem] = useState<EducationalItem | null>(null);
  const [options, setOptions] = useState<AlphabetLetter[]>([]);
  const [selectedOption, setSelectedOption] = useState<AlphabetLetter | null>(null);
  const [feedback, setFeedback] = useState<EducationalFeedbackState>({
    status: 'idle',
    message: '',
  });
  const [isLocked, setIsLocked] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Load a new round using content engine
  const loadNextRound = useCallback(() => {
    cancelActiveAudio();
    setSelectedOption(null);
    setFeedback({ status: 'idle', message: '' });
    setIsLocked(false);

    const res = getNextAlphabetContentSync({
      userId,
      gameType: 'initialLetter',
      quantity: 1,
      difficulty: level,
    });

    const item = res.items[0];
    if (item && item.initialLetter) {
      setCurrentItem(item);
      const letter = item.initialLetter as AlphabetLetter;
      const opts = generateAlphabetDistractors(letter, 3);
      setOptions(opts);

      // Auto-play audio prompt based on level
      if (level === 3) {
        playAudioPromise(`¿Con qué letra empieza la palabra? ${item.audioWordUrl}`, {
          speed: 0.85,
          pitch: 1.15,
        });
      } else {
        playAudioPromise(item.audioWordUrl, { speed: 0.85, pitch: 1.15 });
      }
    }
  }, [userId, level]);

  useEffect(() => {
    loadNextRound();
  }, [loadNextRound]);

  const handlePlayPrompt = () => {
    if (!currentItem) return;
    playSound('pop');
    playAudioPromise(currentItem.audioWordUrl, { speed: 0.85, pitch: 1.15 });
  };

  const handleSelectOption = async (option: AlphabetLetter) => {
    if (isLocked || !currentItem || !currentItem.initialLetter) return;
    setIsLocked(true);
    setSelectedOption(option);

    const correctLetter = currentItem.initialLetter as AlphabetLetter;
    const isCorrect = option === correctLetter;

    // Record result synchronously in memory + async fire-and-forget to Firestore
    educationalFirestoreService.recordAnswerResult(userId, correctLetter, isCorrect, 'alphabet');

    if (isCorrect) {
      playSound('success');
      triggerConfetti();
      setScore((prev) => prev + 1);

      const xp = level * 10;
      const coins = level * 5;
      if (onWinExercise) {
        onWinExercise(xp, coins, correctLetter);
      }

      setFeedback({
        status: 'correct',
        message: `¡Excelente! ${currentItem.word} empieza con la letra ${correctLetter} (${ALPHABET_NAMES[correctLetter]}).`,
        gainedXp: xp,
        gainedCoins: coins,
      });

      await playAudioPromise(
        `¡Muy bien! ${currentItem.word} empieza con la letra ${correctLetter}, ${ALPHABET_NAMES[correctLetter]}!`,
        { speed: 0.88, pitch: 1.2 }
      );

      // Transition to next round after short celebration
      setTimeout(() => {
        setRound((prev) => prev + 1);
        loadNextRound();
      }, 1200);
    } else {
      playSound('error');
      setFeedback({
        status: 'retry',
        message: `¡Casi! Escucha con atención para intentarlo de nuevo.`,
      });

      // Educational formative feedback without punitive message
      await playEducationalAlphabetRetry(
        correctLetter,
        ALPHABET_NAMES[correctLetter],
        currentItem.word,
        currentItem.pronunciation
      );

      // Unlock for retry
      setIsLocked(false);
      setSelectedOption(null);
    }
  };

  const correctLetter = currentItem?.initialLetter as AlphabetLetter;
  const colorConfig = correctLetter ? ALPHABET_COLORS[correctLetter] : undefined;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
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

        {/* Level Selector Pills */}
        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border-2 border-slate-200 shadow-xs">
          <button
            onClick={() => {
              playSound('pop');
              setLevel(1);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              level === 1
                ? 'bg-emerald-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Nivel 1 (Fácil)
          </button>
          <button
            onClick={() => {
              playSound('pop');
              setLevel(2);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              level === 2
                ? 'bg-sky-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Nivel 2 (Medio)
          </button>
          <button
            onClick={() => {
              playSound('pop');
              setLevel(3);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1 ${
              level === 3
                ? 'bg-purple-500 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Ear className="w-3.5 h-3.5" />
            Nivel 3 (Desafío)
          </button>
        </div>

        {/* Score & Round Counter */}
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-50 text-amber-800 font-black text-xs rounded-2xl border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            Ronda {round} • Aciertos: {score}
          </span>
        </div>
      </div>

      {/* Main Play Card */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-xl space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-[#344054]">
              ¿Con qué letra empieza?
            </h2>
            <p className="text-sm font-medium text-slate-500">
              {level === 1 && 'Observa la imagen, lee la palabra y toca la letra inicial correcta.'}
              {level === 2 && 'Observa la imagen, escucha el sonido y encuentra la letra inicial.'}
              {level === 3 && '¡Desafío auditivo! Escucha la palabra y adivina con qué letra empieza.'}
            </p>
          </div>

          {/* Visual Presentation Area */}
          <div className="flex flex-col items-center justify-center py-6 bg-slate-50/80 rounded-3xl border border-slate-100 space-y-4">
            {/* Visual Icon (Hidden in Level 3 Challenge) */}
            {level !== 3 ? (
              <div className="text-7xl sm:text-9xl animate-in zoom-in duration-200">
                {currentItem.imageUrl}
              </div>
            ) : (
              <div className="w-28 h-28 bg-purple-100 rounded-3xl border-2 border-purple-200 flex items-center justify-center text-purple-600 shadow-sm animate-pulse">
                <Ear className="w-14 h-14" />
              </div>
            )}

            {/* Word Display with Masking for Level 1 */}
            {level === 1 && (
              <div className="text-3xl sm:text-4xl font-black text-[#344054] tracking-wide">
                <span className="text-emerald-600 bg-emerald-100 px-3 py-1 rounded-xl border-2 border-emerald-300 mr-1 inline-block animate-pulse">
                  ?
                </span>
                <span>{currentItem.word.slice(1)}</span>
              </div>
            )}

            {/* Audio Prompt Button */}
            <button
              id="btn-hear-word"
              onClick={handlePlayPrompt}
              className="px-5 py-2.5 bg-white text-slate-700 hover:bg-slate-100 font-extrabold text-sm rounded-full border-2 border-slate-200 shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <Volume2 className="w-4 h-4 text-emerald-600" />
              <span>Escuchar de nuevo ({currentItem.audioWordUrl})</span>
            </button>
          </div>

          {/* Intelligent Distractor Options Grid */}
          <div className="space-y-3">
            <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center">
              Toca la letra correcta:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {options.map((option) => {
                const optColor = ALPHABET_COLORS[option] || {
                  bg: '#e0f2fe',
                  text: '#0284c7',
                  border: '#bae6fd',
                };
                const isSelected = selectedOption === option;
                const isCorrect = option === correctLetter;

                let cardStyle = 'bg-white border-slate-200 hover:border-sky-400 hover:bg-sky-50/50';
                if (feedback.status === 'correct' && isCorrect) {
                  cardStyle = 'bg-emerald-100 border-emerald-500 text-emerald-800 scale-105 shadow-md';
                } else if (isSelected && !isCorrect) {
                  cardStyle = 'bg-rose-100 border-rose-400 text-rose-800';
                }

                return (
                  <button
                    key={option}
                    id={`btn-option-${option}`}
                    onClick={() => handleSelectOption(option)}
                    disabled={isLocked}
                    className={`p-5 sm:p-6 rounded-3xl border-3 font-black text-center transition-all transform active:scale-95 cursor-pointer shadow-sm flex flex-col items-center justify-center gap-1 ${cardStyle}`}
                  >
                    <span
                      style={{
                        color:
                          feedback.status === 'correct' && isCorrect
                            ? '#059669'
                            : optColor.text,
                      }}
                      className="text-4xl sm:text-5xl font-black leading-none"
                    >
                      {option}
                    </span>
                    <span className="text-xs font-extrabold text-slate-500 mt-1">
                      {ALPHABET_NAMES[option]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Formative Feedback Message Banner */}
          {feedback.message && (
            <div
              className={`p-4 rounded-2xl border-2 text-center text-sm font-black flex items-center justify-center gap-2 animate-in fade-in duration-200 ${
                feedback.status === 'correct'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              {feedback.status === 'correct' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <HelpCircle className="w-5 h-5 text-amber-600" />
              )}
              <span>{feedback.message}</span>
              {feedback.gainedXp && (
                <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 rounded-md text-xs">
                  +{feedback.gainedXp} XP • +{feedback.gainedCoins} Monedas
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
