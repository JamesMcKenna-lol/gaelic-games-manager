import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { Calendar, TrendingUp, Activity, Shield, PlayCircle, RefreshCw } from 'lucide-react';
import { formatScore } from '../utils/engine';
import clsx from 'clsx';

export const Dashboard: React.FC = () => {
    const { save, startNewSeason } = useGame();
    const navigate = useNavigate();

    const data = useMemo(() => {
        if (!save) return null;

        const competition = save.competitions[0];
        if (!competition) return null;

        const teamId = save.teamId;

        // Find player's group
        const playerGroupFixture = competition.fixtures.find(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        );
        const groupId = playerGroupFixture?.groupId;

        const groupFixtures = competition.fixtures.filter(f => f.groupId === groupId);

        // Next unplayed fixture
        const nextFixture = competition.fixtures
            .filter(f => !f.played && (f.homeTeamId === teamId || f.awayTeamId === teamId))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

        const nextOpponent = nextFixture
            ? save.teams.find(t => t.id === (nextFixture.homeTeamId === teamId ? nextFixture.awayTeamId : nextFixture.homeTeamId))
            : null;

        const nextIsHome = nextFixture?.homeTeamId === teamId;

        // Form from last 5 played matches
        const playedMyFixtures = competition.fixtures
            .filter(f => f.played && f.result && (f.homeTeamId === teamId || f.awayTeamId === teamId))
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const form: (string | null)[] = playedMyFixtures.slice(0, 5).map(f => {
            const isHome = f.homeTeamId === teamId;
            const myScore = isHome ? f.result!.homeScore : f.result!.awayScore;
            const oppScore = isHome ? f.result!.awayScore : f.result!.homeScore;
            const myT = myScore.goals * 3 + myScore.points;
            const oppT = oppScore.goals * 3 + oppScore.points;
            if (myT > oppT) return 'W';
            if (myT === oppT) return 'D';
            return 'L';
        });
        while (form.length < 5) form.push(null);

        // Average squad fitness
        const teamPlayers = save.players.filter(p => p.teamId === teamId);
        const avgFitness = teamPlayers.length > 0
            ? Math.round(teamPlayers.reduce((s, p) => s + p.fitness, 0) / teamPlayers.length)
            : 0;

        // League standings for group
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

        // Board confidence based on form
        const wins = form.filter(f => f === 'W').length;
        const losses = form.filter(f => f === 'L').length;
        let boardConf = 'Sábháilte';
        if (wins >= 4) boardConf = 'An-Sásta!';
        else if (losses >= 4) boardConf = 'Géarchéim!';
        else if (losses >= 3) boardConf = 'Faoi Bhrú';

        // Season-end detection: all player's fixtures are played
        const myFixtures = competition.fixtures.filter(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        );
        const seasonOver = myFixtures.length > 0 && myFixtures.every(f => f.played);

        // Player's final position in group
        const playerRow = standings.find(r => r.team.id === teamId);
        const playerPos = standings.findIndex(r => r.team.id === teamId) + 1;

        return { nextFixture, nextOpponent, nextIsHome, form, avgFitness, standings, boardConf, seasonOver, playerRow, playerPos };
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
                        <p className="text-emerald-500 font-medium">{save.code} • Séasúr {save.season}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-slate-400">Bainisteoir</div>
                        <div className="font-semibold text-white">{save.managerName}</div>
                    </div>
                </div>

                {/* Season Over Banner */}
                {data?.seasonOver && (
                    <div className="bg-slate-900 border border-slate-700 rounded-xl p-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <div className="text-2xl font-black text-white mb-1">
                                    {(data.playerPos ?? 0) <= 2
                                        ? '🏆 Séasúr Críochnaithe!'
                                        : '😔 Séasúr Thart'}
                                </div>
                                <div className="text-slate-300 font-medium">
                                    {(data.playerPos ?? 0) <= 2
                                        ? `Críochnaigh tú sa ${data.playerPos}ú háit — Comhghairdeas!`
                                        : `Chríochnaigh tú sa ${data.playerPos}ú háit. Better luck next time!`}
                                </div>
                                <div className="text-slate-500 text-sm mt-1">
                                    {data.playerRow
                                        ? `${data.playerRow.W}B ${data.playerRow.D}C ${data.playerRow.L}F — ${data.playerRow.Pts} pointe`
                                        : ''}
                                    {'  '}•{'  '}Séasúr {save.season} críochnaithe
                                </div>
                            </div>
                            <button
                                onClick={startNewSeason}
                                className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] whitespace-nowrap"
                            >
                                <RefreshCw size={18} />
                                <span>Séasúr Nua — {save.season + 1}</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* Play Next Match CTA — always visible when there are fixtures left */}
                {!data?.seasonOver && data?.nextOpponent && (
                    <button
                        onClick={() => navigate('/fixtures')}
                        className="w-full flex items-center justify-between px-5 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all hover:scale-[1.005] hover:shadow-[0_0_24px_rgba(16,185,129,0.4)]"
                    >
                        <div className="flex items-center space-x-3">
                            <PlayCircle size={22} />
                            <div className="text-left">
                                <div className="font-bold">Imir an Chéad Cluiche Eile!</div>
                                <div className="text-emerald-200/70 text-sm font-normal">
                                    {data.nextIsHome ? 'Baile' : 'As baile'} vs {data.nextOpponent.name}
                                    {' '}·{' '}
                                    {data.nextFixture!.venue}
                                    {' '}·{' '}
                                    {new Date(data.nextFixture!.date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                            </div>
                        </div>
                        <span className="text-2xl">→</span>
                    </button>
                )}

                {/* Key Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Next Match */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <Calendar size={20} />
                            </div>
                            <span className="text-slate-400 font-medium">An Chéad Cluiche</span>
                        </div>
                        {data?.nextOpponent && !data.seasonOver ? (
                            <>
                                <div className="text-lg font-bold text-white">vs {data.nextOpponent.name}</div>
                                <div className="text-sm text-slate-500">{data.nextIsHome ? 'Baile' : 'As Baile'} •{' '}
                                    {new Date(data.nextFixture!.date).toLocaleDateString('en-IE', { weekday: 'short', day: 'numeric', month: 'short' })}
                                </div>
                            </>
                        ) : (
                            <div className="text-slate-500 text-sm">
                                {data?.seasonOver ? 'Séasúr críochnaithe' : 'Níl cluichí eile ann'}
                            </div>
                        )}
                    </div>

                    {/* Form */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
                                <TrendingUp size={20} />
                            </div>
                            <span className="text-slate-400 font-medium">Foirm</span>
                        </div>
                        <div className="flex space-x-1 mt-1">
                            {(data?.form ?? [null, null, null, null, null]).map((res, i) => (
                                <span key={i} className={clsx(
                                    'w-7 h-7 rounded flex items-center justify-center text-xs font-bold',
                                    res === 'W' ? 'bg-emerald-500/20 text-emerald-400' :
                                    res === 'D' ? 'bg-yellow-500/20 text-yellow-400' :
                                    res === 'L' ? 'bg-red-500/20 text-red-400' :
                                    'bg-slate-800 text-slate-600'
                                )}>
                                    {res ?? '—'}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Squad Fitness */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                <Activity size={20} />
                            </div>
                            <span className="text-slate-400 font-medium">Aclaíocht</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{data?.avgFitness ?? '—'}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div className="bg-purple-500 h-1.5 rounded-full transition-all" style={{ width: `${data?.avgFitness ?? 0}%` }} />
                        </div>
                    </div>

                    {/* Board Confidence */}
                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                                <Shield size={20} />
                            </div>
                            <span className="text-slate-400 font-medium">Muinín an Choiste</span>
                        </div>
                        <div className={clsx(
                            'text-xl font-bold',
                            data?.boardConf === 'An-Sásta!' ? 'text-emerald-400' :
                            data?.boardConf === 'Faoi Bhrú' ? 'text-yellow-400' :
                            data?.boardConf === 'Géarchéim!' ? 'text-red-400' :
                            'text-white'
                        )}>{data?.boardConf ?? 'Sábháilte'}</div>
                        <div className="text-sm text-slate-500">
                            {save.competitions[0] ? 'An craobh ar siúl' : 'Réamhsheaisúr'}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* League Table */}
                    <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Seasamh sa Ghrúpa</h3>
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
                                            row.team.id === save.teamId
                                                ? 'bg-emerald-900/20 border border-emerald-800'
                                                : 'bg-slate-950/50'
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
                            </div>
                        ) : (
                            <p className="text-slate-500 text-sm">Níl aon chluiche imeartha fós. Téigh go dtí Cláracha le d'imirt!</p>
                        )}
                    </div>

                    {/* Last Result / Next Match Preview */}
                    <div className="bg-slate-900 rounded-xl border border-slate-800 p-6">
                        <h3 className="text-lg font-bold text-white mb-4">Torthaí le Déanaí</h3>
                        {data && save.competitions[0] ? (
                            (() => {
                                const recent = save.competitions[0].fixtures
                                    .filter(f => f.played && f.result && (f.homeTeamId === save.teamId || f.awayTeamId === save.teamId))
                                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                    .slice(0, 4);

                                if (recent.length === 0) {
                                    return <p className="text-slate-500 text-sm">Níl torthaí fós. Imir do chéad chluiche!</p>;
                                }

                                return (
                                    <div className="space-y-3">
                                        {recent.map(f => {
                                            const isHome = f.homeTeamId === save.teamId;
                                            const opp = save.teams.find(t => t.id === (isHome ? f.awayTeamId : f.homeTeamId))!;
                                            const myScore = isHome ? f.result!.homeScore : f.result!.awayScore;
                                            const oppScore = isHome ? f.result!.awayScore : f.result!.homeScore;
                                            const myT = myScore.goals * 3 + myScore.points;
                                            const oppT = oppScore.goals * 3 + oppScore.points;
                                            const outcome = myT > oppT ? 'W' : myT === oppT ? 'D' : 'L';

                                            return (
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
                                            );
                                        })}
                                    </div>
                                );
                            })()
                        ) : (
                            <p className="text-slate-500 text-sm">Tosaigh do ghairm le torthaí a fheiceáil anseo.</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
