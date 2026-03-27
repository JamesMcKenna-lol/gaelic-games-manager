import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Trophy, PlayCircle } from 'lucide-react';
import { resumeAudio } from '../utils/sounds';

const SEANFHOCAIL = [
    'Ní neart go cur le chéile. — Strength comes from unity.',
    'Tús maith, leath na hoibre. — A good start is half the work.',
    'Is fearr Gaeilge bhriste ná Béarla cliste. — Broken Irish is better than clever English.',
    'Mol an óige agus tiocfaidh sí. — Praise the young and they will flourish.',
    'Níl aon tinteán mar do thinteán féin. — There\'s no hearth like your own hearth.',
];

const randomSeanfhocal = SEANFHOCAIL[Math.floor(Math.random() * SEANFHOCAIL.length)];

export const MainMenu: React.FC = () => {
    const navigate = useNavigate();
    const { hasSave, loadGame } = useGame();

    const handleContinue = () => {
        resumeAudio();
        loadGame();
        navigate('/dashboard');
    };

    const handleNewCareer = () => {
        resumeAudio();
        navigate('/new-career');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950" />

            {/* Decorative GAA pitch lines */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] border-2 border-white rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white rounded-full" />
                <div className="absolute top-1/2 left-0 right-0 h-px bg-white" />
            </div>

            <div className="relative z-10 max-w-md w-full space-y-8 text-center">
                <div className="space-y-3">
                    <div className="flex justify-center mb-4">
                        <div className="p-5 bg-emerald-500/10 rounded-full ring-2 ring-emerald-500/40 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                            <Trophy size={52} className="text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-emerald-500/70 text-sm font-medium tracking-widest uppercase">
                        Fáilte go
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight leading-tight">
                        Gaelic Games<br />
                        <span className="text-emerald-400">Manager</span>
                    </h1>
                    <p className="text-slate-400 text-sm">Bainistigh do chontae go glóir!</p>
                    <p className="text-slate-600 text-xs italic px-4">{randomSeanfhocal}</p>
                </div>

                <div className="space-y-3">
                    {hasSave && (
                        <button
                            onClick={handleContinue}
                            className="w-full py-4 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] flex items-center justify-center space-x-2"
                        >
                            <PlayCircle size={20} />
                            <div className="flex flex-col items-start">
                                <span>Lean ar Aghaidh</span>
                                <span className="text-emerald-200/50 text-xs font-normal">continue</span>
                            </div>
                        </button>
                    )}

                    <button
                        onClick={handleNewCareer}
                        className="w-full py-4 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all transform hover:scale-[1.02] ring-1 ring-slate-700 hover:ring-emerald-700 flex flex-col items-center"
                    >
                        <span>🏐 Tosaigh Gairm Nua</span>
                        <span className="text-slate-500 text-xs font-normal">start new career</span>
                    </button>
                </div>

                {/* Irish phrase of the day */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 text-left space-y-1">
                    <div className="text-xs text-emerald-500/70 font-semibold uppercase tracking-wide">Focal na Láe</div>
                    <div className="text-sm text-slate-300 font-medium">CÚL = Goal &nbsp;·&nbsp; Pointe = Point &nbsp;·&nbsp; Leathan = Wide</div>
                    <div className="text-xs text-slate-500">Leath-am = Half-time &nbsp;·&nbsp; Craobh = Championship</div>
                </div>

                <div className="text-xs text-slate-700 pt-2">
                    v0.1.5 · Built with React & TypeScript · As Gaeilge
                </div>
            </div>
        </div>
    );
};
