/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PetType = 'panda' | 'dino' | 'rabbit' | 'cat';

export type ActiveTab = 'home' | 'learn' | 'memory' | 'pet' | 'shop' | 'parents' | 'profile' | 'settings';

export type LearnCategory = 'vocales' | 'abecedario' | 'numeros' | 'colores' | 'figuras' | 'animales';

export type SocialProviderType = 'google' | 'facebook';

export type OnboardingStep =
  | 'landing'
  | 'social_login'
  | 'email_capture'
  | 'otp_verify'
  | 'child_profile'
  | 'completed';

export type AuthModalMode = 'login' | 'register' | 'recovery';

export interface FirestoreUser {
  uid: string;
  email: string;
  authProvider: SocialProviderType | string;
  isOtpVerified: boolean;
  isProfileComplete: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreChild {
  childId: string;
  name: string;
  ageGroup: string | number; // e.g. "3", "4", "5", "6+"
  avatarId: string; // avatar_01 to avatar_20
  pet: {
    type: PetType;
    customName: string;
  };
  createdAt?: any;
}

export interface UserProfile {
  id?: string;
  uid?: string;
  username?: string;
  childName: string;
  childAge: number;
  avatarId: string;
  avatar?: string;
  petType: PetType;
  petName: string;
  parentName: string;
  parentEmail: string;
  securityQuestion?: string;
  registeredAt: string;
  lastLoginAt?: string;
  level?: number;
  authProvider?: string;
  isOtpVerified?: boolean;
  isProfileComplete?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  parentEmail: string;
  passwordHash: string;
  salt: string;
  securityQuestion: string;
  securityAnswerHash: string;
  recoveryCode: string;
  childName: string;
  childAge: number;
  avatar: string;
  avatarId?: string;
  petType: PetType;
  petName: string;
  parentName: string;
  registeredAt: string;
  lastLoginAt: string;
}

export interface RegisterFormData {
  childName: string;
  childAge: number;
  username: string;
  parentName: string;
  parentEmail: string;
  password: string;
  confirmPassword?: string;
  passwordConfirm?: string;
  avatar: string;
  avatarId?: string;
  petType: PetType;
  petName: string;
  securityQuestion: string;
  securityAnswer: string;
}

export interface AuthResult {
  success: boolean;
  message?: string;
  account?: UserAccount;
  recoveryCode?: string;
  error?: string;
}

export interface UserDataStore {
  userId?: string;
  points: number;
  coins: number;
  activitiesCount: number;
  level: number;
  petStats: PetStats;
  inventory: string[];
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedOutfit: string | null;
  badges: Badge[];
  activityStats: ActivityStats;
  settings: AppSettings;
}

export interface PetStats {
  hunger: number; // 0 (starving) to 100 (full)
  happiness: number; // 0 to 100
  energy: number; // 0 to 100
  lastUpdated: number;
}

export interface ShopItem {
  id: string;
  name: string;
  category: 'food' | 'accessory' | 'toy';
  icon: string;
  price: number;
  description: string;
  effect?: {
    hunger?: number;
    happiness?: number;
    energy?: number;
  };
  slot?: 'hat' | 'glasses' | 'outfit';
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ActivityStats {
  vocalesCount: number;
  abecedarioCount: number;
  numerosCount: number;
  coloresCount: number;
  figurasCount: number;
  animalesCount: number;
  memoryGamesPlayed: number;
  memoryGamesWon: number;
  totalTimeMinutes: number;
  streakDays: number;
  lastActiveDate: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  soundVolume: number;
  voiceSpeed: number;
  voicePitch: number;
  selectedVoiceURI: string;
  highContrast: boolean;
  largeFont: boolean;
}
