import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LearnCategory } from '../types';
import { VowelsHub } from './vowels/VowelsHub';
import { AlphabetHub } from './alphabet/AlphabetHub';
import { NumbersHub } from './numbers/NumbersHub';
import { ColorsHub } from './colors/ColorsHub';
import { ShapesHub } from './shapes/ShapesHub';
import { AnimalsHub } from './animals/AnimalsHub';
import { cancelActiveAudio, stopAllAudio } from '../utils/audioPromises';
import {
  ABECEDARIO_DATA,
  FIGURAS_DATA,
  ANIMALES_DATA,
} from '../data/learningData';
import { Volume2, Sparkles } from 'lucide-react';

// Helper to create a randomized permutation without repeating the previous last index
function createShuffledIndices(length: number, previousLastIndex = -1): number[] {
  const indices = Array.from({ length }, (_, i) => i);
  for (let i = length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  // Prevent immediate consecutive duplicate when wrapping around cycles
  if (previousLastIndex !== -1 && indices.length > 1 && indices[0] === previousLastIndex) {
    const swapTarget = Math.floor(Math.random() * (indices.length - 1)) + 1;
    [indices[0], indices[swapTarget]] = [indices[swapTarget], indices[0]];
  }
  return indices;
}

export const LearnView: React.FC = () => {
  const {
    activeLearnCategory,
    setActiveLearnCategory,
    playSound,
    speak,
    addPoints,
    incrementActivities,
    triggerConfetti,
  } = useApp();

  // State for Animal Filter
  const [selectedAnimal, setSelectedAnimal] = useState<string | null>(null);

  // Stop all active audio on unmount or category change
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  useEffect(() => {
    stopAllAudio();
  }, [activeLearnCategory]);

  // Category Tabs config
  const categories: { id: LearnCategory; label: string; icon: string; bg: string }[] = [
    { id: 'vocales', label: 'Vocales', icon: '🔤', bg: '#e3f8ff' },
    { id: 'abecedario', label: 'Abecedario', icon: '🔠', bg: '#e8f8e8' },
    { id: 'numeros', label: 'Números', icon: '🔢', bg: '#fff0df' },
    { id: 'colores', label: 'Colores', icon: '🎨', bg: '#fff7cc' },
    { id: 'figuras', label: 'Figuras', icon: '🔺', bg: '#f0e5ff' },
    { id: 'animales', label: 'Animales', icon: '🐶', bg: '#ffe5ec' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 id="learn-title" className="text-3xl sm:text-4xl font-extrabold text-[#344054] tracking-tight flex items-center gap-2">
            <span>📚</span> Aprendemos juntos
          </h1>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Explora las vocales, letras, números, colores, figuras y animales con audio y juegos.
          </p>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeLearnCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => {
                playSound('pop');
                setActiveLearnCategory(cat.id);
              }}
              style={{ backgroundColor: isActive ? '#0284c7' : cat.bg }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-200 border-2 cursor-pointer ${
                isActive
                  ? 'text-white border-[#0284c7] shadow-md scale-103'
                  : 'text-[#334155] border-transparent hover:border-sky-300'
              }`}
            >
              <span className="text-xl">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* ================= CATEGORY 1: VOCALES (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'vocales' && <VowelsHub />}

      {/* ================= CATEGORY 2: ABECEDARIO (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'abecedario' && <AlphabetHub />}

      {/* ================= CATEGORY 3: NÚMEROS (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'numeros' && <NumbersHub />}

      {/* ================= CATEGORY 4: COLORES (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'colores' && <ColorsHub />}

      {/* ================= CATEGORY 5: FIGURAS (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'figuras' && <ShapesHub />}

      {/* ================= CATEGORY 6: ANIMALES (MÓDULO DESACOPLADO CON 4 MINIJUEGOS) ================= */}
      {activeLearnCategory === 'animales' && <AnimalsHub />}
    </div>
  );
};
