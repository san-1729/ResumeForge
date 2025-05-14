import { json, type MetaFunction } from '@remix-run/cloudflare';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { Chat } from '~/components/chat/Chat.client';
import { Header } from '~/components/header/Header';
import { Workbench } from '~/components/workbench/Workbench.client';

export const meta: MetaFunction = () => {
  return [
    { title: 'MCG - My Career Growth' }, 
    { name: 'description', content: 'Create professional, ATS-optimized resumes with MCG, your AI resume assistant' }
  ];
};

export const loader = () => json({});

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <Header />
      <div className="flex flex-row flex-grow relative">
        <ClientOnly fallback={<BaseChat />}>{() => <Chat />}</ClientOnly>
        <ClientOnly>{() => <Workbench />}</ClientOnly>
      </div>
    </div>
  );
}
