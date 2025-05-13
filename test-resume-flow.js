// Test file to diagnose resume generation issues
console.log('Loading test-resume-flow.js');

// Monitor for MessageParser activity
const originalParse = window.StreamingMessageParser?.prototype?.parse;
if (originalParse) {
  window.StreamingMessageParser.prototype.parse = function(messageId, input) {
    console.log('MessageParser.parse called', { messageId, inputLength: input.length });
    try {
      const result = originalParse.call(this, messageId, input);
      return result;
    } catch (error) {
      console.error('Error in MessageParser.parse', error);
      throw error;
    }
  };
}

// Monitor for ActionRunner activity
const originalRunAction = window.ActionRunner?.prototype?.runAction;
if (originalRunAction) {
  window.ActionRunner.prototype.runAction = function(data) {
    console.log('ActionRunner.runAction called', data);
    try {
      const result = originalRunAction.call(this, data);
      return result;
    } catch (error) {
      console.error('Error in ActionRunner.runAction', error);
      throw error;
    }
  };
}

// Check if Three.js is loaded correctly
setTimeout(() => {
  if (window.THREE) {
    console.log('THREE.js is loaded', { version: window.THREE.REVISION });
  } else {
    console.error('THREE.js is not loaded correctly');
  }
}, 2000);

// Monitor WebContainer activity
const webContainerMethods = [
  'fs.writeFile',
  'fs.mkdir',
  'spawn'
];

webContainerMethods.forEach(methodPath => {
  const parts = methodPath.split('.');
  let obj = window;
  let method = parts.pop();
  
  for (const part of parts) {
    obj = obj?.[part];
    if (!obj) return;
  }
  
  const original = obj?.[method];
  if (original && typeof original === 'function') {
    obj[method] = function(...args) {
      console.log(`WebContainer.${methodPath} called`, ...args);
      try {
        const result = original.apply(this, args);
        return result;
      } catch (error) {
        console.error(`Error in WebContainer.${methodPath}`, error);
        throw error;
      }
    };
  }
});

console.log('test-resume-flow.js loaded successfully'); 