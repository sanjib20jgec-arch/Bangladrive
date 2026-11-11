export const DELIVERY_RULES = Object.freeze({ distance: 600, checkpointDistance: 200, timeLimit: 45, minimumDistance: 250 });
export const RESCUE_RULES = Object.freeze({ distance: 600, pickupDistances: Object.freeze([150, 300, 450]), timeLimit: 60, laneLimit: 7, minimumRescues: 1 });
export const RELAY_RULES = Object.freeze({ distance: 600, relayDistances: Object.freeze([180, 360, 540]), timeLimit: 75, laneLimit: 7, minimumRelays: 2, relayScore: 60, integrityBonus: 60 });

export const MODE_TARGETS = Object.freeze({
  Delivery: { bronze: 250, silver: 400, gold: 600 }, Rescue: { bronze: 1, silver: 2, gold: 3 },
  'Drone Delivery': { bronze: 120, silver: 180, gold: 240 }, Escape: { bronze: 45, silver: 70, gold: 100 },
  Stunt: { bronze: 800, silver: 1600, gold: 2800 }, 'Time Trial': { bronze: 95, silver: 80, gold: 68 }, 'No Damage': { bronze: 70, silver: 85, gold: 100 },
});
