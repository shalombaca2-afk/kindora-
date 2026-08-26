/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  ArrowLeft,
  Sparkles,
  RotateCcw,
  Palette,
  CheckCircle2,
  Trophy,
  Download,
} from 'lucide-react';

interface PaintShapeGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface PaintColor {
  name: string;
  hex: string;
}

const PALETTE_COLORS: PaintColor[] = [
  { name: 'Rojo', hex: '#ef4444' },
  { name: 'Azul', hex: '#3b82f6' },
  { name: 'Amarillo', hex: '#eab308' },
  { name: 'Verde', hex: '#22c55e' },
  { name: 'Naranja', hex: '#f97316' },
  { name: 'Morado', hex: '#8b5cf6' },
  { name: 'Rosa', hex: '#ec4899' },
  { name: 'Celeste', hex: '#38bdf8' },
  { name: 'Dorado', hex: '#eab308' },
  { name: 'Menta', hex: '#14b8a6' },
];

type CanvasShapeKey = 'circulo' | 'cuadrado' | 'triangulo' | 'rectangulo' | 'estrella' | 'corazon' | 'rombo';

interface CanvasShapeInfo {
  key: CanvasShapeKey;
  name: string;
  description: string;
  icon: string;
}

const CANVAS_SHAPES: CanvasShapeInfo[] = [
  { key: 'circulo', name: 'Círculo', description: 'Redondo sin esquinas', icon: '⭕' },
  { key: 'cuadrado', name: 'Cuadrado', description: '4 lados iguales', icon: '🟧' },
  { key: 'triangulo', name: 'Triángulo', description: '3 lados y 3 puntitas', icon: '🔺' },
  { key: 'rectangulo', name: 'Rectángulo', description: '2 lados largos y 2 cortos', icon: '🔲' },
  { key: 'estrella', name: 'Estrella', description: '5 puntas mágicas', icon: '⭐' },
  { key: 'corazon', name: 'Corazón', description: 'Símbolo del cariño', icon: '💖' },
  { key: 'rombo', name: 'Rombo', description: 'Cometa con 4 esquinas', icon: '🔷' },
];

export const PaintShapeGame: React.FC<PaintShapeGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [activeShape, setActiveShape] = useState<CanvasShapeKey>('circulo');
  const [selectedColor, setSelectedColor] = useState<PaintColor>(PALETTE_COLORS[0]);

  // Color states for interactive SVG layers
  const [bodyColor, setBodyColor] = useState<string>('#ffffff');
  const [borderColor, setBorderColor] = useState<string>('#cbd5e1');
  const [detailColor, setDetailColor] = useState<string>('#e2e8f0');
  const [coloredSectionsCount, setColoredSectionsCount] = useState<number>(0);
  const [hasCompletedArt, setHasCompletedArt] = useState<boolean>(false);
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

  const currentShapeInfo = CANVAS_SHAPES.find((s) => s.key === activeShape)!;

  // Speak prompt on shape switch
  useEffect(() => {
    cancelActiveAudio();
    playAudioPromise(
      `¡Pinta tu Figura! Estás pintando un ${currentShapeInfo.name}. Elige un color y toca el cuerpo, el borde o los detalles.`,
      { speed: 0.85, pitch: 1.15 }
    );
  }, [activeShape]);

  const handleSelectShape = (shapeKey: CanvasShapeKey) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setActiveShape(shapeKey);
    setBodyColor('#ffffff');
    setBorderColor('#cbd5e1');
    setDetailColor('#e2e8f0');
    setColoredSectionsCount(0);
    setHasCompletedArt(false);
  };

  const handleSelectColor = (c: PaintColor) => {
    playSound('pop');
    setSelectedColor(c);
    speak(`Color ${c.name}`);
  };

  const checkCompletion = (newCount: number) => {
    if (newCount >= 2 && !hasCompletedArt) {
      setHasCompletedArt(true);
      playSound('victoryFanfare');
      triggerConfetti();
      addPoints(10);
      addCoins(3);
      incrementActivities('figuras');
      if (onWinExercise) {
        onWinExercise(10, 3);
      }
      speak(`¡Hermosa obra de arte! Pintaste tu ${currentShapeInfo.name} de forma genial.`);
    }
  };

  const handleColorBody = () => {
    playSound('pop');
    setBodyColor(selectedColor.hex);
    const count = coloredSectionsCount + 1;
    setColoredSectionsCount(count);
    speak(`Pintaste el interior del ${currentShapeInfo.name} de ${selectedColor.name}.`);
    checkCompletion(count);
  };

  const handleColorBorder = () => {
    playSound('pop');
    setBorderColor(selectedColor.hex);
    const count = coloredSectionsCount + 1;
    setColoredSectionsCount(count);
    speak(`Pintaste el borde de ${selectedColor.name}.`);
    checkCompletion(count);
  };

  const handleColorDetail = () => {
    playSound('pop');
    setDetailColor(selectedColor.hex);
    const count = coloredSectionsCount + 1;
    setColoredSectionsCount(count);
    speak(`Pintaste los detalles de ${selectedColor.name}.`);
    checkCompletion(count);
  };

  const handleResetCanvas = () => {
    playSound('pop');
    setBodyColor('#ffffff');
    setBorderColor('#cbd5e1');
    setDetailColor('#e2e8f0');
    setColoredSectionsCount(0);
    setHasCompletedArt(false);
    speak('Lienzo limpio. ¡Vamos a colorear de nuevo!');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-shapes-paint"
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
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Taller de Pintura Creativa
          </span>
        </div>
      </div>

      {/* Shape Selector Ribbon */}
      <div className="bg-white p-4 rounded-3xl border-2 border-slate-200 shadow-sm space-y-2">
        <p className="text-xs font-black text-slate-400 uppercase tracking-wider px-1">
          Selecciona una figura para pintar:
        </p>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
          {CANVAS_SHAPES.map((shape) => {
            const isSelected = shape.key === activeShape;
            return (
              <button
                key={shape.key}
                onClick={() => handleSelectShape(shape.key)}
                className={`px-4 py-2.5 rounded-2xl border-2 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                  isSelected
                    ? 'bg-purple-100/70 border-purple-400 text-purple-900 font-black shadow-md ring-2 ring-purple-200'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-purple-300 font-extrabold'
                }`}
              >
                <span className="text-xl">{shape.icon}</span>
                <span className="text-sm">{shape.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Art Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Color Palette */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border-2 border-slate-200 shadow-md space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Palette className="w-5 h-5 text-purple-600" />
              <h3 className="font-black text-slate-800 text-base">
                Paleta de Colores
              </h3>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Elige el color activo con el que quieres pintar las partes de la figura:
            </p>

            <div className="grid grid-cols-5 gap-3 pt-1">
              {PALETTE_COLORS.map((c) => {
                const isSelected = selectedColor.name === c.name;
                return (
                  <button
                    key={c.name}
                    onClick={() => handleSelectColor(c)}
                    style={{ backgroundColor: c.hex }}
                    className={`w-11 h-11 rounded-2xl shadow-sm transition-all transform active:scale-90 flex items-center justify-center cursor-pointer ${
                      isSelected
                        ? 'ring-4 ring-purple-400 scale-110 shadow-md ring-offset-2'
                        : 'hover:scale-105'
                    }`}
                    title={c.name}
                  >
                    {isSelected && (
                      <span className="text-white drop-shadow-md text-xs font-black">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3 mt-3">
              <div
                style={{ backgroundColor: selectedColor.hex }}
                className="w-8 h-8 rounded-xl shadow-xs border border-slate-300 shrink-0"
              />
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                  Color Seleccionado:
                </span>
                <span className="text-sm font-black text-slate-800">
                  {selectedColor.name}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleResetCanvas}
            className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Limpiar Lienzo
          </button>
        </div>

        {/* Right: Interactive SVG Canvas Stage */}
        <div className="lg:col-span-8 bg-gradient-to-b from-purple-50/50 to-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md flex flex-col items-center justify-between gap-6 min-h-[420px]">
          <div className="text-center space-y-1">
            <span className="text-xs font-black text-purple-600 uppercase tracking-wider">
              {currentShapeInfo.description}
            </span>
            <h2 className="text-2xl font-black text-slate-800">
              Pinta el {currentShapeInfo.name}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Toca el relleno interior, el borde o los ojitos para aplicar el color {selectedColor.name}.
            </p>
          </div>

          {/* Interactive Scalable Vector Canvas */}
          <div className="relative p-6 sm:p-10 bg-white rounded-3xl border-3 border-dashed border-purple-200 shadow-inner flex items-center justify-center min-w-[280px] sm:min-w-[340px] min-h-[260px]">
            <svg
              className="w-56 h-56 sm:w-64 sm:h-64 cursor-pointer filter drop-shadow-md transition-transform"
              viewBox="0 0 200 200"
            >
              {/* CIRCLE */}
              {activeShape === 'circulo' && (
                <g>
                  <circle
                    cx="100"
                    cy="100"
                    r="82"
                    fill={borderColor}
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="70"
                    fill={bodyColor}
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  {/* Cute Eyes & Smile Detail */}
                  <circle cx="75" cy="85" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="125" cy="85" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 80 115 Q 100 135 120 115"
                    stroke={detailColor}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}

              {/* SQUARE */}
              {activeShape === 'cuadrado' && (
                <g>
                  <rect
                    x="20"
                    y="20"
                    width="160"
                    height="160"
                    rx="16"
                    fill={borderColor}
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <rect
                    x="35"
                    y="35"
                    width="130"
                    height="130"
                    rx="12"
                    fill={bodyColor}
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="75" cy="85" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="125" cy="85" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 80 120 Q 100 140 120 120"
                    stroke={detailColor}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}

              {/* TRIANGLE */}
              {activeShape === 'triangulo' && (
                <g>
                  <polygon
                    points="100,15 185,175 15,175"
                    fill={borderColor}
                    strokeLinejoin="round"
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <polygon
                    points="100,38 165,160 35,160"
                    fill={bodyColor}
                    strokeLinejoin="round"
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="82" cy="105" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="118" cy="105" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 88 130 Q 100 142 112 130"
                    stroke={detailColor}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}

              {/* RECTANGLE */}
              {activeShape === 'rectangulo' && (
                <g>
                  <rect
                    x="15"
                    y="40"
                    width="170"
                    height="120"
                    rx="16"
                    fill={borderColor}
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <rect
                    x="28"
                    y="52"
                    width="144"
                    height="96"
                    rx="12"
                    fill={bodyColor}
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="75" cy="90" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="125" cy="90" r="8" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 82 120 Q 100 135 118 120"
                    stroke={detailColor}
                    strokeWidth="6"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}

              {/* STAR */}
              {activeShape === 'estrella' && (
                <g>
                  <polygon
                    points="100,12 125,72 188,74 136,112 158,172 100,136 42,172 64,112 12,74 75,72"
                    fill={borderColor}
                    strokeLinejoin="round"
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <polygon
                    points="100,28 120,74 168,76 128,106 145,154 100,125 55,154 72,106 32,76 80,74"
                    fill={bodyColor}
                    strokeLinejoin="round"
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="85" cy="95" r="6" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="115" cy="95" r="6" fill={detailColor} onClick={handleColorDetail} />
                </g>
              )}

              {/* HEART */}
              {activeShape === 'corazon' && (
                <g>
                  <path
                    d="M100,180 C100,180 20,120 20,68 C20,40 44,20 70,20 C86,20 96,30 100,38 C104,30 114,20 130,20 C156,20 180,40 180,68 C180,120 100,180 100,180 Z"
                    fill={borderColor}
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <path
                    d="M100,165 C100,165 35,112 35,68 C35,48 52,34 72,34 C85,34 94,42 100,50 C106,42 115,34 128,34 C148,34 165,48 165,68 C165,112 100,165 100,165 Z"
                    fill={bodyColor}
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="78" cy="85" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="122" cy="85" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 85 110 Q 100 122 115 110"
                    stroke={detailColor}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}

              {/* RHOMBUS / DIAMOND */}
              {activeShape === 'rombo' && (
                <g>
                  <polygon
                    points="100,15 185,100 100,185 15,100"
                    fill={borderColor}
                    strokeLinejoin="round"
                    onClick={handleColorBorder}
                    className="hover:opacity-80 transition-colors"
                  />
                  <polygon
                    points="100,32 168,100 100,168 32,100"
                    fill={bodyColor}
                    strokeLinejoin="round"
                    onClick={handleColorBody}
                    className="hover:opacity-80 transition-colors"
                  />
                  <circle cx="82" cy="95" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <circle cx="118" cy="95" r="7" fill={detailColor} onClick={handleColorDetail} />
                  <path
                    d="M 88 120 Q 100 132 112 120"
                    stroke={detailColor}
                    strokeWidth="5"
                    fill="none"
                    strokeLinecap="round"
                    onClick={handleColorDetail}
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Celebration / Status Bar */}
          {hasCompletedArt && (
            <div className="w-full p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                <div>
                  <h4 className="text-base font-black text-emerald-950">
                    ¡Obra de Arte Completada! +10 XP • +3 🪙
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium">
                    Has decorado tu {currentShapeInfo.name} con hermosos colores.
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  playSound('pop');
                  const nextIndex =
                    (CANVAS_SHAPES.findIndex((s) => s.key === activeShape) + 1) %
                    CANVAS_SHAPES.length;
                  handleSelectShape(CANVAS_SHAPES[nextIndex].key);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Pintar Otra Figura →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
