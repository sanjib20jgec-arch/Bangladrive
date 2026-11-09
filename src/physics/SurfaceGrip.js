export const SURFACE_GRIP = Object.freeze({ DRY_ASPHALT: 1, MONSOON_PUDDLE: 0.65, TRAM_TRACK: 0.78, MUD_SHOULDER: 0.85 });

export function surfaceAt(x, z) {
  // Deterministic demo strips along the block; replace with collider/material tags in the full world.
  if (z < -42 && z > -54 && Math.abs(x) < 3.5) return SURFACE_GRIP.MONSOON_PUDDLE;
  if (Math.abs(x) < 0.42) return SURFACE_GRIP.TRAM_TRACK;
  if (Math.abs(x) > 8.2) return SURFACE_GRIP.MUD_SHOULDER;
  return SURFACE_GRIP.DRY_ASPHALT;
}
