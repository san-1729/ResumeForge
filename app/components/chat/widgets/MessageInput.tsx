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
