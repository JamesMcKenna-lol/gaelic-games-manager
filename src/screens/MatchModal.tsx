import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Match, Team, Player } from '../types';
import { simulateMatch, formatScore } from '../utils/engine';
import { playGoalSound, playPointSound, playWhistleSound, playWinSound, playLossSound, resumeAudio } from '../utils/sounds';
import { CulOverlay } from '../components/CulOverlay';
import clsx from 'clsx';
import { X, MapPin } from 'lucide-react';

interface MatchModalProps {
    match: Match;
    homeTeam: Team;
    awayTeam: Team;
    homePlayers: Player[];
    awayPlayers: Player[];
    playerTeamId: string;
    onComplete: (completedMatch: Match) => void;
    onClose: () => void;
}

const EVENT_DELAY_MS = 650;

export const MatchModal: React.FC<MatchModalProps> = ({
    match,
    homeTeam,
    awayTeam,
    homePlayers,
    awayPlayers,
    playerTeamId,
    onComplete,
    onClose,
}) => {
    const [simulatedMatch] = useState<Match>(() =>
        simulateMatch(match, homeTeam, awayTeam, homePlayers, awayPlayers)
    );

    const [visibleEvents, setVisibleEvents] = useState<typeof simulatedMatch.events>([]);
    const [isDone, setIsDone] = useState(false);
    const completedRef = useRef(false);
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
    const feedRef = useRef<HTMLDivElement>(null);
    const prevLengthRef = useRef(0);

    // CÚL overlay state
    const [culKey, setCulKey] = useState(0);
    const [showCul, setShowCul] = useState(false);
    const [culIsPlayer, setCulIsPlayer] = useState(false);
    const [culTeamId, setCulTeamId] = useState<string | undefined>();

    // Score bump animation keys
    const [homeBumpKey, setHomeBumpKey] = useState(0);
    const [awayBumpKey, setAwayBumpKey] = useState(0);

    const revealAll = useCallback(() => {
        timeoutsRef.current.forEach(t => clearTimeout(t));
        timeoutsRef.current = [];
        setVisibleEvents(simulatedMatch.events);
        setIsDone(true);
    }, [simulatedMatch.events]);

    // Resume audio on first user interaction
    useEffect(() => {
        resumeAudio();
    }, []);

    useEffect(() => {
        simulatedMatch.events.forEach((_, i) => {
            const t = setTimeout(() => {
                setVisibleEvents(simulatedMatch.events.slice(0, i + 1));
                if (i === simulatedMatch.events.length - 1) {
                    setIsDone(true);
                }
            }, i * EVENT_DELAY_MS);
            timeoutsRef.current.push(t);
        });

        return () => {
            timeoutsRef.current.forEach(t => clearTimeout(t));
        };
    }, [simulatedMatch.events]);

    // Fire onComplete exactly once when done, and play outcome sound
    useEffect(() => {
        if (isDone && !completedRef.current) {
            completedRef.current = true;
            onComplete(simulatedMatch);
        }
    }, [isDone, onComplete, simulatedMatch]);

    // Detect new events and play sounds
    useEffect(() => {
        const newEvents = visibleEvents.slice(prevLengthRef.current);
        prevLengthRef.current = visibleEvents.length;

        for (const event of newEvents) {
            if (event.type === 'goal') {
                playGoalSound();
                const isPlayer = event.teamId === playerTeamId;
                setCulIsPlayer(isPlayer);
                setCulTeamId(event.teamId);
                setCulKey(k => k + 1);
                setShowCul(true);
                if (event.teamId === match.homeTeamId) {
                    setHomeBumpKey(k => k + 1);
                } else {
                    setAwayBumpKey(k => k + 1);
                }
            } else if (event.type === 'point') {
                playPointSound();
                if (event.teamId === match.homeTeamId) {
                    setHomeBumpKey(k => k + 1);
                } else {
                    setAwayBumpKey(k => k + 1);
                }
            } else if (event.type === 'whistle') {
                playWhistleSound();
            }
        }
    }, [visibleEvents, playerTeamId, match.homeTeamId]);

    // Play win/loss sound when result is final
    useEffect(() => {
        if (!isDone || !simulatedMatch.result) return;
        const hT = simulatedMatch.result.homeScore.goals * 3 + simulatedMatch.result.homeScore.points;
        const aT = simulatedMatch.result.awayScore.goals * 3 + simulatedMatch.result.awayScore.points;
        const isPlayerHome = match.homeTeamId === playerTeamId;
        const playerWon = (isPlayerHome && hT > aT) || (!isPlayerHome && aT > hT);
        const draw = hT === aT;
        const delay = setTimeout(() => {
            if (playerWon) playWinSound();
            else if (!draw) playLossSound();
        }, 400);
        return () => clearTimeout(delay);
    }, [isDone, simulatedMatch.result, match.homeTeamId, playerTeamId]);

    // Auto-scroll commentary feed
    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [visibleEvents]);

    // Live score from visible events only
    const liveScore = useMemo(() => {
        const s = { hG: 0, hP: 0, aG: 0, aP: 0 };
        visibleEvents.forEach(e => {
            if (e.type === 'goal') {
                if (e.teamId === match.homeTeamId) s.hG++;
                else if (e.teamId === match.awayTeamId) s.aG++;
            } else if (e.type === 'point') {
                if (e.teamId === match.homeTeamId) s.hP++;
                else if (e.teamId === match.awayTeamId) s.aP++;
            }
        });
        return s;
    }, [visibleEvents, match]);

    const currentMinute = visibleEvents[visibleEvents.length - 1]?.minute ?? 0;
    const isPlayerHome = match.homeTeamId === playerTeamId;

    const outcome = useMemo(() => {
        if (!isDone || !simulatedMatch.result) return null;
        const hT = simulatedMatch.result.homeScore.goals * 3 + simulatedMatch.result.homeScore.points;
        const aT = simulatedMatch.result.awayScore.goals * 3 + simulatedMatch.result.awayScore.points;
        if (hT === aT) return 'draw';
        const playerWon = (isPlayerHome && hT > aT) || (!isPlayerHome && aT > hT);
        return playerWon ? 'win' : 'loss';
    }, [isDone, simulatedMatch, isPlayerHome]);

    const homeScoreStr = `${liveScore.hG}-${String(liveScore.hP).padStart(2, '0')} (${liveScore.hG * 3 + liveScore.hP})`;
    const awayScoreStr = `${liveScore.aG}-${String(liveScore.aP).padStart(2, '0')} (${liveScore.aG * 3 + liveScore.aP})`;

    // Resolve team colors for the goal that just scored
    const culTeam = culTeamId === match.homeTeamId ? homeTeam : awayTeam;

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
            {/* CÚL Overlay */}
            <CulOverlay
                key={culKey}
                show={showCul}
                isPlayerTeam={culIsPlayer}
                teamColors={culTeam?.colors}
                onDone={() => setShowCul(false)}
            />

            {/* Match Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 flex-shrink-0">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-slate-500 uppercase tracking-wide font-medium">Craobh</span>
                        <div className="flex items-center space-x-3">
                            <span className={clsx(
                                'text-sm font-mono font-bold px-2 py-0.5 rounded',
                                isDone ? 'bg-slate-700 text-slate-300' : 'bg-emerald-900/50 text-emerald-400'
                            )}>
                                {isDone ? 'Críoch' : `${currentMinute}'`}
                            </span>
                            <button onClick={onClose} className="p-1 text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    <div className="text-center text-xs text-slate-500 mt-2 mb-3 flex items-center justify-center space-x-1">
                        <MapPin size={12} />
                        <span>{match.venue}</span>
                        <span>·</span>
                        <span>{match.venueCapacity.toLocaleString()} cap.</span>
                    </div>

                    <div className="flex items-center">
                        {/* Home team */}
                        <div className="flex-1 text-center">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                                <div
                                    className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${homeTeam.colors[0]} 50%, ${homeTeam.colors[1]} 50%)` }}
                                />
                                <span className="font-bold text-white text-sm md:text-base">{homeTeam.name}</span>
                            </div>
                            {isPlayerHome && <div className="text-xs text-emerald-500 font-medium mb-1">TÚ FÉIN</div>}
                            <div
                                key={homeBumpKey}
                                className={clsx(
                                    'text-2xl md:text-3xl font-mono font-bold text-white',
                                    homeBumpKey > 0 && 'animate-score-bump'
                                )}
                            >
                                {homeScoreStr}
                            </div>
                        </div>

                        <div className="text-slate-600 font-bold text-xl mx-3">—</div>

                        {/* Away team */}
                        <div className="flex-1 text-center">
                            <div className="flex items-center justify-center space-x-2 mb-1">
                                <div
                                    className="w-5 h-5 rounded-full border border-white/20 flex-shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${awayTeam.colors[0]} 50%, ${awayTeam.colors[1]} 50%)` }}
                                />
                                <span className="font-bold text-white text-sm md:text-base">{awayTeam.name}</span>
                            </div>
                            {!isPlayerHome && <div className="text-xs text-emerald-500 font-medium mb-1">TÚ FÉIN</div>}
                            <div
                                key={awayBumpKey}
                                className={clsx(
                                    'text-2xl md:text-3xl font-mono font-bold text-white',
                                    awayBumpKey > 0 && 'animate-score-bump'
                                )}
                            >
                                {awayScoreStr}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Commentary Feed */}
            <div ref={feedRef} className="flex-1 overflow-y-auto p-4">
                <div className="max-w-2xl mx-auto space-y-2 pb-4">
                    {visibleEvents.map((event, i) => (
                        <div
                            key={i}
                            className={clsx(
                                'flex items-start space-x-3 p-3 rounded-lg animate-fade-in-up',
                                event.type === 'goal'
                                    ? 'bg-emerald-900/40 border border-emerald-700/60'
                                    : event.type === 'whistle'
                                    ? 'bg-amber-900/20 border border-amber-800/40'
                                    : event.type === 'wide'
                                    ? 'bg-slate-900/30'
                                    : 'bg-slate-900/50'
                            )}
                        >
                            <span className="text-xs font-mono text-slate-500 w-8 flex-shrink-0 pt-0.5">
                                {event.minute}'
                            </span>
                            <span className={clsx(
                                'text-sm leading-relaxed',
                                event.type === 'goal' ? 'text-emerald-300 font-bold' :
                                event.type === 'point' ? 'text-white' :
                                event.type === 'whistle' ? 'text-amber-300 font-semibold' :
                                'text-slate-400'
                            )}>
                                {event.type === 'goal' && <span className="mr-1">⚽</span>}
                                {event.type === 'point' && <span className="mr-1">🏳️</span>}
                                {event.type === 'whistle' && <span className="mr-1">📢</span>}
                                {event.text}
                            </span>
                        </div>
                    ))}

                    {!isDone && visibleEvents.length < simulatedMatch.events.length && (
                        <div className="flex justify-center py-4">
                            <div className="flex space-x-1.5">
                                {[0, 1, 2].map(i => (
                                    <div
                                        key={i}
                                        className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                                        style={{ animationDelay: `${i * 180}ms` }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 flex-shrink-0">
                <div className="max-w-2xl mx-auto space-y-3">
                    {isDone && outcome && (
                        <div className={clsx(
                            'p-3 rounded-lg text-center font-bold text-lg animate-fade-in-up',
                            outcome === 'win' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-700' :
                            outcome === 'draw' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-700' :
                            'bg-red-500/20 text-red-300 border border-red-800'
                        )}>
                            {outcome === 'win' && '🏆 Bua! Go hiontach, a bhainisteoir!'}
                            {outcome === 'draw' && '🤝 Cluiche cothrom! Comhbhuaigh!'}
                            {outcome === 'loss' && '😔 Cailleadh an cluiche. Ar ais go dtí an traenáil!'}
                        </div>
                    )}

                    {isDone && simulatedMatch.result && (
                        <div className="text-center text-sm text-slate-400 font-mono">
                            {homeTeam.name} {formatScore(simulatedMatch.result.homeScore)} — {awayTeam.name} {formatScore(simulatedMatch.result.awayScore)}
                            {'  '}•{'  '}
                            Seilbh: {simulatedMatch.result.possession.home}%–{simulatedMatch.result.possession.away}%
                        </div>
                    )}

                    {!isDone ? (
                        <button
                            onClick={revealAll}
                            className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
                        >
                            Scip go dtí an Críoch
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors"
                        >
                            Lean ar Aghaidh →
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
