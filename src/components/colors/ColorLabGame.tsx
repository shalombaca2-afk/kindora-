/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { COLOR_MIX_RULES, COLORES_DATA } from '../../data/learningData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Sparkles,
  TestTube,
  RotateCcw,
  Star,
  Trophy,
  CheckCircle2,
} from 'lucide-react';

interface ColorLabGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface MixingChallenge {
  targetColor: string;
  targetHex: string;
  targetIcon: string;
  required1: string;
  required2: string;
}

const LAB_CHALLENGES: MixingChallenge[] = [
  { targetColor: 'Naranja', targetHex: '#f97316', targetIcon: '🍊', required1: 'Rojo', required2: 'Amarillo' },
  { targetColor: 'Verde', targetHex: '#22c55e', targetIcon: '🌲', required1: 'Azul', required2: 'Amarillo' },
  { targetColor: 'Morado', targetHex: '#8b5cf6', targetIcon: '🔮', required1: 'Rojo', required2: 'Azul' },
  { targetColor: 'Rosa', targetHex: '#ec4899', targetIcon: '🌸', required1: 'Rojo', required2: 'Blanco' },
  { targetColor: 'Celeste', targetHex: '#38bdf8', targetIcon: '💧', required1: 'Azul', required2: 'Blanco' },
];

const AVAILABLE_BASE_COLORS = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Blanco', hex: '#f8fafc' },
];

export const ColorLabGame: React.FC<ColorLabGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [challengeIndex, setChallengeIndex] = useState<number>(0);
  const [color1, setColor1] = useState<string | null>(null);
  const [color2, setColor2] = useState<string | null>(null);
  const [isMixed, setIsMixed] = useState<boolean>(false);
  const [completedChallenges, setCompletedChallenges] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentChallenge = LAB_CHALLENGES[challengeIndex % LAB_CHALLENGES.length];

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

  // Announce challenge
  useEffect(() => {
    cancelActiveAudio();
    playAudioPromise(
      `¡Laboratorio de Mezclas! Tu misión es mezclar dos colores primarios en el tubo de ensayo para crear el color ${currentChallenge.targetColor}.`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [challengeIndex]);

  const handleSelectColor = (colorName: string) => {
    if (isMixed) return;

    playSound('pop');

    if (!color1) {
      setColor1(colorName);
      speak(`Primer ingrediente: ${colorName}. Ahora elige el segundo color.`);
    } else if (!color2) {
      setColor2(colorName);
      // Trigger mixing calculation
      const rule = COLOR_MIX_RULES.find(
        (r) =>
          (r.color1 === color1 && r.color2 === colorName) ||
          (r.color1 === colorName && r.color2 === color1)
      );

      const isMatch =
        (color1 === currentChallenge.required1 && colorName === currentChallenge.required2) ||
        (color1 === currentChallenge.required2 && colorName === currentChallenge.required1);

      setIsMixed(true);

      if (isMatch) {
        playSound('victoryFanfare');
        triggerConfetti();
        addPoints(12);
        addCoins(4);
        incrementActivities('colores');
        setCompletedChallenges((prev) => [...prev, challengeIndex]);

        if (onWinExercise) {
          onWinExercise(12, 4);
        }

        speak(`¡Increíble! ${color1} más ${colorName} crea el color ${currentChallenge.targetColor}. ¡Misión cumplida!`);
      } else {
        playSound('hit');
        const resultingName = rule ? rule.result : 'un tono diferente';
        speak(`¡Vaya! ${color1} más ${colorName} formó ${resultingName}, pero necesitabas ${currentChallenge.targetColor}. ¡Reintenta!`);
      }
    }
  };

  const handleResetMixture = () => {
    cancelActiveAudio();
    playSound('pop');
    setColor1(null);
    setColor2(null);
    setIsMixed(false);
  };

  const handleNextChallenge = () => {
    cancelActiveAudio();
    playSound('pop');
    setColor1(null);
    setColor2(null);
    setIsMixed(false);
    setChallengeIndex((prev) => prev + 1);
  };

  // Find active mixture result
  const activeRule =
    color1 && color2
      ? COLOR_MIX_RULES.find(
          (r) =>
            (r.color1 === color1 && r.color2 === color2) ||
            (r.color1 === color2 && r.color2 === color1)
        ) || {
          result: color1 === color2 ? color1 : 'Un nuevo tono',
          resultHex: color1 === color2 ? COLORES_DATA.find((c) => c.name === color1)?.hex || '#ccc' : '#a855f7',
          icon: '✨',
        }
      : null;

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
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
            <TestTube className="w-3.5 h-3.5 text-emerald-600" />
            Misión {challengeIndex + 1} de {LAB_CHALLENGES.length}
          </span>
        </div>
      </div>

      {/* Main Lab Experiment Board */}
      <div className="bg-gradient-to-b from-emerald-50/50 via-teal-50/30 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md space-y-8">
        {/* Story Header */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-900 font-black text-xs rounded-full uppercase tracking-wider">
            Descubrimiento & Ciencia
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            2. Laboratorio de Mezclas
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">
            Mezcla colores en los tubos de ensayo para descubrir los colores secundarios.
          </p>
        </div>

        {/* Challenge Target Card */}
        <div className="max-w-md mx-auto p-5 bg-white rounded-2xl border-2 border-emerald-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              style={{ backgroundColor: currentChallenge.targetHex }}
              className="w-14 h-14 rounded-2xl shadow-md flex items-center justify-center text-3xl border-2 border-white"
            >
              <span>{currentChallenge.targetIcon}</span>
            </div>
            <div>
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
                Objetivo a crear:
              </span>
              <h3 className="text-xl font-black text-slate-800">
                Color {currentChallenge.targetColor}
              </h3>
            </div>
          </div>

          <div className="text-right">
            <span className="px-3 py-1 bg-amber-100 text-amber-800 font-extrabold text-xs rounded-full">
              +12 XP • +4 🪙
            </span>
          </div>
        </div>

        {/* Central Test Tube Apparatus */}
        <div className="flex flex-col items-center justify-center gap-6 py-4">
          <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
            {/* Tube 1 */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Color 1</span>
              <div
                style={{
                  backgroundColor: color1 ? COLORES_DATA.find((c) => c.name === color1)?.hex : '#f1f5f9',
                }}
                className={`w-16 h-28 sm:w-20 sm:h-36 rounded-b-3xl rounded-t-lg border-3 border-slate-300 shadow-md flex items-center justify-center transition-all ${
                  color1 ? 'scale-105 border-slate-700 shadow-lg' : 'border-dashed'
                }`}
              >
                {color1 ? (
                  <span className="font-black text-xs text-white drop-shadow-md bg-black/30 px-2 py-1 rounded-full">
                    {color1}
                  </span>
                ) : (
                  <span className="text-2xl text-slate-400">🧪</span>
                )}
              </div>
            </div>

            {/* Plus Symbol */}
            <div className="text-3xl font-black text-slate-400 pt-6">+</div>

            {/* Tube 2 */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Color 2</span>
              <div
                style={{
                  backgroundColor: color2 ? COLORES_DATA.find((c) => c.name === color2)?.hex : '#f1f5f9',
                }}
                className={`w-16 h-28 sm:w-20 sm:h-36 rounded-b-3xl rounded-t-lg border-3 border-slate-300 shadow-md flex items-center justify-center transition-all ${
                  color2 ? 'scale-105 border-slate-700 shadow-lg' : 'border-dashed'
                }`}
              >
                {color2 ? (
                  <span className="font-black text-xs text-white drop-shadow-md bg-black/30 px-2 py-1 rounded-full">
                    {color2}
                  </span>
                ) : (
                  <span className="text-2xl text-slate-400">🧪</span>
                )}
              </div>
            </div>

            {/* Equals Symbol */}
            <div className="text-3xl font-black text-slate-400 pt-6">=</div>

            {/* Result Flask */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Resultado</span>
              <div
                style={{
                  backgroundColor: activeRule ? activeRule.resultHex : '#f8fafc',
                }}
                className={`w-20 h-28 sm:w-24 sm:h-36 rounded-b-3xl rounded-t-lg border-4 shadow-xl flex flex-col items-center justify-center transition-all ${
                  activeRule
                    ? 'border-amber-400 scale-110 shadow-emerald-200 animate-in zoom-in-75'
                    : 'border-slate-300 border-dashed'
                }`}
              >
                {activeRule ? (
                  <div className="text-center p-2">
                    <span className="text-3xl block animate-bounce">{activeRule.icon}</span>
                    <span className="font-black text-xs text-white drop-shadow-md bg-black/40 px-2 py-0.5 rounded-full mt-1 block">
                      {activeRule.result}
                    </span>
                  </div>
                ) : (
                  <span className="text-3xl text-slate-300">✨</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Base Colors Palette Picker */}
        <div className="space-y-3 max-w-xl mx-auto">
          <p className="text-center text-xs font-black text-slate-500 uppercase tracking-wider">
            🧪 Selecciona los colores para verter en el tubo:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {AVAILABLE_BASE_COLORS.map((base) => {
              const isSelected = color1 === base.name || color2 === base.name;
              return (
                <button
                  key={base.name}
                  disabled={isMixed}
                  onClick={() => handleSelectColor(base.name)}
                  className={`p-3.5 rounded-2xl border-2 flex items-center justify-center gap-2 font-black text-sm transition-all transform hover:-translate-y-1 active:scale-95 cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-slate-800 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-emerald-400'
                  }`}
                >
                  <span
                    style={{ backgroundColor: base.hex }}
                    className="w-5 h-5 rounded-full border border-white shadow-xs inline-block"
                  />
                  {base.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls & Next Button */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={handleResetMixture}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar Tubo
          </button>

          {isMixed && (
            <button
              onClick={handleNextChallenge}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              Siguiente Mezcla →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
