
export enum Screen {
  HOME = 'HOME',
  ARENAS = 'ARENAS',
  PLAYING = 'PLAYING'
}

export type Color = 'w' | 'b';
export type PieceType = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';

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
  captured?: Piece | null;
  isEnPassant?: boolean;
  isCastling?: 'king' | 'queen' | null;
}

export interface Arena {
  id: string;
  name: string;
  color: string;
  description: string;
  skyColor: number;
}

/**
 * Blade interface for GameCanvas and Shop components.
 */
export interface Blade {
  id: string;
  name: string;
  color: string;
  cost: number;
  trailWidth: number;
}

/**
 * GameStats interface for GameCanvas onGameOver callback.
 */
export interface GameStats {
  score: number;
  combo: number;
  maxCombo: number;
  fruitsSliced: number;
}

/**
 * Character interface for CharacterSelect component.
 */
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

/**
 * Bow interface for ArcheryScene component.
 */
export interface Bow {
  id: string;
  name: string;
  color: string;
  stability: number;
  tensionPower: number;
  cost: number;
}

/**
 * Simple Vector3 interface for coordinate data.
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface PlayerProgress {
  wins: number;
  losses: number;
  draws: number;
  coins: number;
  unlockedArenas: string[];
  selectedArena: string;
  /**
   * Added fields to support CharacterSelect and Shop components.
   */
  unlockedCharacters: string[];
  selectedCharacter: string;
  unlockedBlades: string[];
  selectedBlade: string;
}

export interface GameState {
  board: (Piece | null)[][];
  turn: Color;
  lastMove: Move | null;
  check: boolean;
  checkmate: boolean;
  stalemate: boolean;
  history: Move[];
  castlingRights: {
    w: { kingSide: boolean; queenSide: boolean };
    b: { kingSide: boolean; queenSide: boolean };
  };
  enPassantTarget: Square | null;
  /**
   * Added fields to support ArcheryScene component.
   */
  currentDistance: number;
  wind: {
    speed: number;
    direction: Vector3;
  };
}
