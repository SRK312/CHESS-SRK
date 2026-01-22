
import { Piece, Square, Move, Color, GameState } from '../types';

export class ChessEngine {
  static isSquareOnBoard(s: Square) {
    return s.row >= 0 && s.row < 8 && s.col >= 0 && s.col < 8;
  }

  static getPieceAt(board: (Piece | null)[][], s: Square) {
    return board[s.row][s.col];
  }

  static isSquareAttacked(board: (Piece | null)[][], square: Square, attackerColor: Color): boolean {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.color === attackerColor) {
          const pseudoMoves = this.getPseudoLegalMoves(board, { row: r, col: c }, null, { w: { kingSide: false, queenSide: false }, b: { kingSide: false, queenSide: false } }, true);
          if (pseudoMoves.some(m => m.to.row === square.row && m.to.col === square.col)) return true;
        }
      }
    }
    return false;
  }

  static getPseudoLegalMoves(
    board: (Piece | null)[][], 
    from: Square, 
    enPassantTarget: Square | null, 
    castlingRights: any,
    onlyCaptures: boolean = false
  ): Move[] {
    const piece = board[from.row][from.col];
    if (!piece) return [];

    const moves: Move[] = [];
    const color = piece.color;
    const enemyColor = color === 'w' ? 'b' : 'w';

    const addMove = (to: Square, extras: Partial<Move> = {}) => {
      if (!this.isSquareOnBoard(to)) return false;
      const target = board[to.row][to.col];
      if (target) {
        if (target.color !== color) {
          moves.push({ from, to, piece, captured: target, ...extras });
        }
        return false; // Path blocked
      } else {
        if (!onlyCaptures) {
          moves.push({ from, to, piece, ...extras });
        } else if (piece.type !== 'p') {
          // Non-pawns attack empty squares
          moves.push({ from, to, piece, ...extras });
        }
        return true; // Path clear
      }
    };

    switch (piece.type) {
      case 'p': {
        const dir = color === 'w' ? 1 : -1;
        const startRow = color === 'w' ? 1 : 6;
        
        if (!onlyCaptures) {
          const oneForward = { row: from.row + dir, col: from.col };
          if (this.isSquareOnBoard(oneForward) && !board[oneForward.row][oneForward.col]) {
            moves.push({ from, to: oneForward, piece });
            const twoForward = { row: from.row + 2 * dir, col: from.col };
            if (from.row === startRow && !board[twoForward.row][twoForward.col]) {
              moves.push({ from, to: twoForward, piece });
            }
          }
        }

        // Attacks
        for (const dc of [-1, 1]) {
          const to = { row: from.row + dir, col: from.col + dc };
          if (this.isSquareOnBoard(to)) {
            const target = board[to.row][to.col];
            if (onlyCaptures) {
              moves.push({ from, to, piece });
            } else {
              if (target && target.color === enemyColor) {
                moves.push({ from, to, piece, captured: target });
              } else if (enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
                const epCaptured = board[from.row][to.col];
                if (epCaptured) moves.push({ from, to, piece, captured: epCaptured, isEnPassant: true });
              }
            }
          }
        }
        break;
      }
      case 'n': {
        const jumps = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
        jumps.forEach(([dr, dc]) => addMove({ row: from.row + dr, col: from.col + dc }));
        break;
      }
      case 'b':
      case 'r':
      case 'q': {
        const dirs = [];
        if (piece.type !== 'b') dirs.push([0,1],[0,-1],[1,0],[-1,0]);
        if (piece.type !== 'r') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
        dirs.forEach(([dr, dc]) => {
          for (let i = 1; i < 8; i++) {
            if (!addMove({ row: from.row + dr * i, col: from.col + dc * i })) break;
          }
        });
        break;
      }
      case 'k': {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            addMove({ row: from.row + dr, col: from.col + dc });
          }
        }
        if (!onlyCaptures) {
          const rights = castlingRights[color];
          if (rights?.kingSide) {
            if (!board[from.row][5] && !board[from.row][6] && 
                !this.isSquareAttacked(board, from, enemyColor) && 
                !this.isSquareAttacked(board, {row: from.row, col: 5}, enemyColor)) {
              moves.push({ from, to: { row: from.row, col: 6 }, piece, isCastling: 'king' });
            }
          }
          if (rights?.queenSide) {
             if (!board[from.row][1] && !board[from.row][2] && !board[from.row][3] && 
                 !this.isSquareAttacked(board, from, enemyColor) && 
                 !this.isSquareAttacked(board, {row: from.row, col: 3}, enemyColor)) {
              moves.push({ from, to: { row: from.row, col: 2 }, piece, isCastling: 'queen' });
            }
          }
        }
        break;
      }
    }
    return moves;
  }

  static getLegalMoves(state: GameState, from: Square): Move[] {
    const pseudo = this.getPseudoLegalMoves(state.board, from, state.enPassantTarget, state.castlingRights);
    return pseudo.filter(move => {
      const nextBoard = this.applyMove(state.board, move);
      return !this.isInCheck(nextBoard, state.turn);
    });
  }

  static applyMove(board: (Piece | null)[][], move: Move): (Piece | null)[][] {
    const next = board.map(r => [...r]);
    
    if (move.isEnPassant) {
      next[move.from.row][move.to.col] = null;
    }
    if (move.isCastling === 'king') {
      const rook = next[move.from.row][7];
      next[move.from.row][5] = rook;
      next[move.from.row][7] = null;
    }
    if (move.isCastling === 'queen') {
      const rook = next[move.from.row][0];
      next[move.from.row][3] = rook;
      next[move.from.row][0] = null;
    }

    next[move.to.row][move.to.col] = move.piece;
    next[move.from.row][move.from.col] = null;
    
    if (move.piece.type === 'p' && (move.to.row === 0 || move.to.row === 7)) {
      next[move.to.row][move.to.col] = { ...move.piece, type: 'q' };
    }
    return next;
  }

  static isInCheck(board: (Piece | null)[][], color: Color): boolean {
    let kingPos: Square | null = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = board[r][c];
        if (p && p.type === 'k' && p.color === color) {
          kingPos = { row: r, col: c };
          break;
        }
      }
    }
    if (!kingPos) return false;
    return this.isSquareAttacked(board, kingPos, color === 'w' ? 'b' : 'w');
  }

  static getGameStatus(state: GameState): { checkmate: boolean; stalemate: boolean; check: boolean } {
    const check = this.isInCheck(state.board, state.turn);
    let hasLegalMoves = false;
    
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p && p.color === state.turn) {
          if (this.getLegalMoves(state, { row: r, col: c }).length > 0) {
            hasLegalMoves = true;
            break;
          }
        }
      }
      if (hasLegalMoves) break;
    }

    return {
      check,
      checkmate: check && !hasLegalMoves,
      stalemate: !hasLegalMoves && !check
    };
  }
}
