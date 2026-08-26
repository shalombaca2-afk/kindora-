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
  Eye,
  Search,
  HelpCircle,
  Trophy,
} from 'lucide-react';

interface AnimalCamouflageGameProps {
  onBackToHub: () => void;
  onWinExercise?: (xp: number, coins: number) => void;
}

interface CamouflageSpot {
  id: string;
  isAnimal: boolean;
  elementEmoji: string;
  name: string;
  topPercent: number;
  leftPercent: number;
}

interface CamouflageBiome {
  id: string;
  biomeName: string;
  targetAnimalName: string;
  targetAnimalEmoji: string;
  bgGradient: string;
  environmentDescription: string;
  hints: string[];
  funFact: string;
  spots: CamouflageSpot[];
}

const CAMOUFLAGE_SCENES: CamouflageBiome[] = [
  {
    id: 'camaleon_selva',
    biomeName: 'Selva Tropical Espesa',
    targetAnimalName: 'Camaleón Esmeralda',
    targetAnimalEmoji: '🦎',
    bgGradient: 'from-emerald-900 via-green-800 to-teal-900',
    environmentDescription: 'Entre las grandes hojas de palmeras y flores exóticas.',
    hints: [
      'Pista 1: El camaleón cambió de color verde para parecer una hoja.',
      'Pista 2: Se encuentra cerca de la parte superior de las enredaderas.',
      'Pista 3: ¡Mira atentamente las ramas del lado derecho!',
    ],
    funFact: 'Los camaleones pueden mover sus dos ojos en direcciones diferentes al mismo tiempo.',
    spots: [
      { id: 'spot_1', isAnimal: false, elementEmoji: '🌿', name: 'Hoja de Palmera', topPercent: 25, leftPercent: 20 },
      { id: 'spot_2', isAnimal: false, elementEmoji: '🌺', name: 'Flor de Hibisco', topPercent: 65, leftPercent: 15 },
      { id: 'spot_3', isAnimal: true, elementEmoji: '🦎', name: 'Camaleón Esmeralda', topPercent: 30, leftPercent: 75 },
      { id: 'spot_4', isAnimal: false, elementEmoji: '🪵', name: 'Tronco con Musgo', topPercent: 70, leftPercent: 55 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🍃', name: 'Hojas Verdes', topPercent: 45, leftPercent: 40 },
      { id: 'spot_6', isAnimal: false, elementEmoji: '🍄', name: 'Hongo Silvestre', topPercent: 80, leftPercent: 80 },
    ],
  },
  {
    id: 'buho_bosque',
    biomeName: 'Bosque de Robles al Atardecer',
    targetAnimalName: 'Búho Camuflado',
    targetAnimalEmoji: '🦉',
    bgGradient: 'from-amber-950 via-stone-900 to-amber-900',
    environmentDescription: 'Entre la corteza rugosa de los árboles milenarios.',
    hints: [
      'Pista 1: Las plumas del búho tienen el mismo color marrón que la corteza.',
      'Pista 2: Está descansando en el hueco de un árbol alto.',
      'Pista 3: ¡Busca en el centro-izquierda del tronco!',
    ],
    funFact: 'Las plumas de los búhos son tan suaves que pueden volar en absoluto silencio sin hacer ningún ruido.',
    spots: [
      { id: 'spot_1', isAnimal: false, elementEmoji: '🍂', name: 'Hojas Secas', topPercent: 75, leftPercent: 25 },
      { id: 'spot_2', isAnimal: true, elementEmoji: '🦉', name: 'Búho Camuflado', topPercent: 35, leftPercent: 30 },
      { id: 'spot_3', isAnimal: false, elementEmoji: '🌲', name: 'Corteza Gruesa', topPercent: 20, leftPercent: 70 },
      { id: 'spot_4', isAnimal: false, elementEmoji: '🌰', name: 'Bellota de Roble', topPercent: 60, leftPercent: 60 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🪵', name: 'Rama Seca', topPercent: 40, leftPercent: 85 },
      { id: 'spot_6', isAnimal: false, elementEmoji: '🌿', name: 'Helecho', topPercent: 80, leftPercent: 75 },
    ],
  },
  {
    id: 'oso_polar_nieve',
    biomeName: 'Tundra Ártica Helada',
    targetAnimalName: 'Oso Polar Blanco',
    targetAnimalEmoji: '🐻‍❄️',
    bgGradient: 'from-sky-200 via-slate-100 to-cyan-200',
    environmentDescription: 'Entre témpanos de hielo reluciente y nieve suave.',
    hints: [
      'Pista 1: Su pelaje parece blanco como la nieve, pero en realidad sus pelos son transparentes y huecos.',
      'Pista 2: Está asomándose detrás de un bloque de hielo.',
      'Pista 3: ¡Busca en la parte inferior derecha!',
    ],
    funFact: 'La piel debajo del pelaje blanco del oso polar es de color negro para absorber el calor del sol.',
    spots: [
      { id: 'spot_1', isAnimal: false, elementEmoji: '🧊', name: 'Témpano de Hielo', topPercent: 30, leftPercent: 20 },
      { id: 'spot_2', isAnimal: false, elementEmoji: '❄️', name: 'Montículo de Nieve', topPercent: 60, leftPercent: 25 },
      { id: 'spot_3', isAnimal: false, elementEmoji: '🌨️', name: 'Ráfaga Nevada', topPercent: 20, leftPercent: 65 },
      { id: 'spot_4', isAnimal: true, elementEmoji: '🐻‍❄️', name: 'Oso Polar Blanco', topPercent: 65, leftPercent: 75 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🏔️', name: 'Pico Nevado', topPercent: 40, leftPercent: 45 },
    ],
  },
  {
    id: 'pulpo_arrecife',
    biomeName: 'Fondo del Arrecife de Coral',
    targetAnimalName: 'Pulpo Mimético',
    targetAnimalEmoji: '🐙',
    bgGradient: 'from-blue-950 via-teal-900 to-indigo-950',
    environmentDescription: 'Entre corales coloridos, esponjas marinas y arena.',
    hints: [
      'Pista 1: El pulpo cambió su forma y color para parecer una roca de coral.',
      'Pista 2: Sus tentáculos están enrollados cerca del fondo.',
      'Pista 3: ¡Observa con atención el lado izquierdo inferior!',
    ],
    funFact: 'Los pulpos tienen tres corazones y su sangre es de color azul.',
    spots: [
      { id: 'spot_1', isAnimal: false, elementEmoji: '🪸', name: 'Coral Rosa', topPercent: 30, leftPercent: 75 },
      { id: 'spot_2', isAnimal: false, elementEmoji: '🐚', name: 'Caracola Marina', topPercent: 75, leftPercent: 65 },
      { id: 'spot_3', isAnimal: true, elementEmoji: '🐙', name: 'Pulpo Mimético', topPercent: 70, leftPercent: 25 },
      { id: 'spot_4', isAnimal: false, elementEmoji: '🌊', name: 'Algas Marinas', topPercent: 25, leftPercent: 35 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🐠', name: 'Pez Payaso', topPercent: 40, leftPercent: 80 },
    ],
  },
  {
    id: 'guepardo_sabana',
    biomeName: 'Pastizales Dorados de la Sabana',
    targetAnimalName: 'Guepardo Oculto',
    targetAnimalEmoji: '🐆',
    bgGradient: 'from-amber-700 via-yellow-800 to-amber-900',
    environmentDescription: 'Entre la hierba alta y dorada bajo el sol radiante.',
    hints: [
      'Pista 1: Sus manchas oscuras se confunden con las sombras de la hierba.',
      'Pista 2: Está agazapado observando atentamente.',
      'Pista 3: ¡Busca en el centro de la pantalla!',
    ],
    funFact: 'El guepardo es el animal terrestre más rápido del planeta y puede alcanzar los 100 km/h en pocos segundos.',
    spots: [
      { id: 'spot_1', isAnimal: false, elementEmoji: '🌾', name: 'Hierba Dorada', topPercent: 25, leftPercent: 20 },
      { id: 'spot_2', isAnimal: false, elementEmoji: '🪨', name: 'Roca Caliente', topPercent: 70, leftPercent: 20 },
      { id: 'spot_3', isAnimal: true, elementEmoji: '🐆', name: 'Guepardo Oculto', topPercent: 45, leftPercent: 50 },
      { id: 'spot_4', isAnimal: false, elementEmoji: '🌳', name: 'Acacia Solitaria', topPercent: 20, leftPercent: 80 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🌾', name: 'Matorral Seco', topPercent: 75, leftPercent: 75 },
    ],
  },
  {
    id: 'rana_nenufar',
    biomeName: 'Laguna de Lirios Acuáticos',
    targetAnimalName: 'Ranita Verde Escondida',
    targetAnimalEmoji: '🐸',
    bgGradient: 'from-teal-900 via-emerald-950 to-green-900',
    environmentDescription: 'Flotando en aguas tranquilas sobre hojas flotantes.',
    hints: [
      'Pista 1: La ranita tiene exactamente el mismo tono de verde que los nenúfares.',
      'Pista 2: Asoma sus ojitos saltones justo arriba del agua.',
      'Pista 3: ¡Busca en la esquina superior izquierda!',
    ],
    funFact: 'Muchas ranitas usan su camuflaje para que los pájaros no las vean mientras descansan.',
    spots: [
      { id: 'spot_1', isAnimal: true, elementEmoji: '🐸', name: 'Ranita Verde Escondida', topPercent: 25, leftPercent: 25 },
      { id: 'spot_2', isAnimal: false, elementEmoji: '🪷', name: 'Flor de Loto', topPercent: 65, leftPercent: 30 },
      { id: 'spot_3', isAnimal: false, elementEmoji: '🍃', name: 'Nenúfar Gigante', topPercent: 35, leftPercent: 70 },
      { id: 'spot_4', isAnimal: false, elementEmoji: '💧', name: 'Gotas de Agua', topPercent: 75, leftPercent: 80 },
      { id: 'spot_5', isAnimal: false, elementEmoji: '🌾', name: 'Juncos del Pantano', topPercent: 20, leftPercent: 85 },
    ],
  },
];

export const AnimalCamouflageGame: React.FC<AnimalCamouflageGameProps> = ({
  onBackToHub,
  onWinExercise,
}) => {
  const { playSound, speak, addPoints, addCoins, triggerConfetti, incrementActivities } = useApp();

  // No-repeat engine for scenes
  const playedScenesRef = useRef<string[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const selectNextScene = useCallback((): CamouflageBiome => {
    const history = playedScenesRef.current;
    const threshold = Math.ceil(CAMOUFLAGE_SCENES.length * 0.7);

    let candidates = CAMOUFLAGE_SCENES.filter((s) => !history.includes(s.id));
    if (candidates.length === 0 || history.length >= threshold) {
      playedScenesRef.current = history.slice(-1);
      candidates = CAMOUFLAGE_SCENES.filter((s) => !playedScenesRef.current.includes(s.id));
    }

    const shuffled = shuffleArray(candidates);
    const chosen = shuffled[0] || CAMOUFLAGE_SCENES[0];
    playedScenesRef.current.push(chosen.id);
    return chosen;
  }, []);

  const [currentScene, setCurrentScene] = useState<CamouflageBiome>(() => CAMOUFLAGE_SCENES[0]);
  const [currentHintIndex, setCurrentHintIndex] = useState<number>(0);
  const [revealedAnimal, setRevealedAnimal] = useState<boolean>(false);
  const [clickedSpots, setClickedSpots] = useState<string[]>([]);
  const [streak, setStreak] = useState<number>(0);

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

  const loadScene = useCallback(
    (scene: CamouflageBiome) => {
      setCurrentScene(scene);
      setCurrentHintIndex(0);
      setRevealedAnimal(false);
      setClickedSpots([]);

      cancelActiveAudio();
      playAudioPromise(
        `¿Dónde está el animal? Estamos en: ${scene.biomeName}. Encuentra al ${scene.targetAnimalName} camuflado en el paisaje.`,
        { speed: 0.85, pitch: 1.15 }
      );
    },
    []
  );

  useEffect(() => {
    const scene = selectNextScene();
    loadScene(scene);
  }, [loadScene, selectNextScene]);

  const handleSpotClick = (spot: CamouflageSpot) => {
    if (revealedAnimal) return;

    if (clickedSpots.includes(spot.id)) return;
    setClickedSpots((prev) => [...prev, spot.id]);

    if (spot.isAnimal) {
      // Animal Found!
      setRevealedAnimal(true);
      playSound('victoryFanfare');
      triggerConfetti();
      const xp = 15;
      const coins = 2;
      addPoints(xp);
      addCoins(coins);
      incrementActivities('animales');
      setStreak((prev) => prev + 1);
      if (onWinExercise) {
        onWinExercise(xp, coins);
      }
      speak(`¡Lo encontraste! Es el ${currentScene.targetAnimalName}. ${currentScene.funFact}`);
    } else {
      // Distractor Clicked
      playSound('pop');
      speak(`Eso es: ${spot.name}. ¡Sigue buscando al animal camuflado!`);
    }
  };

  const handleRequestHint = () => {
    playSound('pop');
    if (currentHintIndex < currentScene.hints.length - 1) {
      const nextIndex = currentHintIndex + 1;
      setCurrentHintIndex(nextIndex);
      speak(currentScene.hints[nextIndex]);
    } else {
      speak(currentScene.hints[currentHintIndex]);
    }
  };

  const handleNextScene = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    cancelActiveAudio();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    playSound('pop');
    const next = selectNextScene();
    loadScene(next);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border-2 border-slate-200 shadow-sm">
        <button
          id="btn-back-animals-camouflage"
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
          <span className="px-3.5 py-1.5 bg-orange-50 text-orange-700 font-black text-xs rounded-full border border-orange-200 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-orange-500" />
            Aciertos Seguidos: {streak} 🔥
          </span>
        </div>
      </div>

      {/* Main Camouflage Stage */}
      <div className="bg-gradient-to-b from-orange-50/60 to-white rounded-3xl p-6 sm:p-8 border-2 border-orange-200 shadow-md space-y-6">
        {/* Heading & Mission */}
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <span className="px-3.5 py-1 bg-orange-100 text-orange-900 font-black text-xs rounded-full uppercase tracking-wider">
            Percepción Visual y Camuflaje
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-800">
            ¿Dónde está el {currentScene.targetAnimalName}?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Hábitat: <strong className="text-slate-700">{currentScene.biomeName}</strong> • {currentScene.environmentDescription}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => {
                playSound('pop');
                cancelActiveAudio();
                playAudioPromise(
                  `Busca al ${currentScene.targetAnimalName} en la ${currentScene.biomeName}. ${currentScene.hints[currentHintIndex]}`,
                  { speed: 0.85, pitch: 1.15 }
                );
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-orange-50 text-orange-800 font-black text-xs rounded-full border border-orange-200 shadow-2xs transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-orange-600" /> Escuchar Misión
            </button>

            <button
              id="btn-camouflage-hint"
              onClick={handleRequestHint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 font-black text-xs rounded-full border border-amber-300 shadow-2xs transition-all cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
              Pedir Pista ({currentHintIndex + 1}/{currentScene.hints.length})
            </button>
          </div>
        </div>

        {/* Current Voice Hint Banner */}
        <div className="max-w-md mx-auto p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-center">
          <p className="text-xs font-black text-amber-900">
            💡 {currentScene.hints[currentHintIndex]}
          </p>
        </div>

        {/* Camouflage Biome Canvas Box */}
        <div
          id="camouflage-biome-canvas"
          className={`relative w-full max-w-2xl h-80 sm:h-96 mx-auto rounded-3xl p-6 bg-gradient-to-br ${currentScene.bgGradient} shadow-2xl border-4 border-slate-800/20 overflow-hidden select-none`}
        >
          {/* Ambient Lighting & Particles effect */}
          <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

          {/* Interactive Spots */}
          {currentScene.spots.map((spot) => {
            const isDiscovered = clickedSpots.includes(spot.id);
            const isTarget = spot.isAnimal;

            let spotAnimation = 'hover:scale-125 transition-transform duration-200';
            if (isTarget && revealedAnimal) {
              spotAnimation = 'scale-150 animate-bounce ring-4 ring-amber-300 shadow-2xl rounded-full bg-white/30 backdrop-blur-xs p-2';
            }

            return (
              <button
                key={spot.id}
                onClick={() => handleSpotClick(spot)}
                style={{
                  top: `${spot.topPercent}%`,
                  left: `${spot.leftPercent}%`,
                }}
                aria-label={spot.name}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer flex flex-col items-center justify-center p-2 rounded-2xl group ${spotAnimation}`}
              >
                <span className="text-4xl sm:text-5xl filter drop-shadow-lg select-none">
                  {spot.elementEmoji}
                </span>

                {isDiscovered && !isTarget && (
                  <span className="text-[9px] font-black text-white bg-black/60 px-2 py-0.5 rounded-full mt-1 whitespace-nowrap shadow-xs animate-in fade-in">
                    {spot.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Victory Celebration Card */}
        {revealedAnimal && (
          <div className="max-w-md mx-auto p-5 bg-emerald-500 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95 duration-200 border-2 border-emerald-300">
            <div className="flex items-center gap-3 text-left">
              <CheckCircle2 className="w-8 h-8 text-amber-300 shrink-0" />
              <div>
                <h4 className="text-base font-black">
                  ¡Animal Descubierto! +15 XP • +2 🪙
                </h4>
                <p className="text-xs text-emerald-100 font-medium leading-relaxed">
                  {currentScene.funFact}
                </p>
              </div>
            </div>

            <button
              onClick={handleNextScene}
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap"
            >
              Siguiente Paisaje →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
