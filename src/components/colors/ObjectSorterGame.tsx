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
  Boxes,
  RotateCcw,
  CheckCircle2,
  Trophy,
  Star,
} from 'lucide-react';

interface ObjectSorterGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface SorterItem {
  id: string;
  name: string;
  emoji: string;
  targetColor: string;
  colorHex: string;
}

const ALL_ITEMS_POOL: SorterItem[] = [
  { id: '1', name: 'Manzana', emoji: '🍎', targetColor: 'Rojo', colorHex: '#ef4444' },
  { id: '2', name: 'Fresa', emoji: '🍓', targetColor: 'Rojo', colorHex: '#ef4444' },
  { id: '3', name: 'Corazón', emoji: '❤️', targetColor: 'Rojo', colorHex: '#ef4444' },
  { id: '4', name: 'Plátano', emoji: '🍌', targetColor: 'Amarillo', colorHex: '#eab308' },
  { id: '5', name: 'Sol', emoji: '☀️', targetColor: 'Amarillo', colorHex: '#eab308' },
  { id: '6', name: 'Limón', emoji: '🍋', targetColor: 'Amarillo', colorHex: '#eab308' },
  { id: '7', name: 'Gota de Agua', emoji: '💧', targetColor: 'Azul', colorHex: '#3b82f6' },
  { id: '8', name: 'Ballena', emoji: '🐳', targetColor: 'Azul', colorHex: '#3b82f6' },
  { id: '9', name: 'Océano', emoji: '🌊', targetColor: 'Azul', colorHex: '#3b82f6' },
  { id: '10', name: 'Rana', emoji: '🐸', targetColor: 'Verde', colorHex: '#22c55e' },
  { id: '11', name: 'Hoja', emoji: '🍃', targetColor: 'Verde', colorHex: '#22c55e' },
  { id: '12', name: 'Árbol', emoji: '🌲', targetColor: 'Verde', colorHex: '#22c55e' },
];

const BASKETS = [
  { name: 'Rojo', hex: '#ef4444', icon: '🧺' },
  { name: 'Amarillo', hex: '#eab308', icon: '🧺' },
  { name: 'Azul', hex: '#3b82f6', icon: '🧺' },
  { name: 'Verde', hex: '#22c55e', icon: '🧺' },
];

export const ObjectSorterGame: React.FC<ObjectSorterGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();
  const [level, setLevel] = useState<number>(1);
  const [itemsToClassify, setItemsToClassify] = useState<SorterItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SorterItem | null>(null);
  const [sortedItems, setSortedItems] = useState<{ [color: string]: SorterItem[] }>({
    Rojo: [],
    Amarillo: [],
    Azul: [],
    Verde: [],
  });
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Setup round
  const startRound = (lvl: number) => {
    // Pick 4 items randomly from pool
    const shuffled = [...ALL_ITEMS_POOL].sort(() => 0.5 - Math.random());
    const roundItems = shuffled.slice(0, 4);
    setItemsToClassify(roundItems);
    setSelectedItem(roundItems[0] || null);
    setSortedItems({ Rojo: [], Amarillo: [], Azul: [], Verde: [] });
    setIsCompleted(false);
  };

  useEffect(() => {
    startRound(level);
  }, [level]);

  // Audio cleanup on unmount
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

  // Speak prompt
  useEffect(() => {
    if (itemsToClassify.length > 0) {
      cancelActiveAudio();
      playAudioPromise(
        `¡Clasificador de Objetos! Toca un objeto y luego toca la cesta del color correcto para guardarlo.`,
        { speed: 0.85, pitch: 1.15 }
      );
    }
  }, [itemsToClassify.length === 4]);

  const handleClassify = (basketColor: string) => {
    if (!selectedItem || isCompleted) return;

    if (selectedItem.targetColor === basketColor) {
      playSound('pop');
      const updatedSorted = {
        ...sortedItems,
        [basketColor]: [...sortedItems[basketColor], selectedItem],
      };
      setSortedItems(updatedSorted);

      const remaining = itemsToClassify.filter((i) => i.id !== selectedItem.id);
      setItemsToClassify(remaining);
      setSelectedItem(remaining.length > 0 ? remaining[0] : null);

      if (remaining.length === 0) {
        setIsCompleted(true);
        playSound('victoryFanfare');
        triggerConfetti();
        addPoints(12);
        addCoins(4);
        incrementActivities('colores');
        if (onWinExercise) {
          onWinExercise(12, 4);
        }
        speak(`¡Excelente trabajo! Has clasificado todos los objetos en sus cestas correctas.`);
      } else {
        speak(`¡Correcto! La ${selectedItem.name} va en la cesta ${basketColor}.`);
      }
    } else {
      playSound('hit');
      speak(`¡Ups! La ${selectedItem.name} no es de color ${basketColor}. Es de color ${selectedItem.targetColor}.`);
    }
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
          <span className="px-3.5 py-1.5 bg-orange-50 text-orange-700 font-black text-xs rounded-full border border-orange-200 flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-orange-600" />
            Ronda {level} • Clasificación
          </span>
        </div>
      </div>

      {/* Main Sorter Board */}
      <div className="bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="px-3.5 py-1 bg-orange-100 text-orange-900 font-black text-xs rounded-full uppercase tracking-wider">
            Lógica y Asociación
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            3. Clasificador de Objetos
          </h2>
          <p className="text-sm text-slate-500 font-medium max-w-lg mx-auto">
            Selecciona un objeto y envíalo a la cesta de su color correspondiente.
          </p>
        </div>

        {/* Pending Items Conveyor Belt */}
        <div className="bg-white p-5 rounded-3xl border-2 border-orange-100 shadow-inner max-w-xl mx-auto space-y-3">
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider block text-center">
            Objetos por clasificar: {itemsToClassify.length}
          </span>

          <div className="flex items-center justify-center gap-4 flex-wrap min-h-[90px]">
            {itemsToClassify.map((item) => {
              const isSelected = selectedItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    playSound('pop');
                    setSelectedItem(item);
                    speak(`${item.name}. ¿En qué cesta de color debe ir?`);
                  }}
                  className={`p-3 rounded-2xl border-3 flex flex-col items-center gap-1 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50 scale-110 shadow-md'
                      : 'border-slate-200 bg-slate-50 hover:bg-white shadow-xs'
                  }`}
                >
                  <span className="text-4xl animate-bounce [animation-duration:2.5s]">{item.emoji}</span>
                  <span className="text-xs font-black text-slate-800">{item.name}</span>
                </button>
              );
            })}

            {itemsToClassify.length === 0 && (
              <span className="text-sm font-bold text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> ¡Todos los objetos clasificados!
              </span>
            )}
          </div>
        </div>

        {/* 4 Color Baskets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {BASKETS.map((basket) => {
            const itemsInBasket = sortedItems[basket.name] || [];
            return (
              <div
                key={basket.name}
                onClick={() => handleClassify(basket.name)}
                style={{ borderColor: basket.hex }}
                className="bg-white rounded-3xl p-5 border-3 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col items-center justify-between min-h-[200px] hover:scale-105 group"
              >
                <div className="text-center space-y-1">
                  <div
                    style={{ backgroundColor: basket.hex }}
                    className="w-12 h-12 rounded-2xl text-white flex items-center justify-center text-2xl mx-auto shadow-md"
                  >
                    <span>{basket.icon}</span>
                  </div>
                  <h3 className="font-black text-base text-slate-800">
                    Cesta {basket.name}
                  </h3>
                </div>

                {/* Items contained in this basket */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 py-2">
                  {itemsInBasket.map((it, idx) => (
                    <span
                      key={idx}
                      className="text-2xl animate-in zoom-in-75 duration-200"
                      title={it.name}
                    >
                      {it.emoji}
                    </span>
                  ))}
                  {itemsInBasket.length === 0 && (
                    <span className="text-[11px] font-bold text-slate-400">Vacía</span>
                  )}
                </div>

                <button
                  type="button"
                  style={{ backgroundColor: basket.hex }}
                  className="w-full py-2 rounded-xl text-white font-extrabold text-xs shadow-xs group-hover:brightness-95 transition-all"
                >
                  Guardar aquí
                </button>
              </div>
            );
          })}
        </div>

        {/* Success Banner */}
        {isCompleted && (
          <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl text-white shadow-xl flex flex-col items-center justify-center text-center gap-4 animate-in zoom-in-95 border-2 border-amber-300">
            <div className="flex items-center justify-center gap-2">
              <Star className="w-7 h-7 text-amber-200 fill-amber-200 animate-bounce" />
              <Trophy className="w-9 h-9 text-amber-200" />
              <Star className="w-7 h-7 text-amber-200 fill-amber-200 animate-bounce" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black">¡Misión Cumplida!</h3>
              <p className="text-amber-100 font-bold text-sm">
                Has clasificado todos los objetos por su color.
              </p>
            </div>

            <button
              onClick={() => {
                cancelActiveAudio();
                playSound('pop');
                setLevel((l) => l + 1);
              }}
              className="px-8 py-3 bg-white text-orange-950 font-black text-sm rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              Siguiente Ronda →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
