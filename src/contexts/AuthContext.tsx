import { createContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User, AuthChangeEvent, Session } from '@supabase/supabase-js';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true, signOut: async () => { } });

export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
            setUser(null);
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    useEffect(() => {
        // Check active session
        supabase.auth.getSession()
            .then(({ data: { session } }) => {
                setUser(session?.user ?? null);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Security: Inactivity Timeout (5 minutes)
    useEffect(() => {
        if (!user) return;

        let idleTimer: any;
        const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 minutes

        const resetTimer = () => {
            if (idleTimer) clearTimeout(idleTimer);
            idleTimer = setTimeout(() => {
                console.log('[Security] Inactivity detected. Logging out...');
                signOut();
            }, IDLE_TIMEOUT);
        };

        // Events to monitor for activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        resetTimer(); // Initialize timer

        return () => {
            if (idleTimer) clearTimeout(idleTimer);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};
