/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { EducationalItem, AlphabetLetter } from '../../types/educational';
import {
  ALPHABET_LETTERS,
  ALPHABET_NAMES,
  ALPHABET_COLORS,
  EDUCATIONAL_ALPHABET_ITEMS,
} from '../../data/alphabetItemsData';
import { getNextAlphabetContentSync } from '../../services/alphabetContentEngine';
import { preloadMediaForItems } from '../../services/contentEngine';
import { playDecoupledAlphabetSequence, playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { useApp } from '../../context/AppContext';
import { Volume2, ChevronLeft, ChevronRight, Sparkles, Award } from 'lucide-react';

interface PureAlphabetGameProps {
  onWinExercise?: (xp: number, coins: number, letter: AlphabetLetter) => void;
  onBackToHub?: () => void;
}

export const PureAlphabetGame: React.FC<PureAlphabetGameProps> = ({
  onWinExercise,
  onBackToHub,
}) => {
  const { playSound, user } = useApp();
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter>('A');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStage, setActiveStage] = useState<'letter' | 'pause' | 'word' | 'idle'>('idle');

  // Synchronous, 0ms retrieval of words for the selected letter
  const items = useMemo(() => {
    const res = getNextAlphabetContentSync({
      userId: user?.uid || user?.id || 'guest',
      gameType: 'pureAlphabet',
      quantity: 6,
      letter: selectedLetter,
    });
    return res.items.filter((item) => item.initialLetter === selectedLetter);
  }, [selectedLetter, user]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Preload media for items
  useEffect(() => {
    if (items.length > 0) {
      preloadMediaForItems(items);
    }
  }, [items]);

  // Reset carousel index when letter changes
  useEffect(() => {
    setCurrentIndex(0);
    setActiveStage('idle');
    setIsPlayingAudio(false);
  }, [selectedLetter]);

  const currentItem =
    items[currentIndex] ||
    EDUCATIONAL_ALPHABET_ITEMS.find((i) => i.initialLetter === selectedLetter) ||
    EDUCATIONAL_ALPHABET_ITEMS[0];

  // Play decoupled audio sequence
  const handlePlaySequence = async (itemToPlay?: EducationalItem) => {
    const item = itemToPlay || currentItem;
    if (!item || isPlayingAudio) return;

    setIsPlayingAudio(true);
    playSound('pop');
    try {
      const letterAudio = item.audioLetterUrl || `Letra ${selectedLetter}, ${ALPHABET_NAMES[selectedLetter]}`;
      await playDecoupledAlphabetSequence(
        letterAudio,
        item.audioWordUrl,
        (stage) => setActiveStage(stage)
      );
    } finally {
      setIsPlayingAudio(false);
      setActiveStage('idle');
    }
  };

  const handleSelectLetter = (letter: AlphabetLetter) => {
    cancelActiveAudio();
    playSound('card');
    setSelectedLetter(letter);
    playAudioPromise(`Letra ${letter}, ${ALPHABET_NAMES[letter]}`, { speed: 0.85, pitch: 1.15 });
  };

  const handleNextWord = () => {
    if (items.length === 0) return;
    playSound('card');
    const nextIdx = (currentIndex + 1) % items.length;
    setCurrentIndex(nextIdx);
    handlePlaySequence(items[nextIdx]);
  };

  const handlePrevWord = () => {
    if (items.length === 0) return;
    playSound('card');
    const prevIdx = (currentIndex - 1 + items.length) % items.length;
    setCurrentIndex(prevIdx);
    handlePlaySequence(items[prevIdx]);
  };

  const handleSyllablePronounce = async () => {
    if (!currentItem || isPlayingAudio) return;
    playSound('pop');
    setIsPlayingAudio(true);
    try {
      await playAudioPromise(currentItem.pronunciation, { speed: 0.75, pitch: 1.15 });
      if (onWinExercise) {
        onWinExercise(2, 1, selectedLetter);
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const colorConfig = ALPHABET_COLORS[selectedLetter] || {
    bg: '#e0f2fe',
    text: '#0284c7',
    border: '#bae6fd',
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          id="btn-back-hub"
          onClick={() => {
            cancelActiveAudio();
            onBackToHub?.();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-xs hover:bg-slate-50 active:scale-95 transition-all text-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          Volver al Abecedario
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Exploración Fonética de las 27 Letras
          </span>
        </div>
      </div>

      {/* 27 Alphabet Letters Selector Grid */}
      <div className="bg-white rounded-3xl p-3.5 sm:p-5 border-2 border-slate-200 shadow-md">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
            Selecciona una letra (A - Z + Ñ):
          </span>
          <span className="text-xs font-bold text-slate-400">
            Letra activa: <strong className="text-slate-800">{selectedLetter} ({ALPHABET_NAMES[selectedLetter]})</strong>
          </span>
        </div>

        <div className="grid grid-cols-6 sm:grid-cols-9 md:grid-cols-14 gap-1.5 sm:gap-2">
          {ALPHABET_LETTERS.map((letter) => {
            const isSelected = selectedLetter === letter;
            const letterColor = ALPHABET_COLORS[letter];
            return (
              <button
                key={letter}
                id={`btn-letter-${letter}`}
                onClick={() => handleSelectLetter(letter)}
                style={{
                  backgroundColor: isSelected ? letterColor.bg : '#f8fafc',
                  borderColor: isSelected ? letterColor.text : '#e2e8f0',
                  color: isSelected ? letterColor.text : '#475569',
                }}
                className={`py-2 px-1 rounded-xl border-2 font-black transition-all transform flex flex-col items-center justify-center cursor-pointer ${
                  isSelected
                    ? 'scale-110 shadow-md font-black z-10'
                    : 'hover:bg-slate-100 hover:scale-102'
                }`}
              >
                <span className="text-base sm:text-lg leading-tight">{letter}</span>
                <span className="text-[10px] opacity-75 font-bold">
                  {letter.toLowerCase()}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Visual Exploration Card */}
      {currentItem && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-lg space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Active Letter Badge with Audio Indicator */}
            <div className="flex items-center gap-3">
              <div
                style={{
                  backgroundColor: colorConfig.bg,
                  borderColor: colorConfig.border,
                  color: colorConfig.text,
                }}
                className={`w-20 h-16 rounded-2xl border-2 flex items-baseline justify-center gap-1 px-2 pt-2 text-3xl sm:text-4xl font-black shadow-xs transition-transform ${
                  activeStage === 'letter' ? 'scale-115 animate-bounce' : ''
                }`}
              >
                <span>{selectedLetter}</span>
                <span className="text-2xl opacity-80 lowercase">{selectedLetter}</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-[#344054]">
                  Letra {selectedLetter} ({ALPHABET_NAMES[selectedLetter]})
                </h2>
                <p className="text-sm font-medium text-slate-500">
                  {items.length} palabra{items.length > 1 ? 's' : ''} disponible{items.length > 1 ? 's' : ''} para explorar
                </p>
              </div>
            </div>

            {/* Listen Sequence Button */}
            <button
              id="btn-play-alphabet-sequence"
              onClick={() => handlePlaySequence()}
              disabled={isPlayingAudio}
              style={{
                backgroundColor: colorConfig.text,
              }}
              className="w-full sm:w-auto px-5 py-3 text-white rounded-2xl font-extrabold shadow-md hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
              <span>{isPlayingAudio ? 'Escuchando...' : 'Escuchar Nombre y Palabra'}</span>
            </button>
          </div>

          {/* Word Carousel Stage */}
          <div className="relative flex flex-col items-center justify-center py-4 sm:py-6 bg-slate-50/70 rounded-3xl border border-slate-100">
            {/* Category & Difficulty Badges */}
            <div className="absolute top-4 left-4 sm:left-6 flex items-center gap-2">
              <span className="px-3 py-1 bg-white text-slate-600 font-bold text-xs rounded-full border border-slate-200 shadow-2xs uppercase">
                {currentItem.category}
              </span>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-xs rounded-full border border-amber-200 flex items-center gap-1">
                {'⭐'.repeat(currentItem.difficulty)}
              </span>
            </div>

            {/* Navigation Carousel Buttons */}
            {items.length > 1 && (
              <>
                <button
                  id="btn-carousel-prev"
                  onClick={handlePrevWord}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-slate-100 rounded-full border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-600 active:scale-90 transition-all cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  id="btn-carousel-next"
                  onClick={handleNextWord}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-slate-100 rounded-full border-2 border-slate-200 shadow-sm flex items-center justify-center text-slate-600 active:scale-90 transition-all cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}

            {/* Big Visual Icon */}
            <div
              className={`text-7xl sm:text-9xl my-3 transition-transform duration-300 ${
                activeStage === 'word' ? 'scale-120 animate-pulse' : 'hover:scale-105'
              }`}
            >
              {currentItem.imageUrl}
            </div>

            {/* Word Display with Initial Letter Highlight */}
            <div className="text-center space-y-2 mt-2">
              <div className="text-3xl sm:text-5xl font-black text-[#344054] tracking-wide">
                <span
                  style={{
                    color: colorConfig.text,
                    backgroundColor: colorConfig.bg,
                  }}
                  className="px-2 py-0.5 rounded-xl border border-dashed border-slate-300 mr-0.5 inline-block"
                >
                  {currentItem.word.charAt(0)}
                </span>
                <span>{currentItem.word.slice(1)}</span>
              </div>

              {/* Syllable Breakdown Button */}
              <button
                id="btn-syllables"
                onClick={handleSyllablePronounce}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-extrabold text-sm rounded-full border border-slate-200 shadow-2xs transition-all cursor-pointer active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Silabario: {currentItem.pronunciation}</span>
              </button>
            </div>

            {/* Progress Dots */}
            {items.length > 1 && (
              <div className="flex items-center gap-1.5 mt-6">
                {items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentIndex(idx);
                      handlePlaySequence(items[idx]);
                    }}
                    style={{
                      backgroundColor: idx === currentIndex ? colorConfig.text : '#cbd5e1',
                    }}
                    className={`h-2.5 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex ? 'w-8' : 'w-2.5'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Quick Word Strip under Current Letter */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">
              Otras palabras con {selectedLetter}:
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {items.map((item, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={item.id}
                    id={`btn-word-${item.id}`}
                    onClick={() => {
                      setCurrentIndex(idx);
                      handlePlaySequence(item);
                    }}
                    style={{
                      borderColor: isActive ? colorConfig.text : '#e2e8f0',
                      backgroundColor: isActive ? colorConfig.bg : '#ffffff',
                    }}
                    className="p-2.5 rounded-2xl border-2 text-center shadow-2xs hover:shadow-xs transition-all flex flex-col items-center gap-1 cursor-pointer active:scale-95"
                  >
                    <span className="text-2xl">{item.imageUrl}</span>
                    <span
                      style={{ color: isActive ? colorConfig.text : '#334155' }}
                      className="text-xs font-black truncate w-full"
                    >
                      {item.word}
                    </span>
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
