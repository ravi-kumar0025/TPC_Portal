import { useSyncExternalStore } from 'react';

const THEME_KEY = 'tpc-theme';
const DEFAULT_THEME = 'light';
const listeners = new Set();

const getPreferredTheme = () => {
    if (typeof window === 'undefined') return DEFAULT_THEME;
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark', theme === 'dark');
};

let currentTheme = getPreferredTheme();
if (typeof window !== 'undefined') {
    applyTheme(currentTheme);
    localStorage.setItem(THEME_KEY, currentTheme);
}

const emit = () => {
    listeners.forEach((listener) => listener());
};

const setGlobalTheme = (nextTheme) => {
    if (nextTheme !== 'light' && nextTheme !== 'dark') return;
    if (currentTheme === nextTheme) return;
    currentTheme = nextTheme;
    applyTheme(currentTheme);
    if (typeof window !== 'undefined') {
        localStorage.setItem(THEME_KEY, currentTheme);
    }
    emit();
};

const subscribe = (listener) => {
    listeners.add(listener);

    const handleStorage = (event) => {
        if (event.key === THEME_KEY && (event.newValue === 'light' || event.newValue === 'dark')) {
            setGlobalTheme(event.newValue);
        }
    };

    if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorage);
    }

    return () => {
        listeners.delete(listener);
        if (typeof window !== 'undefined') {
            window.removeEventListener('storage', handleStorage);
        }
    };
};

const getSnapshot = () => currentTheme;

export default function useTheme() {
    const theme = useSyncExternalStore(subscribe, getSnapshot, () => DEFAULT_THEME);

    return {
        theme,
        isDark: theme === 'dark',
        setTheme: setGlobalTheme,
        toggleTheme: () => setGlobalTheme(theme === 'dark' ? 'light' : 'dark'),
    };
}
