import { SystemMessage } from './types';

type EventHandler = (msg: SystemMessage) => void;

export class EventBus {
  private listeners: Record<string, EventHandler[]> = {};
  private globalListeners: EventHandler[] = [];

  subscribe(type: string, handler: EventHandler) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(handler);
  }

  subscribeAll(handler: EventHandler) {
    this.globalListeners.push(handler);
  }

  publish(msg: SystemMessage) {
    this.globalListeners.forEach(handler => handler(msg));
    
    if (this.listeners[msg.type]) {
      this.listeners[msg.type].forEach(handler => handler(msg));
    }
  }

  unsubscribe(type: string, handler: EventHandler) {
    if (!this.listeners[type]) return;
    this.listeners[type] = this.listeners[type].filter(h => h !== handler);
  }
}

export const globalEventBus = new EventBus();
