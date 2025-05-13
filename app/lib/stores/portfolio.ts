import { atom } from 'nanostores';

export interface PortfolioState {
  mode: 'resume' | 'portfolio';
  convertedFromResumeId: string | null;
  showConverter: boolean;
}

export const portfolioStore = atom<PortfolioState>({
  mode: 'resume',
  convertedFromResumeId: null,
  showConverter: false,
});

export const setPortfolioMode = (mode: 'resume' | 'portfolio') => {
  portfolioStore.set({
    ...portfolioStore.get(),
    mode: mode,
  });
};

export const showPortfolioConverter = (show: boolean) => {
  portfolioStore.set({
    ...portfolioStore.get(),
    showConverter: show,
  });
};

export const convertToPortfolio = (resumeId: string) => {
  portfolioStore.set({
    mode: 'portfolio',
    convertedFromResumeId: resumeId,
    showConverter: false,
  });
}; 