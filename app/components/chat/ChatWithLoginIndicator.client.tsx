import React from 'react';
import { BaseChat } from './BaseChat';
import { ClientOnly } from 'remix-utils/client-only';
import { LandingLoginIndicator } from '../header/LandingLoginIndicator.client';

/**
 * Wrapper component that adds a login indicator to the BaseChat component
 * without modifying BaseChat directly
 */
export function ChatWithLoginIndicator() {
  console.log('ChatWithLoginIndicator rendering');
  return (
    <div className="relative flex flex-col h-full w-full">
      {/* Add login indicator in top-right corner with improved visibility */}
      <div className="absolute top-5 right-5 z-[9999]" style={{pointerEvents: 'auto'}}>
        <ClientOnly fallback={<div className="py-2 px-4 bg-blue-500 text-white rounded-md">Loading...</div>}>
          {() => <LandingLoginIndicator />}
        </ClientOnly>
      </div>
      
      {/* The original BaseChat component */}
      <BaseChat />
    </div>
  );
}
