/**
 * shareUtils.js
 * Sharing / export helpers for the Diwali greeting experience.
 */
import html2canvas from 'html2canvas';
import { buildWhatsAppUrl, getShareText } from './wishGenerator';

/**
 * Copy text to the clipboard.
 * @param {string} text
 * @returns {Promise<boolean>} true if successful
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers / insecure contexts
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(textarea);
    return ok;
  } catch (err) {
    console.error('copyToClipboard failed:', err);
    return false;
  }
}

/**
 * Open WhatsApp with a pre-filled Diwali message.
 */
export function shareOnWhatsApp(recipient, sender, wish) {
  const url = buildWhatsAppUrl(recipient, sender, wish);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Capture a DOM element as a PNG and trigger a download.
 * @param {HTMLElement|React.RefObject} elementRef – element or ref with `.current`
 * @param {string} filename – download filename (without extension)
 */
export async function downloadGreetingCard(elementRef, filename = 'diwali-greeting') {
  try {
    const el = elementRef?.current ?? elementRef;
    if (!el) {
      console.warn('downloadGreetingCard: no element provided');
      return false;
    }

    const canvas = await html2canvas(el, {
      backgroundColor: '#000000',
      scale: 2, // retina quality
      useCORS: true,
      logging: false,
    });

    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    const cleanFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.download = cleanFilename;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.error('downloadGreetingCard failed:', err);
    return false;
  }
}

/**
 * Check whether the Web Share API is available.
 */
export function canShare() {
  return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
}

/**
 * Use the native Web Share API to share text.
 * Falls back gracefully if unavailable.
 * @param {string} title
 * @param {string} text
 * @returns {Promise<boolean>}
 */
export async function nativeShare(title, text) {
  if (!canShare()) {
    console.warn('Web Share API not supported');
    return false;
  }
  try {
    await navigator.share({ title, text });
    return true;
  } catch (err) {
    // User cancelled or share failed
    if (err.name !== 'AbortError') {
      console.error('nativeShare failed:', err);
    }
    return false;
  }
}
