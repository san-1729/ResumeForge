import { useStore } from '@nanostores/react';
import { useEffect } from 'react';
import { chatStore } from '~/lib/stores/chat';

/**
 * A component that attaches directly to the DOM to debug chat visibility issues
 */
export function ChatDebugger() {
  const { showChat } = useStore(chatStore);
  
  useEffect(() => {
    // Add debug info to the root element to directly observe state changes
    document.documentElement.setAttribute('data-debug-chat-visible', String(showChat));
    
    console.log('[ChatDebugger] Updated data-debug-chat-visible attribute:', showChat);
    
    // Force layout.css rules to evaluate on the main layout
    const mainLayout = document.getElementById('mcg-main-layout');
    if (mainLayout) {
      mainLayout.setAttribute('data-chat-visible', String(showChat));
      console.log('[ChatDebugger] Setting data-chat-visible directly on mcg-main-layout');
    }
    
    // Log and verify the hierarchy
    console.group('[ChatDebugger] DOM Structure Check');
    console.log('Root element:', document.documentElement);
    console.log('Main layout element:', mainLayout);
    console.log('BaseChat data-chat-visible element:', document.querySelector('[data-chat-visible]'));
    console.log('Chat container:', document.getElementById('mcg-chat-container'));
    console.log('Workbench container:', document.getElementById('mcg-workbench-container'));
    console.groupEnd();
    
    // Test direct style manipulation
    if (!showChat) {
      const chatContainer = document.getElementById('mcg-chat-container');
      if (chatContainer) {
        chatContainer.style.maxWidth = '0px';
        chatContainer.style.flexBasis = '0px';
        chatContainer.style.padding = '0px';
        chatContainer.style.overflow = 'hidden';
        console.log('[ChatDebugger] Applied direct styles for hidden chat');
      }
    }
  }, [showChat]);

  // This component doesn't render anything visible
  return null;
}
