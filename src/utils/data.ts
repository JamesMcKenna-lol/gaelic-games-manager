import { v4 as uuidv4 } from 'uuid';
import type { Team, Player, PlayerAttributes, Code, Competition, Match } from '../types';

const COUNTIES = [
    'Antrim', 'Armagh', 'Carlow', 'Cavan', 'Clare', 'Cork', 'Derry', 'Donegal', 'Down', 'Dublin',
    'Fermanagh', 'Galway', 'Kerry', 'Kildare', 'Kilkenny', 'Laois', 'Leitrim', 'Limerick', 'Longford',
    'Louth', 'Mayo', 'Meath', 'Monaghan', 'Offaly', 'Roscommon', 'Sligo', 'Tipperary', 'Tyrone',
    'Waterford', 'Westmeath', 'Wexford', 'Wicklow', 'London', 'New York'
];

// County colors (primary, secondary)
const COUNTY_COLORS: Record<string, [string, string]> = {
    'Antrim':    ['#FFCC00', '#003087'],
    'Armagh':    ['#FF6600', '#FFFFFF'],
    'Carlow':    ['#CC0000', '#00843D'],
    'Cavan':     ['#5B9BD5', '#FFFFFF'],
    'Clare':     ['#FFCC00', '#003087'],
    'Cork':      ['#CC0000', '#FFFFFF'],
    'Derry':     ['#CC0000', '#FFFFFF'],
    'Donegal':   ['#FFD700', '#00843D'],
    'Down':      ['#CC0000', '#000000'],
    'Dublin':    ['#003087', '#87CEEB'],
    'Fermanagh': ['#00843D', '#FFFFFF'],
    'Galway':    ['#8B0000', '#CCCCCC'],
    'Kerry':     ['#006400', '#FFD700'],
    'Kildare':   ['#FFFFFF', '#008000'],
    'Kilkenny':  ['#000000', '#FFCC00'],
    'Laois':     ['#003087', '#FFFFFF'],
    'Leitrim':   ['#00843D', '#FFD700'],
    'Limerick':  ['#00843D', '#FFFFFF'],
    'Longford':  ['#003087', '#FFCC00'],
    'Louth':     ['#CC0000', '#FFFFFF'],
    'Mayo':      ['#006400', '#CC0000'],
    'Meath':     ['#00843D', '#FFD700'],
    'Monaghan':  ['#FFFFFF', '#003087'],
    'Offaly':    ['#00843D', '#FFCC00'],
    'Roscommon': ['#FFD700', '#003087'],
    'Sligo':     ['#000000', '#FFFFFF'],
    'Tipperary': ['#003087', '#FFD700'],
    'Tyrone':    ['#FFFFFF', '#CC0000'],
    'Waterford': ['#003087', '#FFFFFF'],
    'Westmeath': ['#8B0000', '#FFFFFF'],
    'Wexford':   ['#7B00D4', '#FFCC00'],
    'Wicklow':   ['#003087', '#FFD700'],
    'London':    ['#CC0000', '#FFFFFF'],
    'New York':  ['#003087', '#FFFFFF'],
};

const COUNTY_STADIUMS: Record<string, { name: string; location: string; capacity: number }> = {
    'Antrim':    { name: 'Casement Park', location: 'Belfast', capacity: 32600 },
    'Armagh':    { name: 'Athletic Grounds', location: 'Armagh', capacity: 20000 },
    'Carlow':    { name: 'Dr Cullen Park', location: 'Carlow', capacity: 13000 },
    'Cavan':     { name: 'Kingspan Breffni Park', location: 'Cavan', capacity: 36000 },
    'Clare':     { name: 'Cusack Park', location: 'Ennis', capacity: 17000 },
    'Cork':      { name: 'Páirc Uí Chaoimh', location: 'Cork', capacity: 45000 },
    'Derry':     { name: 'Celtic Park', location: 'Derry', capacity: 18000 },
    'Donegal':   { name: 'MacCumhaill Park', location: 'Ballybofey', capacity: 16500 },
    'Down':      { name: 'Páirc Esler', location: 'Newry', capacity: 8000 },
    'Dublin':    { name: 'Parnell Park', location: 'Dublin', capacity: 8500 },
    'Fermanagh': { name: 'Brewster Park', location: 'Enniskillen', capacity: 18000 },
    'Galway':    { name: 'Pearse Stadium', location: 'Salthill, Galway', capacity: 35000 },
    'Kerry':     { name: 'Fitzgerald Stadium', location: 'Killarney', capacity: 43000 },
    'Kildare':   { name: "St Conleth's Park", location: 'Newbridge', capacity: 9000 },
    'Kilkenny':  { name: 'UPMC Nowlan Park', location: 'Kilkenny', capacity: 26000 },
    'Laois':     { name: "O'Moore Park", location: 'Portlaoise', capacity: 28000 },
    'Leitrim':   { name: 'Avant Money Páirc Seán Mac Diarmada', location: 'Carrick-on-Shannon', capacity: 13000 },
    'Limerick':  { name: 'TUS Gaelic Grounds', location: 'Limerick', capacity: 50000 },
    'Longford':  { name: 'Glennon Brothers Pearse Park', location: 'Longford', capacity: 10000 },
    'Louth':     { name: 'Páirc Mhuire', location: 'Ardee', capacity: 15000 },
    'Mayo':      { name: 'Hastings McHale Park', location: 'Castlebar', capacity: 39000 },
    'Meath':     { name: 'Páirc Tailteann', location: 'Navan', capacity: 18000 },
    'Monaghan':  { name: "St Tiernach's Park", location: 'Clones', capacity: 36000 },
    'Offaly':    { name: "Bord na Móna O'Connor Park", location: 'Tullamore', capacity: 17000 },
    'Roscommon': { name: 'Dr Hyde Park', location: 'Roscommon', capacity: 24000 },
    'Sligo':     { name: 'Markievicz Park', location: 'Sligo', capacity: 25000 },
    'Tipperary': { name: 'FBD Semple Stadium', location: 'Thurles', capacity: 45000 },
    'Tyrone':    { name: "O'Neills Healy Park", location: 'Omagh', capacity: 30000 },
    'Waterford': { name: 'Walsh Park', location: 'Waterford', capacity: 15000 },
    'Westmeath': { name: 'TEG Cusack Park', location: 'Mullingar', capacity: 11000 },
    'Wexford':   { name: 'UPMC Wexford Park', location: 'Wexford', capacity: 15000 },
    'Wicklow':   { name: 'County Grounds', location: 'Aughrim', capacity: 8000 },
    'London':    { name: 'McGovern Park', location: 'Ruislip, London', capacity: 3000 },
    'New York':  { name: 'Gaelic Park', location: 'The Bronx, New York', capacity: 10000 },
};

// Male first names — ~88% Irish/Gaelic, ~12% other
const MALE_FIRST_NAMES = [
    // Irish/Gaelic names
    'Ciarán', 'Seán', 'Tadhg', 'Cillian', 'Oisín', 'Fionn', 'Darragh', 'Cian',
    'Eoin', 'Rian', 'Conor', 'Séamus', 'Pádraig', 'Niall', 'Brendan', 'Colm',
    'Declan', 'Eoghan', 'Fiachra', 'Gearóid', 'Diarmuid', 'Cathal', 'Ronan',
    'Donal', 'Fergal', 'Tomás', 'Cormac', 'Rónán', 'Ruairí', 'Liam', 'Killian',
    'Lorcan', 'Naoise', 'Aodhán', 'Conn', 'Dara', 'Enda', 'Michéal', 'Paudie',
    'Seamus', 'Fintan', 'Conal', 'Brian', 'Fionnbarra', 'Peadar', 'Criostóir',
    'Donnchadha', 'Tarlach', 'Caoimhín', 'Páidí',
    // Other (~12%)
    'James', 'David', 'Daniel', 'Mark', 'Kevin', 'Shane',
];

// Female first names — ~88% Irish/Gaelic, ~12% other
const FEMALE_FIRST_NAMES = [
    // Irish/Gaelic names
    'Áine', 'Aoife', 'Caoimhe', 'Clíodhna', 'Dearbhla', 'Eimear', 'Fionnuala',
    'Gráinne', 'Labhaoise', 'Máire', 'Niamh', 'Orla', 'Siobhán', 'Sorcha',
    'Ciara', 'Mairéad', 'Bríd', 'Caitlín', 'Saoirse', 'Muireann', 'Aisling',
    'Treasa', 'Una', 'Róisín', 'Sinéad', 'Clodagh', 'Méabh', 'Sadhbh',
    'Eabha', 'Dervla', 'Fionnait', 'Rionach', 'Nóra', 'Bríde', 'Tara',
    'Aoibheann', 'Catriona', 'Muadhnait', 'Lasairfhíona', 'Orlaith',
    // Other (~12%)
    'Emma', 'Sarah', 'Rachel', 'Laura', 'Kate',
];

const SURNAMES = [
    "Murphy", "Kelly", "Byrne", "Ryan", "O'Brien", "Walsh", "O'Sullivan", "O'Connor",
    "McCarthy", "O'Neill", "Lynch", "Kennedy", "Gallagher", "Doherty", "Doyle",
    "Brennan", "Maguire", "Nolan", "Flynn", "Healy", "Cunningham", "Boyle",
    "Flanagan", "Sheridan", "Dunne", "Kavanagh", "Collins", "O'Leary", "O'Donnell",
    "Fitzgerald", "Foley", "McGrath", "Keane", "O'Shea", "Breen", "Maher",
    "Tierney", "Bradley", "McLoughlin", "MacMahon", "O'Rourke", "MacNamara",
    "O'Malley", "MacGinley", "O'Gorman", "Hogan", "Power", "Dwyer", "Cullen",
    "Reilly", "Moore", "Murray", "Quinn", "Burke", "Higgins", "O'Callaghan",
    "McGee", "McHugh", "Cassidy", "Canning", "Hartley", "O'Gara", "Mahon",
    "Deane", "Shefflin", "Lynskey", "Ó'Floinn", "Mac Cormaic",
];

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const isWomenCode = (code: Code) => code === 'Camogie' || code === 'Ladies Football';

const generateName = (code: Code): string => {
    const firstNames = isWomenCode(code) ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES;
    return `${getRandomItem(firstNames)} ${getRandomItem(SURNAMES)}`;
};

const generateAttributes = (position: string, teamRating: number): PlayerAttributes => {
    const base = teamRating / 2 + 30;
    const variance = () => Math.floor(Math.random() * 20) - 10;

    const attrs: PlayerAttributes = {
        speed: Math.min(99, Math.max(1, base + variance())),
        strength: Math.min(99, Math.max(1, base + variance())),
        stamina: Math.min(99, Math.max(1, base + variance())),
        skill: Math.min(99, Math.max(1, base + variance())),
        shooting: Math.min(99, Math.max(1, base + variance())),
        passing: Math.min(99, Math.max(1, base + variance())),
        tackling: Math.min(99, Math.max(1, base + variance())),
        intelligence: Math.min(99, Math.max(1, base + variance())),
    };

    if (position === 'GK') {
        attrs.intelligence += 10;
        attrs.passing += 5;
    } else if (position === 'DEF') {
        attrs.tackling += 15;
        attrs.strength += 10;
    } else if (position === 'MID') {
        attrs.stamina += 15;
        attrs.passing += 10;
    } else if (position === 'FWD') {
        attrs.shooting += 15;
        attrs.speed += 10;
    }

    (Object.keys(attrs) as (keyof PlayerAttributes)[]).forEach(key => {
        attrs[key] = Math.min(99, Math.max(1, attrs[key]));
    });

    return attrs;
};

const calculateOverall = (attrs: PlayerAttributes): number => {
    const sum = Object.values(attrs).reduce((a, b) => a + b, 0);
    return Math.floor(sum / 8);
};

export const generateTeams = (code: Code): Team[] => {
    return COUNTIES.map(county => {
        let rating = 60;
        if (['Dublin', 'Kerry', 'Mayo', 'Tyrone', 'Galway', 'Donegal'].includes(county) && code.includes('Football')) rating = 85;
        if (['Kilkenny', 'Limerick', 'Tipperary', 'Cork', 'Clare', 'Galway'].includes(county) && code === 'Hurling') rating = 85;
        if (['Cork', 'Dublin', 'Meath', 'Kerry'].includes(county) && code === 'Ladies Football') rating = 80;
        if (['Cork', 'Kilkenny', 'Galway', 'Tipperary'].includes(county) && code === 'Camogie') rating = 80;

        rating += Math.floor(Math.random() * 10) - 5;

        const colors = COUNTY_COLORS[county] ?? ['#1a1a1a', '#FFFFFF'];
        const stadium = COUNTY_STADIUMS[county] ?? { name: `${county} GAA Grounds`, location: county, capacity: 10000 };

        return {
            id: uuidv4(),
            name: county,
            county,
            code,
            rating,
            colors,
            stadium: stadium.name,
            stadiumLocation: stadium.location,
            stadiumCapacity: stadium.capacity,
        };
    });
};

export const generatePlayers = (team: Team): Player[] => {
    const players: Player[] = [];

    for (let i = 0; i < 30; i++) {
        let position = 'MID';
        if (i < 3) position = 'GK';
        else if (i < 10) position = 'DEF';
        else if (i < 20) position = 'MID';
        else position = 'FWD';

        const attrs = generateAttributes(position, team.rating);

        players.push({
            id: uuidv4(),
            teamId: team.id,
            name: generateName(team.code),
            age: Math.floor(Math.random() * 18) + 18,
            position,
            attributes: attrs,
            overall: calculateOverall(attrs),
            morale: 80 + Math.floor(Math.random() * 20),
            fitness: 90 + Math.floor(Math.random() * 10),
        });
    }

    return players;
};

export const generateCompetition = (teams: Team[], playerTeamId: string, code: Code): Competition => {
    const competitionId = uuidv4();

    // Shuffle teams, ensuring player's team ends up in group 0
    const shuffled = [...teams].sort(() => Math.random() - 0.5);
    const playerIdx = shuffled.findIndex(t => t.id === playerTeamId);
    if (playerIdx >= 5) {
        const swapIdx = Math.floor(Math.random() * 5);
        [shuffled[playerIdx], shuffled[swapIdx]] = [shuffled[swapIdx], shuffled[playerIdx]];
    }

    // Groups of 5 (last group may be 4)
    const groups: Team[][] = [];
    for (let i = 0; i < shuffled.length; i += 5) {
        groups.push(shuffled.slice(i, i + 5));
    }

    // Round-robin within each group, spaced 2 weeks apart
    const fixtures: Match[] = [];
    const startDate = new Date('2024-05-05');
    let offset = 0;

    groups.forEach((group, groupIdx) => {
        for (let i = 0; i < group.length; i++) {
            for (let j = i + 1; j < group.length; j++) {
                const matchDate = new Date(startDate);
                matchDate.setDate(startDate.getDate() + offset * 14);
                offset++;

                const homeTeamObj = teams.find(t => t.id === group[i].id);
                fixtures.push({
                    id: uuidv4(),
                    competitionId,
                    homeTeamId: group[i].id,
                    awayTeamId: group[j].id,
                    date: matchDate.toISOString(),
                    played: false,
                    events: [],
                    groupId: groupIdx,
                    venue: homeTeamObj?.stadium ?? 'GAA Ground',
                    venueCapacity: homeTeamObj?.stadiumCapacity ?? 15000,
                });
            }
        }
    });

    return {
        id: competitionId,
        name: `${code} Championship`,
        type: 'championship',
        teams: teams.map(t => t.id),
        fixtures,
    };
};
