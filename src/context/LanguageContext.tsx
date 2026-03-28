import React, { createContext, useContext, useState } from 'react';

export type Lang = 'hybrid' | 'english' | 'gaeilge';

interface LanguageContextType {
    lang: Lang;
    setLang: (lang: Lang) => void;
    /** Returns the primary display string for the current language mode */
    t: (irish: string, english: string) => string;
    /** Returns the subtitle string only in hybrid mode (null otherwise) */
    sub: (english: string) => string | null;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'ggm_lang';

const LANG_CYCLE: Lang[] = ['hybrid', 'english', 'gaeilge'];

export const LANG_LABEL: Record<Lang, string> = {
    hybrid:  'EN/GA',
    english: 'English',
    gaeilge: 'Gaeilge',
};

export const LANG_ICON: Record<Lang, string> = {
    hybrid:  '🌐',
    english: '🇬🇧',
    gaeilge: '🇮🇪',
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [lang, setLangState] = useState<Lang>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored as Lang) ?? 'hybrid';
    });

    const setLang = (l: Lang) => {
        setLangState(l);
        localStorage.setItem(STORAGE_KEY, l);
    };

    const t = (irish: string, english: string): string => {
        return lang === 'english' ? english : irish;
    };

    const sub = (english: string): string | null => {
        return lang === 'hybrid' ? english : null;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, sub }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const ctx = useContext(LanguageContext);
    if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
    return ctx;
};

export const cycleLanguage = (current: Lang): Lang => {
    const idx = LANG_CYCLE.indexOf(current);
    return LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
};
