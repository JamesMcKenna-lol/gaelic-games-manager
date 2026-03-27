import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { Calendar, MapPin } from 'lucide-react';
import { formatScore } from '../utils/engine';
import { MatchModal } from './MatchModal';
import type { Match } from '../types';
import clsx from 'clsx';

export const Fixtures: React.FC = () => {
    const { save, updateMatch } = useGame();
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

    const { upcoming, results, activeMatch, homeTeam, awayTeam, homePlayers, awayPlayers } = useMemo(() => {
        if (!save || save.competitions.length === 0) {
            return { upcoming: [], results: [], activeMatch: null, homeTeam: null, awayTeam: null, homePlayers: [], awayPlayers: [] };
        }

        const competition = save.competitions[0];
        const teamId = save.teamId;

        const myFixtures = competition.fixtures.filter(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        );

        const upcoming = myFixtures
            .filter(f => !f.played)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const results = myFixtures
            .filter(f => f.played)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        // Data for active match modal
        const activeMatch = activeMatchId
            ? competition.fixtures.find(f => f.id === activeMatchId) ?? null
            : null;

        const homeTeam = activeMatch ? save.teams.find(t => t.id === activeMatch.homeTeamId) ?? null : null;
        const awayTeam = activeMatch ? save.teams.find(t => t.id === activeMatch.awayTeamId) ?? null : null;
        const homePlayers = activeMatch ? save.players.filter(p => p.teamId === activeMatch.homeTeamId) : [];
        const awayPlayers = activeMatch ? save.players.filter(p => p.teamId === activeMatch.awayTeamId) : [];

        return { upcoming, results, activeMatch, homeTeam, awayTeam, homePlayers, awayPlayers };
    }, [save, activeMatchId]);

    if (!save) return null;

    const team = save.teams.find(t => t.id === save.teamId);

    const handleMatchComplete = (completedMatch: Match) => {
        updateMatch(completedMatch);
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });

    return (
        <Layout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold text-white">Cláracha & Torthaí</h1>
                    <p className="text-slate-400">{team?.name} • {save.season} Season</p>
                </div>

                {/* Upcoming Fixtures */}
                <div>
                    <h2 className="text-xl font-bold text-white mb-4">Cluichí le hImirt</h2>
                    {upcoming.length === 0 ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500">
                            Cluichí an ghrúpa críochnaithe! 🏆
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {upcoming.map((fixture, i) => {
                                const isHome = fixture.homeTeamId === save.teamId;
                                const opponent = save.teams.find(t => t.id === (isHome ? fixture.awayTeamId : fixture.homeTeamId));
                                const isNext = i === 0;

                                return (
                                    <div
                                        key={fixture.id}
                                        className={clsx(
                                            'bg-slate-900 border rounded-xl p-4 transition-all',
                                            isNext ? 'border-emerald-800' : 'border-slate-800'
                                        )}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <Calendar size={16} className="text-emerald-500 flex-shrink-0" />
                                                    <span className="text-slate-400 text-sm">{formatDate(fixture.date)}</span>
                                                    <div className="flex items-center space-x-1">
                                                        <MapPin size={13} className="text-slate-500" />
                                                        <span className="text-xs text-slate-500">{isHome ? 'Home' : 'Away'}</span>
                                                    </div>
                                                    {isNext && (
                                                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                            An Chéad Cluiche
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                                                            style={{ background: `linear-gradient(135deg, ${team?.colors[0]} 50%, ${team?.colors[1]} 50%)` }}
                                                        />
                                                        <span className="font-bold text-white">{team?.name}</span>
                                                    </div>
                                                    <span className="text-slate-600 text-sm">vs</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                                                            style={{ background: `linear-gradient(135deg, ${opponent?.colors[0]} 50%, ${opponent?.colors[1]} 50%)` }}
                                                        />
                                                        <span className="font-medium text-slate-200">{opponent?.name}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-1 text-xs text-slate-500 mt-1">
                                                    <MapPin size={12} />
                                                    <span>{fixture.venue}</span>
                                                    <span className="text-slate-700">·</span>
                                                    <span>Cap: {fixture.venueCapacity.toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setActiveMatchId(fixture.id)}
                                                className={clsx(
                                                    'ml-4 px-4 py-2 rounded-lg font-medium transition-colors text-sm',
                                                    isNext
                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                                                )}
                                            >
                                                Imir! ▶
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Results */}
                {results.length > 0 && (
                    <div>
                        <h2 className="text-xl font-bold text-white mb-4">Torthaí</h2>
                        <div className="space-y-3">
                            {results.map(fixture => {
                                const isHome = fixture.homeTeamId === save.teamId;
                                const opponent = save.teams.find(t => t.id === (isHome ? fixture.awayTeamId : fixture.homeTeamId));
                                const myScore = isHome ? fixture.result!.homeScore : fixture.result!.awayScore;
                                const oppScore = isHome ? fixture.result!.awayScore : fixture.result!.homeScore;
                                const myT = myScore.goals * 3 + myScore.points;
                                const oppT = oppScore.goals * 3 + oppScore.points;
                                const outcome = myT > oppT ? 'W' : myT === oppT ? 'D' : 'L';

                                return (
                                    <div key={fixture.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <span className="text-slate-500 text-sm">{formatDate(fixture.date)}</span>
                                            <span className="text-xs text-slate-600">{fixture.venue}</span>
                                            <div className="flex items-center space-x-1">
                                                <MapPin size={13} className="text-slate-500" />
                                                <span className="text-xs text-slate-500">{isHome ? 'Home' : 'Away'}</span>
                                            </div>
                                            <span className={clsx(
                                                'px-2 py-0.5 text-xs font-bold rounded',
                                                outcome === 'W' ? 'bg-emerald-500/10 text-emerald-400' :
                                                outcome === 'D' ? 'bg-yellow-500/10 text-yellow-400' :
                                                'bg-red-500/10 text-red-400'
                                            )}>
                                                {outcome === 'W' ? 'Win' : outcome === 'D' ? 'Draw' : 'Loss'}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/20"
                                                    style={{ background: `linear-gradient(135deg, ${team?.colors[0]} 50%, ${team?.colors[1]} 50%)` }}
                                                />
                                                <span className="font-semibold text-white">{team?.name}</span>
                                            </div>
                                            <span className={clsx(
                                                'font-mono font-bold',
                                                outcome === 'W' ? 'text-emerald-400' : outcome === 'L' ? 'text-red-400' : 'text-yellow-400'
                                            )}>{formatScore(myScore)}</span>
                                            <span className="text-slate-600">—</span>
                                            <span className="font-mono text-slate-400">{formatScore(oppScore)}</span>
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-4 h-4 rounded-full border border-white/20"
                                                    style={{ background: `linear-gradient(135deg, ${opponent?.colors[0]} 50%, ${opponent?.colors[1]} 50%)` }}
                                                />
                                                <span className="text-slate-300">{opponent?.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Match Modal */}
            {activeMatch && homeTeam && awayTeam && (
                <MatchModal
                    match={activeMatch}
                    homeTeam={homeTeam}
                    awayTeam={awayTeam}
                    homePlayers={homePlayers}
                    awayPlayers={awayPlayers}
                    playerTeamId={save.teamId}
                    onComplete={handleMatchComplete}
                    onClose={() => setActiveMatchId(null)}
                />
            )}
        </Layout>
    );
};
