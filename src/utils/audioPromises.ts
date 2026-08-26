/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { speakSpanish, SpeechOptions, speechService, stopAllAudio } from './audio';

/**
 * Instantly stops and cancels any active audio playback/queue, speech synthesis, and HTML5 audio elements.
 */
export function cancelActiveAudio(): void {
  speechService.cancel();
  stopAllAudio();
}

export { stopAllAudio };

/**
 * Promise-based audio speech execution.
 * Decouples the audio playback so minigames can chain speech, pauses, and animations smoothly.
 */
export function playAudioPromise(text: string, options?: SpeechOptions): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Safety timeout in case speechSynthesis hangs
    const timeoutId = setTimeout(() => {
      resolve();
    }, 4000);

    speakSpanish(text, {
      ...options,
      onEnd: () => {
        clearTimeout(timeoutId);
        options?.onEnd?.();
        resolve();
      },
      onError: (err) => {
        clearTimeout(timeoutId);
        options?.onError?.(err);
        resolve();
      },
    });
  });
}

/**
 * Creates an asynchronous pause.
 */
export function pausePromise(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Decoupled promise chain for Pure Vowels (Vocales Puras):
 * 1. playAudio(audioVowelUrl)
 * 2. pause(400ms)
 * 3. playAudio(audioWordUrl)
 */
export async function playDecoupledVowelSequence(
  audioVowelText: string,
  audioWordText: string,
  onStageChange?: (stage: 'vowel' | 'pause' | 'word' | 'idle') => void
): Promise<void> {
  try {
    cancelActiveAudio();
    onStageChange?.('vowel');
    await playAudioPromise(audioVowelText, { speed: 0.8, pitch: 1.15 });

    onStageChange?.('pause');
    await pausePromise(400);

    onStageChange?.('word');
    await playAudioPromise(audioWordText, { speed: 0.85, pitch: 1.1 });
  } finally {
    onStageChange?.('idle');
  }
}

/**
 * Decoupled promise chain for Pure Alphabet (Abecedario Puro):
 * 1. playAudio(audioLetterUrl) e.g. "Letra B, Be"
 * 2. pause(400ms)
 * 3. playAudio(audioWordUrl) e.g. "Barco"
 */
export async function playDecoupledAlphabetSequence(
  audioLetterText: string,
  audioWordText: string,
  onStageChange?: (stage: 'letter' | 'pause' | 'word' | 'idle') => void
): Promise<void> {
  try {
    cancelActiveAudio();
    onStageChange?.('letter');
    await playAudioPromise(audioLetterText, { speed: 0.82, pitch: 1.15 });

    onStageChange?.('pause');
    await pausePromise(400);

    onStageChange?.('word');
    await playAudioPromise(audioWordText, { speed: 0.85, pitch: 1.1 });
  } finally {
    onStageChange?.('idle');
  }
}

/**
 * Formative Retry pattern audio (non-punitive explanation):
 * e.g. "Escucha otra vez: Eee-lefante"
 */
export async function playEducationalRetry(
  vowel: string,
  word: string,
  pronunciation?: string
): Promise<void> {
  cancelActiveAudio();
  const syllables = pronunciation || word;
  const retryText = `Escucha con atención: ¡${vowel}! Como en ${word}, ${syllables}. ¡Inténtalo de nuevo!`;
  await playAudioPromise(retryText, { speed: 0.8, pitch: 1.15 });
}

/**
 * Formative Retry pattern for Alphabet letters:
 * e.g. "Escucha con atención: Letra B... Barco. ¡Tú puedes!"
 */
export async function playEducationalAlphabetRetry(
  letter: string,
  letterName: string,
  word: string,
  pronunciation?: string
): Promise<void> {
  cancelActiveAudio();
  const syllables = pronunciation || word;
  const retryText = `Escucha con atención: Letra ${letter}, ${letterName}. Como en ${word}, ${syllables}. ¡Tú puedes, inténtalo otra vez!`;
  await playAudioPromise(retryText, { speed: 0.8, pitch: 1.15 });
}

