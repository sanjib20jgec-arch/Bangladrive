export const VEHICLES = Object.freeze([
  Object.freeze({ id: 'holud-taxi', name: 'Holud Taxi', color: '#dcae24', cost: 0 }),
  Object.freeze({ id: 'tin-chaka', name: 'Tin-Chaka Rocket Auto', color: '#439e77', cost: 900 }),
  Object.freeze({ id: 'drift-coupe', name: 'Drift Coupe', color: '#ca5541', cost: 1500 }),
  Object.freeze({ id: 'machh-van', name: 'Machh-er Van', color: '#678baa', cost: 1200 }),
]);

export const UPGRADES = Object.freeze([
  Object.freeze({ id: 'engine', label: 'Engine', baseCost: 250, maxLevel: 5 }),
  Object.freeze({ id: 'driftTires', label: 'Drift Tires', baseCost: 220, maxLevel: 5 }),
  Object.freeze({ id: 'nitroTank', label: 'Nitro Tank', baseCost: 200, maxLevel: 5 }),
  Object.freeze({ id: 'bumper', label: 'Desi Bumper', baseCost: 180, maxLevel: 5 }),
  Object.freeze({ id: 'suspension', label: 'Suspension', baseCost: 240, maxLevel: 5 }),
]);

export const CONTRACTS = Object.freeze([
  Object.freeze({ id: 'near-miss', title: 'চুল-চেরা পাস ×3', target: 3, reward: 180 }),
  Object.freeze({ id: 'drift', title: 'ড্রিফট টিয়ার ×3', target: 3, reward: 220 }),
  Object.freeze({ id: 'chaos', title: 'বাজারে কাণ্ড ×4', target: 4, reward: 200 }),
]);

export const LIVERIES = Object.freeze([
  Object.freeze({ id: 'holud', label: 'হলুদ' }),
  Object.freeze({ id: 'cream', label: 'ক্রিম' }),
  Object.freeze({ id: 'green', label: 'সবুজ' }),
]);

export const QUALITY_MODES = Object.freeze(['auto', 'low', 'medium', 'high', 'ultra']);
export const HUD_SIZES = Object.freeze(['standard', 'large']);
export const MOTION_MODES = Object.freeze(['system', 'reduced', 'standard']);
export const CONTROL_MODES = Object.freeze(['split', 'joystick']);
export const MODE_MEDALS = Object.freeze(['none', 'bronze', 'silver', 'gold']);
export const PROFILE_SCHEMA_VERSION = 7;
export const MAX_TAKA = 10_000_000;
export const MAX_RESPECT_XP = 100_000_000;
