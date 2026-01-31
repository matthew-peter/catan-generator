# Catan Board Generator

A mobile-first web app that randomly generates balanced Catan board setups for 3-4 and 5-6 player games.

![Catan Board Generator](https://img.shields.io/badge/Catan-Board%20Generator-orange)

## Features

- **Player Count Options**: Support for both 3-4 player (19 tiles) and 5-6 player (30 tiles) boards
- **Desert Placement**: Choose between center placement or random placement
- **Balanced Distribution**: 
  - Resources are distributed to minimize same-resource adjacencies
  - High-value numbers (6 & 8) are spread across different resources
  - No two 6s or 8s adjacent to each other
- **Random Distribution**: Option for fully random placement
- **Proper Sea Frame**: Ocean hexes form a complete hexagonal border around the island
- **Harbor Pieces**: 9 ports (4 generic 3:1, 5 specialized 2:1) displayed as game-accurate tokens
- **Mobile-First Design**: Beautiful, responsive UI optimized for phones

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Board Layout

The board uses a row-based hexagonal layout:

- **3-4 Player**: 3-4-5-4-3 rows (19 land hexes)
- **5-6 Player**: 3-4-5-6-5-4-3 rows (30 land hexes)

## Resources

| Resource | 3-4 Player | 5-6 Player |
|----------|------------|------------|
| Wood     | 4          | 6          |
| Brick    | 3          | 5          |
| Wheat    | 4          | 6          |
| Sheep    | 4          | 6          |
| Ore      | 3          | 5          |
| Desert   | 1          | 2          |

## License

MIT
