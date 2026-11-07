/**
 * wishGenerator.js
 * Curated Top 10 Diwali 2026 Masterpiece Quotes & Sharing Utilities
 */

export const TOP_10_QUOTES = [
  "{n}, may every diya you light tonight carry your deepest prayers skyward, and may the year 2026 blaze as brilliantly as this very moment.",
  "Here's to you, {n} — a soul as radiant as the sacred flame. May Goddess Lakshmi's golden footprints grace your threshold with eternal abundance, peace, and boundless joy.",
  "{n}, as darkness surrenders to a thousand shimmering lights, may every quiet dream you've nurtured awaken into breathtaking reality this Diwali 2026.",
  "To {n}, whose kindness illuminates the lives of everyone around them — may this Festival of Lights return tenfold the warmth, love, and grace you give to the world.",
  "{n}, may the vibrant colours of rangoli paint your year ahead with vibrant health, sweet laughter, unshakeable peace, and prosperity that knows no bounds.",
  "Across every distance and beneath this starlit sky, {n}, this sacred flame burns for you. May your path always be lighted with courage, triumph, and genuine companionship.",
  "{n}, let the symphony of crackers ignite your spirit and let the glow of diyas melt every lingering sorrow. You are destined for a magnificent chapter in 2026.",
  "Dear {n}, may your home always smell of fresh marigold and sweets, your heart always brim with gratitude, and your life always shine brighter than the northern stars.",
  "{n}, when darkness falls, a thousand lights awaken — but none shine more genuinely than your own spirit. Happy Diwali 2026!",
  "{n}, may this divine festival whisper peace into your soul, shower your loved ones with blessings, and craft a year of golden memories that linger forever.",
];

/**
 * Deterministic hash from name string.
 */
export function nameHash(name) {
  const str = (name || '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    hash = (hash << 5) - hash + ch;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get quote by explicit index (0-9).
 */
export function getQuoteByIndex(name, index = 0) {
  const idx = Math.abs(index) % TOP_10_QUOTES.length;
  const displayName = (name || 'Friend').trim();
  return TOP_10_QUOTES[idx].replace(/\{n\}/g, displayName);
}

/**
 * Pick a personalized wish for the given name.
 */
export function getWish(name, cycleIndex = 0) {
  const idx = (nameHash(name) + cycleIndex) % TOP_10_QUOTES.length;
  const displayName = (name || 'Friend').trim();
  return TOP_10_QUOTES[idx].replace(/\{n\}/g, displayName);
}

/**
 * Build a WhatsApp share URL with Diwali 2026 styling.
 */
export function buildWhatsAppUrl(recipient, sender, wish) {
  const text = getShareText(recipient, sender, wish);
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

/**
 * Build formatted text for clipboard / WhatsApp sharing.
 */
export function getShareText(recipient, sender, wish) {
  const lines = [
    `🪔✨ Happy Diwali 2026, ${recipient}! ✨🪔`,
    '',
    `"${wish}"`,
    '',
    `With love, light & warmest blessings,`,
    `${sender || 'A Well-Wisher'} 🌟`,
  ];
  return lines.join('\n');
}
