import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { Calendar, TrendingUp, Activity, Shield, PlayCircle, RefreshCw, ChevronRight, Trophy } from 'lucide-react';
import { formatScore } from '../utils/engine';
import type { CompetitionPhase } from '../types';
import clsx from 'clsx';

const PHASE_LABEL: Record<CompetitionPhase, string> = {
    'group':              'Grúpchéim',
    'provincial-sf':      'Leathcheannais Cúige',
    'provincial-final':   'Ceannais Cúige',
    'all-ireland-sf':     'Leathcheannais na hÉireann',
    'all-ireland-final':  'Ceannais na hÉireann',
};
const PHASE_EN: Record<CompetitionPhase, string> = {
    'group':              'Group Stage',
    'provincial-sf':      'Provincial Semi-Final',
    'provincial-final':   'Provincial Final',
    'all-ireland-sf':     'All Ireland Semi-Final',
    'all-ireland-final':  'All Ireland Final',
};
const PHASE_ORDER: CompetitionPhase[] = [
    'group', 'provincial-sf', 'provincial-final', 'all-ireland-sf', 'all-ireland-final',
];
const NEXT_PHASE: Record<CompetitionPhase, CompetitionPhase | null> = {
    'group':             'provincial-sf',
    'provincial-sf':     'provincial-final',
    'provincial-final':  'all-ireland-sf',
    'all-ireland-sf':    'all-ireland-final',
    'all-ireland-final': null,
};

export const Dashboard: React.FC = () => {
    const { save, startNewSeason, advancePhase } = useGame();
    const navigate = useNavigate();

    const data = useMemo(() => {
        if (!save) return null;

        const teamId = save.teamId;

        // Active competition = last one
        const competition = save.competitions[save.competitions.length - 1];
        if (!competition) return null;

        const currentPhase: CompetitionPhase = competition.phase ?? 'group';

        // ── Group stage data ──
        const groupComp = save.competitions.find(c => (c.phase ?? 'group') === 'group');
        const playerGroupFixture = groupComp?.fixtures.find(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        );
        const groupId = playerGroupFixture?.groupId;
        const groupFixtures = groupComp?.fixtures.filter(f => f.groupId === groupId) ?? [];

        const groupTeamIds = [...new Set(groupFixtures.flatMap(f => [f.homeTeamId, f.awayTeamId]))];
        const standings = groupTeamIds.map(tid => {
            const team = save.teams.find(t => t.id === tid)!;
            let P = 0, W = 0, D = 0, L = 0, GF = 0, GA = 0;
            groupFixtures.filter(f => f.played && f.result).forEach(f => {
                const hT = f.result!.homeScore.goals * 3 + f.result!.homeScore.points;
                const aT = f.result!.awayScore.goals * 3 + f.result!.awayScore.points;
                if (f.homeTeamId === tid) {
                    P++; GF += hT; GA += aT;
                    if (hT > aT) W++; else if (hT === aT) D++; else L++;
                } else if (f.awayTeamId === tid) {
                    P++; GF += aT; GA += hT;
                    if (aT > hT) W++; else if (aT === hT) D++; else L++;
                }
            });
            return { team, P, W, D, L, Pts: W * 2 + D, GD: GF - GA };
        }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD);

        const playerPos = standings.findIndex(r => r.team.id === teamId) + 1;
        const playerRow = standings.find(r => r.team.id === teamId);

        const myGroupFixtures = groupComp?.fixtures.filter(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        ) ?? [];
        const groupDone = myGroupFixtures.length > 0 && myGroupFixtures.every(f => f.played);
        const groupQualified = groupDone && playerPos >= 1 && playerPos <= 2;

        // ── Knockout match data (for phases after group) ──
        let knockoutFixture = currentPhase !== 'group'
            ? competition.fixtures.find(f => f.homeTeamId === teamId || f.awayTeamId === teamId)
            : undefined;
        let knockoutDone = knockoutFixture?.played ?? false;
        let knockoutWon = false;
        if (knockoutDone && knockoutFixture?.result) {
            const isHome = knockoutFixture.homeTeamId === teamId;
            const myT = isHome
                ? knockoutFixture.result.homeScore.goals * 3 + knockoutFixture.result.homeScore.points
                : knockoutFixture.result.awayScore.goals * 3 + knockoutFixture.result.awayScore.points;
            const oppT = isHome
                ? knockoutFixture.result.awayScore.goals * 3 + knockoutFixture.result.awayScore.points
                : knockoutFixture.result.homeScore.goals * 3 + knockoutFixture.result.homeScore.points;
            knockoutWon = myT > oppT;
        }

        // ── Next unplayed fixture (for play button) ──
        const allMyFixtures = save.competitions.flatMap(c =>
            c.fixtures.filter(f => f.homeTeamId === teamId || f.awayTeamId === teamId)
        );
        const nextFixture = allMyFixtures
            .filter(f => !f.played)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        const nextOpponent = nextFixture
            ? save.teams.find(t => t.id === (nextFixture.homeTeamId === teamId ? nextFixture.awayTeamId : nextFixture.homeTeamId))
            : null;
        const nextIsHome = nextFixture?.homeTeamId === teamId;

        // ── Form from last 5 played matches ──
        const playedMyFixtures = save.competitions.flatMap(c =>
            c.fixtures.filter(f => f.played && f.result && (f.homeTeamId === teamId || f.awayTeamId === teamId))
        ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const form: (string | null)[] = playedMyFixtures.slice(0, 5).map(f => {
            const isHome = f.homeTeamId === teamId;
            const myT = isHome ? f.result!.homeScore.goals * 3 + f.result!.homeScore.points : f.result!.awayScore.goals * 3 + f.result!.awayScore.points;
            const oppT = isHome ? f.result!.awayScore.goals * 3 + f.result!.awayScore.points : f.result!.homeScore.goals * 3 + f.result!.homeScore.points;
            if (myT > oppT) return 'W';
            if (myT === oppT) return 'D';
            return 'L';
        });
        while (form.length < 5) form.push(null);

        // ── Squad fitness ──
        const teamPlayers = save.players.filter(p => p.teamId === teamId);
        const avgFitness = teamPlayers.length > 0
            ? Math.round(teamPlayers.reduce((s, p) => s + p.fitness, 0) / teamPlayers.length) : 0;

        // ── Board confidence ──
        const wins = form.filter(f => f === 'W').length;
        const losses = form.filter(f => f === 'L').length;
        let boardConf = 'Sábháilte';
        if (wins >= 4) boardConf = 'An-Sásta!';
        else if (losses >= 4) boardConf = 'Géarchéim!';
        else if (losses >= 3) boardConf = 'Faoi Bhrú';

        // ── Season-end states ──
        const seasonOver =
            (currentPhase === 'group' && groupDone && !groupQualified) ||
            (currentPhase !== 'group' && knockoutDone && !knockoutWon) ||
            (currentPhase === 'all-ireland-final' && knockoutDone && knockoutWon);

        const canAdvance =
            (currentPhase === 'group' && groupDone && groupQualified) ||
            (currentPhase !== 'group' && knockoutDone && knockoutWon && currentPhase !== 'all-ireland-final');

        const nextPhase = NEXT_PHASE[currentPhase];

        // Recent results
        const recentResults = playedMyFixtures.slice(0, 4).map(f => {
            const isHome = f.homeTeamId === teamId;
            const opp = save.teams.find(t => t.id === (isHome ? f.awayTeamId : f.homeTeamId))!;
            const myScore = isHome ? f.result!.homeScore : f.result!.awayScore;
            const oppScore = isHome ? f.result!.awayScore : f.result!.homeScore;
            const myT = myScore.goals * 3 + myScore.points;
            const oppT = oppScore.goals * 3 + oppScore.points;
            return {
                f,
                isHome,
                opp,
                myScore,
                oppScore,
                outcome: myT > oppT ? 'W' : myT === oppT ? 'D' : 'L',
            };
        });

        return {
            currentPhase,
            competition,
            standings,
            playerPos,
            playerRow,
            groupDone,
            groupQualified,
            knockoutFixture,
            knockoutDone,
            knockoutWon,
            nextFixture,
            nextOpponent,
            nextIsHome,
            form,
            avgFitness,
            boardConf,
            seasonOver,
            canAdvance,
            nextPhase,
            recentResults,
        };
    }, [save]);

    if (!save) return null;
    const team = save.teams.find(t => t.id === save.teamId);

    return (
        <Layout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{team?.name}</h1>
                        <p className="text-emerald-500 font-medium">{save.code} • Séasúr {save.season}
                            <span className="text-slate-500 font-normal"> · season</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Bainisteoir <span className="text-slate-600 text-xs font-normal">manager</span></div>
                        <div className="font-semibold text-white">{save.managerName}</div>
                    </div>
                </div>

                {/* ── Path to All Ireland ── */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-3">
                        An Bealach go Croke Park <span className="font-normal normal-case text-slate-600">· the road to the All Ireland</span>
                    </div>
                    <div className="flex items-center gap-1 overflow-x-auto pb-1">
                        {PHASE_ORDER.map((phase, i) => {
                            const isCurrent = data?.currentPhase === phase;
                            const isDone = data
                                ? PHASE_ORDER.indexOf(data.currentPhase) > i ||
                                  (isCurrent && (data.knockoutDone || (phase === 'group' && data.groupDone)))
                                : false;
                            const isWon = isDone && (
                                phase === 'group' ? data?.groupQualified :
                                (() => {
                                    const c = save.competitions.find(c2 => c2.phase === phase);
                                    if (!c) return false;
                                    const f = c.fixtures.find(fx => fx.homeTeamId === save.teamId || fx.awayTeamId === save.teamId);
                                    if (!f?.result) return false;
                                    const isHome = f.homeTeamId === save.teamId;
                                    const myT = isHome ? f.result.homeScore.goals * 3 + f.result.homeScore.points : f.result.awayScore.goals * 3 + f.result.awayScore.points;
                                    const oppT = isHome ? f.result.awayScore.goals * 3 + f.result.awayScore.points : f.result.homeScore.goals * 3 + f.result.homeScore.points;
                                    return myT > oppT;
                                })()
                            );
                            const isLocked = data ? PHASE_ORDER.indexOf(data.currentPhase) < i : true;

                            return (
                                <React.Fragment key={phase}>
                                    <div className={clsx(
                                        'flex flex-col items-center px-2 py-1.5 rounded-lg min-w-[80px] text-center transition-all',
                                        isCurrent && !isDone ? 'bg-emerald-900/40 border border-emerald-700' :
                                        isWon ? 'bg-emerald-500/10 border border-emerald-800' :
                                        isDone ? 'bg-red-500/10 border border-red-900' :
                                        isLocked ? 'border border-slate-800 opacity-40' :
                                        'border border-slate-800'
                                    )}>
                                        <div className="text-lg mb-0.5">
                                            {isWon ? '✅' : (isDone && !isWon) ? '❌' : isCurrent ? '🏐' : '🔒'}
                                        </div>
                                        <div className={clsx(
                                            'text-[10px] font-bold leading-tight',
                                            isCurrent && !isDone ? 'text-emerald-400' :
                                            isWon ? 'text-emerald-500' :
                                            isDone ? 'text-red-400' :
                                            'text-slate-500'
                                        )}>
                                            {PHASE_LABEL[phase]}
                                        </div>
                                        <div className="text-[9px] text-slate-600 leading-tight mt-0.5">{PHASE_EN[phase]}</div>
                                    </div>
                                    {i < PHASE_ORDER.length - 1 && (
                                        <div className={clsx('text-slate-700 text-xs flex-shrink-0', isLocked && 'opacity-30')}>→</div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>

                {/* ── Season-end / Advance banners ── */}
                {data?.seasonOver && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                {data.currentPhase === 'all-ireland-final' && data.knockoutWon ? (
                                    <>
                                        <div className="text-2xl font-black text-white mb-1">🏆 Craobh na hÉireann!</div>
                                        <div className="text-emerald-400 font-medium">All Ireland Champions!</div>
                                        <div className="text-slate-500 text-sm mt-1">Séasúr {save.season} críochnaithe — season complete</div>
                                    </>
                                ) : data.currentPhase === 'group' ? (
                                    <>
                                        <div className="text-2xl font-black text-white mb-1">😔 Séasúr Thart</div>
                                        <div className="text-slate-300 font-medium">
                                            {data.playerPos}ú háit sa ghrúpa — {data.playerPos}{data.playerPos === 1 ? 'st' : data.playerPos === 2 ? 'nd' : data.playerPos === 3 ? 'rd' : 'th'} in the group. Top 2 advance.
                                        </div>
                                        <div className="text-slate-500 text-sm mt-1">
                                            {data.playerRow ? `${data.playerRow.W}B ${data.playerRow.D}C ${data.playerRow.L}F` : ''}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-2xl font-black text-white mb-1">😔 Eliminated</div>
                                        <div className="text-slate-300 font-medium">
                                            Out in the {PHASE_EN[data.currentPhase]}
                                            <span className="text-slate-500 text-sm ml-2">({PHASE_LABEL[data.currentPhase]})</span>
                                        </div>
                                        <div className="text-slate-500 text-sm mt-1">Séasúr {save.season} críochnaithe</div>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={startNewSeason}
                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] whitespace-nowrap"
                            >
                                <RefreshCw size={18} />
                                <div className="flex flex-col items-start">
                                    <span>Séasúr Nua — {save.season + 1}</span>
                                    <span className="text-emerald-200/50 text-xs font-normal">new season</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}

                {/* Qualified from group — advance button */}
                {data?.canAdvance && data.nextPhase && (
                    <div className="bg-emerald-900/30 border border-emerald-700 rounded-xl p-5">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="text-lg font-black text-emerald-300 mb-1">
                                    {data.currentPhase === 'group' ? '🎉 Cáilithe!' : '🏅 Ár Aghaidh!'}
                                </div>
                                <div className="text-white font-medium">
                                    {data.currentPhase === 'group'
                                        ? `${data.playerPos}ú háit — you qualified from the group!`
                                        : `You won the ${PHASE_EN[data.currentPhase]}!`}
                                </div>
                                <div className="text-emerald-400/70 text-sm mt-1">
                                    Next: {PHASE_EN[data.nextPhase]}
                                    <span className="text-emerald-600 ml-2">· {PHASE_LABEL[data.nextPhase]}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => advancePhase(data.nextPhase!)}
                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] whitespace-nowrap"
                            >
                                <Trophy size={18} />
                                <div className="flex flex-col items-start">
                                    <span>Ar Aghaidh!</span>
                                    <span className="text-emerald-200/50 text-xs font-normal">advance to next round</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Play next match CTA ── */}
                {!data?.seasonOver && !data?.canAdvance && data?.nextOpponent && (
                    <button
                        onClick={() => navigate('/fixtures')}
                        className="w-full flex items-center justify-between px-5 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.005] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]"
                    >
                        <div className="flex items-center space-x-3">
                            <PlayCircle size={22} />
                            <div className="text-left">
                                <div className="font-bold">Imir an Chéad Cluiche Eile!</div>
                                <div className="text-emerald-200/40 text-xs font-normal">play next match</div>
                                <div className="text-emerald-200/70 text-sm font-normal">
                                    {data.nextIsHome ? 'Baile' : 'As baile'} vs {data.nextOpponent.name}
                                    {' '}·{' '}{data.nextFixture!.venue}
                                    {' '}·{' '}
                                    {new Date(data.nextFixture!.date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        </div>
                        <span className="text-2xl">→</span>
                    </button>
                )}

                {/* ── Key Stats Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Calendar size={20} /></div>
                            <span className="text-slate-400 font-medium">An Chéad Cluiche <span className="text-slate-600 text-xs font-normal">next match</span></span>
                        </div>
                        {data?.nextOpponent && !data.seasonOver && !data.canAdvance ? (
                            <>
                                <div className="text-lg font-bold text-white">vs {data.nextOpponent.name}</div>
                                <div className="text-sm text-slate-500">
                                    {data.nextIsHome ? 'Baile' : 'As Baile'} · {new Date(data.nextFixture!.date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-500 text-sm">
                                {data?.seasonOver ? 'Séasúr críochnaithe · season over' : data?.canAdvance ? 'Advance to next round!' : 'Níl cluichí eile ann'}
                            </div>
                        )}
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><TrendingUp size={20} /></div>
                            <span className="text-slate-400 font-medium">Foirm <span className="text-slate-600 text-xs font-normal">form</span></span>
                        </div>
                        <div className="flex space-x-1 mt-1">
                            {(data?.form ?? [null, null, null, null, null]).map((res, i) => (
                                <span key={i} className={clsx(
                                    'w-7 h-7 rounded flex items-center justify-center text-xs font-bold',
                                    res === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                                    res === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                    res === 'L' ? 'bg-red-500/20 text-red-400' :
                                    'bg-slate-800 text-slate-600'
                                )}>{res ?? '—'}</span>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Activity size={20} /></div>
                            <span className="text-slate-400 font-medium">Aclaíocht <span className="text-slate-600 text-xs font-normal">fitness</span></span>
                        </div>
                        <div className="text-2xl font-bold text-white">{data?.avgFitness ?? '—'}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${data?.avgFitness ?? 0}%` }} />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500"><Shield size={20} /></div>
                            <span className="text-slate-400 font-medium">Muinín an Choiste <span className="text-slate-600 text-xs font-normal">board confidence</span></span>
                        </div>
                        <div className={clsx(
                            'text-xl font-bold',
                            data?.boardConf === 'An-Sásta!' ? 'text-emerald-400' :
                            data?.boardConf === 'Faoi Bhrú' ? 'text-yellow-400' :
                            data?.boardConf === 'Géarchéim!' ? 'text-red-400' : 'text-white'
                        )}>{data?.boardConf ?? 'Sábháilte'}</div>
                        <div className="text-sm text-slate-500">{data ? PHASE_EN[data.currentPhase] : 'Pre-season'}</div>
                    </div>
                </div>

                {/* ── Main Content ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Group standings */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Seasamh sa Ghrúpa <span className="text-slate-500 text-sm font-normal">· group standings</span>
                        </h3>
                        {data && data.standings.length > 0 ? (
                            <div className="space-y-1">
                                <div className="flex items-center justify-between px-3 py-1 text-xs text-slate-500 font-medium uppercase tracking-wide">
                                    <span className="w-6">#</span>
                                    <span className="flex-1">Team</span>
                                    <div className="flex space-x-3 font-mono">
                                        <span className="w-6 text-center">P</span>
                                        <span className="w-6 text-center">W</span>
                                        <span className="w-6 text-center">D</span>
                                        <span className="w-6 text-center">L</span>
                                        <span className="w-8 text-center">Pts</span>
                                    </div>
                                </div>
                                {data.standings.map((row, pos) => (
                                    <div
                                        key={row.team.id}
                                        className={clsx(
                                            'flex items-center justify-between p-3 rounded-lg',
                                            row.team.id === save.teamId ? 'bg-emerald-900/20 border border-emerald-800' : 'bg-slate-950/50',
                                            pos < 2 && 'border-l-2 border-l-emerald-600'
                                        )}
                                    >
                                        <span className="w-6 text-slate-500 font-mono text-sm">{pos + 1}</span>
                                        <span className={clsx('flex-1 font-medium', row.team.id === save.teamId ? 'text-emerald-400' : 'text-white')}>
                                            {row.team.name}
                                        </span>
                                        <div className="flex space-x-3 text-sm text-slate-400 font-mono">
                                            <span className="w-6 text-center">{row.P}</span>
                                            <span className="w-6 text-center">{row.W}</span>
                                            <span className="w-6 text-center">{row.D}</span>
                                            <span className="w-6 text-center">{row.L}</span>
                                            <span className="w-8 text-center font-bold text-white">{row.Pts}</span>
                                        </div>
                                    </div>
                                ))}
                                <div className="text-xs text-emerald-600/60 px-3 pt-1">Top 2 advance to Provincial Championship</div>
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">Níl aon chluiche imeartha fós. Téigh go dtí Cláracha le d'imirt!</p>
                        )}
                    </div>

                    {/* Recent results */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">
                            Torthaí le Déanaí <span className="text-slate-500 text-sm font-normal">· recent results</span>
                        </h3>
                        {data && data.recentResults.length > 0 ? (
                            <div className="space-y-3">
                                {data.recentResults.map(({ f, isHome, opp, myScore, oppScore, outcome }) => (
                                    <div key={f.id} className="p-3 bg-slate-950/50 rounded-lg">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs text-slate-500">{isHome ? 'H' : 'A'} vs {opp?.name}</span>
                                            <span className={clsx(
                                                'text-xs font-bold px-1.5 py-0.5 rounded',
                                                outcome === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                                                outcome === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                                'bg-red-500/20 text-red-400'
                                            )}>{outcome}</span>
                                        </div>
                                        <div className="text-sm font-mono text-slate-300">
                                            {formatScore(myScore)} — {formatScore(oppScore)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">Níl torthaí fós. Imir do chéad chluiche!</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
