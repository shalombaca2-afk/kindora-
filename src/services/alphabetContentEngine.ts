/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EducationalItem,
  GetAlphabetContentParams,
  SelectionEngineResult,
  AlphabetLetter,
  WordUsage,
} from '../types/educational';
import {
  EDUCATIONAL_ALPHABET_ITEMS,
  ALPHABET_LETTERS,
  ALPHABET_SIMILAR_MAP,
} from '../data/alphabetItemsData';
import { educationalFirestoreService } from './educationalFirestoreService';
import { preloadMediaForItems } from './contentEngine';

// Active in-session word history for alphabet to enforce intra-game and inter-game deduplication
const activeSessionAlphabetHistory = new Set<string>();

// 7-day spacing window (in milliseconds)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Calculates adaptive sampling weights for all 27 letters based on user accuracy.
 * Lower accuracy letters get a weighted boost in appearance probability.
 */
function calculateAdaptiveAlphabetWeights(
  accuracyMap: Record<string, number>
): Record<AlphabetLetter, number> {
  const inverseWeights: Partial<Record<AlphabetLetter, number>> = {};
  let totalInverse = 0;

  for (const letter of ALPHABET_LETTERS) {
    const acc = accuracyMap[letter] ?? 0.85;
    const factor = Math.pow(Math.max(0.1, 1.15 - acc), 1.5);
    inverseWeights[letter] = factor;
    totalInverse += factor;
  }

  const normalized: Partial<Record<AlphabetLetter, number>> = {};
  for (const letter of ALPHABET_LETTERS) {
    normalized[letter] = totalInverse > 0 ? (inverseWeights[letter] || 1) / totalInverse : 1 / 27;
  }

  return normalized as Record<AlphabetLetter, number>;
}

/**
 * Weighted random alphabet letter picker
 */
function pickWeightedAlphabetLetter(weights: Record<AlphabetLetter, number>): AlphabetLetter {
  const rand = Math.random();
  let cumulative = 0;
  for (const letter of ALPHABET_LETTERS) {
    cumulative += weights[letter] || 0;
    if (rand <= cumulative) {
      return letter;
    }
  }
  return 'A';
}

/**
 * Fisher-Yates array shuffler
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generates intelligent distractors for a given letter.
 * Prioritizes visually and phonetically similar letters from ALPHABET_SIMILAR_MAP.
 */
export function generateAlphabetDistractors(
  correctLetter: AlphabetLetter,
  count = 3
): AlphabetLetter[] {
  const similarPool = (ALPHABET_SIMILAR_MAP[correctLetter] || []).filter(
    (l) => l !== correctLetter && ALPHABET_LETTERS.includes(l)
  );

  const selectedDistractors: AlphabetLetter[] = [];

  // Pick from similar pool first
  const shuffledSimilar = shuffleArray(similarPool);
  for (const sim of shuffledSimilar) {
    if (selectedDistractors.length >= count) break;
    if (!selectedDistractors.includes(sim)) {
      selectedDistractors.push(sim);
    }
  }

  // Fill remaining slots from the general alphabet pool
  if (selectedDistractors.length < count) {
    const remainingPool = shuffleArray(
      ALPHABET_LETTERS.filter((l) => l !== correctLetter && !selectedDistractors.includes(l))
    );
    for (const rem of remainingPool) {
      if (selectedDistractors.length >= count) break;
      selectedDistractors.push(rem);
    }
  }

  return shuffleArray([correctLetter, ...selectedDistractors]);
}

/**
 * Synchronous, zero-latency Central Content Selection Engine for Kindora: Abecedario.
 * Operates on in-memory memory cache with instantaneous access.
 */
export function getNextAlphabetContentSync(
  params: GetAlphabetContentParams
): SelectionEngineResult {
  const { userId = 'kindora_child', gameType, quantity = 4, letter, difficulty } = params;

  // 1. Fetch items from in-memory cache
  const allItems = educationalFirestoreService.getEducationalItemsSync('alphabet');

  // 2. Fetch User Progress & Word Usage History
  const userProgress = educationalFirestoreService.getDomainProgressSync(userId, 'alphabet');
  const usageMap = educationalFirestoreService.getUserWordUsageSync(userId);

  // 3. Determine target letter
  const adaptiveWeights = calculateAdaptiveAlphabetWeights(userProgress.accuracyMap);
  const targetLetter = letter || pickWeightedAlphabetLetter(adaptiveWeights);

  // 4. In-Memory Filtering:
  // - For pureAlphabet, initialLetter, and buildWord (when letter is set): filter strictly by initialLetter === targetLetter
  // - For letterHunter: filter by items containing the target letter in `letters`
  let eligibleItems = allItems.filter((item) => {
    if (!item.enabled) return false;
    if (item.allowedGames && !item.allowedGames.includes(gameType)) return false;

    if (letter) {
      if (gameType === 'letterHunter') {
        return (
          item.initialLetter === letter ||
          (item.letters && item.letters.includes(letter)) ||
          item.word.toUpperCase().includes(letter)
        );
      }
      return item.initialLetter === letter;
    }

    return true;
  });

  // Filter by difficulty if provided
  if (difficulty !== undefined) {
    const strictDifficulty = eligibleItems.filter((item) => item.difficulty === difficulty);
    if (strictDifficulty.length >= quantity) {
      eligibleItems = strictDifficulty;
    } else {
      const relaxedDifficulty = eligibleItems.filter(
        (item) => Math.abs(item.difficulty - difficulty) <= 1
      );
      if (relaxedDifficulty.length > 0) {
        eligibleItems = relaxedDifficulty;
      }
    }
  }

  // 5. History Check & Active Session Deduplication
  const now = Date.now();
  const freshItems = eligibleItems.filter((item) => {
    if (activeSessionAlphabetHistory.has(item.id)) return false;
    const usage = usageMap[item.id];
    if (usage && now - usage.lastUsedAt < SEVEN_DAYS_MS) {
      return false;
    }
    return true;
  });

  let selectedItems: EducationalItem[] = [];
  let source: 'firestore' | 'cache' | 'lru_fallback' = 'cache';

  if (freshItems.length >= quantity) {
    selectedItems = shuffleArray(freshItems).slice(0, quantity);
  } else {
    // 6. Fallback LRU Algorithm
    source = 'lru_fallback';
    selectedItems = [...freshItems];

    const remainingEligible = eligibleItems.filter(
      (item) => !selectedItems.some((s) => s.id === item.id)
    );

    remainingEligible.sort((a, b) => {
      const usageA = usageMap[a.id] || { lastUsedAt: 0, usageCount: 0 };
      const usageB = usageMap[b.id] || { lastUsedAt: 0, usageCount: 0 };
      if (usageA.lastUsedAt !== usageB.lastUsedAt) {
        return usageA.lastUsedAt - usageB.lastUsedAt;
      }
      return usageA.usageCount - usageB.usageCount;
    });

    for (const item of remainingEligible) {
      if (selectedItems.length >= quantity) break;
      selectedItems.push(item);
    }

    // Ultimate fallback pool to guarantee non-empty results
    if (selectedItems.length < quantity) {
      const allAvailableFallback = shuffleArray(
        allItems.filter((it) => {
          if (!it.enabled) return false;
          if (letter && it.initialLetter !== letter) return false;
          return true;
        })
      );
      for (const item of allAvailableFallback) {
        if (selectedItems.length >= quantity) break;
        if (!selectedItems.some((s) => s.id === item.id)) {
          selectedItems.push(item);
        }
      }
    }
  }

  // 7. Non-blocking Fire-and-forget sync to Firestore & active session tracking
  for (const item of selectedItems) {
    activeSessionAlphabetHistory.add(item.id);
    educationalFirestoreService.recordWordUsage(userId, item.id, gameType);
  }

  // 8. Background asset preloading
  preloadMediaForItems(selectedItems);

  return {
    items: selectedItems,
    source,
    targetLetter,
  };
}

/**
 * Async wrapper for backwards-compatibility (0ms latency).
 */
export async function getNextAlphabetContent(
  params: GetAlphabetContentParams
): Promise<SelectionEngineResult> {
  return getNextAlphabetContentSync(params);
}

/**
 * Clears active session alphabet history
 */
export function clearActiveSessionAlphabetHistory(): void {
  activeSessionAlphabetHistory.clear();
}
