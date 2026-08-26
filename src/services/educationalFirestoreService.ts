/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { db } from '../lib/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  increment,
} from 'firebase/firestore';
import {
  EducationalDomain,
  EducationalItem,
  WordUsage,
  DomainProgress,
  VowelLetter,
  AlphabetLetter,
} from '../types/educational';
import { EDUCATIONAL_VOWEL_ITEMS } from '../data/educationalItemsData';
import { EDUCATIONAL_ALPHABET_ITEMS, ALPHABET_LETTERS } from '../data/alphabetItemsData';

const LOCAL_STORAGE_USAGE_KEY = 'kindora_word_usage_cache';
const LOCAL_STORAGE_PROGRESS_KEY = 'kindora_domain_progress_cache';

function getDefaultAccuracyMap(domain: EducationalDomain): Record<string, number> {
  if (domain === 'alphabet') {
    const map: Record<string, number> = {};
    ALPHABET_LETTERS.forEach((l) => {
      map[l] = 0.85;
    });
    return map;
  }
  return { A: 0.9, E: 0.9, I: 0.85, O: 0.9, U: 0.85 };
}

class EducationalFirestoreService {
  // In-memory memory cache with instantaneous access (0ms latency)
  private itemsCache: Map<EducationalDomain, EducationalItem[]> = new Map([
    ['vowels', [...EDUCATIONAL_VOWEL_ITEMS]],
    ['alphabet', [...EDUCATIONAL_ALPHABET_ITEMS]],
  ]);
  private userUsageCache: Map<string, Record<string, WordUsage>> = new Map();
  private userProgressCache: Map<string, DomainProgress> = new Map();
  private isPreloadingDomain: Map<EducationalDomain, boolean> = new Map();

  constructor() {
    // Prime local storage caches into memory immediately on boot
    this.hydrateFromLocalStorage();
  }

  private hydrateFromLocalStorage(): void {
    if (typeof window === 'undefined') return;
    try {
      // Find cached domain progress
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(LOCAL_STORAGE_PROGRESS_KEY)) {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            const userKey = key.replace(`${LOCAL_STORAGE_PROGRESS_KEY}_`, '');
            this.userProgressCache.set(userKey, parsed);
          }
        } else if (key && key.startsWith(LOCAL_STORAGE_USAGE_KEY)) {
          const val = localStorage.getItem(key);
          if (val) {
            const parsed = JSON.parse(val);
            const userKey = key.replace(`${LOCAL_STORAGE_USAGE_KEY}_`, '');
            this.userUsageCache.set(userKey, parsed);
          }
        }
      }
    } catch {
      // Non-blocking fallback
    }
  }

  /**
   * One-time background warm-up: queries Firestore once for the whole domain bank
   * and populates memory cache so all subsequent game queries are synchronous 0ms.
   */
  async preloadDomainBank(domain: EducationalDomain = 'vowels'): Promise<void> {
    if (this.isPreloadingDomain.get(domain)) return;
    this.isPreloadingDomain.set(domain, true);

    try {
      const q = query(
        collection(db, 'educationalItems'),
        where('domain', '==', domain),
        where('enabled', '==', true)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const items: EducationalItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...(d.data() as Omit<EducationalItem, 'id'>) });
        });
        this.itemsCache.set(domain, items);
      }
    } catch {
      // Graceful fallback to verified in-memory bank
    } finally {
      this.isPreloadingDomain.set(domain, false);
    }
  }

  /**
   * One-time background warm-up for user progress and usage data.
   */
  async preloadUserData(userId: string, domain: EducationalDomain = 'vowels'): Promise<void> {
    if (!userId || userId.startsWith('guest_')) return;

    // Background fetch progress
    try {
      const docRef = doc(db, 'users', userId, 'progress', domain);
      getDoc(docRef).then((snap) => {
        if (snap.exists()) {
          const data = snap.data() as DomainProgress;
          const current = this.getDomainProgressSync(userId, domain);
          const merged = { ...current, ...data };
          const cacheKey = `${userId}_${domain}`;
          this.userProgressCache.set(cacheKey, merged);
          try {
            localStorage.setItem(
              `${LOCAL_STORAGE_PROGRESS_KEY}_${cacheKey}`,
              JSON.stringify(merged)
            );
          } catch {}
        }
      }).catch(() => {});
    } catch {}

    // Background fetch word usage
    try {
      const usageCol = collection(db, 'users', userId, 'wordUsage');
      getDocs(usageCol).then((snapshot) => {
        if (!snapshot.empty) {
          const usageMap = this.getUserWordUsageSync(userId);
          snapshot.forEach((d) => {
            usageMap[d.id] = d.data() as WordUsage;
          });
          this.userUsageCache.set(userId, usageMap);
          try {
            localStorage.setItem(
              `${LOCAL_STORAGE_USAGE_KEY}_${userId}`,
              JSON.stringify(usageMap)
            );
          } catch {}
        }
      }).catch(() => {});
    } catch {}
  }

  /**
   * Synchronous, zero-latency retrieval of items from local memory cache.
   */
  getEducationalItemsSync(domain: EducationalDomain = 'vowels'): EducationalItem[] {
    const cached = this.itemsCache.get(domain);
    if (cached && cached.length > 0) {
      return cached.filter((item) => item.enabled);
    }
    if (domain === 'alphabet') {
      return EDUCATIONAL_ALPHABET_ITEMS.filter((item) => item.enabled);
    }
    return EDUCATIONAL_VOWEL_ITEMS.filter((item) => item.domain === domain && item.enabled);
  }

  /**
   * Async retrieval with auto-preload fallback.
   */
  async getEducationalItems(domain: EducationalDomain = 'vowels'): Promise<EducationalItem[]> {
    return this.getEducationalItemsSync(domain);
  }

  /**
   * Synchronous, zero-latency retrieval of word usage map from local memory cache.
   */
  getUserWordUsageSync(userId: string): Record<string, WordUsage> {
    if (this.userUsageCache.has(userId)) {
      return this.userUsageCache.get(userId)!;
    }

    const usageMap: Record<string, WordUsage> = {};
    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_USAGE_KEY}_${userId}`);
      if (raw) {
        Object.assign(usageMap, JSON.parse(raw));
      }
    } catch {}

    this.userUsageCache.set(userId, usageMap);
    return usageMap;
  }

  async getUserWordUsage(userId: string): Promise<Record<string, WordUsage>> {
    return this.getUserWordUsageSync(userId);
  }

  /**
   * Synchronous, zero-latency retrieval of domain progress.
   */
  getDomainProgressSync(
    userId: string,
    domain: EducationalDomain = 'vowels'
  ): DomainProgress {
    const cacheKey = `${userId}_${domain}`;
    const cached = this.userProgressCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const defaultProgress: DomainProgress = {
      domain,
      accuracyMap: getDefaultAccuracyMap(domain),
      totalPlayed: 0,
      updatedAt: Date.now(),
    };

    try {
      const raw = localStorage.getItem(`${LOCAL_STORAGE_PROGRESS_KEY}_${cacheKey}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged = { ...defaultProgress, ...parsed };
        this.userProgressCache.set(cacheKey, merged);
        return merged;
      }
    } catch {}

    this.userProgressCache.set(cacheKey, defaultProgress);
    return defaultProgress;
  }

  async getDomainProgress(
    userId: string,
    domain: EducationalDomain = 'vowels'
  ): Promise<DomainProgress> {
    return this.getDomainProgressSync(userId, domain);
  }

  /**
   * Records word usage: Updates memory and localStorage synchronously,
   * then persists to Firestore in background (Fire-and-forget, non-blocking).
   */
  recordWordUsage(userId: string, wordId: string, gameType: string): void {
    const now = Date.now();
    const usageMap = this.getUserWordUsageSync(userId);
    const prevCount = usageMap[wordId]?.usageCount || 0;

    const updated: WordUsage = {
      wordId,
      lastUsedAt: now,
      usageCount: prevCount + 1,
      gameType,
    };

    usageMap[wordId] = updated;
    this.userUsageCache.set(userId, usageMap);

    // Synchronous local storage update
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_USAGE_KEY}_${userId}`,
        JSON.stringify(usageMap)
      );
    } catch {}

    // Asynchronous Fire-and-Forget sync to Firestore
    if (userId && !userId.startsWith('guest_')) {
      const docRef = doc(db, 'users', userId, 'wordUsage', wordId);
      setDoc(
        docRef,
        {
          wordId,
          lastUsedAt: now,
          usageCount: increment(1),
          gameType,
        },
        { merge: true }
      ).catch(() => {
        // Fire-and-forget background error handling
      });
    }
  }

  /**
   * Updates accuracy metric: Updates memory and localStorage synchronously,
   * then persists to Firestore in background (Fire-and-forget, non-blocking).
   */
  async recordAnswerResult(
    userId: string,
    letter: VowelLetter | AlphabetLetter | string,
    isCorrect: boolean,
    domain: EducationalDomain = 'vowels'
  ): Promise<DomainProgress> {
    const cacheKey = `${userId}_${domain}`;
    const currentProgress = this.getDomainProgressSync(userId, domain);
    const prevAcc = currentProgress.accuracyMap[letter] ?? 0.85;

    // Moving average: weight new answer 25%, previous 75%
    const targetValue = isCorrect ? 1.0 : 0.2;
    const newAcc = Math.max(
      0.1,
      Math.min(1.0, Math.round((prevAcc * 0.75 + targetValue * 0.25) * 100) / 100)
    );

    const updatedProgress: DomainProgress = {
      domain,
      accuracyMap: {
        ...currentProgress.accuracyMap,
        [letter]: newAcc,
      },
      totalPlayed: currentProgress.totalPlayed + 1,
      updatedAt: Date.now(),
    };

    // Synchronous update of in-memory cache and localStorage
    this.userProgressCache.set(cacheKey, updatedProgress);
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_PROGRESS_KEY}_${cacheKey}`,
        JSON.stringify(updatedProgress)
      );
    } catch {}

    // Asynchronous Fire-and-Forget sync to Firestore
    if (userId && !userId.startsWith('guest_')) {
      const docRef = doc(db, 'users', userId, 'progress', domain);
      setDoc(docRef, updatedProgress, { merge: true }).catch(() => {
        // Fire-and-forget background error handling
      });
    }

    return updatedProgress;
  }
}

export const educationalFirestoreService = new EducationalFirestoreService();


