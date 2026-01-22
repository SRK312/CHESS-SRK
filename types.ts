
export enum Screen {
  HOME = 'HOME',
  ARENAS = 'ARENAS',
  PLAYING = 'PLAYING'
}

export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
export type Color = 'w' | 'b';

export interface Piece {
  id: string;
  type: PieceType;
  color: Color;
}

export interface Square {
  row: number;
  col: number;
}

export interface Move {
  from: Square;
  to: Square;
  piece: Piece;
  captured?: Piece;
  isCastling?: 'king' | 'queen';
  isEnPassant?: boolean;
  isPromotion?: boolean;
}

export interface Arena {
  id: string;
  name: string;
  color: string;
  description: string;
  skyColor: number;
}

// Fix: Added GameStats for GameCanvas
export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  fruitsSliced: number;
}

// Fix: Added Blade for Shop and GameCanvas
export interface Blade {
  id: string;
  name: string;
  color: string;
  trailWidth: number;
  cost: number;
}

// Fix: Added Character for CharacterSelect
export interface Character {
  id: string;
  name: string;
  ability: string;
  description: string;
  passiveBonus: {
    windHandling: number;
    steadiness: number;
  };
  cost: number;
}

export interface PlayerProgress {
  wins: number;
  losses: number;
  draws: number;
  coins: number;
  unlockedArenas: string[];
  selectedArena: string;
  // Fix: Added missing properties for character and blade selection
  unlockedCharacters: string[];
  selectedCharacter: string;
  unlockedBlades: string[];
  selectedBlade: string;
}

export interface CastlingRights {
  w: { kingSide: boolean; queenSide: boolean };
  b: { kingSide: boolean; queenSide: boolean };
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  lastMove: Move | null;
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  history: Move[];
  castlingRights: CastlingRights;
  enPassantTarget: Square | null;
}
