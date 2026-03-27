import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SaveGame, Code, Tactics, Match } from '../types';
import { generateTeams, generatePlayers, generateCompetition } from '../utils/data';
import { v4 as uuidv4 } from 'uuid';

interface GameContextType {
    save: SaveGame | null;
    // countyName is used to find the player's team after generation
    startNewCareer: (managerName: string, code: Code, countyName: string) => void;
    startNewSeason: () => void;
    loadGame: () => void;
    saveGame: () => void;
    hasSave: boolean;
    updateMatch: (updatedMatch: Match) => void;
    saveTactics: (tactics: Tactics) => void;
    updateManagerName: (name: string) => void;
    resetCareer: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [save, setSave] = useState<SaveGame | null>(null);
    const [hasSave, setHasSave] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('ggm_save');
        if (stored) {
            setHasSave(true);
        }
    }, []);

    // Auto-save whenever save state changes
    useEffect(() => {
        if (save) {
            localStorage.setItem('ggm_save', JSON.stringify(save));
        }
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
        };

        setSave(newSave);
        setHasSave(true);
    };

    const loadGame = () => {
        const stored = localStorage.getItem('ggm_save');
        if (stored) {
            setSave(JSON.parse(stored));
        }
    };

    const saveGame = () => {
        if (save) {
            localStorage.setItem('ggm_save', JSON.stringify(save));
        }
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

    const startNewSeason = () => {
        setSave(prev => {
            if (!prev) return prev;
            // Keep existing teams & players, just generate a fresh competition and bump season
            const newCompetition = generateCompetition(prev.teams, prev.teamId, prev.code);
            return {
                ...prev,
                season: prev.season + 1,
                competitions: [newCompetition],
            };
        });
    };

    const saveTactics = (tactics: Tactics) => {
        setSave(prev => {
            if (!prev) return prev;
            return { ...prev, tactics };
        });
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
        <GameContext.Provider value={{ save, startNewCareer, startNewSeason, loadGame, saveGame, hasSave, updateMatch, saveTactics, updateManagerName, resetCareer }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};
