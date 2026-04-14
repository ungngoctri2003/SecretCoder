import { useEffect, useMemo, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './auth-context';

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const loadProfile = useCallback(async (userId) => {
    if (!userId) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    const PROFILE_MS = 15000;
    try {
      const row = supabase.from('profiles').select('id, full_name, role').eq('id', userId).single();
      const { data, error } = await Promise.race([
        row,
        new Promise((resolve) =>
          setTimeout(() => resolve({ data: null, error: { message: 'Profile load timeout' } }), PROFILE_MS),
        ),
      ]);
      if (error) {
        console.warn('Profile load:', error.message || error);
        setProfile(null);
      } else {
        setProfile(data);
      }
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      setLoading(true);
      const GET_SESSION_MS = 12000;
      try {
        let s = null;
        try {
          const { data } = await Promise.race([
            supabase.auth.getSession(),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error('getSession timeout')), GET_SESSION_MS),
            ),
          ]);
          s = data?.session ?? null;
        } catch (e) {
          console.warn('Auth init:', e);
        }
        if (cancelled) return;
        setSession(s);
        await loadProfile(s?.user?.id);
      } catch (e) {
        console.warn('Auth init:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, s) => {
      setSession(s);
      if (s?.user?.id) {
        await loadProfile(s.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      profileLoading,
      user: session?.user ?? null,
      async signIn(email, password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Apply session immediately so navigate() after login sees a session (onAuthStateChange can lag one tick).
        setSession(data.session ?? null);
        await loadProfile(data.user?.id ?? null);
        return data;
      },
      async signUp(email, password, fullName) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName || '' } },
        });
        if (error) throw error;
        if (data.session) {
          setSession(data.session);
          await loadProfile(data.user?.id ?? null);
        }
        return data;
      },
      async signOut() {
        await supabase.auth.signOut();
        setSession(null);
        setProfile(null);
      },
    }),
    [session, profile, loading, profileLoading, loadProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
