/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab,
  ActivityStats,
  AppSettings,
  AuthModalMode,
  AuthResult,
  Badge,
  FirestoreChild,
  FirestoreUser,
  LearnCategory,
  OnboardingStep,
  PetStats,
  PetType,
  RegisterFormData,
  ShopItem,
  SocialProviderType,
  UserProfile,
} from '../types';
import { soundEffects, speakSpanish, SpeechOptions, stopAllAudio } from '../utils/audio';
import {
  accountToProfile,
  authStorage,
  createInitialUserData,
  DEFAULT_SETTINGS,
  INITIAL_BADGES_TEMPLATE,
} from '../utils/authStorage';
import { firebaseAuthService } from '../services/firebaseAuthService';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import confetti from 'canvas-confetti';

interface AppContextType {
  // User & Firebase Auth State
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  firestoreUserData: FirestoreUser | null;
  activeChild: FirestoreChild | null;
  isAuthenticated: boolean;
  isAuthInitializing: boolean;
  level: number;

  // Strict Sequential Onboarding & Route Guard
  onboardingStep: OnboardingStep;
  setOnboardingStep: (step: OnboardingStep) => void;
  pendingTutorEmail: string;
  pendingProvider: SocialProviderType;
  otpExpiresAt: number;
  authLoading: boolean;
  authError: string | null;

  // Onboarding & Auth Actions
  startSocialLogin: (provider: SocialProviderType) => Promise<void>;
  submitCapturedEmail: (email: string) => Promise<void>;
  verifyOtpCode: (code: string) => Promise<boolean>;
  resendOtp: () => Promise<void>;
  completeChildProfile: (childData: {
    name: string;
    ageGroup: string;
    avatarId: string;
    petType: PetType;
    petCustomName: string;
  }) => Promise<void>;
  login: (identifier: string, pass: string) => Promise<AuthResult>;
  register: (data: RegisterFormData) => Promise<AuthResult>;
  resetPassword: (identifier: string, newPass: string, verifyType: 'code' | 'answer', verifyVal: string) => Promise<AuthResult>;
  logout: () => Promise<void>;

  // Modal Controls
  showSocialModal: boolean;
  setShowSocialModal: (show: boolean) => void;
  authModalMode: AuthModalMode;
  setAuthModalMode: (mode: AuthModalMode) => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;

  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeLearnCategory: LearnCategory;
  setActiveLearnCategory: (cat: LearnCategory) => void;

  // Metrics
  points: number;
  coins: number;
  activitiesCount: number;
  addPoints: (p: number) => void;
  addCoins: (c: number) => void;
  incrementActivities: (category?: LearnCategory) => void;

  // Pet
  petStats: PetStats;
  feedPet: (foodId?: string) => boolean;
  playWithPet: (toyId?: string) => boolean;
  restPet: () => void;
  petActionEffect: string | null;
  petInteractionCount: number;
  interactPetDirectly: () => void;

  // Inventory & Shop
  inventory: string[];
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedOutfit: string | null;
  buyItem: (item: ShopItem) => boolean;
  equipItem: (item: ShopItem) => void;
  unequipItem: (slot: 'hat' | 'glasses' | 'outfit') => void;

  // Badges & Analytics
  badges: Badge[];
  activityStats: ActivityStats;

  // Settings & Reset
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  resetAllProgress: () => void;

  // Audio helpers
  playSound: (type: 'pop' | 'success' | 'coin' | 'victory' | 'card' | 'pet') => void;
  speak: (text: string, options?: SpeechOptions) => void;
  triggerConfetti: () => void;

  // Reset / Logout confirmation
  showLogoutModal: boolean;
  setShowLogoutModal: (show: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Firebase Auth & Firestore State
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [firestoreUserData, setFirestoreUserData] = useState<FirestoreUser | null>(null);
  const [activeChild, setActiveChild] = useState<FirestoreChild | null>(null);
  const [isAuthInitializing, setIsAuthInitializing] = useState<boolean>(true);

  // 2. Strict Onboarding Flow State
  const [onboardingStep, setOnboardingStepState] = useState<OnboardingStep>('landing');
  const [pendingTutorEmail, setPendingTutorEmail] = useState<string>('');
  const [pendingProvider, setPendingProvider] = useState<SocialProviderType>('google');
  const [otpExpiresAt, setOtpExpiresAt] = useState<number>(0);
  const [authLoading, setAuthLoading] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Social Modal & Auth Modal Trigger
  const [showSocialModal, setShowSocialModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('login');

  // User Profile for Application
  const [user, setUser] = useState<UserProfile | null>(() => {
    const acc = authStorage.getCurrentUser();
    if (acc) return accountToProfile(acc);
    return null;
  });

  // Navigation
  const [activeTab, setActiveTabState] = useState<ActiveTab>('home');
  const [activeLearnCategory, setActiveLearnCategory] = useState<LearnCategory>('vocales');

  // Metrics & State
  const initialUserData = authStorage.getUserData('kindora_active_user', 4);
  const [points, setPoints] = useState<number>(initialUserData.points);
  const [coins, setCoins] = useState<number>(initialUserData.coins);
  const [activitiesCount, setActivitiesCount] = useState<number>(initialUserData.activitiesCount);
  const [petStats, setPetStats] = useState<PetStats>(initialUserData.petStats);
  const [petActionEffect, setPetActionEffect] = useState<string | null>(null);
  const [petInteractionCount, setPetInteractionCount] = useState(0);

  const [inventory, setInventory] = useState<string[]>(initialUserData.inventory);
  const [equippedHat, setEquippedHat] = useState<string | null>(initialUserData.equippedHat);
  const [equippedGlasses, setEquippedGlasses] = useState<string | null>(initialUserData.equippedGlasses);
  const [equippedOutfit, setEquippedOutfit] = useState<string | null>(initialUserData.equippedOutfit);

  const [badges, setBadges] = useState<Badge[]>(initialUserData.badges);
  const [activityStats, setActivityStats] = useState<ActivityStats>(initialUserData.activityStats);
  const [settings, setSettings] = useState<AppSettings>(initialUserData.settings);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const level = Math.floor(points / 50) + 1;

  // Strict Protected Navigation Route Guard:
  // Intercept back button and lock steps to prevent skipping
  const setOnboardingStep = useCallback((step: OnboardingStep) => {
    setOnboardingStepState(step);
    if (typeof window !== 'undefined') {
      try {
        window.history.pushState({ kindoraStep: step }, '', window.location.pathname);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If user is in an active onboarding step, prevent skipping back to landing or game
      if (onboardingStep !== 'landing' && onboardingStep !== 'completed') {
        e.preventDefault();
        try {
          window.history.pushState({ kindoraStep: onboardingStep }, '', window.location.pathname);
        } catch {
          // ignore
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [onboardingStep]);

  // Audio configuration sync
  useEffect(() => {
    soundEffects.setSoundEnabled(settings.soundEnabled);
    soundEffects.setVolume(settings.soundVolume);
  }, [settings.soundEnabled, settings.soundVolume]);

  // Global Audio Cleanup Guard: Cancel any speech synthesis and reset DOM audio on navigation
  useEffect(() => {
    stopAllAudio();
  }, [activeTab, activeLearnCategory, onboardingStep]);

  // Listen to Firebase Auth state & fetch profile with loading resolution
  useEffect(() => {
    let unsubSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);

      // Clean up previous snapshot listener on user state change
      if (unsubSnapshot) {
        unsubSnapshot();
        unsubSnapshot = null;
      }

      if (fbUser) {
        // Fetch or listen to Firestore `users/{uid}`
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          // Set user document with isOtpVerified: true and isProfileComplete: true immediately
          await setDoc(
            userDocRef,
            {
              uid: fbUser.uid,
              email: fbUser.email || '',
              isOtpVerified: true,
              isProfileComplete: true,
              createdAt: new Date().toISOString(),
            },
            { merge: true }
          );

          unsubSnapshot = onSnapshot(
            userDocRef,
            async (docSnap) => {
              if (docSnap.exists()) {
                const uData = docSnap.data() as FirestoreUser;
                setFirestoreUserData(uData);

                // Fetch children from Firestore or provide default child
                const children = await firebaseAuthService.getChildren(fbUser.uid);
                if (children.length > 0) {
                  const child = children[0];
                  setActiveChild(child);
                  const newProfile: UserProfile = {
                    id: fbUser.uid,
                    uid: fbUser.uid,
                    childName: child.name,
                    childAge: parseInt(String(child.ageGroup)) || 4,
                    avatarId: child.avatarId || 'avatar_01',
                    petType: child.pet?.type || 'panda',
                    petName: child.pet?.customName || 'Bambú',
                    parentName: fbUser.displayName || 'Tutor Responsable',
                    parentEmail: uData.email || fbUser.email || '',
                    registeredAt: new Date().toISOString(),
                    authProvider: uData.authProvider || 'google',
                    isOtpVerified: true,
                    isProfileComplete: true,
                  };
                  setUser(newProfile);
                  setOnboardingStepState('completed');
                } else {
                  // Create default child to keep user fully functional without blocking redirects
                  const defaultChild: FirestoreChild = {
                    childId: `child_${Date.now()}`,
                    name: fbUser.displayName?.split(' ')[0] || 'Explorador',
                    ageGroup: 4,
                    avatarId: 'avatar_01',
                    pet: { type: 'panda', customName: 'Bambú' },
                    createdAt: new Date().toISOString(),
                  };
                  setActiveChild(defaultChild);
                  const newProfile: UserProfile = {
                    id: fbUser.uid,
                    uid: fbUser.uid,
                    childName: defaultChild.name,
                    childAge: 4,
                    avatarId: 'avatar_01',
                    petType: 'panda',
                    petName: 'Bambú',
                    parentName: fbUser.displayName || 'Tutor Responsable',
                    parentEmail: uData.email || fbUser.email || '',
                    registeredAt: new Date().toISOString(),
                    authProvider: uData.authProvider || 'google',
                    isOtpVerified: true,
                    isProfileComplete: true,
                  };
                  setUser(newProfile);
                  setOnboardingStepState('completed');
                }
              }
              setIsAuthInitializing(false);
            },
            (error) => {
              console.warn('[Firestore] User document snapshot listener noticed:', error.message);
              setIsAuthInitializing(false);
            }
          );
        } catch (err) {
          console.warn('[Firestore] Sync warning:', err);
          setIsAuthInitializing(false);
        }
      } else {
        // No Firebase user - check if local session exists
        const localAccount = authStorage.getCurrentUser();
        if (localAccount) {
          setUser(accountToProfile(localAccount));
          setOnboardingStepState('completed');
        } else {
          setUser(null);
          setOnboardingStepState('landing');
        }
        setIsAuthInitializing(false);
      }
    });

    return () => {
      if (unsubSnapshot) {
        unsubSnapshot();
      }
      unsubscribeAuth();
    };
  }, []);

  // STEP 1: Start Social Login with Google or Facebook
  const startSocialLogin = async (provider: SocialProviderType) => {
    setAuthLoading(true);
    setAuthError(null);
    setPendingProvider(provider);

    try {
      const res = await firebaseAuthService.signInWithSocial(provider);
      if (!res.success) {
        setAuthError(res.error || 'Error al conectar con el proveedor social.');
        setAuthLoading(false);
        return;
      }

      setShowSocialModal(false);

      if (res.needsEmailCapture || !res.email) {
        // Step 2a: Intermediate email capture screen
        setOnboardingStep('email_capture');
      } else {
        // Email is provided & verified by social provider (isOtpVerified initialized to true)
        setPendingTutorEmail(res.email);
        const existingDoc = await firebaseAuthService.getUserData(res.user?.uid || '');
        if (existingDoc && existingDoc.isProfileComplete) {
          // Profile exists: retrieve children and send directly to dashboard
          const children = await firebaseAuthService.getChildren(res.user?.uid || '');
          if (children.length > 0) {
            const child = children[0];
            setActiveChild(child);
            const newProfile: UserProfile = {
              id: res.user!.uid,
              uid: res.user!.uid,
              childName: child.name,
              childAge: parseInt(String(child.ageGroup)) || 4,
              avatarId: child.avatarId || 'avatar_01',
              petType: child.pet?.type || 'panda',
              petName: child.pet?.customName || 'Bambú',
              parentName: res.user!.displayName || 'Tutor Responsable',
              parentEmail: res.email,
              registeredAt: new Date().toISOString(),
              authProvider: provider,
              isOtpVerified: true,
              isProfileComplete: true,
            };
            setUser(newProfile);
            setOnboardingStep('completed');
            setActiveTabState('home');
            soundEffects.playSuccess();
            speak(`¡Bienvenido de vuelta, ${child.name}!`);
          } else {
            setOnboardingStep('child_profile');
          }
        } else {
          // Advance directly to child profile setup without blocking on OTP
          setOnboardingStep('child_profile');
          soundEffects.playPop();
          speak('¡Acceso verificado! Ahora personaliza el perfil de tu pequeño explorador.');
        }
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Error inesperado durante la autenticación social.');
    } finally {
      setAuthLoading(false);
    }
  };

  // STEP 2a: Submit Tutor Email (if missing from social provider)
  const submitCapturedEmail = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const uid = firebaseUser?.uid || 'user_' + Date.now();
      await firebaseAuthService.syncNewUserDocument({
        uid,
        email: email.trim(),
        authProvider: pendingProvider,
        isProfileComplete: false,
      });
      setPendingTutorEmail(email.trim());
      setOnboardingStep('child_profile');
      soundEffects.playPop();
      speak('¡Correo guardado! Ahora personaliza el perfil de tu pequeño explorador.');
    } catch (err: any) {
      setAuthError('Error de red al guardar el correo de contacto.');
    } finally {
      setAuthLoading(false);
    }
  };

  // STEP 2b: Verify 6-digit OTP (fallback)
  const verifyOtpCode = async (code: string): Promise<boolean> => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const uid = firebaseUser?.uid || 'user_' + Date.now();
      const res = await firebaseAuthService.verifyOtpAndSyncUser({
        uid,
        email: pendingTutorEmail,
        authProvider: pendingProvider,
        code,
      });

      if (!res.success) {
        setAuthError(res.error || 'Código incorrecto o expirado.');
        setAuthLoading(false);
        return false;
      }

      soundEffects.playSuccess();
      triggerConfetti();
      speak('¡Verificación completada! Ahora personaliza el perfil de tu pequeño.');

      setTimeout(() => {
        setOnboardingStep('child_profile');
      }, 500);

      return true;
    } catch (err: any) {
      setAuthError('Error al validar código de verificación.');
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  // Resend 6-digit OTP
  const resendOtp = async () => {
    setAuthError(null);
    const uid = firebaseUser?.uid || 'user_' + Date.now();
    const res = await firebaseAuthService.sendOtp(pendingTutorEmail, uid);
    if (res.success) {
      setOtpExpiresAt(res.expiresAt || Date.now() + 10 * 60 * 1000);
      soundEffects.playPop();
    } else {
      setAuthError(res.error || 'Error al reenviar el código.');
    }
  };

  // STEP 3: Save Child Profile in Cloud Firestore (`users/{uid}/children/{childId}`)
  const completeChildProfile = async (childData: {
    name: string;
    ageGroup: string;
    avatarId: string;
    petType: PetType;
    petCustomName: string;
  }) => {
    setAuthLoading(true);
    setAuthError(null);

    const uid = firebaseUser?.uid || 'kindora_user_' + Date.now();

    try {
      const res = await firebaseAuthService.saveChildProfile({
        uid,
        childName: childData.name,
        ageGroup: childData.ageGroup,
        avatarId: childData.avatarId,
        petType: childData.petType,
        petCustomName: childData.petCustomName,
      });

      if (!res.success) {
        setAuthError(res.error || 'Error al registrar el perfil en Cloud Firestore.');
        setAuthLoading(false);
        return;
      }

      // Build User Profile state
      const ageNum = parseInt(childData.ageGroup) || 4;
      const newProfile: UserProfile = {
        id: uid,
        uid,
        childName: childData.name,
        childAge: ageNum,
        avatarId: childData.avatarId,
        petType: childData.petType,
        petName: childData.petCustomName,
        parentName: firebaseUser?.displayName || 'Tutor Responsable',
        parentEmail: pendingTutorEmail || firebaseUser?.email || '',
        registeredAt: new Date().toISOString(),
        authProvider: pendingProvider,
        isOtpVerified: true,
        isProfileComplete: true,
      };

      // Also persist in local user account storage for backup
      authStorage.saveAccount({
        id: uid,
        username: childData.name.toLowerCase().replace(/\s+/g, '_'),
        parentEmail: pendingTutorEmail || firebaseUser?.email || '',
        passwordHash: 'firebase_oauth_verified',
        salt: 'firebase_salt',
        securityQuestion: 'Firebase Social Auth',
        securityAnswerHash: 'verified',
        recoveryCode: 'KINDORA-FIREBASE',
        childName: childData.name,
        childAge: ageNum,
        avatar: childData.avatarId,
        petType: childData.petType,
        petName: childData.petCustomName,
        parentName: firebaseUser?.displayName || 'Tutor Responsable',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      });

      setUser(newProfile);
      setOnboardingStep('completed');
      setActiveTabState('home');

      soundEffects.playVictoryFanfare();
      triggerConfetti();
      speak(`¡Bienvenido al mundo de Kindora, ${childData.name}!`);
    } catch (err: any) {
      setAuthError('Error inesperado al guardar el perfil: ' + (err?.message || ''));
    } finally {
      setAuthLoading(false);
    }
  };

  // Form Authentication: Login
  const login = async (identifier: string, pass: string): Promise<AuthResult> => {
    const res = await authStorage.login(identifier, pass);
    if (res.success && res.account) {
      const profile = accountToProfile(res.account);
      profile.isOtpVerified = true;
      profile.isProfileComplete = true;
      setUser(profile);
      setOnboardingStep('completed');
      setActiveTabState('home');
      soundEffects.playSuccess();
      speak(`¡Hola de nuevo, ${profile.childName}!`);
    }
    return res;
  };

  // Form Authentication: Register with initialized isOtpVerified: true and direct routing to Dashboard
  const register = async (data: RegisterFormData): Promise<AuthResult> => {
    const res = await authStorage.register(data);
    if (res.success && res.account) {
      const profile = accountToProfile(res.account);
      profile.isOtpVerified = true;
      profile.isProfileComplete = true;

      // Also sync user in Firestore with isOtpVerified: true
      await firebaseAuthService.syncNewUserDocument({
        uid: res.account.id,
        email: data.parentEmail,
        authProvider: 'form',
        isProfileComplete: true,
      });

      // Save child in Firestore
      await firebaseAuthService.saveChildProfile({
        uid: res.account.id,
        childName: data.childName,
        ageGroup: data.childAge,
        avatarId: data.avatarId || 'avatar_01',
        petType: data.petType,
        petCustomName: data.petName,
      }).catch(() => {});

      setUser(profile);
      setOnboardingStep('completed');
      setActiveTabState('home');
      soundEffects.playVictoryFanfare();
      triggerConfetti();
      speak(`¡Bienvenido a Kindora, ${profile.childName}!`);
    }
    return res;
  };

  // Form Authentication: Password Recovery
  const resetPassword = async (
    identifier: string,
    newPass: string,
    verifyType: 'code' | 'answer',
    verifyVal: string
  ): Promise<AuthResult> => {
    return authStorage.resetPassword(identifier, newPass, verifyType, verifyVal);
  };

  // Sign out
  const logout = async () => {
    soundEffects.playPop();
    await firebaseAuthService.signOut();
    authStorage.logout();
    setUser(null);
    setFirebaseUser(null);
    setFirestoreUserData(null);
    setActiveChild(null);
    setOnboardingStep('landing');
    setShowLogoutModal(false);
    setActiveTabState('home');
  };

  // Modal helpers
  const openLoginModal = () => {
    soundEffects.playPop();
    setAuthError(null);
    setShowSocialModal(true);
  };

  const openRegisterModal = () => {
    soundEffects.playPop();
    setAuthError(null);
    setShowSocialModal(true);
  };

  const closeAuthModal = () => {
    setShowSocialModal(false);
  };

  const setActiveTab = (tab: ActiveTab) => {
    stopAllAudio();
    // Route guard: if onboarding is not completed, do not allow tab navigation
    if (onboardingStep !== 'completed' && !user) {
      return;
    }
    soundEffects.playPop();
    setActiveTabState(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addPoints = (amount: number) => {
    setPoints((prev) => prev + amount);
  };

  const addCoins = (amount: number) => {
    soundEffects.playCoin();
    setCoins((prev) => prev + amount);
  };

  const incrementActivities = (category?: LearnCategory) => {
    setActivitiesCount((prev) => prev + 1);
    setActivityStats((prev) => ({
      ...prev,
      totalTimeMinutes: prev.totalTimeMinutes + 2,
    }));
  };

  // Virtual Pet Logic
  const feedPet = (foodId?: string): boolean => {
    soundEffects.playPop();
    setPetStats((prev) => ({
      ...prev,
      hunger: Math.min(100, prev.hunger + 30),
      happiness: Math.min(100, prev.happiness + 15),
      energy: Math.min(100, prev.energy + 5),
      lastUpdated: Date.now(),
    }));
    setPetActionEffect('🍎 ¡Yummy! Delicioso');
    setTimeout(() => setPetActionEffect(null), 2500);

    if (foodId) {
      setInventory((prev) => {
        const idx = prev.indexOf(foodId);
        if (idx > -1) {
          const nxt = [...prev];
          nxt.splice(idx, 1);
          return nxt;
        }
        return prev;
      });
    }

    addPoints(5);
    return true;
  };

  const playWithPet = (toyId?: string): boolean => {
    soundEffects.playPop();
    if (petStats.energy < 15) {
      setPetActionEffect('😴 Tu mascota tiene sueño, déjala descansar');
      setTimeout(() => setPetActionEffect(null), 2500);
      return false;
    }

    setPetStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 30),
      hunger: Math.max(0, prev.hunger - 10),
      energy: Math.max(0, prev.energy - 15),
      lastUpdated: Date.now(),
    }));

    setPetActionEffect('🎾 ¡Qué divertido jugar juntos!');
    setTimeout(() => setPetActionEffect(null), 2500);
    addPoints(10);
    addCoins(3);
    return true;
  };

  const restPet = () => {
    soundEffects.playPop();
    setPetStats((prev) => ({
      ...prev,
      energy: 100,
      hunger: Math.max(0, prev.hunger - 10),
      lastUpdated: Date.now(),
    }));
    setPetActionEffect('💤 Zzz... ¡Mascota llena de energía!');
    setTimeout(() => setPetActionEffect(null), 2500);
  };

  const interactPetDirectly = () => {
    setPetInteractionCount((prev) => prev + 1);
    soundEffects.playPetSound(user?.petType || 'panda');
    setPetStats((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 5),
      lastUpdated: Date.now(),
    }));
    setPetActionEffect('❤️ ¡Te quiero mucho!');
    setTimeout(() => setPetActionEffect(null), 1800);
  };

  // Shop & Inventory
  const buyItem = (item: ShopItem): boolean => {
    if (coins < item.price) {
      soundEffects.playPop();
      return false;
    }

    setCoins((prev) => prev - item.price);
    setInventory((prev) => [...prev, item.id]);
    soundEffects.playSuccess();
    triggerConfetti();
    return true;
  };

  const equipItem = (item: ShopItem) => {
    soundEffects.playPop();
    if (item.slot === 'hat') setEquippedHat(item.id);
    else if (item.slot === 'glasses') setEquippedGlasses(item.id);
    else if (item.slot === 'outfit') setEquippedOutfit(item.id);
  };

  const unequipItem = (slot: 'hat' | 'glasses' | 'outfit') => {
    soundEffects.playPop();
    if (slot === 'hat') setEquippedHat(null);
    else if (slot === 'glasses') setEquippedGlasses(null);
    else if (slot === 'outfit') setEquippedOutfit(null);
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const resetAllProgress = () => {
    const age = user?.childAge || 4;
    const userId = user?.id || user?.uid || 'kindora_active_user';
    const fresh = createInitialUserData(userId, age);

    setPoints(fresh.points);
    setCoins(fresh.coins);
    setActivitiesCount(fresh.activitiesCount);
    setPetStats(fresh.petStats);
    setInventory(fresh.inventory);
    setEquippedHat(fresh.equippedHat);
    setEquippedGlasses(fresh.equippedGlasses);
    setEquippedOutfit(fresh.equippedOutfit);
    setBadges(fresh.badges);
    setActivityStats(fresh.activityStats);

    authStorage.saveUserData(userId, fresh);
    soundEffects.playSuccess();
    triggerConfetti();
    speak('¡Progreso restablecido con éxito!');
  };

  const playSound = (type: 'pop' | 'success' | 'coin' | 'victory' | 'card' | 'pet') => {
    if (type === 'pop') soundEffects.playPop();
    else if (type === 'success') soundEffects.playSuccess();
    else if (type === 'coin') soundEffects.playCoin();
    else if (type === 'victory') soundEffects.playVictoryFanfare();
    else if (type === 'card') soundEffects.playCardFlip();
    else if (type === 'pet') soundEffects.playPetSound(user?.petType || 'panda');
  };

  const speak = (text: string, options?: SpeechOptions) => {
    speakSpanish(text, {
      speed: options?.speed ?? settings.voiceSpeed,
      pitch: options?.pitch ?? settings.voicePitch,
      volume: options?.volume ?? (settings.soundEnabled ? settings.soundVolume : 0),
      voiceURI: options?.voiceURI ?? settings.selectedVoiceURI,
      onEnd: options?.onEnd,
      onError: options?.onError,
    });
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006399', '#fe9d00', '#f96799', '#10b981', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        firebaseUser,
        firestoreUserData,
        activeChild,
        isAuthenticated: !!user,
        isAuthInitializing,
        level,
        onboardingStep,
        setOnboardingStep,
        pendingTutorEmail,
        pendingProvider,
        otpExpiresAt,
        authLoading,
        authError,
        startSocialLogin,
        submitCapturedEmail,
        verifyOtpCode,
        resendOtp,
        completeChildProfile,
        login,
        register,
        resetPassword,
        logout,
        showSocialModal,
        setShowSocialModal,
        authModalMode,
        setAuthModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        activeTab,
        setActiveTab,
        activeLearnCategory,
        setActiveLearnCategory,
        points,
        coins,
        activitiesCount,
        addPoints,
        addCoins,
        incrementActivities,
        petStats,
        feedPet,
        playWithPet,
        restPet,
        petActionEffect,
        petInteractionCount,
        interactPetDirectly,
        inventory,
        equippedHat,
        equippedGlasses,
        equippedOutfit,
        buyItem,
        equipItem,
        unequipItem,
        badges,
        activityStats,
        settings,
        updateSettings,
        resetAllProgress,
        playSound,
        speak,
        triggerConfetti,
        showLogoutModal,
        setShowLogoutModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
