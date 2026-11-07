import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const pulseGlow = `
  @keyframes pulseGold {
    0%, 100% { box-shadow: 0 0 16px 4px rgba(212,166,74,0.3); }
    50% { box-shadow: 0 0 28px 8px rgba(255,215,106,0.5); }
  }
`;

export default function FireworksScene({
  isActive,
  onNext,
  onPrev,
  onLaunchFirework,
  onGrandFinale,
}) {
  const handlePointerDown = useCallback(
    (e) => {
      // Don't fire if clicking on buttons
      if (e.target.closest('button') || e.target.closest('[data-controls]')) return;

      const nx = e.clientX / window.innerWidth;
      const ny = e.clientY / window.innerHeight;
      if (onLaunchFirework) {
        onLaunchFirework(nx, ny);
      }
    },
    [onLaunchFirework]
  );

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          transition={{ duration: 0.6 }}
          onPointerDown={handlePointerDown}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            pointerEvents: 'auto',
            cursor: 'crosshair',
          }}
        >
          <style>{pulseGlow}</style>

          {/* Top section */}
          <div
            data-controls
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: 48,
              gap: 10,
              pointerEvents: 'none',
            }}
          >
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.5rem, 5vw, 2.8rem)',
                fontWeight: 700,
                letterSpacing: '0.15em',
                margin: 0,
                background: 'linear-gradient(135deg, #D4A64A 0%, #FFD76A 50%, #FF8A24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textAlign: 'center',
                filter: 'drop-shadow(0 0 20px rgba(212,166,74,0.3))',
              }}
            >
              Grand Fireworks
            </h2>
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(0.8rem, 1.8vw, 1rem)',
                color: '#a899cc',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '0.04em',
              }}
            >
              Tap anywhere in the sky · Click below for a grand finale
            </p>
          </div>

          {/* Bottom buttons */}
          <div
            data-controls
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingBottom: 36,
              gap: 14,
            }}
          >
            {/* Main buttons row */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {/* Grand Finale Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onGrandFinale?.();
                }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.88rem',
                  letterSpacing: '0.1em',
                  padding: '14px 32px',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  background: 'linear-gradient(135deg, #D4A64A, #FFD76A, #D4A64A)',
                  color: '#080817',
                  fontWeight: 700,
                  animation: 'pulseGold 2s ease-in-out infinite',
                  transition: 'transform 0.2s',
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.06)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                ✦ Grand Finale ✦
              </button>

              {/* Personalise wish */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext?.();
                }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.82rem',
                  letterSpacing: '0.06em',
                  padding: '12px 26px',
                  background: 'transparent',
                  border: '1.5px solid rgba(212,166,74,0.5)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#D4A64A',
                  fontWeight: 600,
                  transition: 'border-color 0.2s, background 0.2s',
                  pointerEvents: 'auto',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD76A';
                  e.currentTarget.style.background = 'rgba(212,166,74,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,166,74,0.5)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Personalise Your Wish →
              </button>
            </div>

            {/* Back button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev?.();
              }}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.72rem',
                letterSpacing: '0.06em',
                padding: '8px 18px',
                background: 'transparent',
                border: '1px solid rgba(168,153,204,0.3)',
                borderRadius: 4,
                cursor: 'pointer',
                color: '#a899cc',
                fontWeight: 500,
                transition: 'border-color 0.2s, color 0.2s',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,153,204,0.6)';
                e.currentTarget.style.color = '#D4A64A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(168,153,204,0.3)';
                e.currentTarget.style.color = '#a899cc';
              }}
            >
              ← Rangoli
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
