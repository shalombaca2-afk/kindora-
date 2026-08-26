/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type EducationalDomain = 'vowels' | 'alphabet' | 'numbers' | 'colors' | 'figures' | 'animals';

export type VowelGameType = 'pureVowels' | 'completeWord' | 'initialVowel' | 'vowelDetective';

export type AlphabetGameType = 'pureAlphabet' | 'initialLetter' | 'letterHunter' | 'buildWord';

export type VowelLetter = 'A' | 'E' | 'I' | 'O' | 'U';

export type AlphabetLetter =
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'E'
  | 'F'
  | 'G'
  | 'H'
  | 'I'
  | 'J'
  | 'K'
  | 'L'
  | 'M'
  | 'N'
  | 'Ñ'
  | 'O'
  | 'P'
  | 'Q'
  | 'R'
  | 'S'
  | 'T'
  | 'U'
  | 'V'
  | 'W'
  | 'X'
  | 'Y'
  | 'Z';

export interface EducationalItem {
  id: string; // e.g. "alphabet_b01" or "vowel_a01"
  domain: EducationalDomain;
  language?: string; // default "es"
  word: string; // e.g. "ballena"
  normalizedWord: string; // e.g. "ballena" (lowercase, no accents)
  initialLetter?: AlphabetLetter | string; // e.g. "B"
  initialVowel?: VowelLetter; // for backwards compatibility in vowel domain
  letters?: string[]; // e.g. ["B", "A", "L", "L", "E", "N", "A"]
  vowels?: VowelLetter[]; // Ordered vowel occurrences, e.g. ["A", "E", "A"]
  category: string; // "animal", "objeto", "naturaleza", "alimento", "transporte", etc.
  difficulty: number; // 1 to 3 (or 1 to 5)
  imageUrl: string; // Emoji / vector icon / image URL
  audioWordUrl: string; // Text to speak or audio asset
  audioLetterUrl?: string; // Text to speak or audio asset for letter (e.g. "Letra B, Be")
  audioVowelUrl?: string; // Text to speak or audio asset for initial vowel
  pronunciation: string; // e.g. "bal-le-na"
  enabled: boolean;
  allowedGames: (VowelGameType | AlphabetGameType | string)[];
}

export interface WordUsage {
  wordId: string;
  lastUsedAt: number; // Timestamp (ms)
  usageCount: number;
  gameType: string;
}

export interface DomainProgress {
  domain: EducationalDomain;
  accuracyMap: Record<string, number>; // e.g. { A: 0.92, B: 0.88, Ñ: 0.70 }
  totalPlayed: number;
  updatedAt: number;
}

export interface GetContentParams {
  userId?: string;
  gameType: VowelGameType;
  quantity: number;
  vowel?: VowelLetter;
  difficulty?: number; // 1 to 5
}

export interface GetAlphabetContentParams {
  userId?: string;
  gameType: AlphabetGameType;
  quantity: number;
  letter?: AlphabetLetter;
  difficulty?: number; // 1 to 3
}

export interface SelectionEngineResult {
  items: EducationalItem[];
  source: 'cache' | 'firestore' | 'lru_fallback';
  targetVowel?: VowelLetter;
  targetLetter?: AlphabetLetter;
}

export interface EducationalFeedbackState {
  status: 'idle' | 'evaluating' | 'correct' | 'retry';
  message: string;
  audioPrompt?: string;
  targetItem?: EducationalItem;
  gainedXp?: number;
  gainedCoins?: number;
}

