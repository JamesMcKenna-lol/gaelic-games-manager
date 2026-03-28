import type { TrainingSchedule, Player, TrainingFocus, TrainingIntensity } from '../types';

// How much each focus improves each attribute per week (base)
const FOCUS_GAINS: Record<TrainingFocus, Partial<Record<keyof Player['attributes'], number>>> = {
    fitness:   { stamina: 1.2, strength: 0.4, speed: 0.3 },
    skills:    { skill: 1.0, shooting: 0.8, passing: 0.7 },
    tactical:  { intelligence: 1.2, passing: 0.4 },
    strength:  { strength: 1.2, stamina: 0.5 },
    speed:     { speed: 1.3, stamina: 0.4 },
    rest:      {}, // no gains — recovery only
};

// Intensity multipliers
const INTENSITY_MULTIPLIER: Record<TrainingIntensity, number> = {
    light: 0.6,
    medium: 1.0,
    hard: 1.5,
};

// Morale drain per week (negative values)
const MORALE_DRAIN: Record<TrainingIntensity, Record<number, number>> = {
    light:  { 1: 0, 2: 0,  3: -1, 4: -2, 5: -3 },
    medium: { 1: 0, 2: -1, 3: -3, 4: -5, 5: -8 },
    hard:   { 1: -2, 2: -5, 3: -9, 4: -14, 5: -20 },
};

export interface TrainingProjection {
    attributeGains: Partial<Record<keyof Player['attributes'], number>>;
    weeklyMoraleDrain: number;
    overallGainPerWeek: number;
}

export const getTrainingProjection = (schedule: TrainingSchedule): TrainingProjection => {
    const baseGains = FOCUS_GAINS[schedule.focus];
    const multiplier = INTENSITY_MULTIPLIER[schedule.intensity] * (schedule.sessionsPerWeek / 3);
    const attributeGains: Partial<Record<keyof Player['attributes'], number>> = {};
    let totalGain = 0;

    for (const [attr, base] of Object.entries(baseGains)) {
        const gain = parseFloat((base * multiplier).toFixed(2));
        attributeGains[attr as keyof Player['attributes']] = gain;
        totalGain += gain;
    }

    const moraleDrain = MORALE_DRAIN[schedule.intensity][schedule.sessionsPerWeek] ?? 0;

    return {
        attributeGains,
        weeklyMoraleDrain: moraleDrain,
        overallGainPerWeek: parseFloat((totalGain / 8).toFixed(3)), // average across 8 attributes
    };
};

// Apply one week of training to a player — returns updated player
export const applyWeeklyTraining = (
    player: Player,
    schedule: TrainingSchedule,
    clubhouseEffectActive: boolean,
): Player => {
    if (schedule.focus === 'rest') {
        // Rest week: recover morale and fitness
        return {
            ...player,
            morale: Math.min(100, player.morale + 5),
            fitness: Math.min(100, player.fitness + 3),
        };
    }

    const { attributeGains, weeklyMoraleDrain } = getTrainingProjection(schedule);
    const effectMultiplier = clubhouseEffectActive ? 0.6 : 1.0; // clubhouse hangovers reduce effectiveness

    const updatedAttrs = { ...player.attributes };
    for (const [attr, gain] of Object.entries(attributeGains)) {
        const key = attr as keyof Player['attributes'];
        // Diminishing returns: harder to improve high-rated attributes
        const current = updatedAttrs[key];
        const diminishing = current >= 90 ? 0.3 : current >= 80 ? 0.6 : current >= 70 ? 0.8 : 1.0;
        updatedAttrs[key] = Math.min(99, current + gain * effectMultiplier * diminishing);
    }

    // Recalculate overall as average of all attributes
    const vals = Object.values(updatedAttrs);
    const overall = Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);

    // Fitness: hard training drains it a little
    const fitnessDrain = schedule.intensity === 'hard' ? -schedule.sessionsPerWeek * 1.5 : 0;

    return {
        ...player,
        attributes: updatedAttrs,
        overall,
        morale: Math.max(0, Math.min(100, player.morale + weeklyMoraleDrain)),
        fitness: Math.max(0, Math.min(100, player.fitness + fitnessDrain)),
    };
};

export const FOCUS_LABELS: Record<TrainingFocus, { irish: string; english: string; description: string }> = {
    fitness:   { irish: 'Aclaíocht',   english: 'Fitness',   description: 'Improve stamina, strength and speed' },
    skills:    { irish: 'Scileanna',   english: 'Skills',    description: 'Sharpen shooting, passing and skill' },
    tactical:  { irish: 'Tacaíocht',   english: 'Tactical',  description: 'Build intelligence and passing play' },
    strength:  { irish: 'Neart',       english: 'Strength',  description: 'Build muscle and physical presence' },
    speed:     { irish: 'Luas',        english: 'Speed',     description: 'Explosive pace and acceleration' },
    rest:      { irish: 'Scíth',       english: 'Rest',      description: 'Recover morale and fitness — no gains' },
};

export const INTENSITY_LABELS: Record<TrainingIntensity, { irish: string; english: string }> = {
    light:  { irish: 'Éadrom',  english: 'Light'  },
    medium: { irish: 'Measartha', english: 'Medium' },
    hard:   { irish: 'Crua',    english: 'Hard'   },
};
