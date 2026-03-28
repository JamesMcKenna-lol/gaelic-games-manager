import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/Layout';
import type { Player } from '../types';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const Squad: React.FC = () => {
    const { save } = useGame();
    const { t } = useLanguage();
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    if (!save) return null;

    const teamPlayers = save.players.filter(p => p.teamId === save.teamId);
    const sortedPlayers = [...teamPlayers].sort((a, b) => b.overall - a.overall);

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('Foireann', 'Squad')}</h1>
                    <p className="text-slate-400">{teamPlayers.length} {t('imreoirí', 'players')}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Player List */}
                    <div className="space-y-3">
                        {sortedPlayers.map(player => (
                            <div
                                key={player.id}
                                onClick={() => setSelectedPlayer(player)}
                                className={clsx(
                                    "p-4 rounded-xl border transition-all cursor-pointer",
                                    selectedPlayer?.id === player.id
                                        ? "bg-emerald-900/20 border-emerald-500"
                                        : "bg-slate-900 border-slate-800 hover:border-slate-700"
                                )}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <span className="text-lg font-bold text-white">{player.name}</span>
                                            <span className="px-2 py-0.5 bg-slate-800 text-slate-300 text-xs font-mono rounded">
                                                {player.position}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                                            <span>Age: {player.age}</span>
                                            <span>Overall: <span className="text-emerald-500 font-bold">{player.overall}</span></span>
                                            <span>Fitness: {player.fitness}%</span>
                                        </div>
                                    </div>
                                    <ChevronRight className="text-slate-600" size={20} />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Player Detail */}
                    <div className="lg:sticky lg:top-4">
                        {selectedPlayer ? (
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 space-y-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{selectedPlayer.name}</h2>
                                    <div className="flex items-center space-x-3 mt-2">
                                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg font-mono text-sm">
                                            {selectedPlayer.position}
                                        </span>
                                        <span className="text-slate-400">Age: {selectedPlayer.age}</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-slate-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 mb-1">Overall</div>
                                        <div className="text-2xl font-bold text-emerald-500">{selectedPlayer.overall}</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 mb-1">Morale</div>
                                        <div className="text-2xl font-bold text-blue-500">{selectedPlayer.morale}</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 mb-1">Fitness</div>
                                        <div className="text-2xl font-bold text-purple-500">{selectedPlayer.fitness}%</div>
                                    </div>
                                    <div className="bg-slate-950/50 p-3 rounded-lg">
                                        <div className="text-xs text-slate-500 mb-1">Age</div>
                                        <div className="text-2xl font-bold text-orange-500">{selectedPlayer.age}</div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-3">Attributes</h3>
                                    <div className="space-y-2">
                                        {Object.entries(selectedPlayer.attributes).map(([key, value]) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-sm text-slate-300 capitalize">{key}</span>
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400"
                                                            style={{ width: `${value}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-sm font-mono font-bold text-white w-6">{value}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-900 rounded-xl border border-slate-800 p-12 text-center">
                                <p className="text-slate-500">Select a player to view details</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
