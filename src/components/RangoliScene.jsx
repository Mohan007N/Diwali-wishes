import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RangoliScene({ isActive, onNext, onPrev }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 40, transition: { duration: 0.4 } }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 20,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px 32px',
            pointerEvents: 'auto',
          }}
        >
          <div
            style={{
              background: 'rgba(8, 8, 23, 0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,166,74,0.18)',
              borderRadius: 18,
              padding: '28px 36px 24px',
              maxWidth: 560,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
            }}
          >
            {/* Heading */}
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1.1rem, 3.5vw, 1.6rem)',
                fontWeight: 700,
                letterSpacing: '0.12em',
                margin: 0,
                textAlign: 'center',
                background: 'linear-gradient(135deg, #D4A64A 0%, #FFD76A 50%, #D4A64A 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Festival of Colours
            </h2>

            {/* Subtitle */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                color: '#a899cc',
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              Sacred geometry, drawn in light and marigold
            </p>

            {/* Navigation buttons */}
            <div
              style={{
                display: 'flex',
                gap: 14,
                flexWrap: 'wrap',
                justifyContent: 'center',
                marginTop: 8,
              }}
            >
              <button
                onClick={onPrev}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  padding: '10px 22px',
                  background: 'transparent',
                  border: '1.5px solid rgba(212,166,74,0.4)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#D4A64A',
                  fontWeight: 600,
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD76A';
                  e.currentTarget.style.background = 'rgba(212,166,74,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,166,74,0.4)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                ← The Diya
              </button>

              <button
                onClick={onNext}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: '0.78rem',
                  letterSpacing: '0.06em',
                  padding: '10px 22px',
                  background: 'transparent',
                  border: '1.5px solid rgba(212,166,74,0.5)',
                  borderRadius: 6,
                  cursor: 'pointer',
                  color: '#D4A64A',
                  fontWeight: 600,
                  transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#FFD76A';
                  e.currentTarget.style.color = '#FFD76A';
                  e.currentTarget.style.background = 'rgba(212,166,74,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(212,166,74,0.5)';
                  e.currentTarget.style.color = '#D4A64A';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                Grand Fireworks →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
