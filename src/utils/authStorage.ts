/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ActivityStats,
  AppSettings,
  AuthResult,
  Badge,
  PetStats,
  RegisterFormData,
  UserAccount,
  UserDataStore,
  UserProfile,
} from '../types';
import { generateRecoveryCode, generateSalt, hashString } from './authCrypto';

const ACCOUNTS_KEY = 'kindora_accounts_v2';
const SESSION_KEY = 'kindora_session_v2';
const USERDATA_PREFIX = 'kindora_userdata_v2_';

// Base badges template
export const INITIAL_BADGES_TEMPLATE: Badge[] = [
  { id: 'first_step', title: '¡Primeros Pasos!', description: 'Iniciaste tu aventura educativa en Kindora', icon: '🌟', unlocked: true },
  { id: 'vowels_master', title: 'Mago de las Vocales', description: 'Completaste ejercicios con las 5 vocales', icon: '🔤', unlocked: false },
  { id: 'alphabet_explorer', title: 'Explorador del Abecedario', description: 'Escuchaste y exploraste las letras', icon: '🔠', unlocked: false },
  { id: 'number_wizard', title: 'Contador Estrella', description: 'Aprendiste a contar números', icon: '🔢', unlocked: false },
  { id: 'color_artist', title: 'Artista de Colores', description: 'Descubriste y mezclaste colores', icon: '🎨', unlocked: false },
  { id: 'shape_genius', title: 'Genio de las Figuras', description: 'Reconociste todas las figuras geométricas', icon: '🔺', unlocked: false },
  { id: 'animal_friend', title: 'Amigo de los Animales', description: 'Escuchaste a los animales de la naturaleza', icon: '🐶', unlocked: false },
  { id: 'memory_champion', title: 'Campeón de Memoria', description: 'Ganaste una partida del memorama', icon: '🧠', unlocked: false },
  { id: 'best_caretaker', title: 'Cuidador Ejemplar', description: 'Mantuviste a tu mascota feliz y alimentada', icon: '🐾', unlocked: false },
  { id: 'super_shopper', title: 'Comprador Estrella', description: 'Compraste tu primer accesorio en la tienda', icon: '🛍️', unlocked: false },
];

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  soundVolume: 0.8,
  voiceSpeed: 0.85,
  voicePitch: 1.15,
  selectedVoiceURI: '',
  highContrast: false,
  largeFont: false,
};

// Generate age-adapted default starting state
export function createInitialUserData(userId: string, age = 4): UserDataStore {
  // Age adaptation: 3-year-olds start with gentle starter points & beginner items
  const isStarterAge = age <= 3;
  const isAdvancedAge = age >= 5;

  const initialPoints = isStarterAge ? 30 : isAdvancedAge ? 70 : 50;
  const initialCoins = isStarterAge ? 50 : isAdvancedAge ? 100 : 80;
  const initialActivities = isStarterAge ? 2 : isAdvancedAge ? 8 : 4;

  const initialStats: ActivityStats = {
    vocalesCount: isStarterAge ? 2 : isAdvancedAge ? 5 : 3,
    abecedarioCount: isStarterAge ? 1 : isAdvancedAge ? 6 : 4,
    numerosCount: isStarterAge ? 2 : isAdvancedAge ? 5 : 3,
    coloresCount: isStarterAge ? 2 : isAdvancedAge ? 4 : 3,
    figurasCount: isStarterAge ? 1 : isAdvancedAge ? 4 : 2,
    animalesCount: isStarterAge ? 2 : isAdvancedAge ? 5 : 4,
    memoryGamesPlayed: isStarterAge ? 1 : isAdvancedAge ? 5 : 2,
    memoryGamesWon: isStarterAge ? 1 : isAdvancedAge ? 4 : 2,
    totalTimeMinutes: isStarterAge ? 12 : isAdvancedAge ? 35 : 20,
    streakDays: 1,
    lastActiveDate: new Date().toISOString().split('T')[0],
  };

  const initialBadges = INITIAL_BADGES_TEMPLATE.map((b) => ({ ...b }));

  return {
    userId,
    points: initialPoints,
    coins: initialCoins,
    activitiesCount: initialActivities,
    level: Math.floor(initialPoints / 50) + 1,
    petStats: {
      hunger: 80,
      happiness: 90,
      energy: 95,
      lastUpdated: Date.now(),
    },
    inventory: ['food-apple', 'food-carrot'],
    equippedHat: null,
    equippedGlasses: null,
    equippedOutfit: null,
    badges: initialBadges,
    activityStats: initialStats,
    settings: { ...DEFAULT_SETTINGS },
  };
}

// Convert Account to UserProfile
export function accountToProfile(account: UserAccount): UserProfile {
  return {
    id: account.id,
    uid: account.id,
    username: account.username,
    childName: account.childName,
    childAge: account.childAge,
    avatarId: account.avatarId || 'avatar_01',
    avatar: account.avatar,
    petType: account.petType,
    petName: account.petName,
    parentName: account.parentName,
    parentEmail: account.parentEmail,
    securityQuestion: account.securityQuestion,
    registeredAt: account.registeredAt,
    lastLoginAt: account.lastLoginAt,
  };
}

class AuthStorageService {
  private initialized = false;

  constructor() {
    this.ensureInitialized();
  }

  private async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    try {
      const accounts = this.getAllAccounts();
      if (accounts.length === 0) {
        // Seed default family account for instant exploration
        const salt = generateSalt();
        const passwordHash = await hashString('kindora123', salt);
        const secAnswerHash = await hashString('bambu', salt);

        const defaultAccount: UserAccount = {
          id: 'user_default_mateo',
          username: 'mateo_explorador',
          parentEmail: 'familia.garcia@ejemplo.com',
          passwordHash,
          salt,
          securityQuestion: '¿Nombre de tu primera mascota?',
          securityAnswerHash: secAnswerHash,
          recoveryCode: '748291',
          childName: 'Mateo',
          childAge: 4,
          avatar: '🧒',
          petType: 'panda',
          petName: 'Bambú',
          parentName: 'María García',
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };

        this.saveAccounts([defaultAccount]);
        
        // Save initial default user data
        const defaultData = createInitialUserData(defaultAccount.id, defaultAccount.childAge);
        this.saveUserData(defaultAccount.id, defaultData);
      }
    } catch (e) {
      console.warn('Auth initialization fallback:', e);
    }
  }

  // 1. Account Store Management
  public getAllAccounts(): UserAccount[] {
    try {
      const raw = localStorage.getItem(ACCOUNTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  }

  public saveAccounts(accounts: UserAccount[]): void {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts:', e);
    }
  }

  public saveAccount(account: UserAccount): void {
    try {
      const accounts = this.getAllAccounts();
      const existingIdx = accounts.findIndex((a) => a.id === account.id);
      if (existingIdx >= 0) {
        accounts[existingIdx] = account;
      } else {
        accounts.push(account);
      }
      this.saveAccounts(accounts);
    } catch (e) {
      console.error('Failed to save account:', e);
    }
  }

  public findAccountByIdentifier(identifier: string): UserAccount | null {
    const clean = identifier.trim().toLowerCase();
    const accounts = this.getAllAccounts();
    return accounts.find(
      (acc) =>
        acc.username.toLowerCase() === clean ||
        acc.parentEmail.toLowerCase() === clean
    ) || null;
  }

  public findAccountById(id: string): UserAccount | null {
    const accounts = this.getAllAccounts();
    return accounts.find((acc) => acc.id === id) || null;
  }

  // 2. Active Session Management
  public getActiveUserId(): string | null {
    try {
      return localStorage.getItem(SESSION_KEY) || null;
    } catch {
      return null;
    }
  }

  public setActiveUserId(userId: string | null): void {
    try {
      if (userId) {
        localStorage.setItem(SESSION_KEY, userId);
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }

  public getCurrentUser(): UserAccount | null {
    const activeId = this.getActiveUserId();
    if (!activeId) return null;
    return this.findAccountById(activeId);
  }

  // 3. Isolated Per-User Data Store
  public getUserData(userId: string, age = 4): UserDataStore {
    try {
      const raw = localStorage.getItem(`${USERDATA_PREFIX}${userId}`);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    // Fallback initialize
    const fresh = createInitialUserData(userId, age);
    try {
      localStorage.setItem(`${USERDATA_PREFIX}${userId}`, JSON.stringify(fresh));
    } catch (e) {
      console.error('Failed to initialize isolated user data:', e);
    }
    return fresh;
  }

  public saveUserData(userId: string, data: Partial<UserDataStore>): void {
    try {
      let existing: UserDataStore;
      const raw = localStorage.getItem(`${USERDATA_PREFIX}${userId}`);
      if (raw) {
        try {
          existing = JSON.parse(raw);
        } catch {
          existing = createInitialUserData(userId);
        }
      } else {
        existing = createInitialUserData(userId);
      }
      const updated: UserDataStore = { ...existing, ...data, userId };
      // Recalculate level dynamically based on points
      updated.level = Math.floor((updated.points ?? 0) / 50) + 1;
      localStorage.setItem(`${USERDATA_PREFIX}${userId}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save isolated user data:', e);
    }
  }

  // 4. Registration Flow with Validation
  public async register(formData: RegisterFormData): Promise<AuthResult> {
    await this.ensureInitialized();

    const childName = formData.childName.trim();
    const parentName = formData.parentName.trim();
    const parentEmail = formData.parentEmail.trim().toLowerCase();
    const username = formData.username.trim().toLowerCase();
    const password = formData.password;
    const passwordConfirm = formData.passwordConfirm;
    const age = Number(formData.childAge) || 4;

    // Strict Validations
    if (!childName) {
      return { success: false, error: 'Por favor ingresa el nombre del niño o niña.' };
    }
    if (childName.length > 30) {
      return { success: false, error: 'El nombre es demasiado largo (máx 30 caracteres).' };
    }
    if (age < 3 || age > 10) {
      return { success: false, error: 'La edad debe estar comprendida entre 3 y 10 años.' };
    }
    if (!username) {
      return { success: false, error: 'Por favor elige un nombre de usuario.' };
    }
    if (username.length < 3) {
      return { success: false, error: 'El nombre de usuario debe tener al menos 3 caracteres.' };
    }
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return { success: false, error: 'El usuario solo puede contener letras, números y guiones.' };
    }
    if (!parentEmail) {
      return { success: false, error: 'Por favor ingresa el correo del padre, madre o tutor.' };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) {
      return { success: false, error: 'El formato del correo electrónico no es válido.' };
    }
    if (!password) {
      return { success: false, error: 'Por favor ingresa una contraseña segura.' };
    }
    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
    }
    if (password !== passwordConfirm) {
      return { success: false, error: 'Las contraseñas no coinciden. Por favor verifícalas.' };
    }

    // Uniqueness Checks
    const existing = this.getAllAccounts();
    const usernameTaken = existing.some((acc) => acc.username.toLowerCase() === username);
    if (usernameTaken) {
      return { success: false, error: `El usuario "${username}" ya está registrado. Elige otro.` };
    }
    const emailTaken = existing.some((acc) => acc.parentEmail.toLowerCase() === parentEmail);
    if (emailTaken) {
      return { success: false, error: `El correo "${parentEmail}" ya tiene una cuenta. Inicia sesión.` };
    }

    // Cryptographic Hashing
    const salt = generateSalt();
    const passwordHash = await hashString(password, salt);
    const securityQuestion = formData.securityQuestion?.trim() || '¿Nombre de tu primera mascota?';
    const securityAnswer = formData.securityAnswer?.trim().toLowerCase() || formData.petName.trim().toLowerCase() || 'mascota';
    const securityAnswerHash = await hashString(securityAnswer, salt);
    const recoveryCode = generateRecoveryCode();

    const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newAccount: UserAccount = {
      id: userId,
      username,
      parentEmail,
      passwordHash,
      salt,
      securityQuestion,
      securityAnswerHash,
      recoveryCode,
      childName,
      childAge: age,
      avatar: formData.avatar || '🧒',
      petType: formData.petType || 'panda',
      petName: formData.petName?.trim() || 'Bambú',
      parentName: parentName || 'Familia Kindora',
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };

    // Save account & create isolated user data
    existing.push(newAccount);
    this.saveAccounts(existing);

    const initialUserData = createInitialUserData(userId, age);
    this.saveUserData(userId, initialUserData);

    // Set active session
    this.setActiveUserId(userId);

    return {
      success: true,
      account: newAccount,
    };
  }

  // 5. Authentication Flow
  public async login(identifier: string, passwordAttempt: string): Promise<AuthResult> {
    await this.ensureInitialized();

    const clean = identifier.trim();
    if (!clean) {
      return { success: false, error: 'Ingresa tu usuario o correo electrónico.' };
    }
    if (!passwordAttempt) {
      return { success: false, error: 'Ingresa tu contraseña.' };
    }

    const account = this.findAccountByIdentifier(clean);
    if (!account) {
      return { success: false, error: 'No encontramos ninguna cuenta con ese usuario o correo.' };
    }

    // Verify Password Hash
    const attemptHash = await hashString(passwordAttempt, account.salt);
    if (attemptHash !== account.passwordHash) {
      return { success: false, error: 'Contraseña incorrecta. Por favor intenta de nuevo.' };
    }

    // Update lastLoginAt
    account.lastLoginAt = new Date().toISOString();
    const all = this.getAllAccounts().map((a) => (a.id === account.id ? account : a));
    this.saveAccounts(all);

    // Set active session
    this.setActiveUserId(account.id);

    return {
      success: true,
      account,
    };
  }

  // 6. Password Recovery: Request Code / Question
  public getAccountRecoveryInfo(identifier: string): {
    success: boolean;
    error?: string;
    account?: UserAccount;
    question?: string;
    recoveryCode?: string;
  } {
    const clean = identifier.trim();
    if (!clean) {
      return { success: false, error: 'Ingresa tu usuario o correo para recuperar tu cuenta.' };
    }
    const account = this.findAccountByIdentifier(clean);
    if (!account) {
      return { success: false, error: 'No se encontró ninguna cuenta asociada a este usuario o correo.' };
    }

    return {
      success: true,
      account,
      question: account.securityQuestion || '¿Nombre de tu primera mascota?',
      recoveryCode: account.recoveryCode,
    };
  }

  // 7. Reset Password with Recovery Code or Security Answer
  public async resetPassword(
    identifier: string,
    verificationValue: string,
    newPassword: string,
    newPasswordConfirm: string,
    mode: 'code' | 'answer' = 'code'
  ): Promise<{ success: boolean; error?: string; account?: UserAccount }> {
    if (!identifier.trim()) {
      return { success: false, error: 'Usuario o correo requerido.' };
    }
    if (!verificationValue.trim()) {
      return { success: false, error: mode === 'code' ? 'Ingresa el código de 6 dígitos.' : 'Ingresa la respuesta secreta.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
    }
    if (newPassword !== newPasswordConfirm) {
      return { success: false, error: 'Las nuevas contraseñas no coinciden.' };
    }

    const account = this.findAccountByIdentifier(identifier);
    if (!account) {
      return { success: false, error: 'Cuenta no encontrada.' };
    }

    if (mode === 'code') {
      const cleanCode = verificationValue.trim();
      if (cleanCode !== account.recoveryCode) {
        return { success: false, error: 'El código de recuperación es incorrecto.' };
      }
    } else {
      const cleanAnswer = verificationValue.trim().toLowerCase();
      const answerHash = await hashString(cleanAnswer, account.salt);
      if (answerHash !== account.securityAnswerHash) {
        return { success: false, error: 'La respuesta de seguridad no coincide.' };
      }
    }

    // Generate new salt & hash for new password
    const newSalt = generateSalt();
    const newPasswordHash = await hashString(newPassword, newSalt);
    const newRecoveryCode = generateRecoveryCode();

    account.passwordHash = newPasswordHash;
    account.salt = newSalt;
    account.recoveryCode = newRecoveryCode;
    account.lastLoginAt = new Date().toISOString();

    const all = this.getAllAccounts().map((a) => (a.id === account.id ? account : a));
    this.saveAccounts(all);
    this.setActiveUserId(account.id);

    return {
      success: true,
      account,
    };
  }

  // 8. Update Profile Data
  public updateAccountProfile(userId: string, updates: Partial<UserProfile>): UserAccount | null {
    const accounts = this.getAllAccounts();
    const index = accounts.findIndex((a) => a.id === userId);
    if (index === -1) return null;

    const acc = accounts[index];
    if (updates.childName) acc.childName = updates.childName.trim();
    if (updates.childAge) acc.childAge = Number(updates.childAge);
    if (updates.avatar) acc.avatar = updates.avatar;
    if (updates.petType) acc.petType = updates.petType;
    if (updates.petName) acc.petName = updates.petName.trim();
    if (updates.parentName) acc.parentName = updates.parentName.trim();

    accounts[index] = acc;
    this.saveAccounts(accounts);
    return acc;
  }

  // 9. Logout
  public logout(): void {
    this.setActiveUserId(null);
  }
}

export const authStorage = new AuthStorageService();
