import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import type { Code, Team } from '../types';
import { generateTeams } from '../utils/data';
import { ChevronRight, ArrowLeft } from 'lucide-react';

const CODES: Code[] = ['Football', 'Hurling', 'Ladies Football', 'Camogie'];

const CODE_DESC: Record<Code, string> = {
    'Football':        '🏐 Bainistigh foireann contae sa Craobh Peile Uile-Éireann.',
    'Hurling':         '🏑 Glac ceannas sa chluiche is sciliúla ar domhan — iomáint!',
    'Ladies Football': '🏐 Tabhair do chontae go glóir sa pheil mhná.',
    'Camogie':         '🏑 Treoraigh do chontae go rath sa chamógaíocht.',
};

const CODE_LABEL: Record<Code, string> = {
    'Football': 'Peil Ghaelach',
    'Hurling': 'Iomáint',
    'Ladies Football': 'Peil na mBan',
    'Camogie': 'Camógaíocht',
};

export const NewCareer: React.FC = () => {
    const navigate = useNavigate();
    const { startNewCareer } = useGame();

    const [step, setStep] = useState(1);
    const [selectedCode, setSelectedCode] = useState<Code | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [managerName, setManagerName] = useState('');
    const [teams, setTeams] = useState<Team[]>([]);

    const handleCodeSelect = (code: Code) => {
        setSelectedCode(code);
        setTeams(generateTeams(code));
        setStep(2);
    };

    const handleTeamSelect = (team: Team) => {
        setSelectedTeam(team);
        setStep(3);
    };

    const handleStartGame = () => {
        if (selectedCode && selectedTeam && managerName.trim()) {
            // Pass county name so GameContext can find the right team after regeneration
            startNewCareer(managerName.trim(), selectedCode, selectedTeam.county);
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 flex items-center space-x-4">
                    {step > 1 && (
                        <button onClick={() => setStep(s => s - 1)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-2xl font-bold text-white">Gairm Nua</h1>
                        <p className="text-slate-400">Céim {step} as 3</p>
                    </div>
                </header>

                {/* Step 1: Pick a code */}
                {step === 1 && (
                    <>
                        <p className="text-slate-400 mb-4">Cén cluiche a bhainistíonn tú? <span className="text-slate-600">(Which sport will you manage?)</span></p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CODES.map(code => (
                            <button
                                key={code}
                                onClick={() => handleCodeSelect(code)}
                                className="p-6 bg-slate-900 border border-slate-800 rounded-xl hover:border-emerald-500 hover:bg-slate-800 transition-all text-left group"
                            >
                                <h3 className="text-xl font-bold group-hover:text-emerald-400">{CODE_LABEL[code]}</h3>
                                <p className="text-xs text-emerald-600/70 font-medium mb-1">{code}</p>
                                <p className="text-slate-400 mt-1 text-sm">{CODE_DESC[code]}</p>
                            </button>
                        ))}
                    </div>
                    </>
                )}

                {/* Step 2: Pick a county */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold text-white">Roghnaigh do Chontae</h2>
                        <p className="text-slate-400 text-sm">Léirítear rátálacha — is láidre an foireann le rátáil níos airde. <span className="text-slate-600">(Higher rating = stronger squad.)</span></p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[...teams].sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                                <button
                                    key={team.id}
                                    onClick={() => handleTeamSelect(team)}
                                    className="p-4 bg-slate-900 border border-slate-800 rounded-lg hover:border-emerald-500 hover:bg-slate-800 transition-all text-center group"
                                >
                                    {/* County colour swatch */}
                                    <div
                                        className="w-8 h-8 rounded-full mx-auto mb-2 border-2 border-white/10 flex-shrink-0"
                                        style={{
                                            background: `linear-gradient(135deg, ${team.colors[0]} 50%, ${team.colors[1]} 50%)`
                                        }}
                                    />
                                    <div className="font-bold group-hover:text-emerald-400 text-sm">{team.name}</div>
                                    <div className="text-xs text-slate-500 mt-1">
                                        Rating: <span className={team.rating >= 80 ? 'text-emerald-400' : team.rating >= 70 ? 'text-yellow-400' : 'text-slate-400'}>{team.rating}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Manager name */}
                {step === 3 && selectedTeam && (
                    <div className="max-w-md mx-auto space-y-6">
                        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                            <h2 className="text-xl font-semibold mb-4 text-white">Manager Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">D'Ainm — Your Name</label>
                                    <input
                                        type="text"
                                        value={managerName}
                                        onChange={(e) => setManagerName(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleStartGame()}
                                        placeholder="Scríobh d'ainm anseo…"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 focus:outline-none focus:border-emerald-500 text-white"
                                        autoFocus
                                    />
                                </div>

                                <div className="pt-4 border-t border-slate-800 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Contae</span>
                                        <div className="flex items-center space-x-2">
                                            <div
                                                className="w-4 h-4 rounded-full border border-white/20"
                                                style={{ background: `linear-gradient(135deg, ${selectedTeam.colors[0]} 50%, ${selectedTeam.colors[1]} 50%)` }}
                                            />
                                            <span className="font-bold text-white">{selectedTeam.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Cluiche</span>
                                        <span className="font-bold text-white">{selectedCode}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-400">Rátáil Foirne</span>
                                        <span className={`font-bold ${selectedTeam.rating >= 80 ? 'text-emerald-400' : selectedTeam.rating >= 70 ? 'text-yellow-400' : 'text-slate-300'}`}>
                                            {selectedTeam.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleStartGame}
                            disabled={!managerName.trim()}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] flex flex-col items-center justify-center"
                        >
                            <div className="flex items-center space-x-2">
                                <span>🏆 Tosaigh an Ghairm!</span>
                                <ChevronRight size={20} />
                            </div>
                            <span className="text-emerald-200/50 text-xs font-normal">start the career</span>
                        </button>
                        {!managerName.trim() && (
                            <p className="text-center text-xs text-slate-600">Scríobh d'ainm ar dtús… (Enter your name first)</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
