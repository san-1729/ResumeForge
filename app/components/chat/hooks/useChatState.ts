import { useStore } from '@nanostores/react';
import { useState, useEffect } from 'react';
import { templateStore } from '~/lib/stores/template';
import { linkedInStore } from '~/lib/stores/linkedin';
import type { Message } from '../lib/types';
import { toast } from 'react-toastify';

export function useChatState() {
  const template = useStore(templateStore);
  const linkedIn = useStore(linkedInStore);
  const [messages, setMessages] = useState<Message[]>([]);

  // example side‑effect — adjust/remove as needed
  useEffect(() => {
    if (template) toast(`Template switched to “${template}”`);
  }, [template]);

  return { template, linkedIn, messages, setMessages };
}
