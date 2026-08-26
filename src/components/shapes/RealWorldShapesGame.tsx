/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

interface RealWorldShapesGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface RealWorldItem {
  id: string;
  name: string;
  emoji: string;
  shapeName: string;
  shapeKey: string;
  hint: string;
  fact: string;
}

const REAL_WORLD_ITEMS: RealWorldItem[] = [
  {
    id: 'pizza',
    name: 'Rebanada de Pizza',
    emoji: '🍕',
    shapeName: 'Triángulo',
    shapeKey: 'triangulo',
    hint: 'Tiene 3 esquinas y una punta deliciosa.',
    fact: 'Una rebanada cortada de una pizza tiene 3 lados, formando un triángulo.',
  },
  {
    id: 'reloj',
    name: 'Reloj de Pared',
    emoji: '⏰',
    shapeName: 'Círculo',
    shapeKey: 'circulo',
    hint: 'Sus manecillas giran en una forma redonda sin esquinas.',
    fact: 'La carátula de este reloj es redonda y continua, ¡un círculo perfecto!',
  },
  {
    id: 'ventana',
    name: 'Ventana de la Casa',
    emoji: '🪟',
    shapeName: 'Cuadrado',
    shapeKey: 'cuadrado',
    hint: 'Tiene 4 lados y 4 esquinas exactamente del mismo tamaño.',
    fact: 'Los 4 bordes de la ventana miden lo mismo, por eso es un cuadrado.',
  },
  {
    id: 'puerta',
    name: 'Puerta Principal',
    emoji: '🚪',
    shapeName: 'Rectángulo',
    shapeKey: 'rectangulo',
    hint: 'Es alta y alargada, con 2 lados más largos que los otros 2.',
    fact: 'Una puerta tiene 2 lados largos arriba y abajo y 2 cortos, ¡un rectángulo!',
  },
  {
    id: 'montana',
    name: 'Cima de la Montaña',
    emoji: '⛰️',
    shapeName: 'Triángulo',
    shapeKey: 'triangulo',
    hint: 'Sube por un lado y baja por el otro hasta su pico.',
    fact: 'La silueta de una gran montaña nevada forma un triángulo natural.',
  },
  {
    id: 'galleta',
    name: 'Galleta Cuadrada',
    emoji: '🧇',
    shapeName: 'Cuadrado',
    shapeKey: 'cuadrado',
    hint: 'Tiene 4 lados iguales y huele delicioso.',
    fact: 'Cada lado de la galleta mide lo mismo formando un cuadrado.',
  },
  {
    id: 'moneda',
    name: 'Moneda Dorada',
    emoji: '🪙',
    shapeName: 'Círculo',
    shapeKey: 'circulo',
    hint: 'Rueda fácilmente porque no tiene esquinas.',
    fact: 'Las monedas son redondas y ruedan sin parar, ¡son círculos!',
  },
  {
    id: 'libro',
    name: 'Libro de Cuentos',
    emoji: '📖',
    shapeName: 'Rectángulo',
    shapeKey: 'rectangulo',
    hint: 'Sus páginas son alargadas y tienen 4 esquinas.',
    fact: 'Los libros suelen ser rectangulares para poder leer cómodamente.',
  },
  {
    id: 'estrella_mar',
    name: 'Estrella de Mar',
    emoji: '⭐',
    shapeName: 'Estrella',
    shapeKey: 'estrella',
    hint: 'Tiene 5 brazos o puntas que se extienden en el agua.',
    fact: 'La estrella de mar tiene 5 puntas hermosas como una figura de estrella.',
  },
  {
    id: 'cometa',
    name: 'Cometa Volador',
    emoji: '🪁',
    shapeName: 'Rombo',
    shapeKey: 'rombo',
    hint: 'Vuela con el viento inclinado con 4 esquinas.',
    fact: 'Los cometas tradicionales tienen forma de rombo o diamante para planear mejor.',
  },
  {
    id: 'huevo',
    name: 'Huevo de Pascua',
    emoji: '🥚',
    shapeName: 'Óvalo',
    shapeKey: 'ovalo',
    hint: 'Es suave y redondo, pero más alargado que un círculo.',
    fact: 'Un huevo tiene una forma redondeada y alargada llamada óvalo.',
  },
  {
    id: 'sandia',
    name: 'Trozo de Sandía',
    emoji: '🍉',
    shapeName: 'Triángulo',
    shapeKey: 'triangulo',
    hint: 'Termina en punta con corteza verde abajo.',
    fact: 'El corte clásico de sandía tiene 3 lados formando un triángulo.',
  },
];

const SHAPE_OPTIONS = [
  { name: 'Círculo', key: 'circulo', icon: '⭕', color: '#ef4444' },
  { name: 'Cuadrado', key: 'cuadrado', icon: '🟧', color: '#3b82f6' },
  { name: 'Triángulo', key: 'triangulo', icon: '🔺', color: '#eab308' },
  { name: 'Rectángulo', key: 'rectangulo', icon: '🔲', color: '#22c55e' },
  { name: 'Estrella', key: 'estrella', icon: '⭐', color: '#f59e0b' },
  { name: 'Rombo', key: 'rombo', icon: '🔷', color: '#8b5cf6' },
  { name: 'Óvalo', key: 'ovalo', icon: '🥚', color: '#ec4899' },
];

export const RealWorldShapesGame: React.FC<RealWorldShapesGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedShape, setSelectedShape] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [options, setOptions] = useState<typeof SHAPE_OPTIONS>([]);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
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

  const currentItem = REAL_WORLD_ITEMS[currentIndex % REAL_WORLD_ITEMS.length];

  // Prepare round options
  useEffect(() => {
    const correctOpt = SHAPE_OPTIONS.find((s) => s.name === currentItem.shapeName)!;
    const distractors = SHAPE_OPTIONS.filter((s) => s.name !== currentItem.shapeName)
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const roundOpts = [correctOpt, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOpts);
    setSelectedShape(null);
    setFeedback(null);

    cancelActiveAudio();
    playAudioPromise(
      `¿Qué figura geométrica tiene la forma de esta ${currentItem.name}? ${currentItem.hint}`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [currentIndex]);

  const handleSelectShape = (shapeKey: string, shapeName: string) => {
    if (feedback !== null) return;
    setSelectedShape(shapeName);

    if (shapeName === currentItem.shapeName) {
      playSound('victoryFanfare');
      triggerConfetti();
      setFeedback('correct');
      const pts = 10 + streak * 2;
      const coinGain = streak >= 2 ? 2 : 1;
      setScore((prev) => prev + pts);
      setStreak((prev) => prev + 1);
      addPoints(pts);
      addCoins(coinGain);
      incrementActivities('figuras');
      if (onWinExercise) {
        onWinExercise(pts, coinGain);
      }
      speak(`¡Correcto! ${currentItem.fact}`);
    } else {
      playSound('hit');
      setFeedback('wrong');
      setStreak(0);
      speak(`No es un ${shapeName}. Recuerda: ${currentItem.hint}`);
      setTimeout(() => {
        setFeedback(null);
        setSelectedShape(null);
      }, 1000);
    }
  };

  const handleNextItem = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-shapes-realworld"
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
          ← Volver a Figuras
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-orange-50 text-orange-700 font-black text-xs rounded-full border border-orange-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Objeto {currentIndex + 1} de {REAL_WORLD_ITEMS.length} • Racha: {streak} 🔥
          </span>
        </div>
      </div>

      {/* Main Stage */}
      <div className="bg-gradient-to-b from-orange-50/80 via-amber-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md space-y-6">
        {/* Title Question */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-orange-100 text-orange-900 font-black text-xs rounded-full uppercase tracking-wider">
            Geometría en la Vida Real
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            ¿Qué figura tiene este objeto?
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Observa el objeto cotidiano e identifica su forma geométrica.
          </p>
        </div>

        {/* Real World Item Display Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-orange-100 shadow-md text-center max-w-md mx-auto space-y-4">
          <div className="w-32 h-32 bg-orange-50 rounded-3xl mx-auto flex items-center justify-center text-7xl shadow-inner border border-orange-200 hover:scale-110 transition-transform">
            {currentItem.emoji}
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-black text-slate-800">
              {currentItem.name}
            </h3>
            <p className="text-xs text-slate-500 font-semibold max-w-xs mx-auto">
              {currentItem.hint}
            </p>
          </div>

          <button
            onClick={() => {
              playSound('pop');
              cancelActiveAudio();
              playAudioPromise(
                `¿Qué figura tiene la ${currentItem.name}? ${currentItem.hint}`,
                { speed: 0.85, pitch: 1.15 }
              );
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 font-extrabold text-xs rounded-xl border border-orange-200 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4" /> Escuchar Pista
          </button>
        </div>

        {/* 3 Shape Choice Buttons */}
        <div className="space-y-3 max-w-lg mx-auto">
          <p className="text-center text-xs font-black text-slate-400 uppercase tracking-wider">
            Elige la figura geométrica:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {options.map((opt) => {
              const isSelected = selectedShape === opt.name;
              const isCorrect = opt.name === currentItem.shapeName;

              let btnStyle =
                'bg-white hover:bg-orange-50 border-slate-200 text-slate-800 hover:border-orange-400 hover:shadow-md';

              if (feedback === 'correct' && isCorrect) {
                btnStyle =
                  'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-200 scale-105';
              } else if (feedback === 'wrong' && isSelected) {
                btnStyle = 'bg-red-500 border-red-600 text-white animate-shake';
              }

              return (
                <button
                  key={opt.name}
                  onClick={() => handleSelectShape(opt.key, opt.name)}
                  disabled={feedback === 'correct'}
                  className={`p-5 rounded-3xl border-3 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-95 ${btnStyle}`}
                >
                  <span className="text-4xl">{opt.icon}</span>
                  <span className="font-black text-base">{opt.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Success / Explanation Banner */}
        {feedback === 'correct' && (
          <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-300">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-base font-black">
                  ¡Exacto! Es un {currentItem.shapeName}
                </h4>
                <p className="text-xs text-emerald-100 font-medium">
                  {currentItem.fact}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextItem}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Objeto →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
