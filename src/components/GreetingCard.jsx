/* ═══════════════════════════════════════════════
   DIWALI — Shareable Greeting Card Modal
   ═══════════════════════════════════════════════ */
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadGreetingCard, shareOnWhatsApp, copyToClipboard } from '../utils/shareUtils';

export default function GreetingCard({ isOpen, onClose, recipient, sender, wish }) {
  const cardRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadGreetingCard(cardRef.current, `diwali-wish-${recipient || 'greeting'}.png`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  }, [recipient, downloading]);

  const handleCopy = useCallback(async () => {
    const text = `🪔 Happy Diwali ${recipient || 'Friend'}!\n\n${wish}\n\nWith love & light,\n${sender || 'Mohan'}`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  }, [recipient, sender, wish]);

  const handleWhatsApp = useCallback(() => {
    shareOnWhatsApp(recipient || 'Friend', sender || 'Mohan', wish);
  }, [recipient, sender, wish]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="greeting-card show"
        role="dialog"
        aria-modal="true"
        aria-label="Greeting card"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(8, 8, 23, 0.88)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          padding: '16px',
          pointerEvents: 'auto',
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          ref={cardRef}
          className="card-inner"
          id="greeting-card-capture"
          style={{
            background: 'linear-gradient(145deg, #170D2B 0%, #0d0820 100%)',
            border: '1px solid var(--antique-gold)',
            borderRadius: '24px',
            padding: '40px 36px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            position: 'relative',
            boxShadow: '0 0 60px rgba(212, 166, 74, 0.2), inset 0 0 40px rgba(212, 166, 74, 0.04)',
          }}
        >
          {/* Close button */}
          <button
            className="card-close"
            onClick={onClose}
            aria-label="Close card"
            style={{
              position: 'absolute',
              top: '14px',
              right: '16px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--muted)',
              fontSize: '1.5rem',
              lineHeight: 1,
              padding: '4px 8px',
              transition: 'color 0.2s',
            }}
          >
            ✕
          </button>

          {/* Diya ornament */}
          <div style={{ fontSize: '2.5rem', lineHeight: 1, marginBottom: '12px' }}>🪔</div>

          {/* Title */}
          <h2
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(1.8rem, 6vw, 2.8rem)',
              fontWeight: 700,
              margin: '0 0 8px',
              background: 'linear-gradient(180deg, #FFD76A, #D4A64A)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Happy Diwali
          </h2>

          {/* Recipient */}
          {recipient && (
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
                color: 'var(--ivory)',
                margin: '0 0 20px',
              }}
            >
              {recipient}
            </p>
          )}

          {/* Wish message */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: 'var(--muted)',
              lineHeight: 1.6,
              margin: '0 0 20px',
            }}
          >
            {wish || 'May the festival of lights bring joy, prosperity, and peace into your life.'}
          </p>

          {/* From */}
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: '1.1rem',
              color: 'var(--antique-gold)',
              margin: '0 0 24px',
            }}
          >
            With love & light, {sender || 'Mohan'}
          </p>

          {/* Actions */}
          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button
              className="btn btn-gold btn-sm"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Capturing…' : 'Download Card'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleWhatsApp}>
              Share on WhatsApp
            </button>
            <button className="btn btn-outline btn-sm" onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy Wish'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

