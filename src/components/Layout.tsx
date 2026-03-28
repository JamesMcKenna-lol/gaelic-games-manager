import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Calendar, Settings, Trophy, BookOpen, Dumbbell, Beer } from 'lucide-react';
import clsx from 'clsx';
import { useLanguage, cycleLanguage, LANG_LABEL, LANG_ICON } from '../context/LanguageContext';

interface LayoutProps {
    children: React.ReactNode;
}

// Nav items have Irish + English labels
const NAV_ITEMS = [
    { to: '/dashboard',    icon: <LayoutDashboard size={20} />, irish: 'Dearbhán',         english: 'Dashboard'    },
    { to: '/squad',        icon: <Users size={20} />,           irish: 'Foireann',          english: 'Squad'        },
    { to: '/tactics',      icon: <ClipboardList size={20} />,   irish: 'Beartaíocht',       english: 'Tactics'      },
    { to: '/fixtures',     icon: <Calendar size={20} />,        irish: 'Cláracha',          english: 'Fixtures'     },
    { to: '/competitions', icon: <Trophy size={20} />,          irish: 'Comórtais',         english: 'Competitions' },
    { to: '/career',       icon: <BookOpen size={20} />,        irish: 'Gairm',             english: 'Career'       },
    { to: '/training',     icon: <Dumbbell size={20} />,        irish: 'Traenáil',          english: 'Training'     },
    { to: '/clubhouse',    icon: <Beer size={20} />,            irish: 'An Clubhouse',      english: 'Clubhouse'    },
    { to: '/settings',     icon: <Settings size={20} />,        irish: 'Socruithe',         english: 'Settings'     },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;
    const { lang, setLang, t } = useLanguage();

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-emerald-500 tracking-tight">
                        {t('Bainisteoir na Gael', 'Gaelic Games Manager')}
                    </h1>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => {
                        const active = path === item.to;
                        const label = t(item.irish, item.english);
                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={clsx(
                                    'flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors',
                                    active ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                )}
                            >
                                {item.icon}
                                <span className="font-medium">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom: version + language toggle */}
                <div className="p-4 border-t border-slate-800 space-y-2">
                    {/* Language toggle */}
                    <button
                        onClick={() => setLang(cycleLanguage(lang))}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors group"
                        title="Cycle language · athraigh teanga · change language"
                    >
                        <div className="flex items-center space-x-2">
                            <span className="text-lg">{LANG_ICON[lang]}</span>
                            <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">
                                {LANG_LABEL[lang]}
                            </span>
                        </div>
                        <div className="flex gap-0.5">
                            {(['hybrid', 'english', 'gaeilge'] as const).map(l => (
                                <div key={l} className={clsx(
                                    'w-1.5 h-1.5 rounded-full transition-colors',
                                    l === lang ? 'bg-emerald-400' : 'bg-slate-600'
                                )} />
                            ))}
                        </div>
                    </button>
                    <div className="text-xs text-slate-600">v0.1.7 Alpha</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                    <h1 className="text-lg font-bold text-emerald-500">GGM</h1>
                    {/* Language toggle for mobile - top right */}
                    <button
                        onClick={() => setLang(cycleLanguage(lang))}
                        className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                        <span>{LANG_ICON[lang]}</span>
                        <span className="text-xs font-medium text-slate-300">{LANG_LABEL[lang]}</span>
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </div>

                {/* Mobile Bottom Nav */}
                <nav className="md:hidden flex justify-around bg-slate-900 border-t border-slate-800 p-2 pb-safe">
                    <Link to="/dashboard" className={clsx("p-2 rounded-lg", path === '/dashboard' ? "text-emerald-500" : "text-slate-400")}>
                        <LayoutDashboard size={24} />
                    </Link>
                    <Link to="/squad" className={clsx("p-2 rounded-lg", path === '/squad' ? "text-emerald-500" : "text-slate-400")}>
                        <Users size={24} />
                    </Link>
                    <Link to="/tactics" className={clsx("p-2 rounded-lg", path === '/tactics' ? "text-emerald-500" : "text-slate-400")}>
                        <ClipboardList size={24} />
                    </Link>
                    <Link to="/fixtures" className={clsx("p-2 rounded-lg", path === '/fixtures' ? "text-emerald-500" : "text-slate-400")}>
                        <Calendar size={24} />
                    </Link>
                    <Link to="/training" className={clsx("p-2 rounded-lg", path === '/training' ? "text-emerald-500" : "text-slate-400")}>
                        <Dumbbell size={24} />
                    </Link>
                    <Link to="/clubhouse" className={clsx("p-2 rounded-lg", path === '/clubhouse' ? "text-emerald-500" : "text-slate-400")}>
                        <Beer size={24} />
                    </Link>
                </nav>
            </main>
        </div>
    );
};
