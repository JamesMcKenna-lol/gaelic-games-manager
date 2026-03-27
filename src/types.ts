export type Code = 'Football' | 'Hurling' | 'Camogie' | 'Ladies Football';

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
    teams: string[]; // Team IDs
    fixtures: Match[];
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
}
