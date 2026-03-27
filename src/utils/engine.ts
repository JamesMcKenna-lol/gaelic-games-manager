import type { Team, Player, Match, MatchEvent, MatchStats } from '../types';

const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const GOAL_TEXTS = (scorer: string, team: string) => [
    `CÚL! CÚL! CÚL! ${scorer} ag scóráil do ${team}! Trí pointe!`,
    `CÚL iontach ó ${scorer}! ${team} ag dul chun cinn! Nach iontach!`,
    `GOÁIL! ${scorer} puts it in the back of the net for ${team}! Incredible scenes!`,
    `CÚL breá! ${scorer} curtha sa líon ag ${team}! Abair é!`,
    `GOAL! What a finish from ${scorer}! ${team} get three points!`,
    `CÚL! ${scorer} slots it low past the keeper! ${team} in front! Liúradh ón slua!`,
];

const POINT_TEXTS = (scorer: string, team: string) => [
    `Pointe! ${scorer} ag ardú an bhratach bhán do ${team}. Maith thú!`,
    `${scorer} raises the white flag for ${team}. Superb score!`,
    `Pointe! ${scorer} ag scaoileadh idir na cuaillí do ${team}.`,
    `${team} get a point. ${scorer} from out on the wing! Ceart go leor!`,
    `${scorer} fires over off his left for ${team}. Go hiontach!`,
    `Pointe maith! ${scorer} curtha os cionn an chroisbhealaigh ag ${team}.`,
];

const WIDE_TEXTS = (scorer: string, team: string) => [
    `Leathan! Díomá ar lucht tacaíochta ${team}.`,
    `${scorer} pulls it wide. ${team} will be disappointed.`,
    `Leathan ón gclé ag ${scorer}! Ní raibh sé ceart.`,
    `Wide from ${scorer}. The ${team} supporters groan.`,
    `Isteach sa slua! ${scorer} ag caitheamh leathan. Amú!`,
];

export const simulateMatch = (
    match: Match,
    homeTeam: Team,
    awayTeam: Team,
    homePlayers: Player[],
    awayPlayers: Player[]
): Match => {
    const events: MatchEvent[] = [];
    const stats: MatchStats = {
        homeScore: { goals: 0, points: 0 },
        awayScore: { goals: 0, points: 0 },
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        wides: { home: 0, away: 0 },
    };

    const throwInTexts = [
        `Liathróid isteach! Cuireann an réiteoir tús leis an gcluiche! ${homeTeam.name} vs ${awayTeam.name}.`,
        `Throw-in! The match is underway. ${homeTeam.name} vs ${awayTeam.name}. Tús maith, leath na hoibre!`,
    ];
    events.push({
        minute: 0,
        type: 'whistle',
        text: pick(throwInTexts),
    });

    const homeStrength = calculateTeamStrength(homeTeam, homePlayers) * 1.1;
    const awayStrength = calculateTeamStrength(awayTeam, awayPlayers);
    const totalStrength = homeStrength + awayStrength;

    stats.possession.home = Math.round((homeStrength / totalStrength) * 100);
    stats.possession.away = 100 - stats.possession.home;

    for (let minute = 1; minute <= 70; minute++) {
        if (Math.random() < 0.18) {
            const isHome = Math.random() < (homeStrength / totalStrength);
            const team = isHome ? homeTeam : awayTeam;
            const teamId = isHome ? match.homeTeamId : match.awayTeamId;
            const players = isHome ? homePlayers : awayPlayers;
            const score = isHome ? stats.homeScore : stats.awayScore;
            const scorer = players[Math.floor(Math.random() * Math.min(15, players.length))];

            const roll = Math.random();

            if (roll < 0.12) {
                score.goals++;
                if (isHome) stats.shots.home++; else stats.shots.away++;
                events.push({
                    minute,
                    type: 'goal',
                    teamId,
                    playerId: scorer.id,
                    text: pick(GOAL_TEXTS(scorer.name, team.name)),
                });
            } else if (roll < 0.52) {
                score.points++;
                if (isHome) stats.shots.home++; else stats.shots.away++;
                events.push({
                    minute,
                    type: 'point',
                    teamId,
                    playerId: scorer.id,
                    text: pick(POINT_TEXTS(scorer.name, team.name)),
                });
            } else if (roll < 0.72) {
                if (isHome) { stats.wides.home++; stats.shots.home++; }
                else { stats.wides.away++; stats.shots.away++; }
                events.push({
                    minute,
                    type: 'wide',
                    teamId,
                    playerId: scorer.id,
                    text: pick(WIDE_TEXTS(scorer.name, team.name)),
                });
            }
        }

        if (minute === 35) {
            events.push({
                minute,
                type: 'whistle',
                text: `Leath-am! ${homeTeam.name} ${formatScore(stats.homeScore)} — ${awayTeam.name} ${formatScore(stats.awayScore)}`,
            });
        }
    }

    events.push({
        minute: 70,
        type: 'whistle',
        text: `Am suas! Críochnaíonn an cluiche. ${homeTeam.name} ${formatScore(stats.homeScore)} — ${awayTeam.name} ${formatScore(stats.awayScore)}`,
    });

    return {
        ...match,
        played: true,
        result: stats,
        events,
    };
};

const calculateTeamStrength = (team: Team, players: Player[]): number => {
    const top15 = players.slice(0, 15);
    const avg = top15.reduce((sum, p) => sum + p.overall, 0) / Math.max(top15.length, 1);
    return (team.rating + avg) / 2;
};

export const formatScore = (score: { goals: number; points: number }): string => {
    const total = score.goals * 3 + score.points;
    return `${score.goals}-${String(score.points).padStart(2, '0')} (${total})`;
};

export const getWinner = (
    homeScore: { goals: number; points: number },
    awayScore: { goals: number; points: number }
): 'home' | 'away' | 'draw' => {
    const h = homeScore.goals * 3 + homeScore.points;
    const a = awayScore.goals * 3 + awayScore.points;
    if (h > a) return 'home';
    if (a > h) return 'away';
    return 'draw';
};
