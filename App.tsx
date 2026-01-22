
import React, { useState, useEffect } from 'react';
import { Screen, PlayerProgress, GameState, Move, Color } from './types';
import { INITIAL_PROGRESS, INITIAL_BOARD, ARENAS } from './constants';
import { loadProgress, saveProgress } from './services/storage';
import { ChessEngine } from './services/ChessEngine';
import MainMenu from './components/MainMenu';
import ChessBoard from './components/ChessBoard';

const App: React.FC = () => {
  const [screen, setScreen] = useState<Screen>(Screen.HOME);
  const [progress, setProgress] = useState<PlayerProgress>(INITIAL_PROGRESS);
  const [redoStack, setRedoStack] = useState<Move[]>([]);
  const [showShareToast, setShowShareToast] = useState(false);

  // Define helper functions before they are used in state/effects
  const createInitialState = (): GameState => ({
    board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
    turn: 'w',
    lastMove: null,
    check: false,
    checkmate: false,
    stalemate: false,
    history: [],
    castlingRights: {
      w: { kingSide: true, queenSide: true },
      b: { kingSide: true, queenSide: true }
    },
    enPassantTarget: null
  });

  const processMove = (state: GameState, move: Move): GameState => {
    const nextBoard = ChessEngine.applyMove(state.board, move);
    const nextTurn: Color = state.turn === 'w' ? 'b' : 'w';

    const nextRights = JSON.parse(JSON.stringify(state.castlingRights));
    if (move.piece.type === 'k') {
      nextRights[state.turn] = { kingSide: false, queenSide: false };
    }
    if (move.piece.type === 'r') {
      if (move.from.col === 0) nextRights[state.turn].queenSide = false;
      if (move.from.col === 7) nextRights[state.turn].kingSide = false;
    }

    let nextEPT: any = null;
    if (move.piece.type === 'p' && Math.abs(move.to.row - move.from.row) === 2) {
      nextEPT = { row: (move.from.row + move.to.row) / 2, col: move.from.col };
    }

    const nextState: GameState = {
      ...state,
      board: nextBoard,
      turn: nextTurn,
      lastMove: move,
      history: [...state.history, move],
      castlingRights: nextRights,
      enPassantTarget: nextEPT
    };

    const status = ChessEngine.getGameStatus(nextState);
    return { ...nextState, ...status };
  };

  const [gameState, setGameState] = useState<GameState>(createInitialState);

  // Handle URL Sharing / Invitation Link
  useEffect(() => {
    const hash = window.location.hash.substring(1);
    if (hash) {
      try {
        const decoded = atob(hash);
        const moveStrings = decoded.split('|').filter(Boolean);
        let newState = createInitialState();
        
        moveStrings.forEach(moveStr => {
          const parts = moveStr.split('-');
          if (parts.length !== 2) return;
          const [f, t] = parts;
          const from = { row: parseInt(f[1]), col: f.charCodeAt(0) - 97 };
          const to = { row: parseInt(t[1]), col: t.charCodeAt(0) - 97 };
          const piece = newState.board[from.row]?.[from.col];
          
          if (piece) {
            const legalMoves = ChessEngine.getLegalMoves(newState, from);
            const valid = legalMoves.find(m => m.to.row === to.row && m.to.col === to.col);
            if (valid) {
              newState = processMove(newState, valid);
            }
          }
        });
        
        setGameState(newState);
        setScreen(Screen.PLAYING);
      } catch (e) {
        console.error("Failed to parse invitation link", e);
      }
    }
    
    const saved = loadProgress();
    setProgress(prev => ({ ...prev, ...saved }));
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handleMove = (move: Move) => {
    const legalMoves = ChessEngine.getLegalMoves(gameState, move.from);
    const validMove = legalMoves.find(m => m.to.row === move.to.row && m.to.col === move.to.col);
    if (!validMove) return;

    const nextState = processMove(gameState, validMove);
    setGameState(nextState);
    setRedoStack([]);

    if (nextState.checkmate) {
       setProgress(p => ({ 
         ...p, 
         wins: p.wins + (gameState.turn === 'w' ? 1 : 0), 
         losses: p.losses + (gameState.turn === 'w' ? 0 : 1),
         coins: p.coins + 150 
       }));
    } else if (nextState.stalemate) {
       setProgress(p => ({ ...p, draws: p.draws + 1, coins: p.coins + 50 }));
    }
  };

  const handleShare = () => {
    const moveHistory = gameState.history.map(m => {
      const f = `${String.fromCharCode(97 + m.from.col)}${m.from.row}`;
      const t = `${String.fromCharCode(97 + m.to.col)}${m.to.row}`;
      return `${f}-${t}`;
    }).join('|');
    
    const encoded = btoa(moveHistory);
    const url = `${window.location.origin}${window.location.pathname}#${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      window.location.hash = encoded;
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 3000);
    });
  };

  const undoMove = () => {
    if (gameState.history.length === 0) return;
    const lastMove = gameState.history[gameState.history.length - 1];
    setRedoStack(prev => [...prev, lastMove]);

    const historyToReplay = gameState.history.slice(0, -1);
    let newState = createInitialState();
    historyToReplay.forEach(move => { newState = processMove(newState, move); });
    setGameState(newState);
  };

  const redoMove = () => {
    if (redoStack.length === 0) return;
    const nextMove = redoStack[redoStack.length - 1];
    setRedoStack(prev => prev.slice(0, -1));
    const nextState = processMove(gameState, nextMove);
    setGameState(nextState);
  };

  const resetGame = () => { 
    setGameState(createInitialState()); 
    setRedoStack([]);
    window.location.hash = '';
  };

  const selectedArena = ARENAS.find(a => a.id === progress.selectedArena) || ARENAS[0];

  return (
    <div className="w-full h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans select-none">
      {screen === Screen.HOME && (
        <MainMenu progress={progress} onNavigate={setScreen} />
      )}

      {screen === Screen.PLAYING && (
        <div className="w-full h-full relative">
          <ChessBoard 
            arena={selectedArena}
            gameState={gameState}
            onMove={handleMove}
            onUndo={undoMove}
            onRedo={redoMove}
            canRedo={redoStack.length > 0}
            coins={progress.coins}
          />
          
          <div className="fixed top-8 right-40 z-50">
            <button 
              onClick={handleShare}
              className="bg-white/90 backdrop-blur-2xl border border-slate-200 px-6 py-5 rounded-[2.5rem] shadow-xl flex items-center gap-4 hover:scale-105 active:scale-95 transition-all group"
            >
              <div className="w-8 h-8 bg-slate-950 rounded-full flex items-center justify-center text-white transition-transform group-hover:rotate-12">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11 2.5a2.5 2.5 0 1 1 .603 1.628l-6.718 3.12a2.5 2.5 0 0 1 0 1.504l6.718 3.12a2.5 2.5 0 1 1-.488.876l-6.718-3.12a2.5 2.5 0 1 1 0-3.256l6.718-3.12A2.5 2.5 0 0 1 11 2.5"/>
                </svg>
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-950 pr-2">Invite Friend</span>
            </button>
          </div>

          <div className={`fixed bottom-32 left-1/2 -translate-x-1/2 z-[60] transition-all duration-500 transform ${showShareToast ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
             <div className="bg-slate-950 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-4 border border-white/10 backdrop-blur-md">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Invitation Link Copied!</span>
             </div>
          </div>
          
          {(gameState.checkmate || gameState.stalemate) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/20 backdrop-blur-2xl p-8">
               <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center space-y-10 max-w-lg w-full border border-slate-200">
                  <h1 className="text-6xl font-game leading-tight tracking-tighter text-slate-950">
                    {gameState.checkmate ? 'CONCLUDED' : 'EQUILIBRIUM'}
                  </h1>
                  <p className="text-slate-400 uppercase tracking-[0.8em] text-[10px] font-black">
                    {gameState.checkmate 
                      ? `${gameState.turn === 'w' ? 'EMBER LEGION' : 'GLACIAL ORDER'} SUPREME` 
                      : 'TACTICAL STALEMATE REACHED'}
                  </p>
                  <div className="flex flex-col gap-4">
                    <button 
                      onClick={resetGame}
                      className="bg-slate-950 text-white px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:scale-[1.05] active:scale-95 transition-all shadow-2xl w-full"
                    >
                      Rematch
                    </button>
                    <button 
                      onClick={() => {
                        setScreen(Screen.HOME);
                        window.location.hash = '';
                      }}
                      className="bg-slate-100 text-slate-600 px-12 py-6 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-200 transition-all w-full border border-slate-200"
                    >
                      Withdraw
                    </button>
                  </div>
               </div>
            </div>
          )}

          <button 
            onClick={() => {
              setScreen(Screen.HOME);
              window.location.hash = '';
            }}
            className="fixed top-8 right-8 bg-white/40 hover:bg-white w-12 h-12 flex items-center justify-center rounded-full border border-slate-200 transition-all backdrop-blur-xl z-50 text-slate-400 shadow-xl active:scale-90"
          >
            <span className="text-xl">✕</span>
          </button>
        </div>
      )}

      {screen === Screen.ARENAS && (
        <div className="p-10 md:p-24 overflow-y-auto h-full bg-slate-50">
           <button onClick={() => setScreen(Screen.HOME)} className="mb-16 text-slate-400 hover:text-slate-950 uppercase tracking-[0.5em] text-[10px] font-black flex items-center gap-3">
             <span className="text-xl">←</span> Return
           </button>
           <h1 className="text-6xl md:text-8xl font-game mb-20 text-slate-950 tracking-tighter">Tactical Arenas</h1>
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
             {ARENAS.map(a => (
               <div 
                 key={a.id}
                 onClick={() => {
                   setProgress(p => ({ ...p, selectedArena: a.id }));
                   setScreen(Screen.HOME);
                 }}
                 className={`p-12 border-2 rounded-[3rem] cursor-pointer transition-all duration-500 ${progress.selectedArena === a.id ? 'bg-white border-blue-500 shadow-2xl scale-[1.05]' : 'bg-white/50 border-slate-100 hover:border-slate-300'}`}
               >
                 <h2 className="text-3xl font-game mb-6 text-slate-950">{a.name}</h2>
                 <p className="text-slate-400 text-sm leading-relaxed mb-10 font-medium">{a.description}</p>
                 <div className="w-full h-1 bg-slate-100 rounded-full">
                   {progress.selectedArena === a.id && <div className="h-full bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6]" style={{ width: '100%' }} />}
                 </div>
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
