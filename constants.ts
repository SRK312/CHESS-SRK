
import { Arena, PlayerProgress, Piece, Blade, Character } from './types';

const generatePiece = (color: 'w' | 'b', type: any, index: number): Piece => ({
  id: `${color}-${type}-${index}`,
  color,
  type
});

export const INITIAL_BOARD: (Piece | null)[][] = [
  [
    generatePiece('w', 'r', 1), generatePiece('w', 'n', 1), generatePiece('w', 'b', 1), generatePiece('w', 'q', 1),
    generatePiece('w', 'k', 1), generatePiece('w', 'b', 2), generatePiece('w', 'n', 2), generatePiece('w', 'r', 2)
  ],
  Array(8).fill(null).map((_, i) => generatePiece('w', 'p', i)),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null),
  Array(8).fill(null).map((_, i) => generatePiece('b', 'p', i)),
  [
    generatePiece('b', 'r', 1), generatePiece('b', 'n', 1), generatePiece('b', 'b', 1), generatePiece('b', 'q', 1),
    generatePiece('b', 'k', 1), generatePiece('b', 'b', 2), generatePiece('b', 'n', 2), generatePiece('b', 'r', 2)
  ]
];

export const ARENAS: Arena[] = [
  { id: 'void', name: 'Celestial Spire', color: '#38bdf8', description: 'A marble platform suspended in the morning sky.', skyColor: 0xf8fafc },
  { id: 'crimson', name: 'Alabaster Sanctum', color: '#f43f5e', description: 'Sun-drenched halls with crimson accents.', skyColor: 0xfff1f2 },
  { id: 'azure', name: 'Glass Fortress', color: '#0ea5e9', description: 'A crystalline tower above the sea of clouds.', skyColor: 0xf0f9ff }
];

export const BLADES: Blade[] = [
  { id: 'steel', name: 'Steel Edge', color: '#94a3b8', cost: 0, trailWidth: 1.0 },
  { id: 'neon', name: 'Neon Saber', color: '#22d3ee', cost: 500, trailWidth: 1.5 },
  { id: 'crimson', name: 'Crimson Fury', color: '#f43f5e', cost: 1200, trailWidth: 2.0 }
];

export const CHARACTERS: Character[] = [
  { 
    id: 'kaito', 
    name: 'Kaito', 
    description: 'A master of the blade from the eastern isles.', 
    ability: 'Swift Strike', 
    cost: 0, 
    passiveBonus: { windHandling: 0.8, steadiness: 0.7 } 
  },
  { 
    id: 'elara', 
    name: 'Elara', 
    description: 'Born in the high peaks, her focus is unmatched.', 
    ability: 'Unerring Aim', 
    cost: 1000, 
    passiveBonus: { windHandling: 0.9, steadiness: 1.0 } 
  }
];

export const INITIAL_PROGRESS: PlayerProgress = {
  wins: 0,
  losses: 0,
  draws: 0,
  unlockedArenas: ['void', 'crimson', 'azure'],
  selectedArena: 'void',
  coins: 100,
  unlockedBlades: ['steel'],
  selectedBlade: 'steel',
  unlockedCharacters: ['kaito'],
  selectedCharacter: 'kaito'
};
