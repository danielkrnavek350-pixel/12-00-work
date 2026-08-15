import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

interface AuthState {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  enterGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);
const GUEST_KEY = '@guest_mode';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) setSession(data.session);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      if (sess) {
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    async function checkGuest() {
      try {
        const g = await AsyncStorage.getItem(GUEST_KEY);
        if (g === '1' && !session) setIsGuest(true);
      } catch (e) {
        // ignore
      }
    }
    checkGuest();
  }, [session]);

  const value = useMemo<AuthState>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isGuest,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error: error?.message || null };
      },
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({ email, password });
        return { error: error?.message || null };
      },
      signOut: async () => {
        await supabase.auth.signOut();
        setSession(null);
        setIsGuest(false);
        try {
          await AsyncStorage.removeItem(GUEST_KEY);
        } catch (e) {}
      },
      enterGuest: () => {
        setIsGuest(true);
        AsyncStorage.setItem(GUEST_KEY, '1').catch(() => {});
      },
      exitGuest: () => {
        setIsGuest(false);
        AsyncStorage.removeItem(GUEST_KEY).catch(() => {});
      },
    }),
    [session, loading, isGuest]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
