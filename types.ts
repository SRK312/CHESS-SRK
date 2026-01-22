
export enum Screen {
  HOME = 'HOME',
  ARENAS = 'ARENAS',
  PLAYING = 'PLAYING',
  SHOP = 'SHOP',
  CHARACTERS = 'CHARACTERS'
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

// Added Blade interface for the armory and game canvas
export interface Blade {
  id: string;
  name: string;
  cost: number;
  color: string;
  trailWidth: number;
}

// Added GameStats interface for game completion tracking
export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  fruitsSliced: number;
}

// Added Character interface for the archer selection
export interface Character {
  id: string;
  name: string;
  ability: string;
  description: string;
  cost: number;
  passiveBonus: {
    windHandling: number;
    steadiness: number;
  };
}

export interface PlayerProgress {
  wins: number;
  losses: number;
  draws: number;
  coins: number;
  unlockedArenas: string[];
  selectedArena: string;
  // Added fields to track unlocked and selected characters and blades
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
