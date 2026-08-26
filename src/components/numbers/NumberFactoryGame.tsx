/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { NUMEROS_DATA } from '../../data/learningData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Plus,
} from 'lucide-react';

interface NumberFactoryGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

export const NumberFactoryGame: React.FC<NumberFactoryGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [selectedNumIndex, setSelectedNumIndex] = useState<number>(4); // Defaults to 5
  const [basketItems, setBasketItems] = useState<Array<{ id: number; emoji: string }>>([]);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // CRITICAL: Cleanup audio on unmount & cancel speech
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

  const currentNumberData = NUMEROS_DATA[selectedNumIndex];
  const targetNumber = currentNumberData.number;

  // Change active number
  const handleSelectNumber = (idx: number) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setSelectedNumIndex(idx);
    setBasketItems([]);
    setIsCompleted(false);
    const item = NUMEROS_DATA[idx];
    playAudioPromise(`Número ${item.number}. ${item.word}.`, { speed: 0.85, pitch: 1.15 });
  };

  // Add object to factory container
  const handleAddObject = (emoji = currentNumberData.emoji) => {
    if (isCompleted) return;
    playSound('pop');
    const newItems = [...basketItems, { id: Date.now() + Math.random(), emoji }];
    setBasketItems(newItems);

    // Speak count
    const newCount = newItems.length;
    speak(`${newCount}`);

    // Check if target reached
    if (newCount === targetNumber) {
      handleSuccess();
    } else if (newCount > targetNumber) {
      playSound('hit');
      speak(`¡Te pasaste! Tienes ${newCount} y necesitábamos ${targetNumber}.`);
    }
  };

  // Remove single item
  const handleRemoveObject = (id: number) => {
    if (isCompleted) return;
    playSound('pop');
    const filtered = basketItems.filter((item) => item.id !== id);
    setBasketItems(filtered);
    if (filtered.length === targetNumber) {
      handleSuccess();
    }
  };

  // Clear container
  const handleClear = () => {
    playSound('pop');
    setBasketItems([]);
    setIsCompleted(false);
    speak('Contenedor vacío. ¡Empecemos de nuevo!');
  };

  // Success trigger
  const handleSuccess = () => {
    setIsCompleted(true);
    playSound('victoryFanfare');
    triggerConfetti();
    addPoints(10);
    addCoins(3);
    incrementActivities('numeros');
    if (onWinExercise) {
      onWinExercise(10, 3);
    }
    speak(`¡Fantástico! Colocaste exactamente ${targetNumber} ${currentNumberData.word.toLowerCase()} objetos.`);
  };

  // Next number
  const handleNextNumber = () => {
    const nextIdx = (selectedNumIndex + 1) % NUMEROS_DATA.length;
    handleSelectNumber(nextIdx);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-numbers-factory"
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
          ← Volver a Números
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-cyan-50 text-cyan-700 font-black text-xs rounded-full border border-cyan-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            La Fábrica de Números (1 al 20)
          </span>
        </div>
      </div>

      {/* Numbers Selector Strip (1 to 20) */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          Selecciona un número para contar:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {NUMEROS_DATA.map((item, idx) => {
            const isSelected = idx === selectedNumIndex;
            return (
              <button
                key={item.number}
                onClick={() => handleSelectNumber(idx)}
                style={{
                  borderColor: isSelected ? item.color : '#e2e8f0',
                  backgroundColor: isSelected ? `${item.color}15` : '#ffffff',
                }}
                className={`min-w-[48px] h-12 rounded-2xl flex flex-col items-center justify-center border-2 transition-all font-black text-base cursor-pointer shrink-0 ${
                  isSelected ? 'scale-110 shadow-md ring-2 ring-cyan-300' : 'hover:border-cyan-300 hover:bg-slate-50'
                }`}
              >
                <span style={{ color: item.color }} className="leading-none text-base">
                  {item.number}
                </span>
                <span className="text-[10px] leading-none mt-0.5">{item.emoji}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Number Presentation Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md text-center flex flex-col items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Número Objetivo
            </span>
            <div
              style={{ color: currentNumberData.color }}
              className="text-8xl sm:text-9xl font-black tracking-tight drop-shadow-sm py-2"
            >
              {currentNumberData.number}
            </div>
            <h3 className="text-2xl font-black text-slate-800">
              {currentNumberData.word}
            </h3>
            <div className="text-4xl py-1">{currentNumberData.emoji}</div>
          </div>

          <button
            onClick={() => {
              playSound('pop');
              playAudioPromise(`Número ${currentNumberData.number}, ${currentNumberData.word}. ¡Vamos a contar ${currentNumberData.number} objetos!`, {
                speed: 0.85,
                pitch: 1.15,
              });
            }}
            className="w-full py-3 px-4 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-extrabold text-sm rounded-2xl border border-cyan-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Escuchar Pronunciación
          </button>
        </div>

        {/* Right: Interactive Factory Assembly & Hopper */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <span>📦</span> Contenedor de Fábrica
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Toca los objetos abajo o pulsa '+1' para meter exactamente {targetNumber} objetos.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-4 py-1.5 rounded-full font-black text-sm border ${
                  basketItems.length === targetNumber
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : basketItems.length > targetNumber
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                Conteo: {basketItems.length} / {targetNumber}
              </span>
            </div>
          </div>

          {/* Container Stage Box */}
          <div
            className={`min-h-[180px] p-5 rounded-3xl border-3 border-dashed flex flex-wrap items-center justify-center content-center gap-3 transition-all ${
              isCompleted
                ? 'bg-emerald-50/80 border-emerald-400 ring-4 ring-emerald-100'
                : basketItems.length > targetNumber
                ? 'bg-red-50/60 border-red-300'
                : 'bg-slate-50 border-slate-300'
            }`}
          >
            {basketItems.length === 0 ? (
              <div className="text-center text-slate-400 py-6 select-none">
                <span className="text-4xl block mb-2 opacity-60">📥</span>
                <p className="text-sm font-bold">El contenedor está vacío</p>
                <p className="text-xs font-medium">Toca los objetos de abajo para añadirlos</p>
              </div>
            ) : (
              basketItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => handleRemoveObject(item.id)}
                  title="Toca para quitar"
                  className="w-14 h-14 bg-white rounded-2xl border-2 border-slate-200 shadow-sm flex flex-col items-center justify-center text-2xl hover:scale-115 active:scale-95 transition-transform group cursor-pointer"
                >
                  <span>{item.emoji}</span>
                  <span className="text-[10px] font-black text-slate-400 group-hover:text-red-500">
                    {idx + 1}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Success Banner when exact count is reached */}
          {isCompleted && (
            <div className="p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-base font-black text-emerald-950">
                    ¡Misión Cumplida! +10 XP • +3 🪙
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Llenaste el contenedor con la cantidad exacta de {targetNumber} objetos.
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextNumber}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Siguiente Número →
              </button>
            </div>
          )}

          {/* Action Control Tray */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleAddObject(currentNumberData.emoji)}
                className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-extrabold text-xs rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Añadir 1 ({currentNumberData.emoji})
              </button>

              <button
                onClick={handleClear}
                className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Vaciar
              </button>
            </div>

            {/* Quick Objects Tray */}
            <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 px-2 hidden sm:inline">
                Objetos:
              </span>
              {['⭐', '🍎', '🎈', '🚗', '🍭'].map((obj) => (
                <button
                  key={obj}
                  onClick={() => handleAddObject(obj)}
                  className="w-9 h-9 bg-white hover:bg-cyan-50 rounded-xl border border-slate-200 flex items-center justify-center text-lg hover:scale-115 active:scale-95 transition-transform cursor-pointer"
                >
                  {obj}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
