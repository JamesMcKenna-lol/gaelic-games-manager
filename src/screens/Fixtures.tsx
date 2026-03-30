import React, { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/Layout';
import { Calendar, MapPin } from 'lucide-react';
import { formatScore } from '../utils/engine';
import { MatchModal } from './MatchModal';
import type { Match, CompetitionPhase } from '../types';
import clsx from 'clsx';

const PHASE_EN: Record<CompetitionPhase, string> = {
    'group':             'Group Stage',
    'provincial-sf':     'Provincial Semi-Final',
    'provincial-final':  'Provincial Final',
    'all-ireland-sf':    'All Ireland Semi-Final',
    'all-ireland-final': 'All Ireland Final',
};

export const Fixtures: React.FC = () => {
    const { save, updateMatch } = useGame();
    const { t, sub } = useLanguage();
    const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

    const { sections, nextFixture, nextFixtureComp, activeMatch, homeTeam, awayTeam, homePlayers, awayPlayers } = useMemo(() => {
        if (!save || save.competitions.length === 0) {
            return { sections: [], nextFixture: null, nextFixtureComp: null, activeMatch: null, homeTeam: null, awayTeam: null, homePlayers: [], awayPlayers: [] };
        }

        const teamId = save.teamId;

        // Build sections from all competitions this season, newest last
        const sections = save.competitions.map(comp => {
            const phase: CompetitionPhase = comp.phase ?? 'group';
            const myFixtures = comp.fixtures.filter(
                f => f.homeTeamId === teamId || f.awayTeamId === teamId
            );
            const upcoming = myFixtures.filter(f => !f.played)
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            const results = myFixtures.filter(f => f.played)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return { comp, phase, upcoming, results };
        });

        // Find the absolute next unplayed fixture across all competitions
        const allUpcoming = save.competitions.flatMap(comp =>
            comp.fixtures
                .filter(f => !f.played && (f.homeTeamId === teamId || f.awayTeamId === teamId))
                .map(f => ({ fixture: f, comp }))
        ).sort((a, b) => new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime());

        const nextFixture = allUpcoming[0]?.fixture ?? null;
        const nextFixtureComp = allUpcoming[0]?.comp ?? null;

        const activeMatch = activeMatchId
            ? save.competitions.flatMap(c => c.fixtures).find(f => f.id === activeMatchId) ?? null
            : null;

        const homeTeam = activeMatch ? save.teams.find(t => t.id === activeMatch.homeTeamId) ?? null : null;
        const awayTeam = activeMatch ? save.teams.find(t => t.id === activeMatch.awayTeamId) ?? null : null;
        const homePlayers = activeMatch ? save.players.filter(p => p.teamId === activeMatch.homeTeamId) : [];
        const awayPlayers = activeMatch ? save.players.filter(p => p.teamId === activeMatch.awayTeamId) : [];

        return { sections, nextFixture, nextFixtureComp, activeMatch, homeTeam, awayTeam, homePlayers, awayPlayers };
    }, [save, activeMatchId]);

    if (!save) return null;

    const team = save.teams.find(t => t.id === save.teamId);
    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' });

    const handleMatchComplete = (completedMatch: Match) => {
        updateMatch(completedMatch);
    };

    // Current active competition = last one
    const currentComp = save.competitions[save.competitions.length - 1];

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('Cláracha & Torthaí', 'Fixtures & Results')}</h1>
                    {sub('fixtures & results') && <p className="text-slate-400 text-sm">{sub('fixtures & results')}</p>}
                    <p className="text-slate-500 text-sm mt-1">{team?.name} • {save.season} {t('Séasúr', 'Season')}</p>
                </div>

                {/* Pinned next match */}
                {nextFixture && nextFixtureComp && (() => {
                    const isHome = nextFixture.homeTeamId === save.teamId;
                    const opponent = save.teams.find(t => t.id === (isHome ? nextFixture.awayTeamId : nextFixture.homeTeamId));
                    return (
                        <div className="bg-emerald-950 border border-emerald-700 rounded-2xl p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                    {t('An Chéad Cluiche Eile', 'Next Match')}
                                </span>
                                <span className="text-xs text-emerald-600 font-medium">{nextFixtureComp.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-2 flex-1">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${team?.colors[0]} 50%, ${team?.colors[1]} 50%)` }} />
                                            <span className="font-bold text-white text-lg">{team?.name}</span>
                                        </div>
                                        <span className="text-slate-500">vs</span>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                                                style={{ background: `linear-gradient(135deg, ${opponent?.colors[0]} 50%, ${opponent?.colors[1]} 50%)` }} />
                                            <span className="font-semibold text-slate-200 text-lg">{opponent?.name}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm text-slate-400">
                                        <span className="flex items-center space-x-1">
                                            <Calendar size={14} className="text-emerald-500" />
                                            <span>{formatDate(nextFixture.date)}</span>
                                        </span>
                                        <span className="flex items-center space-x-1">
                                            <MapPin size={14} className="text-slate-500" />
                                            <span>{nextFixture.venue}</span>
                                        </span>
                                        <span className="text-slate-500">{isHome ? t('Baile', 'Home') : t('As Baile', 'Away')}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setActiveMatchId(nextFixture.id)}
                                    className="ml-4 px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-colors text-sm"
                                >
                                    {t('Imir! ▶', 'Play! ▶')}
                                </button>
                            </div>
                        </div>
                    );
                })()}

                {sections.map(({ comp, phase, upcoming, results }) => {
                    const isCurrentComp = comp.id === currentComp.id;
                    const phaseLabel = comp.name;
                    const phaseEn = PHASE_EN[phase];

                    return (
                        <div key={comp.id} className="space-y-4">
                            {/* Section header */}
                            <div className="flex items-center space-x-3">
                                <div className={clsx(
                                    'h-px flex-1',
                                    isCurrentComp ? 'bg-emerald-800' : 'bg-slate-800'
                                )} />
                                <div className={clsx(
                                    'text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full',
                                    isCurrentComp ? 'text-emerald-400 bg-emerald-900/30 border border-emerald-800' : 'text-slate-500 bg-slate-900'
                                )}>
                                    {t(phaseLabel, phaseEn)}
                                    {sub(phaseEn) && phaseLabel !== phaseEn && (
                                        <span className="text-slate-600 font-normal ml-1 normal-case tracking-normal">· {phaseEn}</span>
                                    )}
                                </div>
                                <div className={clsx(
                                    'h-px flex-1',
                                    isCurrentComp ? 'bg-emerald-800' : 'bg-slate-800'
                                )} />
                            </div>

                            {/* Upcoming */}
                            {upcoming.length > 0 && (
                                <div className="space-y-3">
                                    {upcoming.map((fixture, i) => {
                                        const isHome = fixture.homeTeamId === save.teamId;
                                        const opponent = save.teams.find(t => t.id === (isHome ? fixture.awayTeamId : fixture.homeTeamId));
                                        const isNext = i === 0 && isCurrentComp;

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
                                                                <span className="text-xs text-slate-500">{isHome ? t('Baile', 'Home') : t('As Baile', 'Away')}</span>
                                                            </div>
                                                            {isNext && (
                                                                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                                                    {t('An Chéad Cluiche', 'Next Match')}
                                                                    {sub('next') && <span className="text-emerald-700 font-normal ml-1">· {sub('next')}</span>}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                                                                    style={{ background: `linear-gradient(135deg, ${team?.colors[0]} 50%, ${team?.colors[1]} 50%)` }} />
                                                                <span className="font-bold text-white">{team?.name}</span>
                                                            </div>
                                                            <span className="text-slate-600 text-sm">vs</span>
                                                            <div className="flex items-center space-x-2">
                                                                <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0"
                                                                    style={{ background: `linear-gradient(135deg, ${opponent?.colors[0]} 50%, ${opponent?.colors[1]} 50%)` }} />
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
                                                            'ml-4 px-4 py-2 rounded-lg font-medium transition-colors text-sm flex flex-col items-center',
                                                            isNext
                                                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                                                : 'bg-slate-700 hover:bg-slate-600 text-white'
                                                        )}
                                                    >
                                                        <span>{t('Imir! ▶', 'Play! ▶')}</span>
                                                        {sub('play') && <span className="text-xs font-normal opacity-50">{sub('play')}</span>}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Results */}
                            {results.length > 0 && (
                                <div className="space-y-2">
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
                                                        <span className="text-xs text-slate-500">{isHome ? t('Baile', 'Home') : t('As Baile', 'Away')}</span>
                                                    </div>
                                                    <span className={clsx(
                                                        'px-2 py-0.5 text-xs font-bold rounded',
                                                        outcome === 'W' ? 'bg-emerald-500/10 text-emerald-400' :
                                                        outcome === 'D' ? 'bg-yellow-500/10 text-yellow-400' :
                                                        'bg-red-500/10 text-red-400'
                                                    )}>
                                                        {outcome === 'W' ? t('Bua', 'Win') : outcome === 'D' ? t('Cluiche Cothrom', 'Draw') : t('Caillte', 'Loss')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 rounded-full border border-white/20"
                                                            style={{ background: `linear-gradient(135deg, ${team?.colors[0]} 50%, ${team?.colors[1]} 50%)` }} />
                                                        <span className="font-semibold text-white">{team?.name}</span>
                                                    </div>
                                                    <span className={clsx('font-mono font-bold',
                                                        outcome === 'W' ? 'text-emerald-400' : outcome === 'L' ? 'text-red-400' : 'text-yellow-400'
                                                    )}>{formatScore(myScore)}</span>
                                                    <span className="text-slate-600">—</span>
                                                    <span className="font-mono text-slate-400">{formatScore(oppScore)}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-4 h-4 rounded-full border border-white/20"
                                                            style={{ background: `linear-gradient(135deg, ${opponent?.colors[0]} 50%, ${opponent?.colors[1]} 50%)` }} />
                                                        <span className="text-slate-300">{opponent?.name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {upcoming.length === 0 && results.length === 0 && (
                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
                                    No fixtures yet for this round.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

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
