import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getSpanishVoices } from '../utils/audio';
import {
  Volume2,
  Sliders,
  RefreshCw,
  Sparkles,
  Check,
  AlertTriangle,
  Radio,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllProgress, playSound, speak } = useApp();

  const [spanishVoices, setSpanishVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      const voices = getSpanishVoices();
      setSpanishVoices(voices);
    };

    updateVoices();

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handleTestVoice = () => {
    playSound('pop');
    speak('¡Hola! Soy tu acompañante en Kindora. ¡Vamos a aprender y divertirnos juntos!');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-sky-100 shadow-md">
        <h1 id="settings-title" className="text-3xl sm:text-4xl font-black text-[#1e293b] tracking-tight flex items-center gap-2">
          <span>⚙️</span> Ajustes de Kindora
        </h1>
        <p className="text-base font-semibold text-slate-500 mt-1">
          Configuración de pronunciación en español, efectos de sonido y preferencias de aprendizaje.
        </p>
      </div>

      {/* Voice & Speech Settings Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <h2 id="settings-voice-label" className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>🔊</span> Pronunciación en Español
          </h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 text-xs font-black rounded-full border border-sky-200">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Web Speech API (es-ES / es-MX)</span>
          </span>
        </div>

        {/* Test voice button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-sky-50 rounded-2xl border border-sky-100">
          <div>
            <span className="font-black text-slate-800 block text-base">Prueba de Pronunciación en Español</span>
            <span className="text-xs text-slate-600 font-medium">Escucha el tono cálido y amigable adaptado para niños pequeños</span>
          </div>

          <button
            id="settings-test-voice"
            onClick={handleTestVoice}
            className="px-6 py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white font-black text-sm rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-2 cursor-pointer shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            <span>🔊 Probar voz en español</span>
          </button>
        </div>

        {/* Available Spanish Voices (if detected on device) */}
        {spanishVoices.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700">Voz en Español Seleccionada:</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {spanishVoices.slice(0, 6).map((v) => {
                const isSelected = settings.selectedVoiceURI === v.voiceURI;
                return (
                  <button
                    key={v.voiceURI}
                    onClick={() => {
                      playSound('pop');
                      updateSettings({ selectedVoiceURI: v.voiceURI });
                    }}
                    className={`p-3 text-left rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-sky-500 bg-sky-50/70 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-black text-slate-800 truncate">{v.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-sky-600 shrink-0" />}
                    </div>
                    <span className="text-xs text-slate-500 font-medium mt-1">
                      {v.lang} {v.default ? '• Voz Predeterminada' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Voice Speed */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700">
            <span>Velocidad de pronunciación (0.85x recomendada para 3-5 años)</span>
            <span className="text-[#0284c7] font-black">{Math.round(settings.voiceSpeed * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.6"
            max="1.2"
            step="0.05"
            value={settings.voiceSpeed}
            onChange={(e) => updateSettings({ voiceSpeed: parseFloat(e.target.value) })}
            className="w-full accent-[#0284c7] cursor-pointer"
          />
        </div>

        {/* Voice Pitch */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-bold text-slate-700">
            <span>Tono y calidez vocal (1.15x amigable y dulce)</span>
            <span className="text-[#0284c7] font-black">{Math.round(settings.voicePitch * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.8"
            max="1.4"
            step="0.05"
            value={settings.voicePitch}
            onChange={(e) => updateSettings({ voicePitch: parseFloat(e.target.value) })}
            className="w-full accent-[#0284c7] cursor-pointer"
          />
        </div>
      </div>

      {/* Sound Effects Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span>🎵</span> Efectos de Sonido
        </h2>

        {/* Sound Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <span className="font-black text-slate-800 block text-base">Efectos interactivos</span>
            <span className="text-xs text-slate-500 font-medium">Sonidos al tocar letras, números, monedas y animales</span>
          </div>
          <button
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-14 h-8 rounded-full transition-colors relative p-1 cursor-pointer ${
              settings.soundEnabled ? 'bg-[#0284c7]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Sound Volume */}
        {settings.soundEnabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm font-bold text-slate-700">
              <span>Volumen de sonidos</span>
              <span className="text-[#0284c7] font-black">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.soundVolume}
              onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-[#0284c7] cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Reset Progress Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-rose-100 shadow-md space-y-4">
        <h2 className="text-xl font-extrabold text-rose-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-rose-500" />
          <span>Restablecer Datos</span>
        </h2>
        <p className="text-xs text-slate-600">
          Si deseas reiniciar los puntos, monedas, actividades y mascota a su estado inicial.
        </p>

        {showResetConfirm ? (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-3">
            <p className="text-sm font-bold text-rose-800">
              ¿Estás seguro de que quieres reiniciar todo el progreso?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  resetAllProgress();
                  setShowResetConfirm(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Sí, reiniciar
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowResetConfirm(true)}
            className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-extrabold text-xs rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Restablecer todo el progreso</span>
          </button>
        )}
      </div>
    </div>
  );
};
