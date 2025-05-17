import React from 'react';
import { ChatShell } from './ChatShell';
import { HeaderMenu } from './widgets/HeaderMenu';
import { TemplateSelector } from './TemplateSelector.client';
import { Messages } from './Messages.client';
import { MessageInput } from './widgets/MessageInput';
import { useChatState } from './hooks/useChatState';
import { useScrollAnchor } from './hooks/useScrollAnchor';

export default function Chat() {
  const { template, messages, setMessages } = useChatState();
  const bottomRef = useScrollAnchor<HTMLDivElement>();

  const enqueue = (content: string) => {
    setMessages([
      ...messages,
      { id: crypto.randomUUID(), role: 'user', content, createdAt: Date.now() },
    ]);
  };

  return (
    <ChatShell>
      <div className="flex h-full w-full flex-col">
        <HeaderMenu />
        <TemplateSelector value={template} onChange={() => {}} />
        <div className="flex-1 overflow-y-auto">
          <Messages items={messages} bottomRef={bottomRef} />
          <div ref={bottomRef} />
        </div>
        <MessageInput onSend={enqueue} />
      </div>
    </ChatShell>
  );
}
