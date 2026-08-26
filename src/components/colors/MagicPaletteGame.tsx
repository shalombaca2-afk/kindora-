/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { COLORES_DATA } from '../../data/learningData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  CheckCircle2,
  Star,
  Palette,
} from 'lucide-react';

interface MagicPaletteGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

export const MagicPaletteGame: React.FC<MagicPaletteGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  const [exploredColors, setExploredColors] = useState<Set<string>>(new Set([COLORES_DATA[0].name]));
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentColor = COLORES_DATA[selectedColorIndex];

  // Cleanup on unmount
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

  // Speak initial intro
  useEffect(() => {
    cancelActiveAudio();
    playAudioPromise(
      `¡Bienvenido a La Paleta Mágica! Toca cualquier color para conocer su nombre y descubrir qué cosas en el mundo son de ese color.`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, []);

  const handleSelectColor = (index: number) => {
    cancelActiveAudio();
    playSound('pop');
    setSelectedColorIndex(index);
    const color = COLORES_DATA[index];

    const newExplored = new Set(exploredColors);
    const isNew = !newExplored.has(color.name);
    newExplored.add(color.name);
    setExploredColors(newExplored);

    if (isNew) {
      addPoints(3);
      incrementActivities('colores');
      if (newExplored.size === COLORES_DATA.length) {
        triggerConfetti();
        playSound('victoryFanfare');
        addCoins(5);
        if (onWinExercise) {
          onWinExercise(15, 5);
        }
      }
    }

    speak(`Color ${color.name}. ${color.description}. Ejemplo: ${color.example}.`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          onClick={() => {
            cancelActiveAudio();
            onBackToHub();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Colores
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-cyan-50 text-cyan-700 font-black text-xs rounded-full border border-cyan-200 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-cyan-600" />
            Explorados: {exploredColors.size} / {COLORES_DATA.length}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-cyan-200 shadow-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-cyan-100 text-cyan-900 font-black text-xs rounded-full uppercase tracking-wider">
            Reconocimiento Visual
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            1. La Paleta Mágica
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">
            Toca cada color en la paleta para escuchar su nombre y descubrir ejemplos divertidos en la naturaleza y tu entorno.
          </p>
        </div>

        {/* Featured Color Spotlight Card */}
        <div
          style={{
            borderColor: currentColor.hex,
            backgroundColor: `${currentColor.hex}15`,
          }}
          className="rounded-3xl p-6 sm:p-8 border-3 shadow-inner max-w-2xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-300"
        >
          <div className="flex items-center gap-5">
            <div
              style={{ backgroundColor: currentColor.hex }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl shadow-xl flex items-center justify-center text-5xl sm:text-6xl border-4 border-white transform hover:scale-105 transition-transform"
            >
              <span className="animate-bounce [animation-duration:2.5s]">{currentColor.icon}</span>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400">
                Color Seleccionado
              </span>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-800">
                {currentColor.name}
              </h3>
              <p className="text-sm font-bold text-slate-600">
                {currentColor.description}
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 rounded-full text-xs font-black text-slate-700 border border-slate-200 mt-1">
                <span>Ejemplo:</span>
                <span className="text-indigo-600">{currentColor.example}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              cancelActiveAudio();
              playSound('pop');
              speak(`Color ${currentColor.name}. ${currentColor.description}. Ejemplo: ${currentColor.example}.`);
            }}
            style={{ backgroundColor: currentColor.hex }}
            className="w-14 h-14 rounded-2xl text-white shadow-lg hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer border-2 border-white"
            aria-label="Escuchar pronunciación"
          >
            <Volume2 className="w-7 h-7" />
          </button>
        </div>

        {/* Color Palette Grid */}
        <div className="space-y-3">
          <h4 className="text-sm font-extrabold text-slate-600 text-center uppercase tracking-wider">
            🎨 Elige un color para explorar
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {COLORES_DATA.map((c, idx) => {
              const isSelected = idx === selectedColorIndex;
              const isExplored = exploredColors.has(c.name);

              return (
                <button
                  key={c.name}
                  onClick={() => handleSelectColor(idx)}
                  className={`p-3.5 rounded-2xl border-2 text-center transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer flex flex-col items-center gap-2 relative ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-105'
                      : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                  }`}
                >
                  {isExplored && (
                    <span className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-100" />
                    </span>
                  )}

                  <div
                    style={{ backgroundColor: c.hex }}
                    className="w-12 h-12 rounded-xl shadow-md flex items-center justify-center text-2xl border-2 border-white"
                  >
                    <span>{c.icon}</span>
                  </div>

                  <div>
                    <span className="block font-black text-sm">{c.name}</span>
                    <span
                      className={`block text-[10px] font-bold ${
                        isSelected ? 'text-slate-300' : 'text-slate-400'
                      }`}
                    >
                      {c.example}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Completion Banner */}
        {exploredColors.size === COLORES_DATA.length && (
          <div className="p-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl text-white text-center flex items-center justify-center gap-3 animate-in zoom-in-95">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <span className="font-black text-sm">
              ¡Felicidades! Has explorado todos los colores de La Paleta Mágica (+5 Monedas).
            </span>
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
        )}
      </div>
    </div>
  );
};
