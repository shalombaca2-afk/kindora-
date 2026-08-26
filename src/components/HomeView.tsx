import React from 'react';
import { useApp } from '../context/AppContext';
import { LearnCategory } from '../types';
import { Sparkles, Brain, ArrowRight, Star, Heart, Zap } from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    user,
    setActiveTab,
    setActiveLearnCategory,
    petStats,
    playSound,
    speak,
    interactPetDirectly,
    petActionEffect,
  } = useApp();

  const getPetEmoji = () => {
    if (!user) return '🐼';
    switch (user.petType) {
      case 'dino':
        return '🦖';
      case 'rabbit':
        return '🐰';
      case 'cat':
        return '🐱';
      default:
        return '🐼';
    }
  };

  const petEmoji = getPetEmoji();

  const learningBlocks: {
    id: LearnCategory;
    blockId: string;
    titleId: string;
    descId: string;
    title: string;
    desc: string;
    icon: string;
    bgColor: string;
    accentColor: string;
    examples: string;
  }[] = [
    {
      id: 'vocales',
      blockId: 'block-vocales',
      titleId: 'block-vocales-title',
      descId: 'block-vocales-desc',
      title: 'Vocales',
      desc: 'Aprende A, E, I, O y U.',
      icon: '🔤',
      bgColor: '#e3f8ff',
      accentColor: '#38bdf8',
      examples: 'A, E, I, O, U',
    },
    {
      id: 'abecedario',
      blockId: 'block-abecedario',
      titleId: 'block-abecedario-title',
      descId: 'block-abecedario-desc',
      title: 'Abecedario',
      desc: 'Conoce todas las letras.',
      icon: '🔠',
      bgColor: '#e8f8e8',
      accentColor: '#4ade80',
      examples: 'De la A a la Z',
    },
    {
      id: 'numeros',
      blockId: 'block-numeros',
      titleId: 'block-numeros-title',
      descId: 'block-numeros-desc',
      title: 'Números',
      desc: 'Cuenta del 1 al 20.',
      icon: '🔢',
      bgColor: '#fff0df',
      accentColor: '#fb923c',
      examples: '1, 2, 3 ... 20',
    },
    {
      id: 'colores',
      blockId: 'block-colores',
      titleId: 'block-colores-title',
      descId: 'block-colores-desc',
      title: 'Colores',
      desc: 'Descubre muchos colores.',
      icon: '🎨',
      bgColor: '#fff7cc',
      accentColor: '#facc15',
      examples: 'Rojo, Azul, Verde...',
    },
    {
      id: 'figuras',
      blockId: 'block-figuras',
      titleId: 'block-figuras-title',
      descId: 'block-figuras-desc',
      title: 'Figuras',
      desc: 'Aprende sus nombres.',
      icon: '🔺',
      bgColor: '#f0e5ff',
      accentColor: '#c084fc',
      examples: 'Círculo, Cuadrado...',
    },
    {
      id: 'animales',
      blockId: 'block-animales',
      titleId: 'block-animales-title',
      descId: 'block-animales-desc',
      title: 'Animales',
      desc: 'Conoce animales.',
      icon: '🐶',
      bgColor: '#ffe5ec',
      accentColor: '#f472b6',
      examples: 'Perro, León, Mono...',
    },
  ];

  const handleSelectBlock = (category: LearnCategory, title: string) => {
    playSound('pop');
    speak(`Vamos a aprender ${title}`);
    setActiveLearnCategory(category);
    setActiveTab('learn');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Mascot Greeting Bubble Header */}
      <div className="relative bg-gradient-to-r from-[#38bdf8] via-[#0ea5e9] to-[#0284c7] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-100 overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Interactive Pet Mascot */}
            <button
              onClick={interactPetDirectly}
              className="relative p-3.5 bg-white/20 hover:bg-white/30 backdrop-blur-xs rounded-2xl border-2 border-white/40 shadow-md transform hover:scale-105 active:scale-95 transition-all cursor-pointer"
              title="¡Toca a tu mascota para acariciarla!"
            >
              <span className="text-5xl sm:text-6xl animate-float inline-block">
                {petEmoji}
              </span>
              {petActionEffect && (
                <div className="absolute -top-3 -right-3 bg-[#f97316] text-white font-black text-xs px-2.5 py-1 rounded-full shadow-lg border-2 border-white animate-bounce">
                  {petActionEffect}
                </div>
              )}
            </button>

            {/* Bubble Text */}
            <div className="space-y-1.5">
              <div
                id="home-bubble"
                className="bg-white text-[#334155] px-4 py-2.5 rounded-2xl shadow-md font-black text-base sm:text-xl inline-flex items-center gap-2 border border-sky-100"
              >
                <span>{petEmoji}</span>
                <span>¡Hola {user ? user.childName : ''}! ¿Listo para aprender en Kindora?</span>
              </div>
              <p className="text-sky-50 text-sm font-semibold pl-1">
                Toca cualquier actividad para escuchar, jugar y ganar estrellas.
              </p>
            </div>
          </div>

          {/* Quick Pet Mini Status */}
          <div className="w-full md:w-auto flex items-center gap-3 bg-white/20 backdrop-blur-xs px-4 py-3 rounded-2xl border border-white/30">
            <div className="text-center px-2">
              <div className="text-xs text-white/90 font-bold flex items-center justify-center gap-1">
                🍎 Hambre
              </div>
              <div className="w-16 h-2.5 bg-black/20 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-emerald-300 rounded-full transition-all"
                  style={{ width: `${petStats.hunger}%` }}
                />
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-xs text-white/90 font-bold flex items-center justify-center gap-1">
                😊 Felicidad
              </div>
              <div className="w-16 h-2.5 bg-black/20 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-amber-300 rounded-full transition-all"
                  style={{ width: `${petStats.happiness}%` }}
                />
              </div>
            </div>

            <div className="text-center px-2">
              <div className="text-xs text-white/90 font-bold flex items-center justify-center gap-1">
                ⚡ Energía
              </div>
              <div className="w-16 h-2.5 bg-black/20 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-sky-200 rounded-full transition-all"
                  style={{ width: `${petStats.energy}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => setActiveTab('pet')}
              className="ml-2 px-3.5 py-2 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer"
            >
              Cuidar 🐾
            </button>
          </div>
        </div>
      </div>

      {/* Main Section Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            id="home-section-title"
            className="text-2xl sm:text-3xl font-black text-[#1e293b] tracking-tight flex items-center gap-2"
          >
            <span>📚</span> ¿Qué quieres aprender?
          </h2>
          <p className="text-sm text-slate-500 font-semibold">
            Selecciona una actividad para comenzar a jugar
          </p>
        </div>
      </div>

      {/* 6 Learning Blocks Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {learningBlocks.map((block) => (
          <button
            key={block.id}
            id={block.blockId}
            onClick={() => handleSelectBlock(block.id, block.title)}
            style={{ backgroundColor: block.bgColor }}
            className="group relative p-6 rounded-3xl border-2 border-slate-200/70 hover:border-sky-400 text-left transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg active:scale-98 flex flex-col justify-between min-h-[185px] cursor-pointer"
          >
            <div className="flex items-start justify-between">
              <span className="text-4xl sm:text-5xl group-hover:scale-110 transition-transform">
                {block.icon}
              </span>
              <span
                style={{ backgroundColor: block.accentColor }}
                className="px-3 py-1 rounded-full text-white text-[11px] font-black shadow-2xs"
              >
                {block.examples}
              </span>
            </div>

            <div className="space-y-1 mt-4">
              <h3
                id={block.titleId}
                className="text-2xl font-black text-[#1e293b] group-hover:text-[#0284c7] transition-colors"
              >
                {block.title}
              </h3>
              <p
                id={block.descId}
                className="text-sm font-semibold text-[#334155]/90 leading-snug"
              >
                {block.desc}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black text-[#0284c7] mt-3 pt-2 border-t border-black/5 group-hover:translate-x-1 transition-transform">
              <span>Explorar actividad</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </div>

      {/* Featured Game: Memorama Promo Card */}
      <div className="bg-gradient-to-r from-[#0284c7] via-[#0ea5e9] to-[#38bdf8] rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-sky-100 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-3xl shadow-inner shrink-0">
            🧠
          </div>
          <div>
            <h3 className="text-2xl font-black">Juego de Memorama Kindora</h3>
            <p className="text-white/95 text-sm font-medium">
              Encuentra las parejas de cartas, ejercita tu mente y gana ⭐ puntos y 🪙 monedas.
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            playSound('pop');
            setActiveTab('memory');
          }}
          className="w-full sm:w-auto px-7 py-4 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-base rounded-2xl shadow-lg shadow-orange-950/20 transition-transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Brain className="w-5 h-5 text-white" />
          <span>¡Jugar Memorama!</span>
        </button>
      </div>
    </div>
  );
};
