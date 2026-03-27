# Gaelic Games Manager

A browser-based management simulation game inspired by Football Manager, focused on Gaelic games.

## Overview

Manage a county team through seasons in one of four codes:
- **Men's Gaelic Football**
- **Ladies Gaelic Football (LGFA)**
- **Hurling**
- **Camogie**

Choose from 34 teams (32 Irish counties + London + New York) and lead your squad to glory.

## Tech Stack

- **React** + **TypeScript** - UI framework
- **Vite** - Build tool
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **localStorage** - Data persistence

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The app will be available at `http://localhost:5173`

## Features

### ✅ Implemented
- **Career Mode** - Choose your code and team
- **Squad Management** - View and manage 30 players with detailed attributes
- **Tactics** - Set formation and team style
- **Fixtures** - View upcoming matches and results
- **Dashboard** - Overview of team status and performance
- **Match Engine** - Probability-based match simulation
- **Data Persistence** - Save/load careers via localStorage
- **Responsive Design** - Mobile and desktop optimized

### 🔄 Future Enhancements
- Full match simulation with live commentary
- League/Championship competition structures
- Training and player development
- Injuries and morale systems
- Transfer market
- Manager reputation

## Project Structure

```
src/
├── components/     # Reusable UI components
│   └── Layout.tsx  # Main app layout with navigation
├── context/        # React Context for state management
│   └── GameContext.tsx
├── screens/        # Page components
│   ├── MainMenu.tsx
│   ├── NewCareer.tsx
│   ├── Dashboard.tsx
│   ├── Squad.tsx
│   ├── Tactics.tsx
│   └── Fixtures.tsx
├── utils/          # Helper functions
│   ├── data.ts     # Data generation
│   └── engine.ts   # Match simulation
├── types.ts        # TypeScript interfaces
├── App.tsx         # Router configuration
└── main.tsx        # Entry point
```

## Game Flow

1. **Main Menu** - Start new career or continue saved game
2. **New Career** - Choose code → Select team → Enter manager name
3. **Dashboard** - Central hub showing team stats and upcoming fixtures
4. **Squad** - Manage your 30-player roster
5. **Tactics** - Set formation and playing style
6. **Fixtures** - View schedule and play matches

## Development Notes

- Players are procedurally generated with realistic Irish names
- Team ratings are roughly based on traditional GAA strengths
- Match engine uses probabilistic simulation based on team/player stats
- Home advantage is factored into match outcomes

## License

This is a fan project inspired by management simulation games. Not affiliated with the GAA or any official sporting body.
