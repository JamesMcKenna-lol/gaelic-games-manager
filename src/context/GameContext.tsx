import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SaveGame, Code, Tactics, Match, CompetitionPhase, SeasonRecord } from '../types';
import { generateTeams, generatePlayers, generateCompetition, generateNextKnockout } from '../utils/data';
import { v4 as uuidv4 } from 'uuid';

interface GameContextType {
    save: SaveGame | null;
    startNewCareer: (managerName: string, code: Code, countyName: string) => void;
    startNewSeason: () => void;
    advancePhase: (nextPhase: CompetitionPhase) => void;
    loadGame: () => void;
    saveGame: () => void;
    hasSave: boolean;
    updateMatch: (updatedMatch: Match) => void;
    saveTactics: (tactics: Tactics) => void;
    updateManagerName: (name: string) => void;
    resetCareer: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Build a SeasonRecord from the current save state before rolling over
const buildSeasonRecord = (save: SaveGame): SeasonRecord => {
    const teamId = save.teamId;
    const groupComp = save.competitions.find(c => (c.phase ?? 'group') === 'group');
    const lastComp = save.competitions[save.competitions.length - 1];

    let groupPos = 0, groupW = 0, groupD = 0, groupL = 0;

    if (groupComp) {
        const playerGroupFixture = groupComp.fixtures.find(
            f => f.homeTeamId === teamId || f.awayTeamId === teamId
        );
        const groupId = playerGroupFixture?.groupId;
        const groupFixtures = groupComp.fixtures.filter(f => f.groupId === groupId);
        const groupTeamIds = [...new Set(groupFixtures.flatMap(f => [f.homeTeamId, f.awayTeamId]))];

        const standings = groupTeamIds.map(tid => {
            let W = 0, D = 0, L = 0, GF = 0, GA = 0;
            groupFixtures.filter(f => f.played && f.result).forEach(f => {
                const hT = f.result!.homeScore.goals * 3 + f.result!.homeScore.points;
                const aT = f.result!.awayScore.goals * 3 + f.result!.awayScore.points;
                if (f.homeTeamId === tid) {
                    GF += hT; GA += aT;
                    if (hT > aT) W++; else if (hT === aT) D++; else L++;
                } else if (f.awayTeamId === tid) {
                    GF += aT; GA += hT;
                    if (aT > hT) W++; else if (aT === hT) D++; else L++;
                }
            });
            return { tid, Pts: W * 2 + D, GD: GF - GA, W, D, L };
        }).sort((a, b) => b.Pts - a.Pts || b.GD - a.GD);

        const playerRow = standings.find(r => r.tid === teamId);
        groupPos = standings.findIndex(r => r.tid === teamId) + 1;
        groupW = playerRow?.W ?? 0;
        groupD = playerRow?.D ?? 0;
        groupL = playerRow?.L ?? 0;
    }

    const lastPhase = lastComp?.phase ?? 'group';
    const groupDone = groupComp
        ? groupComp.fixtures.filter(f => f.homeTeamId === teamId || f.awayTeamId === teamId).every(f => f.played)
        : false;
    const qualified = groupPos > 0 && groupPos <= 2 && groupDone;

    // Determine furthest phase reached
    let furthestPhase: SeasonRecord['furthestPhase'] = 'eliminated';
    if (save.competitions.length > 1 || (lastPhase === 'group' && qualified)) {
        // Check if they won each knockout they entered
        for (const comp of save.competitions) {
            if ((comp.phase ?? 'group') === 'group') continue;
            const playerFixture = comp.fixtures.find(
                f => f.homeTeamId === teamId || f.awayTeamId === teamId
            );
            if (playerFixture?.played && playerFixture.result) {
                const isHome = playerFixture.homeTeamId === teamId;
                const myT = isHome
                    ? playerFixture.result.homeScore.goals * 3 + playerFixture.result.homeScore.points
                    : playerFixture.result.awayScore.goals * 3 + playerFixture.result.awayScore.points;
                const oppT = isHome
                    ? playerFixture.result.awayScore.goals * 3 + playerFixture.result.awayScore.points
                    : playerFixture.result.homeScore.goals * 3 + playerFixture.result.homeScore.points;
                if (myT > oppT) {
                    furthestPhase = comp.phase;
                } else {
                    furthestPhase = comp.phase; // lost here, this is the furthest they got
                    break;
                }
            }
        }
        if (furthestPhase === 'eliminated' && qualified) furthestPhase = 'group';
    }

    const allIrelandWinner = lastPhase === 'all-ireland-final' && (() => {
        const finalComp = save.competitions.find(c => c.phase === 'all-ireland-final');
        if (!finalComp) return false;
        const f = finalComp.fixtures.find(fx => fx.homeTeamId === teamId || fx.awayTeamId === teamId);
        if (!f?.played || !f.result) return false;
        const isHome = f.homeTeamId === teamId;
        const myT = isHome ? f.result.homeScore.goals * 3 + f.result.homeScore.points : f.result.awayScore.goals * 3 + f.result.awayScore.points;
        const oppT = isHome ? f.result.awayScore.goals * 3 + f.result.awayScore.points : f.result.homeScore.goals * 3 + f.result.homeScore.points;
        return myT > oppT;
    })();

    const provincialWinner = (allIrelandWinner || lastPhase === 'all-ireland-sf' || lastPhase === 'all-ireland-final') && (() => {
        const finalComp = save.competitions.find(c => c.phase === 'provincial-final');
        if (!finalComp) return false;
        const f = finalComp.fixtures.find(fx => fx.homeTeamId === teamId || fx.awayTeamId === teamId);
        if (!f?.played || !f.result) return false;
        const isHome = f.homeTeamId === teamId;
        const myT = isHome ? f.result.homeScore.goals * 3 + f.result.homeScore.points : f.result.awayScore.goals * 3 + f.result.awayScore.points;
        const oppT = isHome ? f.result.awayScore.goals * 3 + f.result.awayScore.points : f.result.homeScore.goals * 3 + f.result.homeScore.points;
        return myT > oppT;
    })();

    const playerTeam = save.teams.find(t => t.id === teamId);

    return {
        season: save.season,
        county: playerTeam?.county ?? '',
        code: save.code,
        groupPos,
        groupW,
        groupD,
        groupL,
        furthestPhase,
        allIrelandWinner,
        provincialWinner,
    };
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [save, setSave] = useState<SaveGame | null>(null);
    const [hasSave, setHasSave] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('ggm_save');
        if (stored) setHasSave(true);
    }, []);

    useEffect(() => {
        if (save) localStorage.setItem('ggm_save', JSON.stringify(save));
    }, [save]);

    const startNewCareer = (managerName: string, code: Code, countyName: string) => {
        const teams = generateTeams(code);
        const players = teams.flatMap(t => generatePlayers(t));
        const playerTeam = teams.find(t => t.county === countyName);
        if (!playerTeam) return;
        const competition = generateCompetition(teams, playerTeam.id, code);
        const newSave: SaveGame = {
            id: uuidv4(),
            managerName,
            teamId: playerTeam.id,
            code,
            date: new Date().toISOString(),
            season: 2024,
            competitions: [competition],
            teams,
            players,
            careerHistory: [],
        };
        setSave(newSave);
        setHasSave(true);
    };

    const loadGame = () => {
        const stored = localStorage.getItem('ggm_save');
        if (stored) {
            const parsed = JSON.parse(stored) as SaveGame;
            // Migrate old saves: ensure required fields exist
            if (!parsed.careerHistory) parsed.careerHistory = [];
            parsed.competitions = parsed.competitions.map(c => ({
                ...c,
                phase: c.phase ?? 'group',
            }));
            setSave(parsed);
        }
    };

    const saveGame = () => {
        if (save) localStorage.setItem('ggm_save', JSON.stringify(save));
    };

    const updateMatch = (updatedMatch: Match) => {
        setSave(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                competitions: prev.competitions.map(comp => ({
                    ...comp,
                    fixtures: comp.fixtures.map(f =>
                        f.id === updatedMatch.id ? updatedMatch : f
                    ),
                })),
            };
        });
    };

    const advancePhase = (nextPhase: CompetitionPhase) => {
        setSave(prev => {
            if (!prev) return prev;
            const playerTeam = prev.teams.find(t => t.id === prev.teamId);
            if (!playerTeam) return prev;
            const nextComp = generateNextKnockout(nextPhase, playerTeam, prev.teams, prev.teamId, prev.code);
            return {
                ...prev,
                competitions: [...prev.competitions, nextComp],
            };
        });
    };

    const startNewSeason = () => {
        setSave(prev => {
            if (!prev) return prev;
            const record = buildSeasonRecord(prev);
            const newCompetition = generateCompetition(prev.teams, prev.teamId, prev.code);
            return {
                ...prev,
                season: prev.season + 1,
                competitions: [newCompetition],
                careerHistory: [...(prev.careerHistory ?? []), record],
            };
        });
    };

    const saveTactics = (tactics: Tactics) => {
        setSave(prev => prev ? { ...prev, tactics } : prev);
    };

    const updateManagerName = (name: string) => {
        setSave(prev => prev ? { ...prev, managerName: name } : prev);
    };

    const resetCareer = () => {
        localStorage.removeItem('ggm_save');
        setSave(null);
        setHasSave(false);
    };

    return (
        <GameContext.Provider value={{ save, startNewCareer, startNewSeason, advancePhase, loadGame, saveGame, hasSave, updateMatch, saveTactics, updateManagerName, resetCareer }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) throw new Error('useGame must be used within a GameProvider');
    return context;
};
