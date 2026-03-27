import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { Sliders, CheckCircle } from 'lucide-react';

const FORMATIONS = ['1-6-6-3', '1-7-5-3', '1-5-7-3', '1-6-5-4'];

export const Tactics: React.FC = () => {
    const { save, saveTactics } = useGame();

    const [formation, setFormation] = useState(save?.tactics?.formation ?? '1-6-6-3');
    const [attackingStyle, setAttackingStyle] = useState(save?.tactics?.attackingStyle ?? 50);
    const [passingStyle, setPassingStyle] = useState(save?.tactics?.passingStyle ?? 50);
    const [pressing, setPressing] = useState(save?.tactics?.pressing ?? 50);
    const [saved, setSaved] = useState(false);

    if (!save) return null;

    const team = save.teams.find(t => t.id === save.teamId);

    const handleSave = () => {
        saveTactics({ formation, attackingStyle, passingStyle, pressing });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Tactics</h1>
                    <p className="text-slate-400">{team?.name} • Team Setup</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formation */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <div className="flex items-center space-x-2 mb-4">
                            <Sliders size={20} className="text-emerald-500" />
                            <h2 className="text-xl font-bold text-white">Formation</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {FORMATIONS.map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFormation(f)}
                                    className={`p-4 rounded-lg border-2 transition-all ${
                                        formation === f
                                            ? 'border-emerald-500 bg-emerald-500/10 text-white'
                                            : 'border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700'
                                    }`}
                                >
                                    <div className="text-center font-mono font-bold">{f}</div>
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 bg-gradient-to-b from-emerald-900/20 to-emerald-950/20 rounded-lg p-6 border border-emerald-900/30">
                            <div className="text-center text-sm text-slate-500 mb-2">Selected Formation</div>
                            <div className="text-center text-2xl font-mono font-bold text-emerald-500">{formation}</div>
                            <div className="text-center text-xs text-slate-600 mt-2">GK — DEF — MID — FWD</div>
                        </div>
                    </div>

                    {/* Style Sliders */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
                        <h2 className="text-xl font-bold text-white">Team Style</h2>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Defensive</span>
                                <span className="font-medium text-white">Attacking Style</span>
                                <span className="text-slate-400">Attacking</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={attackingStyle}
                                onChange={(e) => setAttackingStyle(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="text-center mt-2">
                                <span className="px-3 py-1 bg-slate-950/50 rounded-lg text-sm font-mono text-emerald-500">
                                    {attackingStyle > 60 ? 'Attacking' : attackingStyle < 40 ? 'Defensive' : 'Balanced'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Short Pass</span>
                                <span className="font-medium text-white">Passing Style</span>
                                <span className="text-slate-400">Direct</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={passingStyle}
                                onChange={(e) => setPassingStyle(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <div className="text-center mt-2">
                                <span className="px-3 py-1 bg-slate-950/50 rounded-lg text-sm font-mono text-blue-500">
                                    {passingStyle > 60 ? 'Direct' : passingStyle < 40 ? 'Short Passing' : 'Mixed'}
                                </span>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Low</span>
                                <span className="font-medium text-white">Pressing</span>
                                <span className="text-slate-400">High</span>
                            </div>
                            <input
                                type="range" min="0" max="100"
                                value={pressing}
                                onChange={(e) => setPressing(Number(e.target.value))}
                                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="text-center mt-2">
                                <span className="px-3 py-1 bg-slate-950/50 rounded-lg text-sm font-mono text-purple-500">
                                    {pressing > 66 ? 'High Press' : pressing < 33 ? 'Low Block' : 'Normal'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-bold transition-all ${
                            saved
                                ? 'bg-emerald-700 text-emerald-200 cursor-default'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                    >
                        {saved && <CheckCircle size={18} />}
                        <span>{saved ? 'Tactics Saved!' : 'Save Tactics'}</span>
                    </button>
                </div>
            </div>
        </Layout>
    );
};
