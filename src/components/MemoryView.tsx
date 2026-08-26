import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { stopAllAudio } from '../utils/audioPromises';
import { Sparkles, Trophy, RotateCcw, Clock, Award, Star } from 'lucide-react';

interface MemoryCard {
  id: number;
  pairId: number;
  emoji: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const THEMES = [
  {
    id: 'animals',
    name: 'Animales',
    icon: '🐶',
    cards: [
      { emoji: '🐶', label: 'Perro' },
      { emoji: '🐱', label: 'Gato' },
      { emoji: '🦁', label: 'León' },
      { emoji: '🐘', label: 'Elefante' },
      { emoji: '🐼', label: 'Panda' },
      { emoji: '🐰', label: 'Conejo' },
      { emoji: '🐸', label: 'Rana' },
      { emoji: '🐵', label: 'Mono' },
    ],
  },
  {
    id: 'fruits',
    name: 'Frutas',
    icon: '🍎',
    cards: [
      { emoji: '🍎', label: 'Manzana' },
      { emoji: '🍌', label: 'Plátano' },
      { emoji: '🍇', label: 'Uva' },
      { emoji: '🍓', label: 'Fresa' },
      { emoji: '🍊', label: 'Naranja' },
      { emoji: '🍉', label: 'Sandía' },
      { emoji: '🍍', label: 'Piña' },
      { emoji: '🍒', label: 'Cereza' },
    ],
  },
  {
    id: 'shapes',
    name: 'Figuras',
    icon: '🔺',
    cards: [
      { emoji: '⭐', label: 'Estrella' },
      { emoji: '💖', label: 'Corazón' },
      { emoji: '⭕', label: 'Círculo' },
      { emoji: '🔺', label: 'Triángulo' },
      { emoji: '🟧', label: 'Cuadrado' },
      { emoji: '💎', label: 'Diamante' },
      { emoji: '🌙', label: 'Luna' },
      { emoji: '☀️', label: 'Sol' },
    ],
  },
];

export const MemoryView: React.FC = () => {
  const {
    playSound,
    speak,
    addPoints,
    addCoins,
    triggerConfetti,
  } = useApp();

  const [selectedTheme, setSelectedTheme] = useState('animals');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isGameWon, setIsGameWon] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Initialize deck
  const startNewGame = () => {
    playSound('pop');
    setIsGameWon(false);
    setFlippedCards([]);
    setMoves(0);
    setSeconds(0);
    setIsTimerRunning(true);

    const theme = THEMES.find((t) => t.id === selectedTheme) || THEMES[0];
    const pairCount = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8;
    const selectedPairs = theme.cards.slice(0, pairCount);

    const deck: MemoryCard[] = [];
    selectedPairs.forEach((item, index) => {
      deck.push({
        id: index * 2,
        pairId: index,
        emoji: item.emoji,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: index * 2 + 1,
        pairId: index,
        emoji: item.emoji,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
  };

  useEffect(() => {
    startNewGame();
  }, [selectedTheme, difficulty]);

  // Timer
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && !isGameWon) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, isGameWon]);

  // Handle Card Click
  const handleCardClick = (index: number) => {
    if (flippedCards.length >= 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    playSound('card');

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;

      if (newCards[firstIdx].pairId === newCards[secondIdx].pairId) {
        // MATCH!
        playSound('success');
        speak(`¡Pareja de ${newCards[firstIdx].label}!`);

        setTimeout(() => {
          let isWon = false;
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].isMatched = true;
            updated[secondIdx].isMatched = true;

            if (updated.every((c) => c.isMatched)) {
              isWon = true;
            }
            return updated;
          });
          setFlippedCards([]);

          if (isWon) {
            handleGameWin();
          }
        }, 500);
      } else {
        // NO MATCH
        setTimeout(() => {
          setCards((prev) => {
            const updated = [...prev];
            updated[firstIdx].isFlipped = false;
            updated[secondIdx].isFlipped = false;
            return updated;
          });
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const handleGameWin = () => {
    setIsGameWon(true);
    setIsTimerRunning(false);
    playSound('victory');
    triggerConfetti();
    addPoints(25);
    addCoins(10);
    speak('¡Felicidades! Completaste el memorama.');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-3 border-indigo-100 shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 id="memory-title" className="text-3xl sm:text-4xl font-extrabold text-indigo-950 flex items-center gap-2">
              <span>🧠</span> Memorama
            </h1>
            <p id="memory-hint" className="text-sm sm:text-base font-bold text-slate-600">
              Encuentra las parejas.
            </p>
          </div>

          {/* New Game Button */}
          <button
            id="memory-new-game"
            onClick={startNewGame}
            className="px-6 py-3.5 bg-[#4fc3f7] hover:bg-sky-500 text-white font-extrabold text-base rounded-2xl shadow-md shadow-sky-200 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-5 h-5" />
            <span>🔄 Nueva partida</span>
          </button>
        </div>

        {/* Theme and Difficulty Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          {/* Themes */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Tema:</span>
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedTheme(theme.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedTheme === theme.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{theme.icon} {theme.name}</span>
              </button>
            ))}
          </div>

          {/* Difficulty */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Dificultad:</span>
            {(['easy', 'medium', 'hard'] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficulty(diff)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  difficulty === diff
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {diff === 'easy' ? 'Fácil (8)' : diff === 'medium' ? 'Medio (12)' : 'Desafío (16)'}
              </button>
            ))}
          </div>

          {/* Score & Time */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>{seconds}s</span>
            </div>
            <div>
              <span>Movimientos: <strong>{moves}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Cards Board Grid */}
      <div
        className={`grid gap-3 sm:gap-4 ${
          difficulty === 'easy'
            ? 'grid-cols-2 sm:grid-cols-4'
            : difficulty === 'medium'
            ? 'grid-cols-3 sm:grid-cols-4'
            : 'grid-cols-4 sm:grid-cols-4 md:grid-cols-8'
        }`}
      >
        {cards.map((card, index) => {
          const showContent = card.isFlipped || card.isMatched;
          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(index)}
              disabled={showContent}
              className={`relative aspect-square rounded-3xl border-3 font-black text-4xl sm:text-5xl transition-all duration-300 transform flex flex-col items-center justify-center cursor-pointer shadow-md ${
                card.isMatched
                  ? 'bg-emerald-100 border-emerald-400 text-emerald-800 scale-95 opacity-90'
                  : showContent
                  ? 'bg-white border-indigo-400 text-slate-800 shadow-xl'
                  : 'bg-gradient-to-br from-indigo-500 via-[#4fc3f7] to-cyan-400 border-white hover:scale-105 active:scale-95 text-white'
              }`}
            >
              {showContent ? (
                <div className="flex flex-col items-center justify-center gap-1 animate-in zoom-in-50 duration-150">
                  <span className="text-4xl sm:text-5xl">{card.emoji}</span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-600">
                    {card.label}
                  </span>
                </div>
              ) : (
                <span className="text-3xl sm:text-4xl opacity-80 select-none">🌈</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Game Won Celebration Modal / Card */}
      {isGameWon && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-4 animate-in zoom-in-90 duration-300">
          <span className="text-6xl animate-bounce inline-block">🏆</span>
          <h2 className="text-3xl font-extrabold">¡Ganaste la partida!</h2>
          <p className="text-white/90 text-base max-w-md mx-auto">
            Completaste el memorama en {seconds} segundos y con {moves} movimientos.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm font-bold bg-white/20 backdrop-blur-xs py-2 px-4 rounded-2xl w-fit mx-auto">
            <span>⭐ +25 Puntos</span>
            <span>🪙 +10 Monedas</span>
          </div>
          <button
            onClick={startNewGame}
            className="px-8 py-3.5 bg-white hover:bg-yellow-100 text-emerald-900 font-extrabold text-base rounded-2xl shadow-lg transition-transform active:scale-95"
          >
            ¡Jugar otra vez!
          </button>
        </div>
      )}
    </div>
  );
};
