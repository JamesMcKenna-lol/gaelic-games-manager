import React, { useState, useEffect, useRef } from 'react';
import type { Team, Player, MatchEvent } from '../types';

interface GaaPitchProps {
    homeTeam: Team;
    awayTeam: Team;
    homePlayers: Player[];
    awayPlayers: Player[];
    lastEvent: MatchEvent | null;
    currentMinute: number;
    isDone: boolean;
    playerTeamId: string;
}

// SVG viewport
const VW = 200;
const VH = 340;
// Pitch boundaries
const PX1 = 10, PY1 = 30, PX2 = 190, PY2 = 310;
const PW = PX2 - PX1; // 180
const PH = PY2 - PY1; // 280
const CX = 100, CY = 170; // center

// Horizontal lines (y values)
const TOP_13 = PY1 + Math.round((13 / 145) * PH);     // ~55
const TOP_20 = PY1 + Math.round((20 / 145) * PH);     // ~69
const TOP_45 = PY1 + Math.round((45 / 145) * PH);     // ~117
const BOT_45 = PY2 - Math.round((45 / 145) * PH);     // ~223
const BOT_20 = PY2 - Math.round((20 / 145) * PH);     // ~271
const BOT_13 = PY2 - Math.round((13 / 145) * PH);     // ~285

// Goal post x positions (GAA: 2 posts, 6.5m apart scaled)
const GL = 87, GR = 113; // left/right inner posts

// Base player positions [x, y]
// Home attacks UPWARD (toward y=PY1=30)
const HOME_BASE: [number, number][] = [
    [CX, 300],                                              // GK
    [148, 278], [CX, 284], [52, 278],                      // Full backs
    [150, 252], [CX, 258], [50, 252],                      // Half backs
    [120, 218], [80, 218],                                  // Midfielders
    [150, 183], [CX, 178], [50, 183],                      // Half forwards
    [140, 148], [CX, 143], [60, 148],                      // Full forwards
];

// Away attacks DOWNWARD (toward y=PY2=310)
const AWAY_BASE: [number, number][] = [
    [CX, 40],                                               // GK
    [148, 62], [CX, 56], [52, 62],                         // Full backs
    [150, 88], [CX, 82], [50, 88],                         // Half backs
    [120, 122], [80, 122],                                  // Midfielders
    [150, 157], [CX, 162], [50, 157],                      // Half forwards
    [140, 192], [CX, 197], [60, 192],                      // Full forwards
];

type Pos = { x: number; y: number };

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

function driftPos(base: [number, number]): Pos {
    return {
        x: clamp(base[0] + (Math.random() - 0.5) * 16, PX1 + 6, PX2 - 6),
        y: clamp(base[1] + (Math.random() - 0.5) * 12, PY1 + 6, PY2 - 6),
    };
}

function initPositions(): [Pos[], Pos[]] {
    return [HOME_BASE.map(b => ({ x: b[0], y: b[1] })), AWAY_BASE.map(b => ({ x: b[0], y: b[1] }))];
}

// Subtle stripe bands for pitch texture
const STRIPES = Array.from({ length: 7 }, (_, i) => ({
    y: PY1 + (i * PH) / 7,
    h: PH / 14,
}));

export const GaaPitch: React.FC<GaaPitchProps> = ({
    homeTeam, awayTeam, homePlayers, awayPlayers, lastEvent, isDone, playerTeamId,
}) => {
    const [positions, setPositions] = useState<[Pos[], Pos[]]>(initPositions);
    const [ballPos, setBallPos] = useState<Pos>({ x: CX, y: CY });
    const [possession, setPossession] = useState<'home' | 'away' | null>(null);
    const lastEventRef = useRef<MatchEvent | null>(null);
    const [lastEventText, setLastEventText] = useState<string>('');

    // Continuous drift tick
    useEffect(() => {
        if (isDone) return;
        const id = setInterval(() => {
            setPositions([HOME_BASE.map(driftPos), AWAY_BASE.map(driftPos)]);
            setBallPos(prev => {
                const tX = clamp(CX + (Math.random() - 0.5) * 80, PX1 + 8, PX2 - 8);
                const tY = possession === 'home' ? 75
                         : possession === 'away' ? 265
                         : CY + (Math.random() - 0.5) * 50;
                return {
                    x: clamp(prev.x + (tX - prev.x) * 0.22 + (Math.random() - 0.5) * 10, PX1 + 4, PX2 - 4),
                    y: clamp(prev.y + (tY - prev.y) * 0.18 + (Math.random() - 0.5) * 8, PY1 + 4, PY2 - 4),
                };
            });
        }, 900);
        return () => clearInterval(id);
    }, [isDone, possession]);

    // React to new events
    useEffect(() => {
        if (!lastEvent || lastEvent === lastEventRef.current) return;
        lastEventRef.current = lastEvent;
        setLastEventText(lastEvent.text ?? '');

        const isHomeEvent = lastEvent.teamId === homeTeam.id;

        if (lastEvent.type === 'goal') {
            // Ball flies into the net
            setBallPos(isHomeEvent ? { x: CX, y: PY1 + 6 } : { x: CX, y: PY2 - 6 });
            // Scoring team surges forward
            setPositions(prev => isHomeEvent
                ? [HOME_BASE.map(b => ({ x: clamp(b[0] + (Math.random() - 0.5) * 28, 15, 185), y: clamp(b[1] - 18 - Math.random() * 18, PY1 + 5, PY2 - 5) })), prev[1]]
                : [prev[0], AWAY_BASE.map(b => ({ x: clamp(b[0] + (Math.random() - 0.5) * 28, 15, 185), y: clamp(b[1] + 18 + Math.random() * 18, PY1 + 5, PY2 - 5) }))]);
            // Kickout after 1.6s
            setTimeout(() => {
                setBallPos(isHomeEvent ? { x: CX, y: 260 } : { x: CX, y: 80 });
                setPossession(isHomeEvent ? 'away' : 'home');
                setPositions(initPositions);
            }, 1600);
        } else if (lastEvent.type === 'point') {
            setBallPos(isHomeEvent ? { x: clamp(CX + (Math.random() - 0.5) * 30, GL, GR), y: PY1 - 4 } : { x: clamp(CX + (Math.random() - 0.5) * 30, GL, GR), y: PY2 + 4 });
            setTimeout(() => {
                setBallPos(isHomeEvent ? { x: CX, y: 90 } : { x: CX, y: 250 });
                setPossession(isHomeEvent ? 'away' : 'home');
            }, 1200);
        } else if (lastEvent.type === 'wide') {
            setBallPos({ x: Math.random() > 0.5 ? PX2 + 8 : PX1 - 8, y: 100 + Math.random() * 140 });
            setTimeout(() => setBallPos({ x: CX, y: CY }), 1400);
        } else if (lastEvent.type === 'whistle') {
            setPositions(initPositions);
            setBallPos({ x: CX, y: CY });
            setPossession(null);
        }
    }, [lastEvent, homeTeam.id]);

    const homeColor = homeTeam.colors[0];
    // Ensure away color is distinct from home
    const awayColor = awayTeam.colors[1] && awayTeam.colors[1] !== homeTeam.colors[0]
        ? awayTeam.colors[1]
        : awayTeam.colors[0];

    // Possession % for bar
    const homePct = possession === 'home' ? 62 : possession === 'away' ? 38 : 50;

    return (
        <div className="w-full h-full flex flex-col select-none">
            {/* Team colour legend + possession bar */}
            <div className="flex items-center space-x-2 px-3 pt-1 pb-0.5">
                <span className="text-xs font-semibold truncate" style={{ color: homeColor }}>{homeTeam.name}</span>
                <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-800 flex">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${homePct}%`, background: homeColor }} />
                    <div className="h-full flex-1 rounded-full" style={{ background: awayColor }} />
                </div>
                <span className="text-xs font-semibold truncate text-right" style={{ color: awayColor }}>{awayTeam.name}</span>
            </div>

            <svg
                viewBox={`0 0 ${VW} ${VH}`}
                className="w-full flex-1"
                style={{ display: 'block' }}
            >
                {/* Dark surround */}
                <rect width={VW} height={VH} fill="#161b22" />

                {/* Pitch surface */}
                <rect x={PX1} y={PY1} width={PW} height={PH} fill="#2d6a3f" />

                {/* Pitch stripes */}
                {STRIPES.map((s, i) => (
                    <rect key={i} x={PX1} y={s.y} width={PW} height={s.h} fill="rgba(0,0,0,0.07)" />
                ))}

                {/* Pitch border */}
                <rect x={PX1} y={PY1} width={PW} height={PH} fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="1.5" />

                {/* Horizontal lines */}
                <line x1={PX1} y1={TOP_13} x2={PX2} y2={TOP_13} stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />
                <line x1={PX1} y1={TOP_20} x2={PX2} y2={TOP_20} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                <line x1={PX1} y1={TOP_45} x2={PX2} y2={TOP_45} stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
                <line x1={PX1} y1={CY}     x2={PX2} y2={CY}     stroke="rgba(255,255,255,0.65)" strokeWidth="1.2" />
                <line x1={PX1} y1={BOT_45} x2={PX2} y2={BOT_45} stroke="rgba(255,255,255,0.6)" strokeWidth="1.1" />
                <line x1={PX1} y1={BOT_20} x2={PX2} y2={BOT_20} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                <line x1={PX1} y1={BOT_13} x2={PX2} y2={BOT_13} stroke="rgba(255,255,255,0.4)" strokeWidth="0.7" />

                {/* 45m tick marks on sideline */}
                {[TOP_45, BOT_45].map(y => (
                    <React.Fragment key={y}>
                        <line x1={PX1 - 3} y1={y} x2={PX1 + 3} y2={y} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                        <line x1={PX2 - 3} y1={y} x2={PX2 + 3} y2={y} stroke="rgba(255,255,255,0.55)" strokeWidth="1" />
                    </React.Fragment>
                ))}

                {/* Center circle */}
                <circle cx={CX} cy={CY} r="22" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.9" />
                <circle cx={CX} cy={CY} r="2" fill="rgba(255,255,255,0.65)" />

                {/* Penalty spots */}
                <circle cx={CX} cy={TOP_20 + 4} r="1.5" fill="rgba(255,255,255,0.5)" />
                <circle cx={CX} cy={BOT_20 - 4} r="1.5" fill="rgba(255,255,255,0.5)" />

                {/* ── TOP GOAL (away defends) ── */}
                {/* Goal mouth box */}
                <rect x={GL} y={PY1} width={GR - GL} height={14} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" />
                {/* Goal posts extending above pitch */}
                <line x1={GL}  y1={PY1} x2={GL}  y2={PY1 - 16} stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1={GR}  y1={PY1} x2={GR}  y2={PY1 - 16} stroke="white" strokeWidth="2" strokeLinecap="round" />
                {/* Crossbar shadow hint */}
                <line x1={GL} y1={PY1 + 14} x2={GR} y2={PY1 + 14} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />

                {/* ── BOTTOM GOAL (home defends) ── */}
                <rect x={GL} y={PY2 - 14} width={GR - GL} height={14} fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.3" />
                <line x1={GL} y1={PY2} x2={GL} y2={PY2 + 16} stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1={GR} y1={PY2} x2={GR} y2={PY2 + 16} stroke="white" strokeWidth="2" strokeLinecap="round" />
                <line x1={GL} y1={PY2 - 14} x2={GR} y2={PY2 - 14} stroke="rgba(255,255,255,0.3)" strokeWidth="0.6" />

                {/* ── AWAY PLAYERS ── */}
                {positions[1].slice(0, Math.min(15, awayPlayers.length || 15)).map((pos, i) => (
                    <g
                        key={`a${i}`}
                        style={{ transform: `translate(${pos.x}px,${pos.y}px)`, transition: 'transform 0.85s ease-out' }}
                    >
                        <circle r="6.5" fill={awayColor} stroke="rgba(255,255,255,0.95)" strokeWidth="1.3" />
                        {i === 0 && (
                            <text textAnchor="middle" dominantBaseline="central" fontSize="5" fill="white" fontWeight="bold">G</text>
                        )}
                    </g>
                ))}

                {/* ── HOME PLAYERS ── */}
                {positions[0].slice(0, Math.min(15, homePlayers.length || 15)).map((pos, i) => (
                    <g
                        key={`h${i}`}
                        style={{ transform: `translate(${pos.x}px,${pos.y}px)`, transition: 'transform 0.85s ease-out' }}
                    >
                        <circle r="6.5" fill={homeColor} stroke="rgba(255,255,255,0.95)" strokeWidth="1.3" />
                        {i === 0 && (
                            <text textAnchor="middle" dominantBaseline="central" fontSize="5" fill="white" fontWeight="bold">G</text>
                        )}
                    </g>
                ))}

                {/* ── BALL ── */}
                <g style={{
                    transform: `translate(${clamp(ballPos.x, PX1 - 6, PX2 + 6)}px,${clamp(ballPos.y, PY1 - 6, PY2 + 6)}px)`,
                    transition: 'transform 0.45s ease-out',
                }}>
                    {/* Shadow */}
                    <ellipse rx="4.5" ry="2.5" cy="4" fill="rgba(0,0,0,0.3)" />
                    <circle r="4.5" fill="white" stroke="rgba(0,0,0,0.45)" strokeWidth="0.8" />
                    {/* Simple seam lines */}
                    <path d="M-2,-2 Q0,0 2,2" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" fill="none" />
                    <path d="M2,-2 Q0,0 -2,2" stroke="rgba(0,0,0,0.25)" strokeWidth="0.6" fill="none" />
                </g>

                {/* Attacking direction arrows (very subtle) */}
                <text x={PX2 + 4} y={CY - 12} fontSize="7" fill={homeColor} opacity="0.5">▲</text>
                <text x={PX2 + 4} y={CY + 16} fontSize="7" fill={awayColor} opacity="0.5">▼</text>

                {/* Team name labels outside pitch */}
                <text x={CX} y={PY1 - 5} textAnchor="middle" fontSize="6" fill={awayColor} fontWeight="bold" opacity="0.85">
                    {awayTeam.name.toUpperCase()}
                </text>
                <text x={CX} y={PY2 + 10} textAnchor="middle" fontSize="6" fill={homeColor} fontWeight="bold" opacity="0.85">
                    {homeTeam.name.toUpperCase()}
                </text>

                {/* Player team indicator dot (for player's own team) */}
                {playerTeamId === homeTeam.id && (
                    <rect x={PX1} y={PY2 + 4} width={6} height={3} rx="1" fill={homeColor} opacity="0.7" />
                )}
                {playerTeamId === awayTeam.id && (
                    <rect x={PX1} y={PY1 - 7} width={6} height={3} rx="1" fill={awayColor} opacity="0.7" />
                )}
            </svg>

            {/* Last event text ticker */}
            <div className="px-3 py-1.5 text-center min-h-[2rem]">
                <p className="text-xs text-slate-400 leading-tight truncate italic">
                    {lastEventText || 'Ag fanacht le tosú…'}
                </p>
            </div>
        </div>
    );
};
