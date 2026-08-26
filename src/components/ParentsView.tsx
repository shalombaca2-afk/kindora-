import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KindoraIcon, KindoraWordmark } from './KindoraLogo';
import { Lock, Unlock, CheckCircle, Clock, Star, Trophy, BookOpen, Award, Printer } from 'lucide-react';

export const ParentsView: React.FC = () => {
  const { user, activityStats, badges, playSound, speak } = useApp();

  // Parental Gate Security Check
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [num1] = useState(Math.floor(Math.random() * 5) + 3);
  const [num2] = useState(Math.floor(Math.random() * 5) + 2);
  const [parentAnswer, setParentAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [showCertificate, setShowCertificate] = useState(false);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(parentAnswer, 10) === num1 + num2) {
      playSound('success');
      setIsUnlocked(true);
      setErrorMsg('');
    } else {
      playSound('pop');
      setErrorMsg('Respuesta incorrecta. Intenta nuevamente.');
    }
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-white rounded-3xl border-3 border-purple-200 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center mx-auto text-3xl">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 id="parents-title" className="text-2xl font-extrabold text-[#344054]">
            👨‍👩‍👧 Panel para padres
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Control de seguridad parental. Por favor resuelve el siguiente cálculo:
          </p>
        </div>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200">
            <span className="text-2xl font-black text-purple-900">
              ¿Cuánto es {num1} + {num2}?
            </span>
          </div>

          <input
            type="number"
            value={parentAnswer}
            onChange={(e) => setParentAnswer(e.target.value)}
            placeholder="Escribe el resultado"
            className="w-full px-4 py-3 text-center text-xl font-bold bg-slate-50 border-2 border-slate-200 rounded-xl focus:border-purple-500 focus:outline-none"
            autoFocus
          />

          {errorMsg && <p className="text-xs font-bold text-rose-500">{errorMsg}</p>}

          <button
            type="submit"
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-base rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            Acceder al panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Top Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 id="parents-title" className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight">
              👨‍👩‍👧 Panel para padres
            </h1>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Acceso seguro
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-500 mt-1">
            Seguimiento del progreso de aprendizaje en Kindora de <strong>{user?.childName || 'tu pequeño'}</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowCertificate(true)}
          className="px-5 py-3 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-sm rounded-2xl shadow-md shadow-orange-200/80 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
        >
          <Award className="w-5 h-5 text-yellow-200" />
          <span>Ver Diploma de Logros</span>
        </button>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Tiempo Total</p>
            <p className="text-2xl font-black text-slate-800">{activityStats.totalTimeMinutes} min</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Logros</p>
            <p className="text-2xl font-black text-slate-800">{unlockedBadgesCount} / {badges.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Actividades</p>
            <p className="text-2xl font-black text-slate-800">
              {activityStats.vocalesCount +
                activityStats.abecedarioCount +
                activityStats.numerosCount +
                activityStats.coloresCount +
                activityStats.figurasCount +
                activityStats.animalesCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border-2 border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase">Racha de Días</p>
            <p className="text-2xl font-black text-slate-800">{activityStats.streakDays} días 🔥</p>
          </div>
        </div>
      </div>

      {/* Progress Breakdown by Subject */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-slate-200 shadow-md space-y-6">
        <h3 className="text-xl font-extrabold text-slate-800">
          Progreso por Áreas Educativas
        </h3>

        <div className="space-y-4">
          {[
            { name: 'Vocales (A, E, I, O, U)', count: activityStats.vocalesCount, target: 5, icon: '🔤', color: 'bg-sky-500' },
            { name: 'Abecedario (A-Z)', count: activityStats.abecedarioCount, target: 10, icon: '🔠', color: 'bg-emerald-500' },
            { name: 'Números y Conteo', count: activityStats.numerosCount, target: 10, icon: '🔢', color: 'bg-orange-500' },
            { name: 'Colores y Mezclas', count: activityStats.coloresCount, target: 5, icon: '🎨', color: 'bg-yellow-500' },
            { name: 'Figuras Geométricas', count: activityStats.figurasCount, target: 5, icon: '🔺', color: 'bg-purple-500' },
            { name: 'Animales y Sonidos', count: activityStats.animalesCount, target: 8, icon: '🐶', color: 'bg-pink-500' },
          ].map((item) => {
            const percentage = Math.min(100, Math.round((item.count / item.target) * 100));
            return (
              <div key={item.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm font-bold text-slate-700">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">{item.icon}</span> {item.name}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">{percentage}% ({item.count} realizadas)</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Diploma Modal */}
      {showCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full border-8 border-amber-300 shadow-2xl text-center space-y-6 relative animate-in zoom-in-95">
            <div className="space-y-2 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center shadow-xs">
                <KindoraIcon className="w-12 h-12" />
              </div>
              <h2 className="text-3xl font-black text-amber-900 uppercase tracking-wide">
                Diploma de Aprendizaje
              </h2>
              <p className="text-xs font-bold text-amber-700">Otorgado con orgullo por Kindora • Creciendo con Imaginación</p>
            </div>

            <div className="py-4 border-y-2 border-amber-200 space-y-3">
              <p className="text-sm text-slate-600">Se certifica con alegría que:</p>
              <h3 className="text-4xl font-black text-[#0284c7] underline decoration-amber-400 decoration-wavy">
                {user?.childName || 'Pequeño Genio'}
              </h3>
              <p className="text-sm text-slate-700 max-w-md mx-auto leading-relaxed">
                Ha demostrado entusiasmo, curiosidad y dedicación aprendiendo las vocales, números, colores, figuras y cuidando a su mascota con amor en Kindora.
              </p>
            </div>

            <div className="flex items-center justify-between px-6 text-xs text-slate-500 font-bold">
              <span>📅 {new Date().toLocaleDateString('es-ES')}</span>
              <span>⭐ {user?.parentName || 'Familia Kindora'}</span>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-6 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-white font-black text-sm rounded-xl shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Imprimir diploma
              </button>
              <button
                onClick={() => setShowCertificate(false)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
