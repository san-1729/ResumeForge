import { atom } from 'nanostores';

export interface TemplateState {
  selectedTemplateId: string | null;
  appliedTemplateId: string | null;
}

export const templateStore = atom<TemplateState>({
  selectedTemplateId: null,
  appliedTemplateId: null,
});

export const selectTemplate = (templateId: string) => {
  templateStore.set({
    ...templateStore.get(),
    selectedTemplateId: templateId,
  });
};

export const applyTemplate = () => {
  const currentState = templateStore.get();
  templateStore.set({
    ...currentState,
    appliedTemplateId: currentState.selectedTemplateId,
  });
};

export const resetTemplateSelection = () => {
  templateStore.set({
    selectedTemplateId: null,
    appliedTemplateId: null,
  });
}; 