/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { playAudioPromise, cancelActiveAudio } from '../../utils/audioPromises';
import { shuffleArray } from '../../utils/shuffle';
import {
  ArrowLeft,
  Sparkles,
  Volume2,
  CheckCircle2,
  Backpack,
  Trophy,
  HelpCircle,
  Timer,
  Zap,
  RotateCcw,
} from 'lucide-react';

interface AnimalSafariGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface SafariAnimalItem {
  id: string;
  name: string;
  emoji: string;
  category: 'marino' | 'volador' | 'granja' | 'selva' | 'nocturno';
  categoryLabel: string;
  sound: string;
  diet: 'herbívoro' | 'carnívoro' | 'omnívoro';
}

const ALL_SAFARI_ANIMALS: SafariAnimalItem[] = [
  { id: 'delfin', name: 'Delfín', emoji: '🐬', category: 'marino', categoryLabel: 'Animal Marino', sound: 'Chasquidos', diet: 'carnívoro' },
  { id: 'tiburon', name: 'Tiburón', emoji: '🦈', category: 'marino', categoryLabel: 'Animal Marino', sound: 'Chapoteo', diet: 'carnívoro' },
  { id: 'pulpo', name: 'Pulpo', emoji: '🐙', category: 'marino', categoryLabel: 'Animal Marino', sound: 'Burbujas', diet: 'carnívoro' },
  { id: 'ballena', name: 'Ballena', emoji: '🐋', category: 'marino', categoryLabel: 'Animal Marino', sound: 'Canto marino', diet: 'carnívoro' },
  { id: 'aguila', name: 'Águila', emoji: '🦅', category: 'volador', categoryLabel: 'Ave Voladora', sound: 'Chillido agudo', diet: 'carnívoro' },
  { id: 'buho', name: 'Búho', emoji: '🦉', category: 'nocturno', categoryLabel: 'Ave Nocturna', sound: '¡Uuuh uuuh!', diet: 'carnívoro' },
  { id: 'loro', name: 'Loro', emoji: '🦜', category: 'volador', categoryLabel: 'Ave Voladora', sound: '¡Hola hola!', diet: 'herbívoro' },
  { id: 'pato', name: 'Pato', emoji: '🦆', category: 'granja', categoryLabel: 'Animal de Granja', sound: '¡Cuac cuac!', diet: 'omnívoro' },
  { id: 'vaca', name: 'Vaca', emoji: '🐮', category: 'granja', categoryLabel: 'Animal de Granja', sound: '¡Muuuuuu!', diet: 'herbívoro' },
  { id: 'oveja', name: 'Oveja', emoji: '🐑', category: 'granja', categoryLabel: 'Animal de Granja', sound: '¡Beee beee!', diet: 'herbívoro' },
  { id: 'cerdo', name: 'Cerdito', emoji: '🐷', category: 'granja', categoryLabel: 'Animal de Granja', sound: '¡Oink oink!', diet: 'omnívoro' },
  { id: 'caballo', name: 'Caballo', emoji: '🐴', category: 'granja', categoryLabel: 'Animal de Granja', sound: '¡Relincho!', diet: 'herbívoro' },
  { id: 'mono', name: 'Mono', emoji: '🐵', category: 'selva', categoryLabel: 'Animal de Selva', sound: '¡Uu aa!', diet: 'herbívoro' },
  { id: 'leon', name: 'León', emoji: '🦁', category: 'selva', categoryLabel: 'Animal de Selva', sound: '¡Roaaar!', diet: 'carnívoro' },
  { id: 'elefante', name: 'Elefante', emoji: '🐘', category: 'selva', categoryLabel: 'Animal de Selva', sound: '¡Barrito!', diet: 'herbívoro' },
  { id: 'tigre', name: 'Tigre', emoji: '🐯', category: 'selva', categoryLabel: 'Animal de Selva', sound: '¡Rugido!', diet: 'carnívoro' },
  { id: 'murcielago', name: 'Murciélago', emoji: '🦇', category: 'nocturno', categoryLabel: 'Animal Nocturno', sound: 'Chirrido ultrasónico', diet: 'omnívoro' },
];

interface BackpackQuest {
  id: string;
  category: 'marino' | 'volador' | 'granja' | 'selva' | 'nocturno';
  title: string;
  targetCount: number;
  prompt: string;
}

const BACKPACK_QUESTS: BackpackQuest[] = [
  { id: 'q_marinos', category: 'marino', title: 'Animales Marinos', targetCount: 3, prompt: '¡Empaca 3 animales que viven en el mar u océano en tu mochila!' },
  { id: 'q_granja', category: 'granja', title: 'Animales de la Granja', targetCount: 3, prompt: '¡Guarda 3 animales que viven y ayudan en la granja!' },
  { id: 'q_selva', category: 'selva', title: 'Animales de la Selva', targetCount: 3, prompt: '¡Empaca 3 animales salvajes que habitan en la selva!' },
  { id: 'q_voladores', category: 'volador', title: 'Animales que Vuelan', targetCount: 2, prompt: '¡Empaca animales con alas que vuelan por el cielo!' },
  { id: 'q_nocturnos', category: 'nocturno', title: 'Animales Nocturnos', targetCount: 2, prompt: '¡Guarda animales que despiertan de noche bajo la luna!' },
];

interface TriviaQuestion {
  id: string;
  question: string;
  options: { text: string; emoji: string; isCorrect: boolean }[];
  explanation: string;
}

const TRIVIA_POOL: TriviaQuestion[] = [
  {
    id: 't1',
    question: '¿Qué animal hace "¡Muuuuuu!" y nos da leche fresca?',
    options: [
      { text: 'Vaca', emoji: '🐮', isCorrect: true },
      { text: 'León', emoji: '🦁', isCorrect: false },
      { text: 'Pato', emoji: '🦆', isCorrect: false },
    ],
    explanation: 'La vaca vive en la granja y come pasto verde.',
  },
  {
    id: 't2',
    question: '¿Cuál de estos animales puede respirar bajo el agua?',
    options: [
      { text: 'Pulpo', emoji: '🐙', isCorrect: true },
      { text: 'Mono', emoji: '🐵', isCorrect: false },
      { text: 'Caballo', emoji: '🐴', isCorrect: false },
    ],
    explanation: 'El pulpo respira con branquias en el mar.',
  },
  {
    id: 't3',
    question: '¿Qué animal tiene una trompa larga para beber agua?',
    options: [
      { text: 'Elefante', emoji: '🐘', isCorrect: true },
      { text: 'Tigre', emoji: '🐯', isCorrect: false },
      { text: 'Oveja', emoji: '🐑', isCorrect: false },
    ],
    explanation: 'El elefante usa su trompa como una mano y ducha.',
  },
  {
    id: 't4',
    question: '¿Quién es conocido como el "Rey de la Selva"?',
    options: [
      { text: 'León', emoji: '🦁', isCorrect: true },
      { text: 'Conejo', emoji: '🐰', isCorrect: false },
      { text: 'Delfín', emoji: '🐬', isCorrect: false },
    ],
    explanation: 'El león tiene una gran melena y un potente rugido.',
  },
  {
    id: 't5',
    question: '¿Qué animal salta entre los árboles y le encantan los plátanos?',
    options: [
      { text: 'Mono', emoji: '🐵', isCorrect: true },
      { text: 'Pato', emoji: '🦆', isCorrect: false },
      { text: 'Tiburón', emoji: '🦈', isCorrect: false },
    ],
    explanation: 'El mono es muy ágil y trepa lianas en la selva.',
  },
  {
    id: 't6',
    question: '¿Qué animal tiene plumas blancas y nada en la nieve polar?',
    options: [
      { text: 'Pingüino', emoji: '🐧', isCorrect: true },
      { text: 'Caballo', emoji: '🐴', isCorrect: false },
      { text: 'Loro', emoji: '🦜', isCorrect: false },
    ],
    explanation: 'El pingüino resbala por el hielo y es un gran nadador.',
  },
];

type SafariPhase = 'backpack' | 'trivia' | 'summary';

export const AnimalSafariGame: React.FC<AnimalSafariGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  const [phase, setPhase] = useState<SafariPhase>('backpack');

  // No-repeat engine for quests and trivia
  const playedQuestsRef = useRef<string[]>([]);
  const playedTriviaRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectNextQuest = useCallback((): BackpackQuest => {
    const history = playedQuestsRef.current;
    const threshold = Math.ceil(BACKPACK_QUESTS.length * 0.7);

    let candidates = BACKPACK_QUESTS.filter((q) => !history.includes(q.id));
    if (candidates.length === 0 || history.length >= threshold) {
      playedQuestsRef.current = history.slice(-1);
      candidates = BACKPACK_QUESTS.filter((q) => !playedQuestsRef.current.includes(q.id));
    }

    const shuffled = shuffleArray(candidates);
    const chosen = shuffled[0] || BACKPACK_QUESTS[0];
    playedQuestsRef.current.push(chosen.id);
    return chosen;
  }, []);

  const selectNextTrivia = useCallback((): TriviaQuestion => {
    const history = playedTriviaRef.current;
    const threshold = Math.ceil(TRIVIA_POOL.length * 0.7);

    let candidates = TRIVIA_POOL.filter((t) => !history.includes(t.id));
    if (candidates.length === 0 || history.length >= threshold) {
      playedTriviaRef.current = history.slice(-1);
      candidates = TRIVIA_POOL.filter((t) => !playedTriviaRef.current.includes(t.id));
    }

    const shuffled = shuffleArray(candidates);
    const chosen = shuffled[0] || TRIVIA_POOL[0];
    playedTriviaRef.current.push(chosen.id);
    return chosen;
  }, []);

  // Phase 1 State (Backpack)
  const [currentQuest, setCurrentQuest] = useState<BackpackQuest>(() => BACKPACK_QUESTS[0]);
  const [questOptions, setQuestOptions] = useState<SafariAnimalItem[]>([]);
  const [packedAnimals, setPackedAnimals] = useState<SafariAnimalItem[]>([]);
  const [backpackComplete, setBackpackComplete] = useState<boolean>(false);

  // Phase 2 State (Trivia)
  const [currentTrivia, setCurrentTrivia] = useState<TriviaQuestion>(() => TRIVIA_POOL[0]);
  const [triviaStreak, setTriviaStreak] = useState<number>(0);
  const [selectedTriviaOption, setSelectedTriviaOption] = useState<string | null>(null);
  const [triviaFeedback, setTriviaFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [triviaRound, setTriviaRound] = useState<number>(1);
  const maxTriviaRounds = 3;

  // Final summary state
  const [totalEarnedXp, setTotalEarnedXp] = useState<number>(0);
  const [totalEarnedCoins, setTotalEarnedCoins] = useState<number>(0);

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

  // Init Backpack Quest
  const initBackpackQuest = useCallback(
    (quest: BackpackQuest) => {
      setCurrentQuest(quest);
      setPackedAnimals([]);
      setBackpackComplete(false);

      const targetMatching = ALL_SAFARI_ANIMALS.filter(
        (a) => a.category === quest.category
      );
      const distractors = ALL_ANIMALS_DISTRACTORS(quest.category);

      const candidates = shuffleArray([
        ...targetMatching.slice(0, quest.targetCount + 1),
        ...distractors.slice(0, 4),
      ]).slice(0, 6);

      setQuestOptions(candidates);

      cancelActiveAudio();
      playAudioPromise(
        `¡Safari de Explorador! Misión: ${quest.prompt}`,
        { speed: 0.85, pitch: 1.15 }
      );
    },
    []
  );

  useEffect(() => {
    const q = selectNextQuest();
    initBackpackQuest(q);
  }, [initBackpackQuest, selectNextQuest]);

  function ALL_ANIMALS_DISTRACTORS(excludeCategory: string) {
    return ALL_SAFARI_ANIMALS.filter((a) => a.category !== excludeCategory);
  }

  // Handle Packing animal into backpack
  const handlePackAnimal = (animal: SafariAnimalItem) => {
    if (backpackComplete) return;

    const isAlreadyPacked = packedAnimals.some((a) => a.id === animal.id);
    if (isAlreadyPacked) {
      // Unpack
      playSound('pop');
      setPackedAnimals((prev) => prev.filter((a) => a.id !== animal.id));
      return;
    }

    if (animal.category === currentQuest.category) {
      // Correct item
      playSound('pop');
      const updated = [...packedAnimals, animal];
      setPackedAnimals(updated);
      speak(`¡Muy bien! Guardaste al ${animal.name} (${animal.categoryLabel}).`);

      if (updated.length >= currentQuest.targetCount) {
        setBackpackComplete(true);
        playSound('victoryFanfare');
        triggerConfetti();
        speak(`¡Mochila lista! Has empacado todos los ${currentQuest.title}. Ahora pasamos a la trivia de safari.`);
      }
    } else {
      // Wrong category
      playSound('hit');
      speak(`El ${animal.name} es un ${animal.categoryLabel}. Recuerda: necesitamos ${currentQuest.title}.`);
    }
  };

  const handleStartTriviaPhase = () => {
    playSound('pop');
    setPhase('trivia');
    setTriviaRound(1);
    const firstTrivia = selectNextTrivia();
    setCurrentTrivia(firstTrivia);
    setSelectedTriviaOption(null);
    setTriviaFeedback(null);

    cancelActiveAudio();
    playAudioPromise(
      `¡Fase 2: Trivia Safari! Pregunta 1: ${firstTrivia.question}`,
      { speed: 0.85, pitch: 1.15 }
    );
  };

  const handleSelectTriviaOption = (opt: { text: string; emoji: string; isCorrect: boolean }) => {
    if (triviaFeedback !== null) return;
    setSelectedTriviaOption(opt.text);

    if (opt.isCorrect) {
      playSound('victoryFanfare');
      setTriviaFeedback('correct');
      setTriviaStreak((s) => s + 1);
      speak(`¡Correcto! ${opt.text}. ${currentTrivia.explanation}`);

      setTimeout(() => {
        if (triviaRound < maxTriviaRounds) {
          setTriviaRound((r) => r + 1);
          const next = selectNextTrivia();
          setCurrentTrivia(next);
          setSelectedTriviaOption(null);
          setTriviaFeedback(null);
          cancelActiveAudio();
          playAudioPromise(`Pregunta ${triviaRound + 1}: ${next.question}`, { speed: 0.85, pitch: 1.15 });
        } else {
          // Finish safari game: Award global points and coins at round completion!
          const xp = 30;
          const coins = 5;
          setTotalEarnedXp(xp);
          setTotalEarnedCoins(coins);
          addPoints(xp);
          addCoins(coins);
          incrementActivities('animales');
          if (onWinExercise) {
            onWinExercise(xp, coins);
          }
          triggerConfetti();
          setPhase('summary');
          speak(`¡Felicidades Explorador! Has completado el Safari con éxito. Ganaste ${xp} puntos y ${coins} monedas.`);
        }
      }, 1500);
    } else {
      playSound('hit');
      setTriviaFeedback('wrong');
      speak(`No es correcto. ¡Sigue intentándolo!`);
      setTimeout(() => {
        setTriviaFeedback(null);
        setSelectedTriviaOption(null);
      }, 1000);
    }
  };

  const handleRestartSafari = () => {
    playSound('pop');
    setPhase('backpack');
    const q = selectNextQuest();
    initBackpackQuest(q);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-animals-safari"
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
          ← Volver a Animales
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 font-black text-xs rounded-full border border-purple-200 flex items-center gap-1.5">
            <Backpack className="w-3.5 h-3.5 text-purple-500" />
            Safari de Explorador
          </span>
        </div>
      </div>

      {/* PHASE 1: BACKPACK CLASSIFICATION */}
      {phase === 'backpack' && (
        <div className="bg-gradient-to-b from-purple-50/70 via-indigo-50/30 to-white rounded-3xl p-6 sm:p-8 border-2 border-purple-200 shadow-md space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="px-3.5 py-1 bg-purple-100 text-purple-900 font-black text-xs rounded-full uppercase tracking-wider">
              Fase 1: Mochila de Clasificación
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              {currentQuest.title}
            </h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {currentQuest.prompt}
            </p>

            <button
              onClick={() => {
                playSound('pop');
                cancelActiveAudio();
                playAudioPromise(
                  `Misión: ${currentQuest.prompt}`,
                  { speed: 0.85, pitch: 1.15 }
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-purple-50 text-purple-800 font-black text-xs rounded-full border border-purple-200 shadow-2xs transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-purple-600" /> Escuchar Misión
            </button>
          </div>

          {/* Mochila Container */}
          <div className="max-w-md mx-auto p-5 bg-purple-900 text-white rounded-3xl border-3 border-purple-400 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Backpack className="w-6 h-6 text-amber-300" />
                <span className="font-black text-sm">Tu Mochila de Explorador</span>
              </div>
              <span className="text-xs font-bold text-purple-200">
                {packedAnimals.length} / {currentQuest.targetCount} Guardados
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: currentQuest.targetCount }).map((_, idx) => {
                const item = packedAnimals[idx];
                return (
                  <div
                    key={idx}
                    className={`h-20 rounded-2xl border-2 flex flex-col items-center justify-center p-1.5 transition-all ${
                      item
                        ? 'bg-purple-800/80 border-amber-300 shadow-inner'
                        : 'bg-purple-950/40 border-purple-700/60 border-dashed'
                    }`}
                  >
                    {item ? (
                      <>
                        <span className="text-3xl select-none">{item.emoji}</span>
                        <span className="text-[10px] font-black text-amber-200 truncate max-w-[80px]">
                          {item.name}
                        </span>
                      </>
                    ) : (
                      <span className="text-[10px] font-bold text-purple-400">
                        Espacio {idx + 1}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Animal Cards to Pick From */}
          <div className="max-w-xl mx-auto space-y-3">
            <p className="text-center text-xs font-black text-slate-400 uppercase tracking-wider">
              Toca los animales correctos para guardarlos en tu mochila:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {questOptions.map((animal) => {
                const isPacked = packedAnimals.some((a) => a.id === animal.id);
                return (
                  <button
                    key={animal.id}
                    onClick={() => handlePackAnimal(animal)}
                    disabled={backpackComplete}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 transition-all transform active:scale-95 cursor-pointer shadow-xs ${
                      isPacked
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-950 ring-2 ring-emerald-300'
                        : 'bg-white hover:bg-purple-50 border-slate-200 text-slate-800'
                    }`}
                  >
                    <span className="text-4xl">{animal.emoji}</span>
                    <span className="font-black text-sm">{animal.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {animal.categoryLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Backpack Completed Banner */}
          {backpackComplete && (
            <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-300">
              <div className="flex items-center gap-3 text-left">
                <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
                <div>
                  <h4 className="text-base font-black">
                    ¡Mochila Equipada con Éxito!
                  </h4>
                  <p className="text-xs text-emerald-100 font-medium">
                    Ahora continuemos con la Trivia Safari para ganar monedas.
                  </p>
                </div>
              </div>

              <button
                onClick={handleStartTriviaPhase}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
              >
                Comenzar Trivia →
              </button>
            </div>
          )}
        </div>
      )}

      {/* PHASE 2: TRIVIA SAFARI EXPRÉS */}
      {phase === 'trivia' && (
        <div className="bg-gradient-to-b from-indigo-50/80 via-purple-50/40 to-white rounded-3xl p-6 sm:p-8 border-2 border-indigo-200 shadow-md space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="px-3.5 py-1 bg-indigo-100 text-indigo-900 font-black text-xs rounded-full uppercase tracking-wider">
              Fase 2: Trivia Safari ({triviaRound}/{maxTriviaRounds})
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
              {currentTrivia.question}
            </h2>

            <button
              onClick={() => {
                playSound('pop');
                cancelActiveAudio();
                playAudioPromise(
                  currentTrivia.question,
                  { speed: 0.85, pitch: 1.15 }
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-indigo-50 text-indigo-800 font-black text-xs rounded-full border border-indigo-200 shadow-2xs transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-indigo-600" /> Escuchar Pregunta
            </button>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl mx-auto">
            {currentTrivia.options.map((opt) => {
              const isSelected = selectedTriviaOption === opt.text;
              let btnStyle = 'bg-white hover:bg-indigo-50 border-slate-200 text-slate-800 hover:border-indigo-400';

              if (triviaFeedback === 'correct' && opt.isCorrect) {
                btnStyle = 'bg-emerald-500 border-emerald-600 text-white shadow-lg ring-4 ring-emerald-200 scale-105';
              } else if (triviaFeedback === 'wrong' && isSelected) {
                btnStyle = 'bg-red-500 border-red-600 text-white animate-shake';
              }

              return (
                <button
                  key={opt.text}
                  onClick={() => handleSelectTriviaOption(opt)}
                  disabled={triviaFeedback === 'correct'}
                  className={`p-6 rounded-3xl border-3 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer transform active:scale-95 shadow-sm ${btnStyle}`}
                >
                  <span className="text-5xl">{opt.emoji}</span>
                  <span className="font-black text-base">{opt.text}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* PHASE 3: FINAL SUMMARY & AWARD */}
      {phase === 'summary' && (
        <div className="bg-gradient-to-b from-amber-50 via-purple-50 to-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center space-y-6 max-w-lg mx-auto">
          <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-3xl mx-auto flex items-center justify-center text-4xl shadow-inner border border-amber-300">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <span className="text-xs font-black text-purple-700 uppercase tracking-wider">
              ¡Misión Safari Completada!
            </span>
            <h2 className="text-3xl font-black text-slate-800">
              ¡Gran Explorador Animal!
            </h2>
            <p className="text-sm text-slate-600 font-medium">
              Completaste la mochila de clasificación y respondiste todas las preguntas de la trivia.
            </p>
          </div>

          <div className="p-4 bg-white rounded-2xl border-2 border-slate-100 flex items-center justify-center gap-8 shadow-sm">
            <div>
              <span className="text-xs font-black text-slate-400 uppercase block">
                Puntos Ganados
              </span>
              <span className="text-2xl font-black text-purple-600">
                +{totalEarnedXp} XP
              </span>
            </div>
            <div className="h-8 w-px bg-slate-200" />
            <div>
              <span className="text-xs font-black text-slate-400 uppercase block">
                Monedas
              </span>
              <span className="text-2xl font-black text-amber-500">
                +{totalEarnedCoins} 🪙
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleRestartSafari}
              className="w-full sm:w-auto px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer"
            >
              Jugar Otro Safari →
            </button>
            <button
              onClick={onBackToHub}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm rounded-2xl transition-all cursor-pointer"
            >
              Volver al Menú
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
