import React from 'react';
import { useGame } from '../context/GameContext';
import { useLanguage } from '../context/LanguageContext';
import { Layout } from '../components/Layout';
import { Beer, Clock, TrendingUp, Zap, AlertTriangle } from 'lucide-react';
import { CLUBHOUSE_ACTIVITIES } from '../utils/clubhouse';
import clsx from 'clsx';

const COST_LABEL = { low: 'Íseal · low', medium: 'Measartha · medium', high: 'Ard · high' };
const COST_COLOR = { low: 'text-emerald-400', medium: 'text-yellow-400', high: 'text-red-400' };

export const Clubhouse: React.FC = () => {
    const { save, doClubhouseActivity } = useGame();
    const { t, sub } = useLanguage();

    if (!save) return null;

    const now = new Date();
    const teamPlayers = save.players.filter(p => p.teamId === save.teamId);
    const avgMorale = teamPlayers.length > 0
        ? Math.round(teamPlayers.reduce((s, p) => s + p.morale, 0) / teamPlayers.length) : 0;
    const avgFitness = teamPlayers.length > 0
        ? Math.round(teamPlayers.reduce((s, p) => s + p.fitness, 0) / teamPlayers.length) : 0;

    const getActivityStatus = (activityId: string) => {
        const effect = save.activeClubhouseEffects
            .filter(e => e.activityId === activityId)
            .sort((a, b) => new Date(b.cooldownUntil).getTime() - new Date(a.cooldownUntil).getTime())[0];
        if (!effect) return { onCooldown: false, daysLeft: 0 };
        const cooldownEnd = new Date(effect.cooldownUntil);
        if (cooldownEnd <= now) return { onCooldown: false, daysLeft: 0 };
        const daysLeft = Math.ceil((cooldownEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { onCooldown: true, daysLeft };
    };

    // Active effects summary
    const activeEffects = save.activeClubhouseEffects.filter(e => {
        const expiry = new Date(e.appliedDate);
        expiry.setDate(expiry.getDate() + e.trainingEffectDays);
        return expiry > now;
    });

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">{t('An Clubhouse', 'Clubhouse')}</h1>
                    {sub('team activities') && <p className="text-slate-400 text-sm">an teach tábhairne · {sub('team activities')}</p>}
                </div>

                {/* Squad overview */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Meon <span className="font-normal normal-case text-slate-600">· morale</span>
                        </div>
                        <div className={clsx('text-2xl font-bold',
                            avgMorale >= 70 ? 'text-emerald-400' : avgMorale >= 40 ? 'text-yellow-400' : 'text-red-400'
                        )}>{avgMorale}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div className={clsx('h-1.5 rounded-full',
                                avgMorale >= 70 ? 'bg-emerald-500' : avgMorale >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            )} style={{ width: `${avgMorale}%` }} />
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">
                            Aclaíocht <span className="font-normal normal-case text-slate-600">· fitness</span>
                        </div>
                        <div className={clsx('text-2xl font-bold',
                            avgFitness >= 70 ? 'text-purple-400' : avgFitness >= 40 ? 'text-yellow-400' : 'text-red-400'
                        )}>{avgFitness}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div className={clsx('h-1.5 rounded-full',
                                avgFitness >= 70 ? 'bg-purple-500' : avgFitness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                            )} style={{ width: `${avgFitness}%` }} />
                        </div>
                    </div>
                </div>

                {/* Active training effects warning */}
                {activeEffects.length > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-800 rounded-xl p-4 flex items-start space-x-3">
                        <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <div className="text-yellow-300 font-semibold text-sm">Training effectiveness reduced</div>
                            <div className="text-yellow-500/70 text-xs mt-0.5">
                                {activeEffects.length} active {activeEffects.length === 1 ? 'activity' : 'activities'} are reducing
                                training effectiveness this week. The lads are still recovering!
                            </div>
                        </div>
                    </div>
                )}

                {/* Activities grid */}
                <div className="space-y-4">
                    <div className="text-sm font-semibold text-slate-300">
                        Available Activities <span className="text-slate-600 font-normal">· gníomhaíochtaí</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {CLUBHOUSE_ACTIVITIES.map(activity => {
                            const { onCooldown, daysLeft } = getActivityStatus(activity.id);

                            return (
                                <div
                                    key={activity.id}
                                    className={clsx(
                                        'bg-slate-900 border rounded-xl p-5 space-y-3 transition-all',
                                        onCooldown ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-slate-600'
                                    )}
                                >
                                    <div>
                                        <div className="font-bold text-white">{activity.irishName}</div>
                                        <div className="text-slate-500 text-xs">{activity.name}</div>
                                        <div className="text-slate-400 text-sm mt-1 leading-relaxed">{activity.description}</div>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center space-x-1.5 text-emerald-400">
                                            <TrendingUp size={12} />
                                            <span>Morale +{activity.moraleBoost}</span>
                                        </div>
                                        <div className="flex items-center space-x-1.5 text-red-400">
                                            <Zap size={12} />
                                            <span>Fitness {activity.fitnessImpact}</span>
                                        </div>
                                        {activity.trainingEffectDays > 0 && (
                                            <div className="flex items-center space-x-1.5 text-yellow-500">
                                                <AlertTriangle size={12} />
                                                <span>Training -{activity.trainingEffectDays}d</span>
                                            </div>
                                        )}
                                        <div className="flex items-center space-x-1.5 text-slate-500">
                                            <Clock size={12} />
                                            <span>CD {activity.cooldownDays}d</span>
                                        </div>
                                        <div className={clsx('flex items-center space-x-1.5', COST_COLOR[activity.cost])}>
                                            <Beer size={12} />
                                            <span>Cost: {COST_LABEL[activity.cost]}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => !onCooldown && doClubhouseActivity(activity.id)}
                                        disabled={onCooldown}
                                        className={clsx(
                                            'w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all flex flex-col items-center',
                                            onCooldown
                                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                                : activity.cost === 'high'
                                                ? 'bg-amber-700 hover:bg-amber-600 text-white'
                                                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                                        )}
                                    >
                                        {onCooldown ? (
                                            <>
                                                <span className="flex items-center space-x-1">
                                                    <Clock size={14} />
                                                    <span>Cooldown — {daysLeft}d remaining</span>
                                                </span>
                                                <span className="text-xs font-normal opacity-60">am i bhfeidhm go fóill</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('Déan é!', 'Do it!')}</span>
                                                {sub('do it') && <span className="text-xs font-normal opacity-50">+{activity.moraleBoost} morale · {activity.fitnessImpact} fitness</span>}
                                            </>
                                        )}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent activity log */}
                {save.activeClubhouseEffects.length > 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                        <div className="text-sm font-semibold text-slate-300 mb-3">
                            Activity Log <span className="text-slate-600 font-normal">· loga gníomhaíochtaí</span>
                        </div>
                        <div className="space-y-2">
                            {[...save.activeClubhouseEffects]
                                .sort((a, b) => new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime())
                                .slice(0, 5)
                                .map((effect, i) => {
                                    const activity = CLUBHOUSE_ACTIVITIES.find(a => a.id === effect.activityId);
                                    const date = new Date(effect.appliedDate);
                                    const cooldownEnd = new Date(effect.cooldownUntil);
                                    const onCooldown = cooldownEnd > now;
                                    return (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <span className="text-slate-300">{activity?.name ?? effect.activityId}</span>
                                            <div className="flex items-center space-x-3 text-xs">
                                                <span className="text-slate-500">
                                                    {date.toLocaleDateString('en-IE', { day: 'numeric', month: 'short' })}
                                                </span>
                                                {onCooldown && (
                                                    <span className="text-yellow-500 flex items-center space-x-1">
                                                        <Clock size={11} />
                                                        <span>Active</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};
