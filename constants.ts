
import { Arena, PlayerProgress, Piece, Character, Blade, PieceType } from './types';

// Fix: Updated type from any to PieceType
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

// Fix: Added CHARACTERS for CharacterSelect
export const CHARACTERS: Character[] = [
  {
    id: 'swift',
    name: 'Swift Wind',
    ability: 'Gale Force',
    description: 'A master of the winds who can predict any gust.',
    passiveBonus: { windHandling: 0.9, steadiness: 0.5 },
    cost: 0
  },
  {
    id: 'steady',
    name: 'Steady Eye',
    ability: 'Focus Point',
    description: 'Rare focus allows for unparalleled accuracy.',
    passiveBonus: { windHandling: 0.4, steadiness: 0.9 },
    cost: 500
  },
  {
    id: 'shadow',
    name: 'Shadow Stalker',
    ability: 'Umbral Veil',
    description: 'Moves unseen through the darkest terrains.',
    passiveBonus: { windHandling: 0.6, steadiness: 0.6 },
    cost: 1200
  }
];

// Fix: Added BLADES for Shop
export const BLADES: Blade[] = [
  { id: 'steel', name: 'Forged Steel', color: '#94a3b8', trailWidth: 1.0, cost: 0 },
  { id: 'plasma', name: 'Plasma Edge', color: '#f43f5e', trailWidth: 2.5, cost: 1000 },
  { id: 'void', name: 'Void Slicer', color: '#a855f7', trailWidth: 1.8, cost: 600 },
  { id: 'jade', name: 'Jade Katana', color: '#10b981', trailWidth: 1.5, cost: 350 }
];

export const INITIAL_PROGRESS: PlayerProgress = {
  wins: 0,
  losses: 0,
  draws: 0,
  unlockedArenas: ['celestial', 'alabaster', 'glass'],
  selectedArena: 'celestial',
  coins: 100,
  // Fix: Added initial fields for characters and blades
  unlockedCharacters: ['swift'],
  selectedCharacter: 'swift',
  unlockedBlades: ['steel'],
  selectedBlade: 'steel'
};
