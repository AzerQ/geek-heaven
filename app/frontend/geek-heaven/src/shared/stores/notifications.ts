/**
 * Notifications store for managing application notifications
 */

import { writable, derived } from 'svelte/store';

// Browser detection
const browser = typeof window !== 'undefined';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: string;
  duration?: number; // in milliseconds, 0 means persistent
  actions?: NotificationAction[];
  read?: boolean;
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

export interface NotificationsState {
  active: Notification[];
  history: Notification[];
  unreadCount: number;
}

const STORAGE_KEY = 'geek-heaven-notifications';
const MAX_ACTIVE_NOTIFICATIONS = 5;
const DEFAULT_DURATION = 5000; // 5 seconds

// Load notifications history from localStorage
function loadNotificationsHistory(): Notification[] {
  if (!browser) return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load notifications history:', error);
    return [];
  }
}

// Save notifications history to localStorage
function saveNotificationsHistory(history: Notification[]): void {
  if (!browser) return;
  
  try {
    // Keep only last 100 notifications in history
    const limitedHistory = history.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Failed to save notifications history:', error);
  }
}

// Generate unique ID for notifications
function generateId(): string {
  return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

const initialState: NotificationsState = {
  active: [],
  history: loadNotificationsHistory(),
  unreadCount: 0
};

// Calculate initial unread count
initialState.unreadCount = initialState.history.filter(n => !n.read).length;

function createNotificationsStore() {
  const { subscribe, set, update } = writable<NotificationsState>(initialState);

  // Auto-remove notifications after their duration
  const autoRemoveTimers = new Map<string, number>();

  function scheduleAutoRemove(notification: Notification) {
    if (notification.duration === 0) return; // Persistent notification
    
    const duration = notification.duration || DEFAULT_DURATION;
    const timerId = window.setTimeout(() => {
      removeNotification(notification.id);
      autoRemoveTimers.delete(notification.id);
    }, duration);
    
    autoRemoveTimers.set(notification.id, timerId);
  }

  function clearAutoRemoveTimer(notificationId: string) {
    const timerId = autoRemoveTimers.get(notificationId);
    if (timerId) {
      clearTimeout(timerId);
      autoRemoveTimers.delete(notificationId);
    }
  }

  function addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: generateId(),
      timestamp: new Date().toISOString(),
      read: false
    };

    update(state => {
      const newActive = [...state.active, newNotification];
      
      // Remove oldest if exceeding max active notifications
      if (newActive.length > MAX_ACTIVE_NOTIFICATIONS) {
        const removed = newActive.shift();
        if (removed) {
          clearAutoRemoveTimer(removed.id);
        }
      }

      const newHistory = [...state.history, newNotification];
      saveNotificationsHistory(newHistory);

      const newState = {
        active: newActive,
        history: newHistory,
        unreadCount: state.unreadCount + 1
      };

      return newState;
    });

    // Schedule auto-remove for the new notification
    if (browser) {
      scheduleAutoRemove(newNotification);
    }

    return newNotification.id;
  }

  function removeNotification(notificationId: string) {
    clearAutoRemoveTimer(notificationId);
    
    update(state => ({
      ...state,
      active: state.active.filter(n => n.id !== notificationId)
    }));
  }

  function markAsRead(notificationId: string) {
    update(state => {
      const updatedHistory = state.history.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      saveNotificationsHistory(updatedHistory);
      
      return {
        ...state,
        history: updatedHistory,
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    });
  }

  function markAllAsRead() {
    update(state => {
      const updatedHistory = state.history.map(n => ({ ...n, read: true }));
      saveNotificationsHistory(updatedHistory);
      
      return {
        ...state,
        history: updatedHistory,
        unreadCount: 0
      };
    });
  }

  function clearHistory() {
    update(state => {
      saveNotificationsHistory([]);
      return {
        ...state,
        history: [],
        unreadCount: 0
      };
    });
  }

  function clearActive() {
    update(state => {
      // Clear all auto-remove timers
      state.active.forEach(notification => {
        clearAutoRemoveTimer(notification.id);
      });
      
      return {
        ...state,
        active: []
      };
    });
  }

  return {
    subscribe,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearHistory,
    clearActive,
    
    // Convenience methods for different notification types
    success: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'error', title, message, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'warning', title, message, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Notification>) => 
      addNotification({ type: 'info', title, message, ...options })
  };
}

export const notifications = createNotificationsStore();

// Derived stores for convenience
export const activeNotifications = derived(
  notifications,
  $notifications => $notifications.active
);

export const notificationsHistory = derived(
  notifications,
  $notifications => $notifications.history
);

export const unreadNotificationsCount = derived(
  notifications,
  $notifications => $notifications.unreadCount
);