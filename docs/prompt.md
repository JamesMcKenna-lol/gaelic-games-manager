You are an expert game developer and full-stack web engineer.

Your task: Design and IMPLEMENT a complete, playable browser game called **Gaelic Games Manager** – a Football Manager-style management sim – as a responsive web app.

The game must run fully in the browser (no special tooling required beyond a normal modern browser).

====================================
HIGH-LEVEL CONCEPT
====================================
Build a management sim similar in feel to **Football Manager**, but focused on **Gaelic games**.

Scope:

- Teams:
  - All **32 Irish counties**
  - Plus **London** and **New York**
- Codes available in the game:
  1. Men’s Gaelic Football
  2. Ladies Gaelic Football (LGFA)
  3. Hurling
  4. Camogie

The user can:
- Start a new career
- Choose a code (one of the 4 above)
- Choose a team (any of the 32 counties + London or New York)
- Manage a squad over multiple seasons:
  - Tactics
  - Line-ups
  - Basic training focus
  - Simple finances / reputation
- Play through fixtures and tournaments
- Watch matches unfold via a **text and stats-driven match engine** (no need for complex 3D; a simple 2D or abstract view with commentary is fine)

Make the **vibe** very clearly Football-Manager-inspired (menus, panels, squad lists, stats, etc.), but without copying any copyrighted assets or names.

====================================
TECH & ARCHITECTURE
====================================
- Build as a **single-page application**.
- Use **TypeScript** + **React** (or another modern JS framework if you strongly prefer, but React + TS is ideal).
- Use a modern build tool (e.g. Vite) if needed, but make sure the codebase is easy to run with clear instructions.
- No backend server logic is required beyond static hosting – persist game data in:
  - **localStorage** or **IndexedDB** for save/load.
- Styling:
  - Mobile-first, responsive layout.
  - Looks good in both **mobile portrait** and **desktop/laptop** browser windows.
  - Clean, modern UI. Use a simple CSS approach (CSS modules, Tailwind, or styled-components are all acceptable) but keep it readable and well-structured.

Deliverables:
- A complete, runnable project structure.
- All core pages/components.
- Example game data.
- Utility functions.
- Types/interfaces for all main game entities.
- Inline comments and a short README.

====================================
UX & UI REQUIREMENTS
====================================
Design for both **mobile phones** and **laptops/desktops**:

1. **Main Menu Screen**
   - Game title: “Gaelic Games Manager”
   - Buttons:
     - New Career
     - Continue (if saved game exists)
     - Settings
     - About

2. **New Career Flow**
   - Step 1: Choose Code:
     - Men’s Football
     - Ladies Football (LGFA)
     - Hurling
     - Camogie
   - Step 2: Choose County Team:
     - List of all 32 counties + London + New York
     - Simple search or filter by province (Leinster, Munster, Connacht, Ulster, plus “Overseas”).
   - Step 3: Confirm career & start.

3. **Manager Home Dashboard**
   - Header with:
     - Team name & badge placeholder
     - Code (e.g. “Hurling – Senior”)
   - Panels (cards) for:
     - Next fixture (opponent, competition, date, home/away)
     - League/Championship position summary
     - Squad fitness/injuries summary
     - Recent results
   - Navigation bar (mobile friendly, collapsible on small screens):
     - Home
     - Squad
     - Tactics
     - Fixtures
     - Competitions
     - Club Info
     - Settings

4. **Squad Screen**
   - Table/list of players with:
     - Name
     - Position (e.g. GK, FB, HB, MF, HF, FF)
     - Age
     - Overall rating
     - Key attributes (e.g. pace, shooting, passing, tackling, stamina)
     - Morale and fitness %.
   - Ability to:
     - Select starting XV (or relevant number depending on code) with clear indication of starters vs subs.
     - View individual player details on tap/click.

5. **Player Detail Screen**
   - Player name and position
   - Attributes (ratings out of 20, for example)
   - Form (last 5 matches rating)
   - Fitness & injury status
   - A brief text description (generated template) to give them personality.

6. **Tactics Screen**
   - Choose a **formation** (e.g. 1–3–3–2–3 style, or a simple named preset).
   - Set team style sliders:
     - Attacking vs Defensive
     - Direct vs Short Passing
     - Pressing intensity (Low / Normal / High)
   - Option to set a few simple **set piece** preferences (who takes frees, penalties, sidelines).

7. **Fixtures & Competitions**
   - Fixtures list:
     - Date
     - Opponent
     - Competition
     - Home/Away
   - Past results with score and a simple match rating.
   - Competitions view:
     - Simple league/championship tables with:
       - Team, Played, Won, Lost, Drawn, For, Against, Points.
   - Basic provincial + All-Ireland style structure:
     - Start with provincial competition.
     - Qualifiers/backdoor path.
     - Knock-out rounds towards a final.
     - Keep it simplified but recognisably inspired by real GAA structures (without copying any protected competition names if they are protected).

8. **Match Engine / Match Day Screen**
   - On match day, user sees:
     - Scoreline
     - Time (minutes)
     - Possession/shot stats
     - Text commentary events (e.g. “Dublin win the kickout…”, “Goal for Cork!”)
   - Simulate matches minute-by-minute or in steps (e.g. “Play”, “Pause”, “Fast Forward”).
   - Use a simple probability-based system influenced by:
     - Team overall strength
     - Tactics
     - Player attributes
     - Home advantage
   - Optionally, simple 2D pitch representation with dots/markers is nice, but text commentary + stats is sufficient.

9. **Save/Load**
   - Auto-save career after each match or major action, stored in localStorage/IndexedDB.
   - Provide manual “Save” and “Load Career” options.

10. **Settings & About**
    - Basic settings:
      - Toggle sound effects on/off (if you add simple sounds).
      - Toggle match speed.
    - About:
      - Short description of the game.
      - Note that it’s a fan project inspired by management sims, not an official GAA product.

====================================
GAME LOGIC & DATA MODEL
====================================
Implement clear TypeScript interfaces for core objects, for example:

- Team
  - id
  - name
  - county
  - code (Men’s Football, Ladies Football, Hurling, Camogie)
  - strength rating
  - home stadium name

- Player
  - id
  - name
  - age
  - position
  - attributes (object of key ratings)
  - current club/team
  - morale
  - fitness
  - potential rating

- Match
  - id
  - homeTeamId
  - awayTeamId
  - competitionId
  - date
  - events (goals, points, cards, injuries)
  - stats (shots, possession, etc.)
  - result

- Competition
  - id
  - name
  - type (league, cup, provincial, all-Ireland)
  - teams involved
  - fixtures
  - table/standings

- SaveGame
  - active career info
  - selected code
  - selected team
  - current season, current date
  - competitions, fixtures, results
  - squad data
  - manager profile

Generate a **plausible but fictional** set of players and attributes for each county. Use typical Irish names and some international names mixed in.

====================================
IMPLEMENTATION DETAILS
====================================
- Code quality:
  - Use TypeScript types for all major entities.
  - Organise components cleanly (e.g. `components/`, `screens/`, `state/`).
  - Prefer a simple state management approach (React Context or a light library).
  - Comment key functions, especially:
    - Match simulation logic
    - League table updates
    - Save/load functions

- Responsive design:
  - On mobile:
    - Navigation collapses into a bottom or hamburger menu.
    - Cards stack vertically.
  - On desktop:
    - Use a multi-column layout (e.g. sidebar navigation + main content + info sidebar).
  - Keep tap targets large and friendly.

- Visual “vibe”:
  - Flashy but clean. Use subtle animations for transitions (e.g. hover effects, card fade-ins).
  - Use a modern, bold colour palette inspired by sports dashboards, but do not overcomplicate.

====================================
WHAT YOU MUST OUTPUT
====================================
1. The full project code (front-end only) with:
   - All relevant source files.
   - Components, hooks, utils, styles.
2. A brief README that explains:
   - How to install dependencies.
   - How to run the project locally.
   - High-level overview of the architecture.
3. Enough seeded data and fixtures so that:
   - I can launch the app,
   - Start a new career with any team,
   - Play at least one full season with meaningful stats and results.

Make assumptions where necessary, but keep everything focused on delivering a **fully playable, browser-based Gaelic Games Manager** that feels as close to Football Manager as is reasonable within a web app.
In no way should it be a replica of Football Manager, but it should feel like it is. Also make no explicit mention of Football Manager throughout. 