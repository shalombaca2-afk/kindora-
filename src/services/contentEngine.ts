/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  EducationalItem,
  GetContentParams,
  SelectionEngineResult,
  VowelLetter,
  WordUsage,
} from '../types/educational';
import { EDUCATIONAL_VOWEL_ITEMS, VOWEL_LETTERS } from '../data/educationalItemsData';
import { educationalFirestoreService } from './educationalFirestoreService';

// Active in-session word history to enforce intra-game and inter-game deduplication
const activeSessionWordHistory = new Set<string>();

// 7-day spacing window (in milliseconds)
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Preloads media assets (images and audio files) in the background
 * so subsequent interactions are completely instantaneous.
 */
export function preloadMediaForItems(items: EducationalItem[]): void {
  if (typeof window === 'undefined') return;

  for (const item of items) {
    // 1. Image preloading (if it's an external URL, local path, or base64)
    if (
      item.imageUrl &&
      (item.imageUrl.startsWith('http://') ||
        item.imageUrl.startsWith('https://') ||
        item.imageUrl.startsWith('/') ||
        item.imageUrl.startsWith('data:image'))
    ) {
      const img = new Image();
      img.src = item.imageUrl;
    }

    // 2. Audio preloading (if it's a media URL file)
    if (
      item.audioWordUrl &&
      (item.audioWordUrl.startsWith('http://') ||
        item.audioWordUrl.startsWith('https://') ||
        item.audioWordUrl.startsWith('/'))
    ) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.src = item.audioWordUrl;
    }
  }
}

/**
 * Calculates adaptive sampling weights for vowels based on user accuracy.
 * Low accuracy vowels get priority boost.
 */
function calculateAdaptiveVowelWeights(
  accuracyMap: Record<string, number>
): Record<VowelLetter, number> {
  const letters: VowelLetter[] = ['A', 'E', 'I', 'O', 'U'];
  const inverseWeights: Record<VowelLetter, number> = {} as any;

  let totalInverse = 0;
  for (const v of letters) {
    const acc = accuracyMap[v] ?? 0.85;
    const factor = Math.pow(Math.max(0.1, 1.15 - acc), 1.5);
    inverseWeights[v] = factor;
    totalInverse += factor;
  }

  const normalized: Record<VowelLetter, number> = {} as any;
  for (const v of letters) {
    normalized[v] = totalInverse > 0 ? inverseWeights[v] / totalInverse : 0.2;
  }

  return normalized;
}

/**
 * Weighted random vowel picker according to adaptive weights
 */
function pickWeightedVowel(weights: Record<VowelLetter, number>): VowelLetter {
  const rand = Math.random();
  let cumulative = 0;
  for (const v of VOWEL_LETTERS) {
    cumulative += weights[v];
    if (rand <= cumulative) {
      return v;
    }
  }
  return 'A';
}

/**
 * Synchronous, zero-latency Central Content Selection Engine for Kindora.
 * Operates purely on fast in-memory cache without awaiting network reads.
 */
export function getNextVowelContentSync(
  params: GetContentParams
): SelectionEngineResult {
  const { userId = 'kindora_child', gameType, quantity = 4, vowel, difficulty } = params;

  // 1. Fetch educational item bank from in-memory cache (0ms)
  const allItems = educationalFirestoreService.getEducationalItemsSync('vowels');

  // 2. Fetch User Progress & Word Usage History from in-memory cache (0ms)
  const userProgress = educationalFirestoreService.getDomainProgressSync(userId, 'vowels');
  const usageMap = educationalFirestoreService.getUserWordUsageSync(userId);

  // Calculate adaptive weights for vowels
  const adaptiveWeights = calculateAdaptiveVowelWeights(userProgress.accuracyMap);

  // Determine target vowel if not explicitly specified
  const targetVowel = vowel || pickWeightedVowel(adaptiveWeights);

  // 3. Step 1: Fetching & Strict Initial Vowel Filtering
  // CRITICAL FIX: In Vocales Puras / Initial Vowel games, when a vowel is selected (e.g. 'O'),
  // filter STRICTLY by item.initialVowel === selectedVowel. DO NOT use vowels.includes().
  let eligibleItems = allItems.filter((item) => {
    if (!item.enabled) return false;
    if (!item.allowedGames.includes(gameType)) return false;

    // Strict initial vowel filter when target vowel is specified
    if (vowel) {
      return item.initialVowel === vowel;
    }

    return true;
  });

  // Filter by difficulty tolerance if specified
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

  // 4. Step 2: History Check & Active Session Deduplication
  const now = Date.now();
  const freshItems = eligibleItems.filter((item) => {
    // Exclude if already shown in the active session
    if (activeSessionWordHistory.has(item.id)) return false;

    // Check 7-day usage window
    const usage = usageMap[item.id];
    if (usage && now - usage.lastUsedAt < SEVEN_DAYS_MS) {
      return false;
    }

    return true;
  });

  let selectedItems: EducationalItem[] = [];
  let source: 'firestore' | 'cache' | 'lru_fallback' = 'cache';

  // If we have enough fresh items, shuffle and pick
  if (freshItems.length >= quantity) {
    selectedItems = shuffleArray(freshItems).slice(0, quantity);
  } else {
    // 5. Step 3: Fallback Algorithm (LRU)
    source = 'lru_fallback';
    selectedItems = [...freshItems];

    // Sort remaining eligible items by LRU (guaranteed to match initialVowel === vowel if vowel was specified)
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

    // Ultimate fallback pool: Still strictly enforcing initialVowel === vowel if vowel was set
    if (selectedItems.length < quantity) {
      const allAvailableFallback = shuffleArray(
        allItems.filter((it) => {
          if (!it.enabled || !it.allowedGames.includes(gameType)) return false;
          if (vowel && it.initialVowel !== vowel) return false;
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

  // 6. Step 6: Non-blocking Fire-and-forget in-memory + async storage sync
  for (const item of selectedItems) {
    activeSessionWordHistory.add(item.id);
    educationalFirestoreService.recordWordUsage(userId, item.id, gameType);
  }

  // 7. Background Preload Media Assets
  preloadMediaForItems(selectedItems);

  return {
    items: selectedItems,
    source,
    targetVowel,
  };
}

/**
 * Async wrapper maintaining backwards-compatibility, executing instantaneously with 0ms delay.
 */
export async function getNextVowelContent(
  params: GetContentParams
): Promise<SelectionEngineResult> {
  return getNextVowelContentSync(params);
}

/**
 * Utility to generate valid distractors for a target vowel without repeating the correct answer.
 */
export function generateVowelDistractors(
  correctVowel: VowelLetter,
  count = 3
): VowelLetter[] {
  const pool = VOWEL_LETTERS.filter((v) => v !== correctVowel);
  const shuffled = shuffleArray(pool);
  const distractors = shuffled.slice(0, count);
  const options = shuffleArray([correctVowel, ...distractors]);
  return options;
}

/**
 * Resets the in-session word history cache (e.g. on new game session).
 */
export function clearActiveSessionHistory(): void {
  activeSessionWordHistory.clear();
}

/**
 * Pure Fisher-Yates shuffle
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
