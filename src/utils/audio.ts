// Web Audio API & Speech Synthesis engine for Kindora

class SoundEngine {
  private ctx: AudioContext | null = null;
  private soundEnabled = true;
  private volume = 0.8;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
  }

  public playPop() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // ignore
    }
  }

  public playCardFlip() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(540, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.2 * this.volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.07);
    } catch {
      // ignore
    }
  }

  public playSuccess() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.08);

        gain.gain.setValueAtTime(0, now + i * 0.08);
        gain.gain.linearRampToValueAtTime(0.25 * this.volume, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.26);
      });
    } catch {
      // ignore
    }
  }

  public playCoin() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now); // B5
      osc2.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.25 * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);
      osc2.start(now + 0.08);
      osc2.stop(now + 0.35);
    } catch {
      // ignore
    }
  }

  public playVictoryFanfare() {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const chord = [
        { f: 523.25, t: 0, d: 0.15 },
        { f: 659.25, t: 0.12, d: 0.15 },
        { f: 783.99, t: 0.24, d: 0.15 },
        { f: 1046.5, t: 0.36, d: 0.4 },
        { f: 1318.51, t: 0.5, d: 0.6 },
      ];

      chord.forEach(({ f, t, d }) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + t);

        gain.gain.setValueAtTime(0.25 * this.volume, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + t);
        osc.stop(now + t + d);
      });
    } catch {
      // ignore
    }
  }

  public playPetSound(type: string) {
    if (!this.soundEnabled) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      if (type === 'cat') {
        // Meow sound
        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.35);
        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else if (type === 'dino') {
        // Dino roar / growl
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      } else {
        // Cheerful squeak / chirp for Panda & Rabbit
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
        osc.frequency.exponentialRampToValueAtTime(750, now + 0.2);
        gain.gain.setValueAtTime(0.2 * this.volume, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.23);
      }
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEngine();

/**
 * Voice Scoring Algorithm:
 * Evaluates available voices and scores them based on natural/neural quality,
 * child-friendliness, and Spanish regional clarity.
 */
function scoreSpanishVoice(voice: SpeechSynthesisVoice): number {
  const name = voice.name.toLowerCase();
  const lang = voice.lang.toLowerCase();

  // Voice must be in Spanish
  const isSpanish =
    lang.startsWith('es') ||
    lang.includes('spanish') ||
    name.includes('spanish') ||
    name.includes('español');

  if (!isSpanish) return -100;

  let score = 20;

  // 1. High-priority neural / natural child-friendly voices
  if (name.includes('dalia')) score += 120; // Microsoft Dalia (warm, clear, friendly tone)
  else if (name.includes('google') && (name.includes('español') || name.includes('spanish'))) score += 115; // Google Spanish
  else if (name.includes('sabina')) score += 110; // Microsoft Sabina
  else if (name.includes('paulina')) score += 105; // Apple Paulina (Mexico)
  else if (name.includes('mónica') || name.includes('monica')) score += 100; // Apple Mónica (Spain)
  else if (name.includes('paloma')) score += 95; // Microsoft Paloma
  else if (name.includes('alvaro') || name.includes('álvaro')) score += 90; // Microsoft Álvaro
  else if (name.includes('elvira')) score += 90; // Microsoft Elvira
  else if (name.includes('alonso')) score += 85;
  else if (name.includes('lucia') || name.includes('lucía')) score += 85;
  else if (name.includes('helena')) score += 80;
  else if (name.includes('jorge')) score += 75;
  else if (name.includes('carlos')) score += 70;
  else if (name.includes('siri')) score += 65;

  // 2. Bonus for Natural / Neural / Enhanced tags
  if (name.includes('natural') || name.includes('neural') || name.includes('online')) {
    score += 40;
  }
  if (name.includes('premium') || name.includes('enhanced') || name.includes('high quality')) {
    score += 25;
  }

  // 3. Dialect preferences for clarity
  if (lang === 'es-mx' || lang === 'es_mx') score += 15;
  else if (lang === 'es-es' || lang === 'es_es') score += 14;
  else if (lang === 'es-us' || lang === 'es_us' || lang === 'es-419') score += 12;
  else if (lang.startsWith('es')) score += 8;

  // 4. Default voice bonus
  if (voice.default) score += 5;

  return score;
}

/**
 * Returns all available Spanish voices sorted from highest to lowest quality.
 */
export function getSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !window.speechSynthesis) return [];
  const voices = window.speechSynthesis.getVoices();
  return voices
    .map((v) => ({ voice: v, score: scoreSpanishVoice(v) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.voice);
}

/**
 * Selects the optimal neural/natural Spanish voice on the client device.
 */
export function getBestSpanishVoice(preferredURI?: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // If the user picked a specific custom voice URI and it exists
  if (preferredURI) {
    const match = voices.find((v) => v.voiceURI === preferredURI);
    if (match) return match;
  }

  const sortedSpanish = getSpanishVoices();
  if (sortedSpanish.length > 0) {
    return sortedSpanish[0];
  }

  // Fallback: any voice with language code starting with 'es'
  const genericEs = voices.find((v) => v.lang.toLowerCase().startsWith('es'));
  if (genericEs) return genericEs;

  return null;
}

export interface SpeechOptions {
  speed?: number; // default: 0.85 (clear, warm cadence for early learners)
  pitch?: number; // default: 1.15 (warm, friendly pitch)
  volume?: number; // 0.0 to 1.0
  voiceURI?: string;
  lang?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * Standardized Native Web Speech API Service
 * - Child-friendly cadence: rate 0.85
 * - Warm, friendly tone: pitch 1.15
 * - Collision-free: Immediately stops/cancels prior audio instances on rapid clicks.
 * - Robust Spanish voice prioritization (Dalia, Google Español, Paulina, Sabina, etc.)
 */
class SpeechService {
  private activeUtterance: SpeechSynthesisUtterance | null = null;

  /**
   * Cleans text to optimize pronunciation for Spanish learners
   */
  private cleanText(text: string): string {
    if (!text) return '';
    return text
      .replace(
        /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu,
        ''
      )
      .replace(/[\n\r\t]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Pronounces text in Spanish using native Web Speech API.
   */
  public speak(text: string, options?: SpeechOptions) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    const cleaned = this.cleanText(text);
    if (!cleaned) return;

    // Immediately stop any active speech to avoid audio collisions
    this.cancel();

    try {
      const utterance = new SpeechSynthesisUtterance(cleaned);
      const voice = getBestSpanishVoice(options?.voiceURI);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'es-ES';
      } else {
        utterance.lang = options?.lang || 'es-ES';
      }

      // Default rate 0.85 for early learners (3-5 years old), pitch 1.15 for warm friendly tone
      utterance.rate = options?.speed ?? 0.85;
      utterance.pitch = options?.pitch ?? 1.15;
      utterance.volume = options?.volume ?? 1.0;

      utterance.onstart = () => {
        options?.onStart?.();
      };

      utterance.onend = () => {
        this.activeUtterance = null;
        options?.onEnd?.();
      };

      utterance.onerror = (event) => {
        this.activeUtterance = null;
        // Do not throw or log on intentional cancellation / interruption
        if (event.error === 'canceled' || event.error === 'interrupted') {
          return;
        }
        options?.onError?.(event);
      };

      this.activeUtterance = utterance;

      // Chrome bug workaround: ensure synth is not paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      window.speechSynthesis.speak(utterance);
    } catch {
      // Gracefully handle any browser synthesis exceptions
    }
  }

  /**
   * Stops any currently playing speech audio immediately.
   */
  public cancel() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      this.activeUtterance = null;
    } catch {}
  }

  public pause() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.pause();
    } catch {}
  }

  public resume() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.resume();
    } catch {}
  }
}

export const speechService = new SpeechService();

/**
 * Stops any active speech synthesis and all HTML5 <audio> elements in the DOM.
 */
export function stopAllAudio(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  if (typeof document !== 'undefined') {
    try {
      const audioElements = document.querySelectorAll('audio');
      audioElements.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    } catch {}
  }
}

/**
 * Central export for global Spanish speech synthesis
 */
export function speakSpanish(text: string, options?: SpeechOptions) {
  speechService.speak(text, options);
}
