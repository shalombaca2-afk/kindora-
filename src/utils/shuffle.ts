/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Modern Fisher-Yates shuffle algorithm.
 * Returns a new shuffled array without mutating the source array.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = result[i];
    result[i] = result[j];
    result[j] = temp;
  }
  return result;
}

/**
 * Helper to select an item from a pool avoiding items in playedHistory.
 * When playedHistory reaches >= thresholdRatio (default 70%) of pool, it resets history.
 */
export function getNextNoRepeatItem<T extends { id?: string; name?: string }>(
  pool: T[],
  playedHistory: (string | number)[],
  getId: (item: T) => string | number = (item) => item.id || item.name || '',
  thresholdRatio = 0.7
): { item: T; updatedHistory: (string | number)[] } {
  if (pool.length === 0) {
    throw new Error('Pool cannot be empty');
  }

  let history = [...playedHistory];
  // If we have played through >= 70% of the pool, reset history to keep only the most recent 1 item
  if (history.length >= Math.ceil(pool.length * thresholdRatio)) {
    history = history.slice(-1);
  }

  const unplayed = pool.filter((item) => !history.includes(getId(item)));
  const candidatePool = unplayed.length > 0 ? unplayed : pool;
  const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];

  history.push(getId(selected));
  return { item: selected, updatedHistory: history };
}
