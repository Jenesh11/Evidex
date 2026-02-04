
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Custom storage adapter for Electron
const electronStorage = {
    getItem: async (key) => {
        try {
            return await window.electronAPI.store.get(key);
        } catch (error) {
            console.error('Error getting item from store:', error);
            return null;
        }
    },
    setItem: async (key, value) => {
        try {
            await window.electronAPI.store.set(key, value);
        } catch (error) {
            console.error('Error setting item in store:', error);
        }
    },
    removeItem: async (key) => {
        try {
            await window.electronAPI.store.delete(key);
        } catch (error) {
            console.error('Error removing item from store:', error);
        }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: electronStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false, // We handle this manually via deep linking
    },
});
