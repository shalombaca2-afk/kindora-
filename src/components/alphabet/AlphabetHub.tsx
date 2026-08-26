/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AlphabetGameType, AlphabetLetter, DomainProgress } from '../../types/educational';
import { PureAlphabetGame } from './PureAlphabetGame';
import { InitialLetterGame } from './InitialLetterGame';
import { LetterHunterGame } from './LetterHunterGame';
import { BuildWordGame } from './BuildWordGame';
import { educationalFirestoreService } from '../../services/educationalFirestoreService';
import { useApp } from '../../context/AppContext';
import {
  ALPHABET_LETTERS,
  ALPHABET_NAMES,
  ALPHABET_COLORS,
  EDUCATIONAL_ALPHABET_ITEMS,
} from '../../data/alphabetItemsData';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import {
  Sparkles,
  BookOpen,
  Volume2,
  Trophy,
  Play,
  CheckCircle,
  Puzzle,
  Ear,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
} from 'lucide-react';

export const AlphabetHub: React.FC = () => {
  const { user, addPoints, addCoins, playSound, triggerConfetti } = useApp();
  const [activeGame, setActiveGame] = useState<AlphabetGameType | null>(null);
  const [progress, setProgress] = useState<DomainProgress | null>(null);

  // Load progress and warm-up cache for alphabet domain
  const loadProgress = () => {
    const userId = user?.uid || user?.id || 'guest';
    const p = educationalFirestoreService.getDomainProgressSync(userId, 'alphabet');
    setProgress(p);

    // Background preloads
    educationalFirestoreService.preloadDomainBank('alphabet');
    educationalFirestoreService.preloadUserData(userId, 'alphabet');
  };

  useEffect(() => {
    loadProgress();
    return () => {
      cancelActiveAudio();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [user]);

  const handleWinExercise = async (xp: number, coins: number, letter: AlphabetLetter) => {
    addPoints(xp);
    addCoins(coins);
    loadProgress();
  };

  const handleStartGame = (game: AlphabetGameType) => {
    cancelActiveAudio();
    playSound('pop');
    setActiveGame(game);
    const titles: Record<AlphabetGameType, string> = {
      pureAlphabet: 'Abecedario Puro',
      initialLetter: '¿De qué letra es?',
      letterHunter: 'Cazador de Letras',
      buildWord: 'Construye la Palabra',
    };
    playAudioPromise(`¡Vamos a jugar a ${titles[game]}!`, { speed: 0.85, pitch: 1.15 });
  };

  // Minigames switch
  if (activeGame === 'pureAlphabet') {
    return (
      <PureAlphabetGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          cancelActiveAudio();
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'initialLetter') {
    return (
      <InitialLetterGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          cancelActiveAudio();
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'letterHunter') {
    return (
      <LetterHunterGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          cancelActiveAudio();
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  if (activeGame === 'buildWord') {
    return (
      <BuildWordGame
        onWinExercise={handleWinExercise}
        onBackToHub={() => {
          cancelActiveAudio();
          playSound('pop');
          setActiveGame(null);
        }}
      />
    );
  }

  // Calculate overall alphabet mastery average across all 27 letters
  const accuracyMap = progress?.accuracyMap || {};
  let totalAcc = 0;
  ALPHABET_LETTERS.forEach((letter) => {
    totalAcc += accuracyMap[letter] ?? 0.85;
  });
  const avgAccuracy = Math.round((totalAcc / ALPHABET_LETTERS.length) * 100);

  const minigamesConfig = [
    {
      id: 'pureAlphabet' as AlphabetGameType,
      title: 'Abecedario Puro',
      subtitle: 'Exploración Fonética',
      description: 'Descubre las 27 letras (Aa - Zz), sus nombres oficiales y escucha sus palabras asociadas.',
      icon: '🔤',
      color: 'bg-emerald-500',
      badge: 'Básico / Fonético',
      accentBg: 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200',
    },
    {
      id: 'initialLetter' as AlphabetGameType,
      title: '¿De qué letra es?',
      subtitle: 'Relación Imagen / Sonido',
      description: 'Identifica la letra inicial con 3 niveles adaptativos: imagen, texto y desafío auditivo.',
      icon: '❓',
      color: 'bg-sky-500',
      badge: '3 Niveles',
      accentBg: 'bg-sky-50 hover:bg-sky-100/70 border-sky-200',
    },
    {
      id: 'letterHunter' as AlphabetGameType,
      title: 'Cazador de Letras',
      subtitle: 'Discriminación Visual',
      description: 'Caza todas las letras objetivo en burbujas interactivas o busca dentro de palabras completas.',
      icon: '🏹',
      color: 'bg-amber-500',
      badge: 'Rapidez y Enfoque',
      accentBg: 'bg-amber-50 hover:bg-amber-100/70 border-amber-200',
    },
    {
      id: 'buildWord' as AlphabetGameType,
      title: 'Construye la Palabra',
      subtitle: 'Aplicación Práctica',
      description: 'Completa la letra inicial, intermedia o reordena palabras desordenadas con interacción táctil.',
      icon: '🧩',
      color: 'bg-purple-500',
      badge: 'Escritura / Orden',
      accentBg: 'bg-purple-50 hover:bg-purple-100/70 border-purple-200',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Welcome Banner for Abecedario Module */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-white/20 backdrop-blur-xs rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              Módulo Oficial • 27 Letras (A - Z + Ñ)
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Aprende el Abecedario Español
            </h1>
            <p className="text-emerald-100 text-sm sm:text-base font-medium leading-relaxed">
              Explora las 27 letras del abecedario con pronunciación nativa, discriminación visual y 4 minijuegos interactivos de 0ms de latencia.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-white/15 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-center shadow-sm">
              <span className="text-2xl font-black text-amber-300 block">
                27 Letras
              </span>
              <span className="text-[11px] font-extrabold text-emerald-100 uppercase tracking-wider block mt-0.5">
                Aa - Zz + Ññ
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Minigames Grid Section - Directly under main banner */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#344054] flex items-center gap-2">
            <span>🎮</span> Selecciona un Minijuego
          </h2>
          <span className="text-xs font-bold text-slate-500">
            4 modos interactivos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {minigamesConfig.map((game) => (
            <div
              key={game.id}
              onClick={() => handleStartGame(game.id)}
              className={`rounded-3xl p-6 border-2 transition-all duration-200 transform hover:-translate-y-1 hover:shadow-lg cursor-pointer flex flex-col justify-between space-y-4 ${game.accentBg}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-3 bg-white rounded-2xl shadow-xs border border-slate-200/60 inline-block">
                    {game.icon}
                  </span>
                  <span className="px-3 py-1 bg-white text-slate-700 font-extrabold text-xs rounded-full border border-slate-200 shadow-2xs">
                    {game.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">
                    {game.title}
                  </h3>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-0.5">
                    {game.subtitle}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-2">
                    {game.description}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between">
                <span className="text-xs font-black text-slate-500 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 fill-current" /> Jugar ahora
                </span>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-700 shadow-2xs">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
