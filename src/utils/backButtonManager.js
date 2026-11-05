import { App as CapApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

// Registered handlers: array of { id, handler, priority }
const handlers = [];
let isInitialized = false;
let exitTimer = null;
let toastCallback = null;

/**
 * Register a callback to show an exit-confirmation toast on the root Home screen.
 */
export function registerBackToastCallback(cb) {
  toastCallback = cb;
}

/**
 * Register a back-button handler with a given priority.
 * Higher priority runs first. Return `true` from your handler to mark
 * the back button as handled (preventing further handlers or app exit).
 *
 * @param {() => boolean} handler Function that returns true if it handled the event
 * @param {number} priority Priority level (default: 0)
 * @returns {() => void} Unregister function
 */
export function registerBackButtonHandler(handler, priority = 0) {
  const id = Math.random().toString(36).substring(2, 9);
  handlers.push({ id, handler, priority });
  handlers.sort((a, b) => b.priority - a.priority);

  return () => {
    const idx = handlers.findIndex(h => h.id === id);
    if (idx !== -1) {
      handlers.splice(idx, 1);
    }
  };
}

/**
 * Trigger back-button logic manually or from an event.
 */
export function triggerBackButton() {
  // Sort descending by priority so highest priority runs first
  const sorted = [...handlers].sort((a, b) => b.priority - a.priority);

  for (let i = 0; i < sorted.length; i++) {
    try {
      const handled = sorted[i].handler();
      if (handled) {
        // Successfully handled by a subscreen / modal / reader
        return true;
      }
    } catch (err) {
      console.error('Error in back-button handler:', err);
    }
  }

  // If no handler handled it, we are on the root Home screen
  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
    if (Capacitor.isPluginAvailable('App')) {
      CapApp.exitApp();
    }
    return true;
  }

  // First press on root Home screen: show prompt toast
  if (toastCallback) {
    toastCallback();
  }
  exitTimer = setTimeout(() => {
    exitTimer = null;
  }, 2000);

  return true;
}

/**
 * Initialize back-button listener for Capacitor Android & WebView.
 */
export function initBackButtonManager() {
  if (isInitialized) return;
  isInitialized = true;

  try {
    if (Capacitor.isPluginAvailable('App')) {
      CapApp.addListener('backButton', () => {
        triggerBackButton();
      });
    }
  } catch (err) {
    console.warn('Could not register Capacitor backButton listener:', err);
  }

  // Also listen for Cordova/Capacitor document backbutton event
  document.addEventListener('backbutton', (e) => {
    if (e && e.preventDefault) e.preventDefault();
    triggerBackButton();
  }, false);
}

