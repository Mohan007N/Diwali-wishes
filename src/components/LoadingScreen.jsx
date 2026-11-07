/* ═══════════════════════════════════════════════
   DIWALI — Cinematic Loading Screen
   ═══════════════════════════════════════════════ */
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingScreen({ isLoading }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          id="loading"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--midnight)',
            pointerEvents: 'auto',
          }}
        >
          {/* Animated 3D-like Diya */}
          <div
            className="load-diya"
            style={{
              width: '80px',
              height: '80px',
              position: 'relative',
              marginBottom: '28px',
            }}
          >
            {/* Flame */}
            <div
              className="load-flame"
              style={{
                position: 'absolute',
                bottom: '22px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '16px',
                height: '30px',
                background: 'radial-gradient(ellipse at 50% 80%, #fff7cf 0%, #FFD76A 40%, var(--saffron) 80%)',
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                animation: 'flicker 1.2s ease-in-out infinite',
                boxShadow: '0 0 24px 10px rgba(255,160,40,0.6), 0 0 60px 20px rgba(255,100,20,0.25)',
              }}
            />
            {/* Bowl */}
            <div
              className="load-bowl"
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '64px',
                height: '24px',
                background: 'linear-gradient(180deg, #e08a2d, #8b3a0b)',
                borderRadius: '4px 4px 50px 50px',
              }}
            />
          </div>

          {/* Pulse Text */}
          <div
            className="load-text"
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              letterSpacing: '0.25em',
              color: 'var(--antique-gold)',
              textTransform: 'uppercase',
              animation: 'pulse-text 2s ease-in-out infinite',
            }}
          >
            Lighting the way…
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

