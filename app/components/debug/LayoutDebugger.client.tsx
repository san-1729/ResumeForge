import { useEffect } from 'react';
import { enableLayoutDebugging, addDebugOverlay } from '~/lib/debug/layoutDebugger';

/**
 * Debug component that activates layout debugging tools when the app is running
 * Only used in development and controlled by URL parameter ?debug=layout
 */
export function LayoutDebugger() {
  useEffect(() => {
    // Only activate debugger if URL has ?debug=layout parameter
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'layout') {
      console.log('[LayoutDebugger] Initializing layout debugging tools');
      enableLayoutDebugging();
      addDebugOverlay();
      
      // Log CSS variable values
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      console.group('[LayoutDebugger] CSS Variables');
      [
        '--workbench-width',
        '--workbench-inner-width',
        '--workbench-left',
        '--chat-width',
        '--chat-max-width',
        '--header-height'
      ].forEach(variable => {
        console.log(`${variable}:`, computedStyle.getPropertyValue(variable));
      });
      console.groupEnd();
      
      // Log DOM structure
      console.group('[LayoutDebugger] Component Structure');
      console.log('BaseChat Container:', document.querySelector('[data-chat-visible]'));
      console.log('Workbench Panel:', document.querySelector('[data-testid="workbench-panel"]'));
      console.log('Main Layout:', document.querySelector('.flex.flex-row.flex-grow'));
      console.groupEnd();
    }
  }, []);

  return null;
}
