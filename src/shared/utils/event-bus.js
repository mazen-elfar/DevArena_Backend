import { domainEventQueue } from "../../jobs/index.js";

/**
 * DomainEventBus
 * Centralized service for emitting domain events across the ecosystem.
 * Events are processed asynchronously via BullMQ.
 */
export const DomainEventBus = {
  /**
   * Emit a domain event.
   * @param {string} eventType - The type of event (e.g., 'BATTLE_WON', 'POST_CREATED')
   * @param {object} payload - The data associated with the event
   */
  async emit(eventType, payload) {
    if (!domainEventQueue) {
      console.warn(`[DomainEventBus] Queue not initialized. Skipping event: ${eventType}`);
      return;
    }

    try {
      await domainEventQueue.add(eventType, {
        eventType,
        payload,
        timestamp: new Date().toISOString()
      }, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000
        }
      });
      console.log(`[DomainEventBus] Emitted: ${eventType}`);
    } catch (error) {
      console.error(`[DomainEventBus] Failed to emit event ${eventType}:`, error.message);
    }
  }
};
