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
  Star,
  Trophy,
} from 'lucide-react';

interface FindShapeGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface ShapeItemDetail {
  id: string;
  name: string;
  sides: number;
  color: string;
  description: string;
  hint: string;
  renderSvg: (className?: string) => React.ReactNode;
}

const SHAPE_DEFINITIONS: ShapeItemDetail[] = [
  {
    id: 'circulo',
    name: 'Círculo',
    sides: 0,
    color: '#ef4444',
    description: 'Es completamente redondo y no tiene ninguna esquina.',
    hint: 'Busca la figura redonda como el sol o una pelota.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <circle cx="50" cy="50" r="42" />
      </svg>
    ),
  },
  {
    id: 'cuadrado',
    name: 'Cuadrado',
    sides: 4,
    color: '#3b82f6',
    description: 'Tiene 4 lados rectos exactamente iguales.',
    hint: 'Tiene 4 esquinas iguales como una ventana o un dado.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <rect x="14" y="14" width="72" height="72" rx="6" />
      </svg>
    ),
  },
  {
    id: 'triangulo',
    name: 'Triángulo',
    sides: 3,
    color: '#eab308',
    description: 'Tiene 3 lados y 3 esquinas puntiagudas.',
    hint: 'Tiene 3 puntas como una montaña o un trozo de pizza.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,12 90,86 10,86" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rectangulo',
    name: 'Rectángulo',
    sides: 4,
    color: '#22c55e',
    description: 'Tiene 2 lados largos y 2 lados cortos.',
    hint: 'Es alargado como una puerta o un cuaderno.',
    renderSvg: (cls = 'w-24 h-18') => (
      <svg className={cls} viewBox="0 0 120 90" fill="currentColor">
        <rect x="10" y="15" width="100" height="60" rx="6" />
      </svg>
    ),
  },
  {
    id: 'estrella',
    name: 'Estrella',
    sides: 10,
    color: '#f59e0b',
    description: 'Tiene 5 puntas mágicas que brillan.',
    hint: 'Tiene 5 picos brillantes como las estrellas del cielo.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,8 63,36 94,37 68,56 79,86 50,68 21,86 32,56 6,37 37,36" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rombo',
    name: 'Rombo',
    sides: 4,
    color: '#8b5cf6',
    description: 'Tiene 4 lados inclinados como un cometa.',
    hint: 'Parece un cuadrado inclinado listo para volar como cometa.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <polygon points="50,10 88,50 50,90 12,50" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'ovalo',
    name: 'Óvalo',
    sides: 0,
    color: '#ec4899',
    description: 'Es un círculo alargado y suave.',
    hint: 'Tiene forma de huevo alargado sin esquinas.',
    renderSvg: (cls = 'w-20 h-24') => (
      <svg className={cls} viewBox="0 0 100 120" fill="currentColor">
        <ellipse cx="50" cy="60" rx="35" ry="48" />
      </svg>
    ),
  },
  {
    id: 'corazon',
    name: 'Corazón',
    sides: 0,
    color: '#f43f5e',
    description: 'El símbolo del amor y el cariño.',
    hint: 'Tiene dos curvas arriba y termina en punta abajo.',
    renderSvg: (cls = 'w-20 h-20') => (
      <svg className={cls} viewBox="0 0 100 100" fill="currentColor">
        <path d="M50,88 C50,88 10,58 10,32 C10,18 22,8 35,8 C43,8 48,13 50,17 C52,13 57,8 65,8 C78,8 90,18 90,32 C90,58 50,88 50,88 Z" />
      </svg>
    ),
  },
];

export const FindShapeGame: React.FC<FindShapeGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [round, setRound] = useState<number>(1);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [targetShape, setTargetShape] = useState<ShapeItemDetail>(() => SHAPE_DEFINITIONS[0]);
  const [options, setOptions] = useState<ShapeItemDetail[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
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

  // Generate round
  const setupRound = (r: number) => {
    const targetIdx = (r - 1) % SHAPE_DEFINITIONS.length;
    const target = SHAPE_DEFINITIONS[targetIdx];
    setTargetShape(target);

    // Pick 3 distractors
    const distractors = SHAPE_DEFINITIONS.filter((s) => s.id !== target.id)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const roundOptions = [target, ...distractors].sort(() => Math.random() - 0.5);
    setOptions(roundOptions);
    setSelectedId(null);
    setFeedback(null);

    // Play TTS instructions
    cancelActiveAudio();
    playAudioPromise(
      `¡Encuentra el ${target.name}! ${target.hint}`,
      { speed: 0.85, pitch: 1.15 }
    );
  };

  useEffect(() => {
    setupRound(round);
  }, [round]);

  const handleSelectShape = (shape: ShapeItemDetail) => {
    if (feedback !== null) return;
    setSelectedId(shape.id);

    if (shape.id === targetShape.id) {
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

      speak(`¡Excelente! Este es el ${targetShape.name}. ${targetShape.description}`);
    } else {
      playSound('hit');
      setFeedback('wrong');
      setStreak(0);
      speak(`Ese es un ${shape.name}. ¡Busca el ${targetShape.name}!`);
      setTimeout(() => {
        setFeedback(null);
        setSelectedId(null);
      }, 1000);
    }
  };

  const handleNextRound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setRound((prev) => prev + 1);
  };

  const handleRepeatPrompt = () => {
    playSound('pop');
    cancelActiveAudio();
    playAudioPromise(`¡Encuentra el ${targetShape.name}! ${targetShape.hint}`, {
      speed: 0.85,
      pitch: 1.15,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-shapes-find"
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
          <span className="px-3.5 py-1.5 bg-cyan-50 text-cyan-700 font-black text-xs rounded-full border border-cyan-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            Ronda {round} • Racha: {streak} 🔥
          </span>
        </div>
      </div>

      {/* Main Game Stage */}
      <div className="bg-gradient-to-b from-cyan-50/80 via-sky-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-cyan-200 shadow-md space-y-6">
        {/* Mission Prompt Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-cyan-100 shadow-sm text-center space-y-4 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-100 text-cyan-900 rounded-full font-black text-xs uppercase tracking-wider">
            <span>🎯</span> Discriminación Auditiva
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            ¿Dónde está el <span style={{ color: targetShape.color }}>{targetShape.name}</span>?
          </h2>

          <p className="text-sm text-slate-500 font-medium max-w-md mx-auto">
            {targetShape.hint}
          </p>

          <div className="pt-1">
            <button
              onClick={handleRepeatPrompt}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-extrabold text-xs rounded-2xl border border-cyan-200 transition-all cursor-pointer shadow-xs"
            >
              <Volume2 className="w-4 h-4 text-cyan-600" /> Escuchar de Nuevo
            </button>
          </div>
        </div>

        {/* 4 Shapes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {options.map((shape) => {
            const isSelected = selectedId === shape.id;
            const isCorrect = shape.id === targetShape.id;

            let cardStateClasses =
              'bg-white hover:bg-slate-50 border-slate-200 hover:border-cyan-400 hover:shadow-lg';

            if (feedback === 'correct' && isCorrect) {
              cardStateClasses =
                'bg-emerald-50 border-emerald-400 ring-4 ring-emerald-200 shadow-xl scale-105';
            } else if (feedback === 'wrong' && isSelected) {
              cardStateClasses = 'bg-red-50 border-red-400 animate-shake';
            }

            return (
              <button
                key={shape.id}
                onClick={() => handleSelectShape(shape)}
                disabled={feedback === 'correct'}
                className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-between gap-4 transition-all transform active:scale-95 cursor-pointer min-h-[190px] group ${cardStateClasses}`}
              >
                <div
                  style={{ color: shape.color }}
                  className="p-2 transition-transform group-hover:scale-115"
                >
                  {shape.renderSvg()}
                </div>

                <div className="text-center space-y-1">
                  <span className="block font-black text-lg text-slate-800 group-hover:text-cyan-600 transition-colors">
                    {shape.name}
                  </span>
                  <span className="block text-[11px] font-bold text-slate-400">
                    {shape.sides > 0 ? `${shape.sides} lados` : 'Sin esquinas'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Success Banner */}
        {feedback === 'correct' && (
          <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-300">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-base font-black">
                  ¡Correcto! Es un {targetShape.name}
                </h4>
                <p className="text-xs text-emerald-100 font-medium">
                  {targetShape.description}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextRound}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Figura →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
