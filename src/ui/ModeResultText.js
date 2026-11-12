const REASONS = Object.freeze({
  'destination-reached': 'গন্তব্যে পৌঁছেছেন / Destination reached',
  'time-limit': 'সময়ে প্রয়োজনীয় দূরত্ব পেরিয়েছেন / Minimum distance reached',
  'safe-dropoff': 'নিরাপদে পৌঁছেছেন / Safe drop-off',
  'relay-dropoff': 'রিলে সম্পন্ন / Relay completed',
  'cargo-damaged': 'কার্গো ক্ষতিগ্রস্ত / Cargo damaged',
  'kit-damaged': 'রিলে সরঞ্জাম ক্ষতিগ্রস্ত / Relay kit damaged',
  'time-expired': 'সময় শেষ / Time expired',
  'no-parcels-recovered': 'কোনো পার্সেল সংগ্রহ হয়নি / No parcels recovered',
  'insufficient-relays': 'যথেষ্ট লিংক চালু হয়নি / Not enough links',
});

export function modeResultText(result) {
  if (!result) return '';
  const outcome = result.outcome === 'success' ? 'সম্পন্ন / Complete' : result.outcome === 'failure' ? 'ব্যর্থ / Failed' : 'অসম্পূর্ণ / Incomplete';
  const reason = REASONS[result.reason] || '';
  return `${result.mode} · ${outcome}${reason ? ` · ${reason}` : ''} · Medal: ${result.medal}`;
}
