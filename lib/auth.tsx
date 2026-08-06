import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
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
    (async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      (async () => {
        setSession(sess);
        if (sess) {
          setIsGuest(false);
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem(GUEST_KEY);
          } catch {
            // ignore
          }
        }
      })();
    });

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const g = await AsyncStorage.getItem(GUEST_KEY);
        if (g === '1' && !session) setIsGuest(true);
      } catch {
        // ignore
      }
    })();
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
          const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
          await AsyncStorage.removeItem(GUEST_KEY);
        } catch {
          // ignore
        }
      },
      enterGuest: () => {
        setIsGuest(true);
        (async () => {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.setItem(GUEST_KEY, '1');
          } catch {
            // ignore
          }
        })();
      },
      exitGuest: () => {
        setIsGuest(false);
        (async () => {
          try {
            const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
            await AsyncStorage.removeItem(GUEST_KEY);
          } catch {
            // ignore
          }
        })();
      },
    }),
    [session, loading, isGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
