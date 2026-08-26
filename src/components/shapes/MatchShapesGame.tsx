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
  CheckCircle2,
  Trophy,
  Star,
} from 'lucide-react';

interface MatchShapesGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface ShapePiece {
  id: string;
  name: string;
  color: string;
  matched: boolean;
  renderSvg: (className?: string, fillColor?: string) => React.ReactNode;
}

const ALL_SHAPE_PIECES = [
  {
    id: 'circulo',
    name: 'Círculo',
    color: '#ef4444',
    renderSvg: (cls = 'w-16 h-16', color = '#ef4444') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <circle cx="50" cy="50" r="42" />
      </svg>
    ),
  },
  {
    id: 'cuadrado',
    name: 'Cuadrado',
    color: '#3b82f6',
    renderSvg: (cls = 'w-16 h-16', color = '#3b82f6') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <rect x="14" y="14" width="72" height="72" rx="6" />
      </svg>
    ),
  },
  {
    id: 'triangulo',
    name: 'Triángulo',
    color: '#eab308',
    renderSvg: (cls = 'w-16 h-16', color = '#eab308') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <polygon points="50,12 90,86 10,86" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rectangulo',
    name: 'Rectángulo',
    color: '#22c55e',
    renderSvg: (cls = 'w-20 h-14', color = '#22c55e') => (
      <svg className={cls} viewBox="0 0 120 90" fill={color}>
        <rect x="10" y="15" width="100" height="60" rx="6" />
      </svg>
    ),
  },
  {
    id: 'estrella',
    name: 'Estrella',
    color: '#f59e0b',
    renderSvg: (cls = 'w-16 h-16', color = '#f59e0b') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <polygon points="50,8 63,36 94,37 68,56 79,86 50,68 21,86 32,56 6,37 37,36" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'rombo',
    name: 'Rombo',
    color: '#8b5cf6',
    renderSvg: (cls = 'w-16 h-16', color = '#8b5cf6') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <polygon points="50,10 88,50 50,90 12,50" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'corazon',
    name: 'Corazón',
    color: '#f43f5e',
    renderSvg: (cls = 'w-16 h-16', color = '#f43f5e') => (
      <svg className={cls} viewBox="0 0 100 100" fill={color}>
        <path d="M50,88 C50,88 10,58 10,32 C10,18 22,8 35,8 C43,8 48,13 50,17 C52,13 57,8 65,8 C78,8 90,18 90,32 C90,58 50,88 50,88 Z" />
      </svg>
    ),
  },
];

export const MatchShapesGame: React.FC<MatchShapesGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [level, setLevel] = useState<number>(1);
  const [targetSlots, setTargetSlots] = useState<ShapePiece[]>([]);
  const [draggablePieces, setDraggablePieces] = useState<ShapePiece[]>([]);
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
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

  // Initialize level shapes
  const initLevel = (lvl: number) => {
    // Select 4 shapes per level
    const offset = ((lvl - 1) * 3) % ALL_SHAPE_PIECES.length;
    const selected: ShapePiece[] = [];
    for (let i = 0; i < 4; i++) {
      const p = ALL_SHAPE_PIECES[(offset + i) % ALL_SHAPE_PIECES.length];
      selected.push({ ...p, matched: false });
    }

    setTargetSlots([...selected]);
    // Shuffle draggable pieces
    setDraggablePieces([...selected].sort(() => Math.random() - 0.5));
    setSelectedPieceId(null);
    setIsCompleted(false);

    cancelActiveAudio();
    playAudioPromise(
      '¡Une las figuras! Arrastra o toca cada figura de abajo para encajarla en su silueta correspondiente.',
      { speed: 0.85, pitch: 1.15 }
    );
  };

  useEffect(() => {
    initLevel(level);
  }, [level]);

  // Attempt match logic
  const handleMatch = (pieceId: string, slotId: string) => {
    if (pieceId === slotId) {
      playSound('victoryFanfare');
      const matchedShape = targetSlots.find((s) => s.id === pieceId);
      speak(`¡Excelente! Encajaste el ${matchedShape?.name || 'figura'}.`);

      const updatedSlots = targetSlots.map((s) =>
        s.id === pieceId ? { ...s, matched: true } : s
      );
      const updatedPieces = draggablePieces.map((p) =>
        p.id === pieceId ? { ...p, matched: true } : p
      );

      setTargetSlots(updatedSlots);
      setDraggablePieces(updatedPieces);
      setSelectedPieceId(null);

      // Check if all are matched
      if (updatedSlots.every((s) => s.matched)) {
        setIsCompleted(true);
        triggerConfetti();
        addPoints(12);
        addCoins(4);
        incrementActivities('figuras');
        if (onWinExercise) {
          onWinExercise(12, 4);
        }
        speak('¡Felicidades! Encajaste todas las figuras en su lugar.');
      }
    } else {
      playSound('hit');
      speak('Esa silueta no coincide. ¡Intenta en otra!');
      setSelectedPieceId(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setSelectedPieceId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, slotId: string) => {
    e.preventDefault();
    const droppedPieceId = e.dataTransfer.getData('text/plain') || selectedPieceId;
    if (droppedPieceId) {
      handleMatch(droppedPieceId, slotId);
    }
  };

  // Tap-to-match fallback handlers for touch devices
  const handlePieceClick = (piece: ShapePiece) => {
    if (piece.matched) return;
    playSound('pop');
    setSelectedPieceId(piece.id);
    speak(`Seleccionaste ${piece.name}. Ahora toca su silueta arriba.`);
  };

  const handleSlotClick = (slot: ShapePiece) => {
    if (slot.matched) return;
    if (selectedPieceId) {
      handleMatch(selectedPieceId, slot.id);
    } else {
      speak(`Esta es la silueta de un ${slot.name}. Toca la figura de abajo primero.`);
    }
  };

  const handleNextLevel = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    setLevel((prev) => prev + 1);
  };

  const handleReset = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    playSound('pop');
    initLevel(level);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-shapes-match"
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
          <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-black text-xs rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            Nivel {level} • Encaje y Motricidad
          </span>
        </div>
      </div>

      {/* Main Board Stage */}
      <div className="bg-gradient-to-b from-emerald-50/70 via-teal-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-200 shadow-md space-y-6">
        {/* Instructions */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-emerald-100 text-emerald-900 font-black text-xs rounded-full uppercase tracking-wider">
            ¡Rompecabezas de Encaje!
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            Une cada figura con su silueta
          </h2>
          <p className="text-sm text-slate-500 font-medium">
            Arrastra o toca una figura de abajo y luego toca su silueta correspondiente arriba.
          </p>
        </div>

        {/* TOP: Target Silhouette Slots */}
        <div className="space-y-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
            Siluetas para encajar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {targetSlots.map((slot) => (
              <div
                key={slot.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, slot.id)}
                onClick={() => handleSlotClick(slot)}
                className={`min-h-[170px] p-5 rounded-3xl border-3 flex flex-col items-center justify-between transition-all text-center cursor-pointer ${
                  slot.matched
                    ? 'bg-emerald-50 border-emerald-400 shadow-md ring-4 ring-emerald-100 animate-in zoom-in-90 duration-300'
                    : selectedPieceId === slot.id
                    ? 'bg-emerald-100/50 border-emerald-500 ring-2 ring-emerald-300'
                    : 'bg-slate-100/80 border-dashed border-slate-300 hover:border-emerald-300'
                }`}
              >
                <div className="flex-1 flex items-center justify-center">
                  {slot.matched ? (
                    <div style={{ color: slot.color }} className="animate-bounce [animation-duration:2s]">
                      {slot.renderSvg('w-18 h-18', slot.color)}
                    </div>
                  ) : (
                    <div className="text-slate-300 opacity-60">
                      {slot.renderSvg('w-18 h-18', '#94a3b8')}
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <span className={`block text-sm font-black ${slot.matched ? 'text-emerald-800' : 'text-slate-500'}`}>
                    {slot.name}
                  </span>
                  <span className="block text-[10px] font-bold text-slate-400">
                    {slot.matched ? '¡Encajado! ✨' : 'Vacío'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM: Draggable Shape Drawer */}
        <div className="space-y-2 pt-2">
          <p className="text-xs font-black text-slate-400 uppercase tracking-wider text-center">
            Tus Figuras para Colocar:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {draggablePieces.map((piece) => (
              <div
                key={piece.id}
                draggable={!piece.matched}
                onDragStart={(e) => handleDragStart(e, piece.id)}
                onClick={() => handlePieceClick(piece)}
                className={`p-5 rounded-3xl border-2 flex flex-col items-center justify-between gap-2 transition-all text-center cursor-pointer ${
                  piece.matched
                    ? 'opacity-30 bg-slate-50 border-slate-200 pointer-events-none'
                    : selectedPieceId === piece.id
                    ? 'bg-white border-emerald-500 shadow-xl scale-105 ring-4 ring-emerald-200'
                    : 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                <div className="p-1">{piece.renderSvg('w-16 h-16', piece.color)}</div>
                <span className="font-black text-sm text-slate-800">{piece.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Controls & Reset */}
        <div className="flex items-center justify-center pt-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-extrabold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Rompecabezas
          </button>
        </div>

        {/* Level Complete Celebration Card */}
        {isCompleted && (
          <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl text-white shadow-xl flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 duration-300 border-2 border-emerald-300">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
              <Trophy className="w-9 h-9 text-amber-300" />
              <Star className="w-7 h-7 text-amber-300 fill-amber-300 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl sm:text-3xl font-black">
                ¡Nivel {level} Completado!
              </h3>
              <p className="text-emerald-100 font-medium text-xs">
                Encajaste todas las figuras geométricas a la perfección.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-xs px-4 py-1 rounded-full text-xs font-black">
              <span>+12 XP</span>
              <span>•</span>
              <span>+4 🪙 Monedas</span>
            </div>

            <button
              onClick={handleNextLevel}
              className="mt-1 px-8 py-3 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Siguiente Desafío →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
