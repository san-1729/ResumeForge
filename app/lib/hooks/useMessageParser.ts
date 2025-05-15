import type { Message } from 'ai';
import { useCallback, useState } from 'react';
import { StreamingMessageParser } from '~/lib/runtime/message-parser';
import { workbenchStore } from '~/lib/stores/workbench';
import { createScopedLogger } from '~/utils/logger';

const logger = createScopedLogger('useMessageParser');

const messageParser = new StreamingMessageParser({
  callbacks: {
    onArtifactOpen: (data) => {
      logger.trace('onArtifactOpen', data);

      workbenchStore.showWorkbench.set(true);
      workbenchStore.addArtifact(data);
    },
    onArtifactClose: (data) => {
      logger.trace('onArtifactClose');

      workbenchStore.updateArtifact(data, { closed: true });

      // Persist resume/version to backend
      (async () => {
        try {
          const wc = await (await import('~/lib/webcontainer')).webcontainer;
          const container = await wc;
          const htmlBuf = await container.fs.readFile('index.html', 'utf8').catch(()=>null);
          const cssBuf = await container.fs.readFile('styles.css', 'utf8').catch(()=>null);
          if (!htmlBuf || !cssBuf) return;

          const html = String(htmlBuf);
          const css = String(cssBuf);

          const { api } = await import('~/lib/services/api.client');

          const resumeId = workbenchStore.resumeId.get();
          if (!resumeId) {
            const templateId = new URL(window.location.href).searchParams.get('template');
            const resp: any = await api('/api/resumes', {
              method: 'POST',
              body: JSON.stringify({
                title: data.title || 'Untitled Resume',
                templateId,
                html,
                css,
              }),
            });
            workbenchStore.resumeId.set(resp.id);
          } else {
            await api(`/api/resumes/${resumeId}/versions`, {
              method: 'POST',
              body: JSON.stringify({ html, css }),
            });
          }
        } catch (err) {
          console.warn('Failed to persist resume:', err);
        }
      })();
      
      // Set view to 'preview' when artifact generation is complete
      const previews = workbenchStore.previews.get();
      if (previews.length > 0) {
        workbenchStore.currentView.set('preview');
      }
    },
    onActionOpen: (data) => {
      logger.trace('onActionOpen', data.action);

      // we only add shell actions when when the close tag got parsed because only then we have the content
      if (data.action.type !== 'shell') {
        workbenchStore.addAction(data);
      }
    },
    onActionClose: (data) => {
      logger.trace('onActionClose', data.action);

      if (data.action.type === 'shell') {
        workbenchStore.addAction(data);
      }

      workbenchStore.runAction(data);
    },
  },
});

export function useMessageParser() {
  const [parsedMessages, setParsedMessages] = useState<{ [key: number]: string }>({});

  const parseMessages = useCallback((messages: Message[], isLoading: boolean) => {
    let reset = false;

    if (import.meta.env.DEV && !isLoading) {
      reset = true;
      messageParser.reset();
    }

    for (const [index, message] of messages.entries()) {
      if (message.role === 'assistant') {
        const newParsedContent = messageParser.parse(message.id, message.content);

        setParsedMessages((prevParsed) => ({
          ...prevParsed,
          [index]: !reset ? (prevParsed[index] || '') + newParsedContent : newParsedContent,
        }));
      }
    }
  }, []);

  return { parsedMessages, parseMessages };
}
