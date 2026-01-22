
import React from 'react';
import { Screen, PlayerProgress } from '../types';

interface MainMenuProps {
  progress: PlayerProgress;
  onNavigate: (screen: Screen) => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ progress, onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8 relative overflow-hidden text-slate-950">
      
      {/* Cinematic Backgrounds */}
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-100 to-transparent opacity-40" />
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-orange-100 to-transparent opacity-40" />
      
      <div className="absolute -top-48 -left-48 w-96 h-96 bg-blue-300/10 rounded-full blur-[160px] animate-pulse" />
      <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-orange-300/10 rounded-full blur-[160px] animate-pulse" />

      <div className="relative z-10 text-center space-y-20 max-w-4xl">
        <div className="space-y-4">
          <div className="inline-block px-8 py-2 bg-white/50 border border-slate-200 rounded-full text-blue-600 text-[10px] font-black tracking-[0.8em] uppercase backdrop-blur-md shadow-sm">
            The Eternal Conflict
          </div>
          <h1 className="text-[12rem] font-game leading-none tracking-tighter text-slate-950 drop-shadow-md">
            CHESS<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-slate-950 to-orange-600">CLASH</span>
          </h1>
          <p className="text-slate-400 font-medium tracking-[0.3em] uppercase text-xs">A 2-Player Tactical Arena</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch">
          <button 
            onClick={() => onNavigate(Screen.PLAYING)}
            className="group relative bg-slate-950 text-white font-black text-2xl px-20 py-10 rounded-2xl transition-all hover:scale-105 active:scale-95 overflow-hidden shadow-2xl"
          >
            <span className="relative z-10">COMMENCE BATTLE</span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
          
          <button 
            onClick={() => onNavigate(Screen.ARENAS)}
            className="bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 font-black text-2xl px-20 py-10 rounded-2xl transition-all backdrop-blur-xl shadow-xl"
          >
            THE ARENAS
          </button>
        </div>

        <div className="grid grid-cols-3 gap-12 pt-20 border-t border-slate-200">
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mb-2">Conquests</div>
            <div className="text-slate-950 text-4xl font-game">{progress.wins}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mb-2">Defeats</div>
            <div className="text-slate-950 text-4xl font-game">{progress.losses}</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400 text-[10px] uppercase font-bold tracking-[0.3em] mb-2">Truce</div>
            <div className="text-slate-950 text-4xl font-game">{progress.draws}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;