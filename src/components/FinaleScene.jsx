/* ═══════════════════════════════════════════════
   DIWALI — Scene 6: The Grand Finale
   ═══════════════════════════════════════════════ */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FinaleScene({
  isActive,
  recipient,
  sender,
  wish,
  onShowCard,
  onShareWhatsApp,
  onReplay,
}) {
  if (!isActive) return null;

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="scene active"
        role="region"
        aria-label="Grand Finale"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          textAlign: 'center',
          pointerEvents: 'auto',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '24px',
            maxWidth: '640px',
            width: '100%',
          }}
        >
          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.7rem, 2.5vw, 1rem)',
              letterSpacing: '0.35em',
              color: 'var(--antique-gold)',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Wishing You A Radiant
          </motion.p>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: 0.7 }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(3rem, 11vw, 6.5rem)',
              fontWeight: 700,
              lineHeight: 0.95,
              margin: 0,
              background: 'linear-gradient(180deg, #FFD76A 0%, #D4A64A 30%, #FF8A24 70%, #D4A64A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(255, 180, 40, 0.6))',
            }}
          >
            Happy
            <br />
            Diwali
          </motion.h2>

          {/* Message */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)',
              color: 'var(--ivory)',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {wish || 'May the light of a thousand diyas fill your home with joy, prosperity, and peace.'}
          </motion.p>

          {/* From */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.9 }}
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 'clamp(1rem, 2.8vw, 1.3rem)',
              color: 'var(--antique-gold)',
              margin: 0,
            }}
          >
            — With love, {sender || 'Mohan'}
          </motion.p>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 2.5 }}
            style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <button className="btn btn-gold" onClick={onShowCard}>
              View Greeting Card ✦
            </button>
            <button className="btn btn-outline" onClick={onShareWhatsApp}>
              Share on WhatsApp
            </button>
            <button className="btn btn-outline btn-sm" onClick={onReplay}>
              ↺ Replay
            </button>
          </motion.div>
        </div>
      </motion.section>
    </AnimatePresence>
  );
}

