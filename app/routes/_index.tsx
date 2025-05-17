import { json, type MetaFunction } from '@remix-run/node';
import { useStore } from '@nanostores/react';
import { chatStore } from '~/lib/stores/chat';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { Workbench } from '~/components/workbench/Workbench.client';
import { ChatWithLoginIndicator } from '~/components/chat/ChatWithLoginIndicator.client';

export const meta: MetaFunction = () => {
  return [
    { title: 'MCG - My Career Growth' }, 
    { name: 'description', content: 'Create professional, ATS-optimized resumes with MCG, your AI resume assistant' }
  ];
};

export const loader = () => json({});

export default function Index() {
  // Access chatStore to get chat state
  const { showChat, started: chatStarted } = useStore(chatStore);
  
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <Header />
      <div 
        className="flex flex-row flex-grow relative overflow-hidden" 
        id="mcg-main-layout"
        data-chat-visible={showChat}
        data-chat-started={chatStarted}
      >
        <div className="flex-grow flex min-w-0" id="mcg-chat-container">
          <ClientOnly fallback={<ChatWithLoginIndicator />}>{() => <Chat />}</ClientOnly>
        </div>
        <ClientOnly>{() => <Workbench />}</ClientOnly>
      </div>
    </div>
  );
}
