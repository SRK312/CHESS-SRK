
import { PlayerProgress } from '../types.ts';
import { INITIAL_PROGRESS } from '../constants.ts';

const SAVE_KEY = 'chess_clash_elemental_save';

export const loadProgress = (): PlayerProgress => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return INITIAL_PROGRESS;
  try {
    const parsed = JSON.parse(saved);
    return { ...INITIAL_PROGRESS, ...parsed };
  } catch {
    return INITIAL_PROGRESS;
  }
};

export const saveProgress = (progress: PlayerProgress) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
};
