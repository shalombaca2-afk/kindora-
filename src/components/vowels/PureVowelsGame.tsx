/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { EducationalItem, VowelLetter } from '../../types/educational';
import { EDUCATIONAL_VOWEL_ITEMS, VOWEL_LETTERS, VOWEL_COLORS } from '../../data/educationalItemsData';
import { getNextVowelContentSync, preloadMediaForItems } from '../../services/contentEngine';
import { playDecoupledVowelSequence, playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { useApp } from '../../context/AppContext';
import { Volume2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { GameCard, ProgressDots, VowelSelector } from '../../design-system';

interface PureVowelsGameProps {
  onWinExercise?: (xp: number, coins: number, vowel: VowelLetter) => void;
  onBackToHub?: () => void;
}

export const PureVowelsGame: React.FC<PureVowelsGameProps> = ({ onWinExercise, onBackToHub }) => {
  const { playSound, user } = useApp();
  const [selectedVowel, setSelectedVowel] = useState<VowelLetter>('A');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeStage, setActiveStage] = useState<'vowel' | 'pause' | 'word' | 'idle'>('idle');

  // Synchronous, zero-latency content query from local in-memory bank
  // Guarantees strict filtering: every item has initialVowel === selectedVowel
  const items = useMemo(() => {
    const res = getNextVowelContentSync({
      userId: user?.uid || user?.id || 'guest',
      gameType: 'pureVowels',
      quantity: 7,
      vowel: selectedVowel,
    });
    return res.items.filter((item) => item.initialVowel === selectedVowel);
  }, [selectedVowel, user]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Preload media (images and audio) for the entire current vowel bank and adjacent vowels
  useEffect(() => {
    if (items.length > 0) {
      preloadMediaForItems(items);
    }
  }, [items]);

  // Reset carousel index when selected vowel changes
  useEffect(() => {
    setCurrentIndex(0);
    setActiveStage('idle');
    setIsPlayingAudio(false);
  }, [selectedVowel]);

  // Safe fallback ensuring strict initialVowel match
  const currentItem =
    items[currentIndex] ||
    EDUCATIONAL_VOWEL_ITEMS.find((i) => i.initialVowel === selectedVowel) ||
    EDUCATIONAL_VOWEL_ITEMS[0];

  // Play decoupled audio promise chain: (1) "Vocal O" -> (2) pause -> (3) "Oso"
  const handlePlaySequence = async (itemToPlay?: EducationalItem) => {
    const item = itemToPlay || currentItem;
    if (!item || isPlayingAudio) return;

    setIsPlayingAudio(true);
    playSound('pop');
    try {
      await playDecoupledVowelSequence(
        item.audioVowelUrl,
        item.audioWordUrl,
        (stage) => setActiveStage(stage)
      );
    } finally {
      setIsPlayingAudio(false);
      setActiveStage('idle');
    }
  };

  const handleSelectVowel = (vowel: VowelLetter) => {
    if (isPlayingAudio) return;
    playSound('card');
    setSelectedVowel(vowel);
    // Audio trigger on switch
    playAudioPromise(`Vocal ${vowel}`, { speed: 0.85, pitch: 1.15 });
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
        onWinExercise(2, 1, selectedVowel);
      }
    } finally {
      setIsPlayingAudio(false);
    }
  };

  const colorConfig = VOWEL_COLORS[selectedVowel];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToHub}
          className="flex items-center gap-2 px-4 py-2 bg-white text-slate-700 font-bold rounded-2xl border-2 border-slate-200 shadow-sm hover:bg-slate-50 active:scale-95 transition-all text-sm"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
          Volver a Minijuegos
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full flex items-center gap-1 border border-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Reconocimiento y Fonética
          </span>
        </div>
      </div>

      {/* 5 Vowels Selector Bar (Instant Zero-Latency Filter) - using design-system VowelSelector */}
      <div>
        <GameCard className="p-3">
          <VowelSelector value={selectedVowel} onChange={handleSelectVowel} size="md" className="w-full justify-center" />
        </GameCard>
      </div>

      {/* Interactive Word Showcase Card - using GameCard and ProgressDots */}
      {currentItem && (
        <GameCard className="text-center relative overflow-hidden">
          {/* Subtle Background Glow */}
          <div
            className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none ${colorConfig.bg}`}
          />

          <div className="relative z-10 space-y-6">
            {/* Word Badge & Carousel Indicator */}
            <div className="flex items-center justify-between">
              <span className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold capitalize ${colorConfig.badgeBg}`}>
                {currentItem.category} • Nivel {currentItem.difficulty}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">Palabra {currentIndex + 1} de {Math.max(1, items.length)}</span>
                <ProgressDots total={items.length || 1} activeIndex={currentIndex} size={8} gap={6} className="ml-3" />
              </div>
            </div>

            {/* Visual Icon Illustration (kept markup but clickable) */}
            <div className="flex justify-center my-2">
              <div
                onClick={() => handlePlaySequence()}
                className={`w-36 h-36 sm:w-44 sm:h-44 rounded-3xl ${colorConfig.bgLight} border-3 ${colorConfig.border} flex items-center justify-center text-7xl sm:text-8xl shadow-inner cursor-pointer ${
                  isPlayingAudio ? 'animate-bounce' : ''
                }`}
                title="Toca para escuchar"
              >
                {currentItem.imageUrl}
              </div>
            </div>

            {/* Word Name with Highlighted Initial Vowel */}
            <div className="space-y-2">
              <div className="text-4xl sm:text-6xl font-black tracking-wide text-slate-800">
                {/* Highlight initial vowel */}
                <span
                  className={`inline-block transition-transform duration-200 ${
                    activeStage === 'vowel' ? 'scale-125 text-amber-500 font-extrabold' : colorConfig.text
                  }`}
                >
                  {currentItem.word.charAt(0)}
                </span>
                <span className={activeStage === 'word' ? 'text-sky-600 font-extrabold' : 'text-slate-800'}>
                  {currentItem.word.slice(1)}
                </span>
              </div>

              {/* Phonetic Syllables */}
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={handleSyllablePronounce}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Silábico: </span>
                  <span className="font-extrabold text-slate-800">{currentItem.pronunciation}</span>
                </button>
              </div>
            </div>

            {/* Audio Decoupled Playback Button */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => handlePlaySequence()}
                disabled={isPlayingAudio}
                className={`px-8 py-3.5 rounded-2xl font-black text-white text-base shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:translate-y-0.5 ${
                  isPlayingAudio ? 'bg-slate-400 cursor-not-allowed' : `${colorConfig.bg} hover:brightness-110`
                }`}
              >
                <Volume2 className={`w-5 h-5 ${isPlayingAudio ? 'animate-pulse' : ''}`} />
                {isPlayingAudio
                  ? activeStage === 'vowel'
                    ? `¡Vocal ${selectedVowel}!`
                    : activeStage === 'pause'
                    ? '...'
                    : `¡${currentItem.word}!`
                  : 'Escuchar Sonido y Palabra'}
              </button>
            </div>

            {/* Carousel Navigation Arrows */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={handlePrevWord}
                disabled={isPlayingAudio || items.length <= 1}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-1.5">
                { /* keep the visual thin progress dots already provided above */ }
              </div>

              <button
                onClick={handleNextWord}
                disabled={isPlayingAudio || items.length <= 1}
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-40"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </GameCard>
      )}
    </div>
  );
};
