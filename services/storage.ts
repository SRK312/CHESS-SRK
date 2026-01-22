
import { PlayerProgress } from '../types';
import { INITIAL_PROGRESS } from '../constants';

const SAVE_KEY = 'zen_archery_save';

export const loadProgress = (): PlayerProgress => {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) return INITIAL_PROGRESS;
  try {
    return { ...INITIAL_PROGRESS, ...JSON.parse(saved) };
  } catch {
    return INITIAL_PROGRESS;
  }
};

export const saveProgress = (progress: PlayerProgress) => {
  localStorage.setItem(SAVE_KEY, JSON.stringify(progress));
};
