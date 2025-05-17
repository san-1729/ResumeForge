#!/usr/bin/env bash
# ====================================================================
# chat‑refactor.sh — one‑shot script to create all new files *in place*
# ====================================================================
# Usage (from repo root):
#   bash scripts/chat-refactor.sh
# …then restart your dev server.
# --------------------------------------------------------------------
# This script is idempotent: run it again and it will just overwrite
# the same files.
# --------------------------------------------------------------------
set -euo pipefail

base="app/components/chat"
echo "📦  Creating directory tree under $base …"
mkdir -p "$base/hooks" "$base/widgets/LinkedIn" "$base/lib"

# -------------------------------------------------
# 1️⃣  ChatShell.tsx
# -------------------------------------------------
cat > "$base/ChatShell.tsx" <<'TS'
import React from 'react';
import { ResumeBackground } from '~/components/ui/ResumeBackground.client';
import { classNames } from '~/utils/classNames';

export const ChatShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ResumeBackground>
    <div className={classNames('flex h-full w-full')}>{children}</div>
  </ResumeBackground>
);
TS

echo "✓ ChatShell.tsx"

# -------------------------------------------------
# 2️⃣  hooks/useChatState.ts
# -------------------------------------------------
cat > "$base/hooks/useChatState.ts" <<'TS'
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
TS

echo "✓ hooks/useChatState.ts"

# -------------------------------------------------
# 3️⃣  hooks/useScrollAnchor.ts
# -------------------------------------------------
cat > "$base/hooks/useScrollAnchor.ts" <<'TS'
import { useRef, useEffect } from 'react';

export function useScrollAnchor<T extends HTMLElement>() {
  const anchorRef = useRef<T | null>(null);

  useEffect(() => {
    anchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  return anchorRef;
}
TS

echo "✓ hooks/useScrollAnchor.ts"

# -------------------------------------------------
# 4️⃣  lib/types.ts
# -------------------------------------------------
cat > "$base/lib/types.ts" <<'TS'
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: number;
}
TS

echo "✓ lib/types.ts"

# -------------------------------------------------
# 5️⃣  lib/linkedin.ts
# -------------------------------------------------
cat > "$base/lib/linkedin.ts" <<'TS'
import type { LinkedInProfile } from '~/lib/stores/linkedin';

export const formatLinkedInDataForPrompt = (profile: LinkedInProfile) =>
  [
    `Name: ${profile.fullName}`,
    `Headline: ${profile.headline}`,
    '',
    'Experience:',
    ...profile.experience.map(
      (exp) =>
        `- ${exp.title} @ ${exp.company} (${exp.startDate} – ${exp.endDate ?? 'Present'})`
    ),
    '',
    'Education:',
    ...profile.education.map(
      (edu) => `- ${edu.degree} @ ${edu.school} (${edu.year ?? '—'})`
    ),
  ].join('\n');
TS

echo "✓ lib/linkedin.ts"

# -------------------------------------------------
# 6️⃣  widgets/HeaderMenu.tsx
# -------------------------------------------------
cat > "$base/widgets/HeaderMenu.tsx" <<'TS'
import React from 'react';
import { Menu } from '~/components/sidebar/Menu.client';
import { LinkedInToggle } from '~/components/linkedin/LinkedInToggle.client';

export const HeaderMenu: React.FC = () => (
  <div className="flex items-center gap-2 px-4 py-2">
    <Menu />
    <LinkedInToggle />
  </div>
);
TS

echo "✓ widgets/HeaderMenu.tsx"

# -------------------------------------------------
# 7️⃣  widgets/MessageInput.tsx
# -------------------------------------------------
cat > "$base/widgets/MessageInput.tsx" <<'TS'
import React, { useState } from 'react';
import { SendButton } from '../SendButton.client';

interface Props {
  onSend: (message: string) => void;
}

export const MessageInput: React.FC<Props> = ({ onSend }) => {
  const [text, setText] = useState('');

  const push = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  return (
    <div className="flex items-end gap-2 border-t p-4">
      <textarea
        className="flex-1 resize-none rounded-md border p-2 text-sm focus:outline-none"
        rows={2}
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            push();
          }
        }}
      />
      <SendButton onClick={push} disabled={!text.trim()} />
    </div>
  );
};
TS

echo "✓ widgets/MessageInput.tsx"

# -------------------------------------------------
# 8️⃣  Chat.tsx (new orchestrator)
# -------------------------------------------------
cat > "$base/Chat.tsx" <<'TS'
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
TS

echo "✓ Chat.tsx"

# -------------------------------------------------
# 9️⃣  index.ts barrel
# -------------------------------------------------
cat > "$base/index.ts" <<'TS'
export { default as Chat } from './Chat';
export * from './ChatShell';
export * from './hooks/useChatState';
export * from './hooks/useScrollAnchor';
export * from './lib/linkedin';
export * from './lib/types';
TS

echo "✓ index.ts"

# -------------------------------------------------
# 🔟  Legacy shim for BaseChat.client.tsx
# -------------------------------------------------
cat > "$base/BaseChat.client.tsx" <<'TS'
// DO NOT DELETE: keeps existing imports working while you migrate.
export { default } from './Chat';
TS

echo "✓ BaseChat.client.tsx shim (re‑export)"

echo -e "\n🎉  Refactor complete — new files created. Restart your dev server and enjoy a cleaner codebase!"
