
import { Arena, PlayerProgress, Piece, PieceType, Color, Blade, Character } from './types.ts';

/**
 * Helper to generate chess pieces with a specific color and type.
 * Fixes "Cannot find name 'Color'" by adding it to the import list.
 */
const generatePiece = (color: Color, type: PieceType, index: number): Piece => ({
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

/**
 * Added BLADES constant used by the Shop component.
 */
export const BLADES: Blade[] = [
  { id: 'standard', name: 'Steel Edge', color: '#64748b', cost: 0, trailWidth: 1.0 },
  { id: 'neon', name: 'Neon Saber', color: '#0ea5e9', cost: 500, trailWidth: 1.5 },
  { id: 'crimson', name: 'Crimson Fury', color: '#ef4444', cost: 1000, trailWidth: 2.0 },
  { id: 'void', name: 'Void Reaver', color: '#a855f7', cost: 2500, trailWidth: 3.0 }
];

/**
 * Added CHARACTERS constant used by the CharacterSelect component.
 */
export const CHARACTERS: Character[] = [
  { 
    id: 'robin', 
    name: 'Robin', 
    ability: 'Wind Whisperer', 
    description: 'A master of the forest who can predict the subtlest breeze.', 
    passiveBonus: { windHandling: 0.8, steadiness: 0.4 }, 
    cost: 0 
  },
  { 
    id: 'evelyn', 
    name: 'Evelyn', 
    ability: 'Steady Hand', 
    description: 'An elite sharpshooter with nerves of cold steel.', 
    passiveBonus: { windHandling: 0.4, steadiness: 0.9 }, 
    cost: 1500 
  },
  { 
    id: 'kaito', 
    name: 'Kaito', 
    ability: 'Focus Burst', 
    description: 'A samurai archer who finds stillness in the eye of the storm.', 
    passiveBonus: { windHandling: 0.6, steadiness: 0.6 }, 
    cost: 3000 
  }
];

/**
 * Added GRAVITY constant used by the ArcheryScene component.
 */
export const GRAVITY = -9.8;

export const INITIAL_PROGRESS: PlayerProgress = {
  wins: 0,
  losses: 0,
  draws: 0,
  unlockedArenas: ['celestial', 'alabaster', 'glass'],
  selectedArena: 'celestial',
  coins: 100,
  /**
   * Added initial values for Character and Blade selection.
   */
  unlockedCharacters: ['robin'],
  selectedCharacter: 'robin',
  unlockedBlades: ['standard'],
  selectedBlade: 'standard'
};
