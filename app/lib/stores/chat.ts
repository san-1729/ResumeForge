import { map } from 'nanostores';

export const chatStore = map({
  started: false,
  aborted: false,
  showChat: true,
});

/**
 * Toggle the visibility of the chat panel
 * @param value Optional explicit value to set
 */
export function toggleChatVisibility(value?: boolean) {
  const currentValue = chatStore.get().showChat;
  chatStore.setKey('showChat', value !== undefined ? value : !currentValue);
}
