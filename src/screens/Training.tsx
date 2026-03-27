import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { Layout } from '../components/Layout';
import { Dumbbell, TrendingUp, AlertTriangle, CheckCircle, Zap } from 'lucide-react';
import type { TrainingFocus, TrainingIntensity, TrainingSchedule } from '../types';
import { getTrainingProjection, FOCUS_LABELS, INTENSITY_LABELS } from '../utils/training';
import clsx from 'clsx';

const FOCUSES: TrainingFocus[] = ['fitness', 'skills', 'tactical', 'strength', 'speed', 'rest'];
const INTENSITIES: TrainingIntensity[] = ['light', 'medium', 'hard'];

const FOCUS_ICON: Record<TrainingFocus, string> = {
    fitness: '🏃',
    skills: '🎯',
    tactical: '🧠',
    strength: '💪',
    speed: '⚡',
    rest: '😴',
};

export const Training: React.FC = () => {
    const { save, setTraining, applyTrainingWeek } = useGame();

    const [focus, setFocus] = useState<TrainingFocus>(save?.training?.focus ?? 'fitness');
    const [intensity, setIntensity] = useState<TrainingIntensity>(save?.training?.intensity ?? 'medium');
    const [sessions, setSessions] = useState<number>(save?.training?.sessionsPerWeek ?? 3);
    const [applied, setApplied] = useState(false);

    if (!save) return null;

    const schedule: TrainingSchedule = { focus, intensity, sessionsPerWeek: sessions };
    const projection = getTrainingProjection(schedule);

    const teamPlayers = save.players.filter(p => p.teamId === save.teamId);
    const avgMorale = teamPlayers.length > 0
        ? Math.round(teamPlayers.reduce((s, p) => s + p.morale, 0) / teamPlayers.length) : 0;
    const avgFitness = teamPlayers.length > 0
        ? Math.round(teamPlayers.reduce((s, p) => s + p.fitness, 0) / teamPlayers.length) : 0;

    const currentSchedule = save.training;
    const isRestFocus = focus === 'rest';

    const handleSave = () => {
        setTraining(schedule);
    };

    const handleApplyWeek = () => {
        setTraining(schedule);
        applyTrainingWeek();
        setApplied(true);
        setTimeout(() => setApplied(false), 3000);
    };

    const moraleAfter = Math.max(0, Math.min(100, avgMorale + (projection.weeklyMoraleDrain ?? 0)));
    const moraleDelta = moraleAfter - avgMorale;

    return (
        <Layout>
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Traenáil</h1>
                    <p className="text-slate-400 text-sm">training schedule</p>
                </div>

                {/* Current squad stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Squad Morale
                            <span className="text-slate-600 font-normal normal-case"> · meon foirne</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{avgMorale}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div
                                className={clsx('h-1.5 rounded-full transition-all',
                                    avgMorale >= 70 ? 'bg-emerald-500' : avgMorale >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                                style={{ width: `${avgMorale}%` }}
                            />
                        </div>
                    </div>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <div className="text-xs text-slate-500 uppercase tracking-wide mb-1">Squad Fitness
                            <span className="text-slate-600 font-normal normal-case"> · aclaíocht</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{avgFitness}%</div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2">
                            <div
                                className={clsx('h-1.5 rounded-full transition-all',
                                    avgFitness >= 70 ? 'bg-purple-500' : avgFitness >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                )}
                                style={{ width: `${avgFitness}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Current active schedule */}
                {currentSchedule && (
                    <div className="bg-emerald-900/20 border border-emerald-800 rounded-xl p-4">
                        <div className="flex items-center space-x-2 text-emerald-400 text-sm font-medium">
                            <CheckCircle size={16} />
                            <span>Active schedule: {FOCUS_LABELS[currentSchedule.focus].english} ·
                                {' '}{INTENSITY_LABELS[currentSchedule.intensity].english} ·
                                {' '}{currentSchedule.sessionsPerWeek} sessions/week</span>
                        </div>
                    </div>
                )}

                {/* Focus selection */}
                <div>
                    <div className="text-sm font-semibold text-slate-300 mb-3">
                        Training Focus <span className="text-slate-600 font-normal">· fócas traenála</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {FOCUSES.map(f => {
                            const label = FOCUS_LABELS[f];
                            const isSelected = focus === f;
                            return (
                                <button
                                    key={f}
                                    onClick={() => setFocus(f)}
                                    className={clsx(
                                        'p-4 rounded-xl border text-left transition-all',
                                        isSelected
                                            ? 'bg-emerald-900/30 border-emerald-600 text-white'
                                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-600'
                                    )}
                                >
                                    <div className="text-2xl mb-1">{FOCUS_ICON[f]}</div>
                                    <div className="font-bold text-sm">{label.irish}</div>
                                    <div className="text-xs opacity-60">{label.english}</div>
                                    <div className="text-xs text-slate-500 mt-1 leading-tight">{label.description}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Intensity */}
                {!isRestFocus && (
                    <div>
                        <div className="text-sm font-semibold text-slate-300 mb-3">
                            Intensity <span className="text-slate-600 font-normal">· déine</span>
                        </div>
                        <div className="flex gap-3">
                            {INTENSITIES.map(lvl => (
                                <button
                                    key={lvl}
                                    onClick={() => setIntensity(lvl)}
                                    className={clsx(
                                        'flex-1 py-3 px-4 rounded-xl border font-medium transition-all text-sm',
                                        intensity === lvl
                                            ? lvl === 'hard'
                                                ? 'bg-red-900/30 border-red-700 text-red-300'
                                                : lvl === 'medium'
                                                ? 'bg-yellow-900/20 border-yellow-700 text-yellow-300'
                                                : 'bg-emerald-900/20 border-emerald-700 text-emerald-300'
                                            : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'
                                    )}
                                >
                                    <div className="font-bold">{INTENSITY_LABELS[lvl].irish}</div>
                                    <div className="text-xs opacity-60">{INTENSITY_LABELS[lvl].english}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sessions per week */}
                {!isRestFocus && (
                    <div>
                        <div className="text-sm font-semibold text-slate-300 mb-3">
                            Sessions per Week <span className="text-slate-600 font-normal">· seisiúin sa tseachtain</span>
                            <span className="ml-2 text-emerald-400 font-bold">{sessions}</span>
                        </div>
                        <input
                            type="range"
                            min={1}
                            max={5}
                            value={sessions}
                            onChange={e => setSessions(Number(e.target.value))}
                            className="w-full accent-emerald-500"
                        />
                        <div className="flex justify-between text-xs text-slate-600 mt-1">
                            <span>1 · easy week</span>
                            <span>3 · standard</span>
                            <span>5 · gruelling</span>
                        </div>
                    </div>
                )}

                {/* Projection panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                    <div className="text-sm font-semibold text-slate-300 flex items-center space-x-2">
                        <TrendingUp size={16} className="text-emerald-500" />
                        <span>Weekly Projection <span className="text-slate-600 font-normal">· réamhaisnéis seachtainiúil</span></span>
                    </div>

                    {isRestFocus ? (
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-emerald-400">
                                <span>Morale recovery</span>
                                <span className="font-bold">+5 pts</span>
                            </div>
                            <div className="flex justify-between text-purple-400">
                                <span>Fitness recovery</span>
                                <span className="font-bold">+3 pts</span>
                            </div>
                            <div className="flex justify-between text-slate-500">
                                <span>Attribute gains</span>
                                <span>None</span>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Attribute gains */}
                            {Object.entries(projection.attributeGains).length > 0 && (
                                <div className="space-y-1.5">
                                    <div className="text-xs text-slate-500 uppercase tracking-wide">Attribute gains per week</div>
                                    {Object.entries(projection.attributeGains).map(([attr, gain]) => (
                                        <div key={attr} className="flex justify-between text-sm">
                                            <span className="text-slate-400 capitalize">{attr}</span>
                                            <span className="text-emerald-400 font-mono">+{gain?.toFixed(2)}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Morale impact */}
                            <div className="pt-2 border-t border-slate-800 space-y-1.5">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-400 flex items-center space-x-1">
                                        <span>Morale impact · meon</span>
                                    </span>
                                    <span className={clsx('font-mono font-bold',
                                        moraleDelta < -10 ? 'text-red-400' : moraleDelta < 0 ? 'text-yellow-400' : 'text-emerald-400'
                                    )}>
                                        {moraleDelta > 0 ? '+' : ''}{moraleDelta} pts
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-slate-500">
                                    <span>Squad morale: {avgMorale}% → {moraleAfter}%</span>
                                    {moraleDelta <= -10 && (
                                        <span className="flex items-center space-x-1 text-red-400 text-xs">
                                            <AlertTriangle size={12} />
                                            <span>High drain!</span>
                                        </span>
                                    )}
                                </div>
                            </div>

                            {intensity === 'hard' && (
                                <div className="flex items-start space-x-2 p-3 bg-red-900/20 border border-red-800 rounded-lg text-xs text-red-300">
                                    <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                    <span>Hard training will also drain player fitness. Use sparingly before big matches.</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors flex flex-col items-center"
                    >
                        <span>Sábháil Sceideal</span>
                        <span className="text-xs font-normal opacity-50">save schedule</span>
                    </button>
                    <button
                        onClick={handleApplyWeek}
                        className={clsx(
                            'flex-1 py-3 px-4 rounded-xl font-bold transition-all flex flex-col items-center',
                            applied
                                ? 'bg-emerald-700 text-emerald-200'
                                : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02]'
                        )}
                    >
                        {applied ? (
                            <>
                                <span className="flex items-center space-x-1"><CheckCircle size={16} /><span>Applied!</span></span>
                                <span className="text-xs font-normal opacity-50">traenáil curtha i bhfeidhm</span>
                            </>
                        ) : (
                            <>
                                <span className="flex items-center space-x-1"><Zap size={16} /><span>Apply Training Week</span></span>
                                <span className="text-xs font-normal opacity-50">cuir seachtain traenála i bhfeidhm</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Player morale table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                    <div className="text-sm font-semibold text-slate-300 mb-4 flex items-center space-x-2">
                        <Dumbbell size={16} className="text-emerald-500" />
                        <span>Squad Status <span className="text-slate-600 font-normal">· staid na foirne</span></span>
                    </div>
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                        {teamPlayers.sort((a, b) => b.overall - a.overall).map(p => (
                            <div key={p.id} className="flex items-center gap-3 text-sm">
                                <span className="text-slate-500 w-6 text-xs font-mono">{p.position}</span>
                                <span className="flex-1 text-slate-200 font-medium truncate">{p.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-500 w-16 text-right">
                                        <span className={clsx(p.morale >= 70 ? 'text-emerald-400' : p.morale >= 40 ? 'text-yellow-400' : 'text-red-400')}>
                                            M {Math.round(p.morale)}
                                        </span>
                                    </span>
                                    <span className="text-xs text-slate-500 w-16 text-right">
                                        <span className={clsx(p.fitness >= 70 ? 'text-purple-400' : p.fitness >= 40 ? 'text-yellow-400' : 'text-red-400')}>
                                            F {Math.round(p.fitness)}
                                        </span>
                                    </span>
                                    <span className="text-xs text-slate-400 w-8 text-right font-mono">{p.overall}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};
