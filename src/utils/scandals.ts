import type { ScandalSeverity, ScandalTarget } from '../types';

export interface ScandalTemplate {
    title: string;
    description: string;
    severity: ScandalSeverity;
    moraleImpact: number;
    target: ScandalTarget;
    affectedCount?: number; // if target === 'player', how many players affected
}

// Placeholders substituted at runtime:
//   {p1}      — first affected player's full name
//   {p2}      — second affected player's full name
//   {manager} — manager's name

export const SCANDAL_TEMPLATES: ScandalTemplate[] = [
    // MINOR (-5 to -10 morale)
    {
        title: 'Late Night Spotted',
        description: '{p1} and {p2} were seen leaving a pub well after curfew the night before training. Nothing serious, but word has gotten around the county board.',
        severity: 'minor', moraleImpact: -6, target: 'player', affectedCount: 2,
    },
    {
        title: 'Training Row',
        description: 'A heated argument broke out on the training pitch between {p1} and {p2}. It was kept mostly internal but the mood in the dressing room has soured.',
        severity: 'minor', moraleImpact: -8, target: 'player', affectedCount: 2,
    },
    {
        title: 'Social Media Slip',
        description: '{p1} posted a photo that raised eyebrows in club circles. Deleted quickly but not before screenshots made the rounds on GAA Twitter.',
        severity: 'minor', moraleImpact: -5, target: 'player', affectedCount: 1,
    },
    {
        title: 'Missed Training Session',
        description: '{p1} skipped training without notifying the management team. The rest of the lads noticed.',
        severity: 'minor', moraleImpact: -7, target: 'player', affectedCount: 1,
    },
    {
        title: 'Club Funding Complaint',
        description: 'A local councillor went to the papers complaining the county board was favouring your club in grant allocations. Storm in a teacup, but distracting for {manager}.',
        severity: 'minor', moraleImpact: -5, target: 'manager',
    },
    {
        title: 'Leaked Team Sheet',
        description: 'Next week\'s starting fifteen was leaked to a rival county\'s backroom team before announcement. Someone inside the camp is talking.',
        severity: 'minor', moraleImpact: -9, target: 'team',
    },
    {
        title: 'Medical Staff Dispute',
        description: 'The physio and team doctor publicly disagreed over a player\'s return-to-play timeline. Undermines confidence in the backroom setup.',
        severity: 'minor', moraleImpact: -6, target: 'team',
    },
    {
        title: 'Kit Man Row',
        description: 'The kit man resigned suddenly after a dispute over expenses. Hardly headline news, but it disrupted the week\'s preparations.',
        severity: 'minor', moraleImpact: -5, target: 'team',
    },
    {
        title: 'Radio Interview Controversy',
        description: '{manager} made an offhand remark on Raidió na Gaeltachta that didn\'t land well. The county board asked for clarification.',
        severity: 'minor', moraleImpact: -7, target: 'manager',
    },
    {
        title: 'Sponsor Tension',
        description: 'The main county sponsor was unhappy after players skipped a promotional appearance. Relations are frosty.',
        severity: 'minor', moraleImpact: -8, target: 'team',
    },

    // MODERATE (-15 to -20 morale)
    {
        title: 'Drink Driving Arrest',
        description: '{p1} was arrested for drink driving after a night out. The county board has launched an internal review.',
        severity: 'moderate', moraleImpact: -18, target: 'player', affectedCount: 1,
    },
    {
        title: 'Transfer Agitation',
        description: '{p1} has lodged a transfer request and wants to play for a neighbouring county. The story has broken in the Irish Examiner.',
        severity: 'moderate', moraleImpact: -17, target: 'player', affectedCount: 1,
    },
    {
        title: 'County Board Power Struggle',
        description: 'A faction on the county board is questioning {manager}\'s training methods and threatening to intervene in team selection. Classic GAA politics.',
        severity: 'moderate', moraleImpact: -15, target: 'manager',
    },
    {
        title: 'Doping Whisper',
        description: 'Anonymous claims circulated online suggesting unusual supplement use within the squad. No evidence found, but Croke Park is asking questions.',
        severity: 'moderate', moraleImpact: -20, target: 'team',
    },
    {
        title: 'Club vs County Conflict',
        description: 'Three clubs have refused to release players for a crucial training camp, citing fixture congestion. Tension between club and county is boiling.',
        severity: 'moderate', moraleImpact: -15, target: 'team',
    },
    {
        title: 'Referee Allegation',
        description: '{manager} was quoted accusing a referee of bias after last week\'s match. The GAA disciplinary committee has opened a file.',
        severity: 'moderate', moraleImpact: -16, target: 'manager',
    },
    {
        title: 'Player Walkout Threat',
        description: 'A group of senior players held a private meeting and threatened to boycott training over scheduling grievances. It was resolved, but trust is damaged.',
        severity: 'moderate', moraleImpact: -19, target: 'team',
    },
    {
        title: 'Stadium Debacle',
        description: 'A home game was moved to a rival county\'s ground due to a pitch inspection failure. The players felt humiliated.',
        severity: 'moderate', moraleImpact: -15, target: 'team',
    },
    {
        title: 'Bogus Expenses Claim',
        description: '{p1} was found to have submitted inflated travel expense claims. The county board have reprimanded them publicly.',
        severity: 'moderate', moraleImpact: -17, target: 'player', affectedCount: 1,
    },
    {
        title: 'Journalist Ambush',
        description: 'A Sunday paper ran a piece suggesting {manager}\'s tactics are "ten years out of date". Former players were quoted. The dressing room is rattled.',
        severity: 'moderate', moraleImpact: -15, target: 'manager',
    },

    // MAJOR (-25 to -35 morale)
    {
        title: 'Match Fixing Allegation',
        description: 'A tabloid alleged that a recent defeat was deliberately arranged to benefit a betting syndicate. Gardaí have been contacted. The county is in shock.',
        severity: 'major', moraleImpact: -32, target: 'team',
    },
    {
        title: 'Doping Positive Test',
        description: '{p1} has returned a positive result for a banned substance. The player claims it was a contaminated supplement. Croke Park has suspended them pending investigation.',
        severity: 'major', moraleImpact: -30, target: 'player', affectedCount: 1,
    },
    {
        title: 'Violent Conduct Ban',
        description: '{p1} received a lengthy suspension after a post-match altercation with an opponent. The incident was caught on camera and went viral.',
        severity: 'major', moraleImpact: -28, target: 'player', affectedCount: 1,
    },
    {
        title: 'County Board Vote of No Confidence',
        description: 'The county board called an emergency meeting and passed a motion of no confidence in {manager}\'s management approach. The position is under serious threat.',
        severity: 'major', moraleImpact: -35, target: 'manager',
    },
    {
        title: 'Alleged Payments Scandal',
        description: 'An investigation revealed that players may have received illegal payments from a county board member. The GAA Central Council is involved.',
        severity: 'major', moraleImpact: -33, target: 'team',
    },
    {
        title: 'Training Ground Brawl',
        description: 'A serious physical altercation broke out between {p1} and {p2} at training and could not be kept quiet. One required medical attention. The county is talking about nothing else.',
        severity: 'major', moraleImpact: -29, target: 'player', affectedCount: 3,
    },
    {
        title: 'Misappropriation of Funds',
        description: 'The county treasurer was found to have mismanaged development funds. While not connected to the playing side, it has cast a dark cloud over the whole county.',
        severity: 'major', moraleImpact: -25, target: 'team',
    },
    {
        title: 'Selection Controversy',
        description: '{manager} dropped a county legend without explanation. His family went to the press. The controversy has split the county\'s supporters.',
        severity: 'major', moraleImpact: -27, target: 'manager',
    },
    {
        title: 'Abuse Allegation Against Coach',
        description: 'A former minor player has made allegations of verbal abuse against a member of the backroom team. The coach has stepped aside pending review.',
        severity: 'major', moraleImpact: -34, target: 'team',
    },
    {
        title: 'Leaked Dressing Room Audio',
        description: 'Audio of {manager}\'s half-time team talk was leaked online. It contained strong language and criticism of individual players by name.',
        severity: 'major', moraleImpact: -26, target: 'manager',
    },
    {
        title: 'Championship Eligibility Dispute',
        description: 'An opposing county lodged a protest claiming one of your players was ineligible to play. The GAA are reviewing match results. Season in jeopardy.',
        severity: 'major', moraleImpact: -30, target: 'team',
    },
    {
        title: 'Mass Walkout After AGM',
        description: 'Several senior players announced their retirement simultaneously after a fractious county board AGM. A generation of experience is gone overnight.',
        severity: 'major', moraleImpact: -32, target: 'team',
    },

    // CATASTROPHIC (-40 to -50 morale)
    {
        title: 'Criminal Charges Against Star Player',
        description: '{p1} has been charged with assault following an incident outside a Galway nightclub. They have voluntarily stepped away from the squad.',
        severity: 'catastrophic', moraleImpact: -45, target: 'player', affectedCount: 1,
    },
    {
        title: 'Match Fixing Conviction',
        description: 'A former backroom member has been convicted of match fixing. Though removed from the setup before {manager}\'s tenure, the county\'s name is destroyed in the press.',
        severity: 'catastrophic', moraleImpact: -48, target: 'team',
    },
    {
        title: 'Mass Doping Ban',
        description: 'Widespread banned substance use has been uncovered across the squad following a surprise Croke Park inspection. Multiple players face lengthy bans.',
        severity: 'catastrophic', moraleImpact: -50, target: 'team',
    },
    {
        title: 'Manager Resignation Demanded',
        description: 'Over a thousand supporters have signed a petition calling for {manager}\'s immediate resignation. Local TDs are weighing in. The future is in serious doubt.',
        severity: 'catastrophic', moraleImpact: -42, target: 'manager',
    },
    {
        title: 'County Board Corruption Exposed',
        description: 'A RTÉ Investigates documentary has exposed systematic corruption in county board finances spanning a decade. The GAA has suspended the entire board.',
        severity: 'catastrophic', moraleImpact: -47, target: 'team',
    },
    {
        title: 'Serious Player Welfare Failure',
        description: '{p1} collapsed during training and it emerged that warning signs had been ignored for weeks. The GAA launched a full investigation into player welfare protocols.',
        severity: 'catastrophic', moraleImpact: -44, target: 'player', affectedCount: 1,
    },
    {
        title: 'Player Death Scare',
        description: '{p1} suffered a serious cardiac event during a training drill. He survived, but the incident has left the squad badly shaken and the county devastated.',
        severity: 'catastrophic', moraleImpact: -40, target: 'player', affectedCount: 1,
    },
    {
        title: 'County Expulsion Threatened',
        description: 'Following a series of on-field and off-field controversies, the GAA Central Council has threatened to expel the county from this year\'s championship.',
        severity: 'catastrophic', moraleImpact: -50, target: 'team',
    },
    {
        title: 'Financial Ruin of County Board',
        description: 'The county board has been declared insolvent. Training facilities are closed and there is no money for travel or equipment. Players are in limbo.',
        severity: 'catastrophic', moraleImpact: -46, target: 'team',
    },
    {
        title: 'National Disgrace',
        description: 'Actions by senior players at a post-match function made front-page news across Ireland and were condemned by the Taoiseach in the Dáil. GAA headquarters issued a rare public condemnation.',
        severity: 'catastrophic', moraleImpact: -48, target: 'team',
    },

    // Extra: manager-focused minor/moderate
    {
        title: 'Tactics Questioned Publicly',
        description: 'A former All-Ireland winner went on Newstalk to call {manager}\'s defensive setup "an embarrassment to the county". The lads heard every word.',
        severity: 'minor', moraleImpact: -9, target: 'manager',
    },
    {
        title: 'Selector Feud',
        description: 'One of {manager}\'s selectors resigned and told the Connacht Tribune they were overruled on key selections all season. Backroom unity is gone.',
        severity: 'moderate', moraleImpact: -16, target: 'manager',
    },
    {
        title: 'Academy Neglect Claims',
        description: 'The under-21 manager claimed {manager} has been poaching his best players without communication. The county board held a summit.',
        severity: 'minor', moraleImpact: -7, target: 'manager',
    },
    {
        title: 'Dressing Room Division',
        description: 'Word has leaked of a north-county vs south-county divide among the panel. Two factions, two WhatsApp groups, one dressing room.',
        severity: 'moderate', moraleImpact: -18, target: 'team',
    },
    {
        title: 'Fan Protest at Training',
        description: 'A small group of supporters staged a protest outside the training ground, calling for {manager} to be replaced. TV cameras were present.',
        severity: 'minor', moraleImpact: -10, target: 'manager',
    },
    {
        title: 'Broken Handshake Controversy',
        description: '{manager} was photographed walking past the opposing manager without shaking hands after a match. The GAA code of conduct committee is investigating.',
        severity: 'minor', moraleImpact: -6, target: 'manager',
    },
    {
        title: 'Amateur Status Violation',
        description: '{p1} accepted payment for a personal appearance while in county colours, violating GAA amateur status rules. A fine has been issued.',
        severity: 'moderate', moraleImpact: -14, target: 'player', affectedCount: 1,
    },
    {
        title: 'Illegal Recruitment Allegation',
        description: 'A rival county has accused {manager} of inducing a college student to declare for the county using financial incentives. The GAA are investigating.',
        severity: 'major', moraleImpact: -28, target: 'manager',
    },
];
