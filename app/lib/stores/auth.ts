import { atom } from 'nanostores';
import type { User } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  showAuthModal: boolean;
}

// Initial auth state
export const authStore = atom<AuthState>({
  user: null,
  isLoading: true,
  showAuthModal: false,
});

// Auth actions
export function setUser(user: User | null) {
  authStore.set({
    ...authStore.get(),
    user,
    isLoading: false,
    showAuthModal: user === null,
  });
}

export function setAuthLoading(isLoading: boolean) {
  authStore.set({
    ...authStore.get(),
    isLoading,
  });
}

export function showAuthModal(show: boolean) {
  authStore.set({
    ...authStore.get(),
    showAuthModal: show,
  });
}

export function clearAuthState() {
  authStore.set({
    user: null,
    isLoading: false,
    showAuthModal: true,
  });
}
