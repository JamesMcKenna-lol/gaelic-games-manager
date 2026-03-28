import React from 'react';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import type { CompetitionPhase } from '../types';
import clsx from 'clsx';

const PHASE_EN: Record<CompetitionPhase | 'eliminated', string> = {
    'eliminated':        'Eliminated in Group Stage',
    'group':             'Qualified from Group Stage',
    'provincial-sf':     'Provincial Semi-Final',
    'provincial-final':  'Provincial Final',
    'all-ireland-sf':    'All Ireland Semi-Final',
    'all-ireland-final': 'All Ireland Final',
};

const PHASE_ORDER = ['eliminated', 'group', 'provincial-sf', 'provincial-final', 'all-ireland-sf', 'all-ireland-final'];

const achievementColor = (phase: string, won: boolean) => {
    if (won) return 'text-yellow-400';
    if (phase === 'all-ireland-final') return 'text-emerald-400';
    if (phase === 'all-ireland-sf') return 'text-emerald-500';
    if (phase === 'provincial-final') return 'text-blue-400';
    if (phase === 'provincial-sf') return 'text-blue-500';
    if (phase === 'group') return 'text-slate-300';
    return 'text-slate-500';
};

const achievementBadge = (phase: string, allIrelandWinner: boolean, provincialWinner: boolean) => {
    if (allIrelandWinner) return { label: '🏆 All Ireland Winner', bg: 'bg-yellow-500/20 border-yellow-600 text-yellow-300' };
    if (provincialWinner) return { label: '🥇 Provincial Champion', bg: 'bg-emerald-500/20 border-emerald-700 text-emerald-300' };
    if (phase === 'all-ireland-sf') return { label: '🏅 All Ireland SF', bg: 'bg-emerald-500/10 border-emerald-800 text-emerald-400' };
    if (phase === 'provincial-final') return { label: '🏅 Provincial Final', bg: 'bg-blue-500/10 border-blue-800 text-blue-400' };
    if (phase === 'provincial-sf') return { label: 'Provincial SF', bg: 'bg-blue-500/10 border-blue-900 text-blue-500' };
    if (phase === 'group') return { label: 'Qualified', bg: 'bg-slate-700/50 border-slate-600 text-slate-300' };
    return { label: 'Eliminated', bg: 'bg-red-500/10 border-red-900 text-red-500' };
};

export const Career: React.FC = () => {
    const { save } = useGame();

    if (!save) return null;

    const history = [...(save.careerHistory ?? [])].reverse(); // most recent first
    const team = save.teams.find(t => t.id === save.teamId);

    const totalSeasons = save.careerHistory?.length ?? 0;
    const allIrelandWins = save.careerHistory?.filter(r => r.allIrelandWinner).length ?? 0;
    const provincialWins = save.careerHistory?.filter(r => r.provincialWinner).length ?? 0;
    const totalW = save.careerHistory?.reduce((s, r) => s + r.groupW, 0) ?? 0;
    const totalD = save.careerHistory?.reduce((s, r) => s + r.groupD, 0) ?? 0;
    const totalL = save.careerHistory?.reduce((s, r) => s + r.groupL, 0) ?? 0;
    const bestPhase = save.careerHistory?.reduce((best, r) => {
        const rIdx = PHASE_ORDER.indexOf(r.furthestPhase);
        const bIdx = PHASE_ORDER.indexOf(best);
        return rIdx > bIdx ? r.furthestPhase : best;
    }, 'eliminated' as string) ?? 'eliminated';

    return (
        <Layout>
            <div className="space-y-8 max-w-3xl">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-white">Gairm</h1>
                    <p className="text-slate-400 text-sm">career history</p>
                    {team && (
                        <p className="text-emerald-500 font-medium mt-1">
                            {save.managerName} · {team.name} · {save.code}
                        </p>
                    )}
                </div>

                {/* Career Stats Summary */}
                {totalSeasons > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                            <div className="text-2xl font-black text-white">{totalSeasons}</div>
                            <div className="text-xs text-slate-500 mt-1">Séasúir <span className="block">seasons</span></div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                            <div className={clsx('text-2xl font-black', allIrelandWins > 0 ? 'text-yellow-400' : 'text-white')}>{allIrelandWins}</div>
                            <div className="text-xs text-slate-500 mt-1">Craobh na hÉireann <span className="block">All Irelands</span></div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                            <div className={clsx('text-2xl font-black', provincialWins > 0 ? 'text-emerald-400' : 'text-white')}>{provincialWins}</div>
                            <div className="text-xs text-slate-500 mt-1">Craobh Cúige <span className="block">Provincial titles</span></div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-center">
                            <div className="text-lg font-black text-white font-mono">{totalW}W {totalD}D {totalL}L</div>
                            <div className="text-xs text-slate-500 mt-1">Group record <span className="block">all seasons</span></div>
                        </div>
                    </div>
                )}

                {/* Best achievement */}
                {totalSeasons > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center space-x-4">
                        <div className="text-3xl">{allIrelandWins > 0 ? '🏆' : provincialWins > 0 ? '🥇' : '📊'}</div>
                        <div>
                            <div className="text-xs text-slate-500 uppercase tracking-wide">Best achievement</div>
                            <div className={clsx('font-bold text-lg', achievementColor(bestPhase, allIrelandWins > 0))}>
                                {PHASE_EN[bestPhase as CompetitionPhase | 'eliminated']}
                            </div>
                        </div>
                    </div>
                )}

                {/* Season by season */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white">
                        Taifead Séasúir <span className="text-slate-500 text-sm font-normal">· season by season</span>
                    </h2>

                    {history.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-slate-500">
                            <div className="text-4xl mb-3">📋</div>
                            <div className="font-medium">No completed seasons yet.</div>
                            <div className="text-sm mt-1">Finish a season to see your career history here.</div>
                        </div>
                    ) : (
                        history.map((record, i) => {
                            const badge = achievementBadge(record.furthestPhase, record.allIrelandWinner, record.provincialWinner);
                            const phaseIdx = PHASE_ORDER.indexOf(record.furthestPhase);
                            return (
                                <div
                                    key={`${record.season}-${i}`}
                                    className={clsx(
                                        'bg-slate-900 border rounded-xl p-5',
                                        record.allIrelandWinner ? 'border-yellow-600/50' :
                                        record.provincialWinner ? 'border-emerald-700/50' :
                                        'border-slate-800'
                                    )}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl font-black text-white">{record.season}</span>
                                                <span className={clsx(
                                                    'text-xs font-bold px-2 py-0.5 rounded-full border',
                                                    badge.bg
                                                )}>{badge.label}</span>
                                            </div>
                                            <div className="text-sm text-slate-400 mt-0.5">
                                                {record.county} · {record.code}
                                            </div>
                                        </div>
                                        {record.allIrelandWinner && (
                                            <div className="text-3xl">🏆</div>
                                        )}
                                    </div>

                                    {/* Phase progress bar */}
                                    <div className="flex items-center gap-1 mb-3">
                                        {['group', 'provincial-sf', 'provincial-final', 'all-ireland-sf', 'all-ireland-final'].map((phase, pi) => (
                                            <React.Fragment key={phase}>
                                                <div className={clsx(
                                                    'h-1.5 flex-1 rounded-full',
                                                    pi < phaseIdx ? 'bg-emerald-500' :
                                                    pi === phaseIdx && record.furthestPhase !== 'eliminated' ? (record.allIrelandWinner || record.provincialWinner || pi < 2 ? 'bg-emerald-500' : 'bg-emerald-500') :
                                                    'bg-slate-700'
                                                )} />
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="bg-slate-950/50 rounded-lg p-2">
                                            <div className="text-sm font-bold text-slate-300 font-mono">
                                                {record.groupW}W {record.groupD}D {record.groupL}L
                                            </div>
                                            <div className="text-xs text-slate-600 mt-0.5">group record</div>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-lg p-2">
                                            <div className={clsx(
                                                'text-sm font-bold',
                                                record.groupPos === 1 ? 'text-yellow-400' :
                                                record.groupPos === 2 ? 'text-emerald-400' :
                                                'text-slate-400'
                                            )}>
                                                {record.groupPos > 0 ? `${record.groupPos}${record.groupPos === 1 ? 'st' : record.groupPos === 2 ? 'nd' : record.groupPos === 3 ? 'rd' : 'th'}` : '—'}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-0.5">group position</div>
                                        </div>
                                        <div className="bg-slate-950/50 rounded-lg p-2">
                                            <div className={clsx('text-sm font-bold', achievementColor(record.furthestPhase, record.allIrelandWinner))}>
                                                {record.furthestPhase === 'eliminated' ? 'Out' :
                                                 record.furthestPhase === 'group' ? 'Qualified' :
                                                 record.furthestPhase === 'provincial-sf' ? 'Prov SF' :
                                                 record.furthestPhase === 'provincial-final' ? 'Prov Final' :
                                                 record.furthestPhase === 'all-ireland-sf' ? 'AI SF' :
                                                 record.allIrelandWinner ? 'Champion!' : 'AI Final'}
                                            </div>
                                            <div className="text-xs text-slate-600 mt-0.5">furthest reached</div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Current season preview */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 text-slate-500 text-sm">
                    Current season ({save.season}) will appear here when completed.
                </div>
            </div>
        </Layout>
    );
};
