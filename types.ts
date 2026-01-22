
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
  skyColor: number; // Hex number for Three.js
}

/* Added Blade, GameStats, and Character types to resolve import errors in components */
export interface Blade {
  id: string;
  name: string;
  color: string;
  cost: number;
  trailWidth: number;
}

export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  fruitsSliced: number;
}

export interface Character {
  id: string;
  name: string;
  description: string;
  ability: string;
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
  unlockedArenas: string[];
  selectedArena: string;
  /* Additional fields required by CharacterSelect and Shop components */
  coins: number;
  unlockedBlades: string[];
  selectedBlade: string;
  unlockedCharacters: string[];
  selectedCharacter: string;
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
