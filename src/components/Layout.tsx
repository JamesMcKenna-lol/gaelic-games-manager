import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, ClipboardList, Calendar, Settings, Trophy, BookOpen } from 'lucide-react';
import clsx from 'clsx';

interface LayoutProps {
    children: React.ReactNode;
}

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label: string; active: boolean }> = ({ to, icon, label, active }) => (
    <Link
        to={to}
        className={clsx(
            "flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors",
            active ? "bg-emerald-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
        )}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const location = useLocation();
    const path = location.pathname;

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Sidebar - Desktop */}
            <aside className="hidden md:flex w-64 flex-col bg-slate-900 border-r border-slate-800">
                <div className="p-6">
                    <h1 className="text-xl font-bold text-emerald-500 tracking-tight">Gaelic Games Manager</h1>
                </div>

                <nav className="flex-1 px-4 space-y-2">
                    <NavItem to="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={path === '/dashboard'} />
                    <NavItem to="/squad" icon={<Users size={20} />} label="Squad" active={path === '/squad'} />
                    <NavItem to="/tactics" icon={<ClipboardList size={20} />} label="Tactics" active={path === '/tactics'} />
                    <NavItem to="/fixtures" icon={<Calendar size={20} />} label="Fixtures" active={path === '/fixtures'} />
                    <NavItem to="/competitions" icon={<Trophy size={20} />} label="Competitions" active={path === '/competitions'} />
                    <NavItem to="/career" icon={<BookOpen size={20} />} label="Career" active={path === '/career'} />
                    <NavItem to="/settings" icon={<Settings size={20} />} label="Settings" active={path === '/settings'} />
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <div className="text-xs text-slate-500">v0.1.0 Alpha</div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800">
                    <h1 className="text-lg font-bold text-emerald-500">GGM</h1>
                    {/* Mobile menu toggle could go here */}
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
                </nav>
            </main>
        </div>
    );
};
