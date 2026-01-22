
import { Arena, PlayerProgress, Piece, PieceType, Blade, Character } from './types.ts';

const generatePiece = (color: 'w' | 'b', type: PieceType, index: number): Piece => ({
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
  { id: 'celestial', name: 'Celestial Spire', color: '#38bdf8', description: 'A marble platform suspended in the morning sky.', skyColor: 0xf8fafc },
  { id: 'alabaster', name: 'Alabaster Sanctum', color: '#f43f5e', description: 'Sun-drenched halls with crimson accents.', skyColor: 0xfff1f2 },
  { id: 'glass', name: 'Glass Fortress', color: '#0ea5e9', description: 'A crystalline tower above the sea of clouds.', skyColor: 0xf0f9ff }
];

// Added BLADES constant for the armory shop
export const BLADES: Blade[] = [
  { id: 'basic', name: 'Training Blade', cost: 0, color: '#94a3b8', trailWidth: 1.0 },
  { id: 'sky', name: 'Sky Piercer', cost: 500, color: '#0ea5e9', trailWidth: 1.5 },
  { id: 'fire', name: 'Embers Edge', cost: 1200, color: '#f43f5e', trailWidth: 2.0 },
  { id: 'void', name: 'Void Reaver', cost: 2500, color: '#6366f1', trailWidth: 2.5 }
];

// Added CHARACTERS constant for selection
export const CHARACTERS: Character[] = [
  { 
    id: 'kaito', 
    name: 'Kaito', 
    ability: 'Wind Walker', 
    description: 'A master of the high winds.', 
    cost: 0, 
    passiveBonus: { windHandling: 0.8, steadiness: 0.4 } 
  },
  { 
    id: 'elara', 
    name: 'Elara', 
    ability: 'Storm Seer', 
    description: 'Precision in the eye of the storm.', 
    cost: 1000, 
    passiveBonus: { windHandling: 0.5, steadiness: 0.9 } 
  },
  { 
    id: 'jorin', 
    name: 'Jorin', 
    ability: 'Mountain Heart', 
    description: 'Steady as the ancient stone.', 
    cost: 1500, 
    passiveBonus: { windHandling: 0.3, steadiness: 1.0 } 
  }
];

export const INITIAL_PROGRESS: PlayerProgress = {
  wins: 0,
  losses: 0,
  draws: 0,
  unlockedArenas: ['celestial', 'alabaster', 'glass'],
  selectedArena: 'celestial',
  coins: 100,
  // Added default values for character and blade progression
  unlockedCharacters: ['kaito'],
  selectedCharacter: 'kaito',
  unlockedBlades: ['basic'],
  selectedBlade: 'basic'
};
