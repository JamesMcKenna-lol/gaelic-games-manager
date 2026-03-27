export type Code = 'Football' | 'Hurling' | 'Camogie' | 'Ladies Football';

export type CompetitionPhase =
    | 'group'
    | 'provincial-sf'
    | 'provincial-final'
    | 'all-ireland-sf'
    | 'all-ireland-final';

export interface Tactics {
    formation: string;
    attackingStyle: number; // 0-100, 0=defensive 100=attacking
    passingStyle: number;   // 0-100, 0=short 100=direct
    pressing: number;       // 0-100, 0=low 100=high
}

export interface Team {
    id: string;
    name: string;
    county: string;
    code: Code;
    rating: number; // 1-100
    colors: [string, string]; // Primary, Secondary hex codes
    stadium: string;
    stadiumLocation: string;
    stadiumCapacity: number;
}

export interface PlayerAttributes {
    speed: number;
    strength: number;
    stamina: number;
    skill: number;
    shooting: number;
    passing: number;
    tackling: number;
    intelligence: number;
}

export interface Player {
    id: string;
    teamId: string;
    name: string;
    age: number;
    position: string; // GK, DEF, MID, FWD
    attributes: PlayerAttributes;
    overall: number;
    morale: number; // 0-100
    fitness: number; // 0-100
}

export interface MatchEvent {
    minute: number;
    type: 'goal' | 'point' | 'wide' | 'card' | 'sub' | 'whistle';
    teamId?: string;
    playerId?: string;
    text: string;
}

export interface MatchStats {
    homeScore: { goals: number; points: number };
    awayScore: { goals: number; points: number };
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    wides: { home: number; away: number };
}

export interface Match {
    id: string;
    competitionId: string;
    homeTeamId: string;
    awayTeamId: string;
    date: string;
    played: boolean;
    result?: MatchStats;
    events: MatchEvent[];
    groupId?: number;
    venue: string;
    venueCapacity: number;
}

export interface Competition {
    id: string;
    name: string;
    type: 'league' | 'championship';
    phase: CompetitionPhase;
    province?: string;
    teams: string[]; // Team IDs
    fixtures: Match[];
}

export interface SeasonRecord {
    season: number;
    county: string;
    code: Code;
    groupPos: number;
    groupW: number;
    groupD: number;
    groupL: number;
    furthestPhase: CompetitionPhase | 'eliminated';
    allIrelandWinner: boolean;
    provincialWinner: boolean;
}

export type TrainingFocus = 'fitness' | 'skills' | 'tactical' | 'strength' | 'speed' | 'rest';
export type TrainingIntensity = 'light' | 'medium' | 'hard';

export interface TrainingSchedule {
    focus: TrainingFocus;
    intensity: TrainingIntensity;
    sessionsPerWeek: number; // 1-5
}

export type ScandalSeverity = 'minor' | 'moderate' | 'major' | 'catastrophic';
export type ScandalTarget = 'team' | 'player' | 'manager';

export interface ScandalEvent {
    id: string;
    title: string;
    description: string;
    severity: ScandalSeverity;
    moraleImpact: number; // negative number
    target: ScandalTarget;
    affectedPlayerIds?: string[]; // if target === 'player', which players
    triggeredAfterMatchId: string;
    season: number;
    dismissed: boolean;
}

export interface ClubhouseActivity {
    id: string;
    name: string;
    irishName: string;
    description: string;
    moraleBoost: number;       // positive
    fitnessImpact: number;     // negative (drain)
    trainingEffectDays: number; // days of reduced training effectiveness
    cooldownDays: number;
    cost: 'low' | 'medium' | 'high';
}

export interface ActiveClubhouseEffect {
    activityId: string;
    appliedDate: string; // ISO date
    trainingEffectDays: number;
    cooldownUntil: string; // ISO date
}

export interface SaveGame {
    id: string;
    managerName: string;
    teamId: string;
    code: Code;
    date: string;
    season: number;
    competitions: Competition[];
    teams: Team[];
    players: Player[];
    tactics?: Tactics;
    careerHistory: SeasonRecord[];
    training?: TrainingSchedule;
    scandals: ScandalEvent[];
    activeClubhouseEffects: ActiveClubhouseEffect[];
    lastClubhouseActivity?: string; // activityId
}
