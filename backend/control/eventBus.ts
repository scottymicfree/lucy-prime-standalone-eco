import { EventEmitter } from 'events';

export const EVENT_CATEGORIES = {
  HUMAN: "HUMAN.INPUT", // Windows key, UE5 build button, any direct human click/type
  LUCY: "LUCY.ACTION",  // proposals, simulations, dashboard flips — Emma's domain
  SYSTEM: "SYSTEM."     // internal spine events
};

// Central Event Bus for the 137-node swarm and dashboard events
export const dataBus = new EventEmitter();

// Optional: enhance with cooldowns or deduping filters if needed
// dataBus.setMaxListeners(137); 

export default dataBus;
