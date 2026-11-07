import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DIYAS = [
  { id: 'health', label: 'Health', color: '#FF8A24' },
  { id: 'joy', label: 'Joy', color: '#FFD76A' },
  { id: 'wealth', label: 'Wealth', color: '#D4A64A' },
  { id: 'love', label: 'Love', color: '#D83B83' },
  { id: 'peace', label: 'Peace', color: '#FFF4DD' },
];

const flameKeyframes = `
  @keyframes flameFlicker {
    0%, 100% { transform: scaleX(1) scaleY(1) rotate(-1deg); }
    25% { transform: scaleX(0.95) scaleY(1.04) rotate(1deg); }
    50% { transform: scaleX(1.03) scaleY(0.97) rotate(-0.5deg); }
    75% { transform: scaleX(0.97) scaleY(1.02) rotate(1.5deg); }
  }
  @keyframes flameLightUp {
    from { transform: scale(0.1); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }
`;

function DiyaButton({ diya, isLit, onToggle }) {
  return (
    <button
      onClick={() => onToggle(diya.id)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px 12px',
        transition: 'transform 0.2s',
        minWidth: 60,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
      }}
      aria-label={`${isLit ? 'Extinguish' : 'Light'} diya for ${diya.label}`}
    >
      {/* Flame */}
      <div
        style={{
          width: 16,
          height: 24,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          background: isLit
            ? `radial-gradient(ellipse at 50% 60%, #FFF4DD 0%, ${diya.color} 40%, rgba(255,138,36,0.4) 80%, transparent 100%)`
            : 'transparent',
          boxShadow: isLit
            ? `0 0 12px 4px ${diya.color}88, 0 0 30px 8px ${diya.color}44, 0 -8px 20px 4px rgba(255,215,106,0.3)`
            : 'none',
          opacity: isLit ? 1 : 0,
          transform: isLit ? 'scale(1)' : 'scale(0.1)',
          animation: isLit ? 'flameLightUp 0.5s ease-out forwards, flameFlicker 1.5s ease-in-out infinite' : 'none',
          transition: 'opacity 0.4s, transform 0.4s',
          marginBottom: 2,
        }}
      />

      {/* Bowl */}
      <div
        style={{
          width: 36,
          height: 14,
          background: isLit
            ? `linear-gradient(180deg, ${diya.color}, #8B5E20)`
            : 'linear-gradient(180deg, #5a4a30, #3a2a18)',
          borderRadius: '4px 4px 50% 50%',
          boxShadow: isLit
            ? `0 4px 16px ${diya.color}44, inset 0 -2px 4px rgba(0,0,0,0.3)`
            : 'inset 0 -2px 4px rgba(0,0,0,0.3)',
          transition: 'background 0.4s, box-shadow 0.4s',
        }}
      />

      {/* Label */}
      <span
        style={{
          fontFamily: "'Cinzel', serif",
          fontSize: '0.65rem',
          letterSpacing: '0.1em',
          color: isLit ? diya.color : '#a899cc',
          textTransform: 'uppercase',
          marginTop: 4,
          transition: 'color 0.3s',
        }}
      >
        {diya.label}
      </span>
    </button>
  );
}

export default function DiyaScene({ isActive, onNext, onLightDiya, litDiyas = [], onToggleDiya }) {
  const isBoolArray = Array.isArray(litDiyas) && typeof litDiyas[0] === 'boolean';
  const litCount = isBoolArray
    ? litDiyas.filter(Boolean).length
    : litDiyas.length;
  const allLit = litCount === 5;

  const handleToggle = useCallback(
    (id, index) => {
      if (onToggleDiya) {
        onToggleDiya(isBoolArray ? index : id);
      }
      if (onLightDiya) {
        onLightDiya(id);
      }
    },
    [onToggleDiya, onLightDiya, isBoolArray]
  );

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
          <style>{flameKeyframes}</style>

          <div
            style={{
              background: 'rgba(8, 8, 23, 0.55)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(212,166,74,0.18)',
              borderRadius: 18,
              padding: '28px 36px 24px',
              maxWidth: 620,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
            }}
          >
            {/* Title */}
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                fontVariant: 'small-caps',
                color: '#D4A64A',
                letterSpacing: '0.15em',
                margin: 0,
                textAlign: 'center',
              }}
            >
              The Sacred Flame
            </h2>

            {/* Quote */}
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
                color: '#FFF4DD',
                opacity: 0.8,
                margin: 0,
                textAlign: 'center',
                lineHeight: 1.5,
              }}
            >
              "One little flame can illuminate a thousand dreams."
            </p>

            {/* Diya Grid */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'clamp(8px, 3vw, 20px)',
                flexWrap: 'wrap',
                margin: '8px 0',
              }}
            >
              {DIYAS.map((diya, index) => (
                <DiyaButton
                  key={diya.id}
                  diya={diya}
                  isLit={isBoolArray ? !!litDiyas[index] : litDiyas.includes(diya.id)}
                  onToggle={() => handleToggle(diya.id, index)}
                />
              ))}
            </div>

            {/* Status message */}
            <motion.p
              key={litCount}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '0.9rem',
                color: allLit ? '#FFD76A' : '#a899cc',
                margin: 0,
                textAlign: 'center',
                fontStyle: 'italic',
              }}
            >
              {allLit
                ? '✨ All five diyas lit! May every blessing find you.'
                : `${litCount} of 5 lit · Light glows for you.`}
            </motion.p>

            {/* Next button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: allLit ? 1 : 0.5 }}
              onClick={onNext}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.82rem',
                letterSpacing: '0.08em',
                padding: '12px 28px',
                background: 'transparent',
                border: '1.5px solid rgba(212,166,74,0.5)',
                borderRadius: 6,
                cursor: 'pointer',
                color: '#D4A64A',
                fontWeight: 600,
                transition: 'border-color 0.2s, color 0.2s, background 0.2s',
                marginTop: 4,
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
              Explore the Rangoli →
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
