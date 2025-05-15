/**
 * Layout Debugger Utility
 * 
 * This file contains utilities for debugging layout issues in the MCG application.
 * It adds visual debugging aids and logs important positioning data to help
 * identify DOM structure and CSS issues.
 */

/**
 * Adds colored outlines to key layout elements to visualize their boundaries
 */
export function enableLayoutDebugging() {
  console.log('[LayoutDebugger] Enabling visual layout debugging');
  
  // Add debugging styles
  const style = document.createElement('style');
  style.id = 'mcg-layout-debugger';
  style.innerHTML = `
    [data-debug-layout="true"] {
      outline: 2px solid rgba(255, 0, 0, 0.5) !important;
    }
    [data-debug-layout="chat"] {
      outline: 2px solid rgba(0, 255, 0, 0.5) !important;
      background-color: rgba(0, 255, 0, 0.05) !important;
    }
    [data-debug-layout="workbench"] {
      outline: 2px solid rgba(0, 0, 255, 0.5) !important;
      background-color: rgba(0, 0, 255, 0.05) !important;
    }
    [data-debug-layout="container"] {
      outline: 2px dashed rgba(255, 0, 255, 0.5) !important;
    }
  `;
  document.head.appendChild(style);
  
  // Add debug info for key layout elements
  setTimeout(() => {
    const debugElements = {
      'chat-panel': document.querySelector('[data-chat-visible]'),
      'workbench-panel': document.querySelector('[data-testid="workbench-panel"]'),
      'main-container': document.querySelector('.flex.flex-row.flex-grow.relative')
    };
    
    // Log DOM hierarchy and position info
    console.group('[LayoutDebugger] Layout Analysis');
    
    Object.entries(debugElements).forEach(([name, element]) => {
      if (!element) {
        console.log(`${name}: Not found in DOM`);
        return;
      }
      
      // Add debug attributes
      element.setAttribute('data-debug-layout', name === 'chat-panel' ? 'chat' : 
                                                name === 'workbench-panel' ? 'workbench' : 'container');
      
      // Get computed styles
      const styles = window.getComputedStyle(element);
      
      // Log layout properties
      console.group(`${name} Layout Info`);
      console.log('Element:', element);
      console.log('Position:', styles.position);
      console.log('Display:', styles.display);
      console.log('Z-index:', styles.zIndex);
      console.log('Width:', styles.width);
      console.log('Left/Right:', styles.left, styles.right);
      console.log('Margin:', styles.margin);
      console.log('Padding:', styles.padding);
      console.log('CSS Variables:', {
        workbenchWidth: styles.getPropertyValue('--workbench-width'),
        workbenchLeft: styles.getPropertyValue('--workbench-left'),
        chatWidth: styles.getPropertyValue('--chat-width'),
        chatMaxWidth: styles.getPropertyValue('--chat-max-width')
      });
      console.groupEnd();
    });
    
    // Check for any absolute/fixed positioned elements that might be interfering
    const absoluteElements = document.querySelectorAll('[style*="position: absolute"], [style*="position: fixed"]');
    console.log('Absolutely positioned elements that might interfere:', absoluteElements);
    
    console.groupEnd();
  }, 1000); // Delay to ensure DOM is fully rendered
}

/**
 * Logs essential state and props of Workbench and Chat components
 */
export function logComponentState(componentName, state) {
  console.group(`[LayoutDebugger] ${componentName} State`);
  console.table(state);
  console.groupEnd();
}

/**
 * Adds a debug overlay showing the workbench and chat panel boundaries
 */
export function addDebugOverlay() {
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 9999;
  `;
  overlay.id = 'mcg-debug-overlay';
  
  // Add panel guidelines
  const panels = ['Chat Panel', 'Workbench Panel'];
  panels.forEach((name, i) => {
    const marker = document.createElement('div');
    marker.textContent = name;
    marker.style.cssText = `
      position: absolute;
      top: 60px;
      ${i === 0 ? 'left: 10px;' : 'right: 10px;'}
      background-color: ${i === 0 ? 'rgba(0, 255, 0, 0.7)' : 'rgba(0, 0, 255, 0.7)'};
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    `;
    overlay.appendChild(marker);
  });
  
  document.body.appendChild(overlay);
}
