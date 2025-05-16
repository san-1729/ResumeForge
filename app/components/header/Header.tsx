import React from 'react';
import { useStore } from '@nanostores/react';
import { ClientOnly } from 'remix-utils/client-only';
import { chatStore } from '~/lib/stores/chat';
import { classNames } from '~/utils/classNames';
import { HeaderActionButtons } from './HeaderActionButtons.client';
import { UserProfileDropdown } from './UserProfileDropdown.client';
import { ChatDescription } from '~/lib/persistence/ChatDescription.client';
import { createSupabaseClient } from '~/lib/supabase/client.client';

export function Header() {
  console.log('📋 [Header] Component rendering');
  const chat = useStore(chatStore);
  
  // Add session logging on component mount
  React.useEffect(() => {
    const checkSessionStatus = async () => {
      try {
        const supabase = createSupabaseClient();
        if (!supabase) {
          console.log('❌ [Auth] Supabase client initialization failed');
          return;
        }
        
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ [Auth] Session error:', error.message);
          return;
        }
        
        if (data.session) {
          console.log('✅ [Auth] User authenticated:', {
            id: data.session.user.id,
            email: data.session.user.email,
            lastSignIn: new Date(data.session.user.last_sign_in_at || '').toLocaleString(),
          });
        } else {
          console.log('ℹ️ [Auth] No active session found');
        }
      } catch (err) {
        console.error('❌ [Auth] Unexpected auth check error:', err);
      }
    };
    
    checkSessionStatus();
  }, []);

  return (
    <header
      className={classNames(
        'flex items-center bg-bolt-elements-background-depth-1 p-5 border-b h-[var(--header-height)]',
        {
          'border-transparent': !chat.started,
          'border-bolt-elements-borderColor': chat.started,
        },
      )}
    >
      <div className="flex items-center gap-3 z-logo text-bolt-elements-textPrimary cursor-pointer">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg flex items-center justify-center">
          <div className="i-ph:file-text-duotone text-xl"></div>
        </div>
        <a href="/" className="text-2xl font-bold text-accent flex items-center">
          <span className="bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">MCG</span>
        </a>
      </div>
      <span className="flex-1 px-4 truncate text-center text-bolt-elements-textPrimary">
        <ClientOnly>{() => <ChatDescription />}</ClientOnly>
      </span>
      <ClientOnly>
        {() => (
          <div className="mr-1 flex items-center gap-2">
            {chat.started && <HeaderActionButtons />}
            {/* Always show user profile/login regardless of chat state */}
            <div className="ml-2">
              <UserProfileDropdown />
            </div>
          </div>
        )}
      </ClientOnly>
    </header>
  );
}
