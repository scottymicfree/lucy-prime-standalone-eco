import { dataBus } from './eventBus.js';

/**
 * Normalizes event dispatching into the mesh architecture.
 * Ensures consistent shaping of events before they hit the swarm.
 */
export function emitEvent(eventType: string, payload: any) {
  const normalizedEvent = {
    type: eventType,
    payload,
    timestamp: Date.now()
  };
  
  console.log(`[EVENT EMITTED] ${eventType}`);
  dataBus.emit(eventType, normalizedEvent);
}
