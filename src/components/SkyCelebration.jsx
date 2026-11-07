import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SkyCelebration({
  recipient,
  cinematicStage,
  onLaunchCracker,
  onBurstSkyButton,
  onSwipeDown,
  isMuted,
  onToggleMute,
  trackName,
}) {
  const letters = recipient ? recipient.split('') : ['D', 'i', 'w', 'a', 'l', 'i'];
  const touchStartY = React.useRef(0);

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = touchStartY.current - e.changedTouches[0].clientY;
    if (deltaY > 40) {
      onSwipeDown?.();
    }
  };

  const handleWheel = (e) => {
    if (e.deltaY > 25) {
      onSwipeDown?.();
    }
  };

  const handleSkyClick = (e) => {
    if (e.target.closest('button') || e.target.closest('[data-no-burst]')) return;
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    if (onLaunchCracker) {
      onLaunchCracker(nx, ny);
    }
  };

  const isNameRevealed =
    cinematicStage === 'NAME_AND_WISH_REVEAL' ||
    cinematicStage === 'GRAND_FIREWORKS' ||
    cinematicStage === 'INTERACTIVE_CELEBRATION';

  const isInteractive =
    cinematicStage === 'GRAND_FIREWORKS' ||
    cinematicStage === 'INTERACTIVE_CELEBRATION';

  return (
    <section
      id="sky-section"
      onClick={handleSkyClick}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 20px 32px',
        boxSizing: 'border-box',
        overflow: 'hidden',
        cursor: isInteractive ? 'crosshair' : 'default',
        userSelect: 'none',
      }}
    >
      {/* ── Top Bar ── */}
      <header
        data-no-burst
        style={{
          width: '100%',
          maxWidth: '1200px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>🪔</span>
          <span
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.82rem',
              letterSpacing: '0.22em',
              color: '#FFD76A',
              textTransform: 'uppercase',
            }}
          >
            Diwali 2026
          </span>
        </div>

        {/* Music Player & Mute Controller */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onToggleMute}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: '50px',
              background: 'rgba(5, 5, 8, 0.75)',
              border: '1px solid rgba(212, 166, 74, 0.35)',
              color: '#FFF4DD',
              fontFamily: "'Hind', sans-serif",
              fontSize: '0.82rem',
              letterSpacing: '0.05em',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              transition: 'border-color 0.2s, background 0.2s',
            }}
            title={isMuted ? 'Unmute music' : 'Mute music'}
          >
            <span style={{ fontSize: '0.95rem' }}>{isMuted ? '🔇' : '🎵'}</span>
            <span style={{ color: '#FFD76A', fontWeight: 600 }}>
              {trackName || 'ReelAudio-53164'}
            </span>
            <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>
              ({isMuted ? 'Muted' : 'Playing'})
            </span>
          </button>
        </div>
      </header>

      {/* ── Middle: Dynamic Storytelling Center ── */}
      <div
        data-no-burst
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          zIndex: 5,
          pointerEvents: 'none',
          padding: '0 16px',
          maxWidth: '920px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* Initial Atmosphere Title (No Name) */}
          {cinematicStage === 'ATMOSPHERE' && (
            <motion.div
              key="atmosphere"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.5 } }}
              transition={{ duration: 1 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <p
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.8rem, 2.5vw, 1.1rem)',
                  letterSpacing: '0.35em',
                  color: '#FFD76A',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                }}
              >
                Diwali 2026
              </p>
              <h1
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(1.8rem, 5vw, 3.2rem)',
                  fontWeight: 700,
                  margin: 0,
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 40%, #D4A64A 75%, #FF8A24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.08em',
                }}
              >
                A Celestial Celebration of Light
              </h1>
            </motion.div>
          )}

          {/* When Name Emerges From The Firework Explosion */}
          {isNameRevealed && (
            <motion.div
              key="name-revealed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              {/* Top Spark Emblem */}
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(0.75rem, 2.4vw, 1.02rem)',
                  letterSpacing: '0.35em',
                  color: '#FFD76A',
                  textTransform: 'uppercase',
                  marginBottom: '10px',
                  textShadow: '0 0 16px rgba(255, 215, 106, 0.6)',
                }}
              >
                ✨ A Celestial Celebration For ✨
              </motion.div>

              {/* The Recipient's Name in Metallic 3D Gold */}
              <motion.h1
                initial={{ opacity: 0, scale: 0.8, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.3, ease: 'easeOut' }}
                style={{
                  margin: '0',
                  fontFamily: "'Cinzel', serif",
                  fontSize: 'clamp(2.8rem, 9.5vw, 6.4rem)',
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 25%, #D4A64A 60%, #FF8A24 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 30px rgba(255, 215, 106, 0.75)) drop-shadow(0 0 60px rgba(255, 138, 36, 0.4))',
                }}
              >
                {letters.map((char, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.4 + i * 0.05 }}
                    style={{ display: 'inline-block' }}
                  >
                    {char === ' ' ? '\u00A0' : char}
                  </motion.span>
                ))}
              </motion.h1>

              {/* Diwali Wish Message */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 1.1 }}
                style={{ marginTop: '14px', maxWidth: '680px' }}
              >
                <div
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(1.1rem, 3.6vw, 2.1rem)',
                    fontWeight: 700,
                    letterSpacing: '0.22em',
                    color: '#FFF4DD',
                    textTransform: 'uppercase',
                    textShadow: '0 0 22px rgba(212, 166, 74, 0.65)',
                    marginBottom: '8px',
                  }}
                >
                  ✨ Happy Diwali 2026 ✨
                </div>

                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', Georgia, serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                    color: '#FFF4DD',
                    lineHeight: 1.5,
                    opacity: 0.92,
                    margin: 0,
                    textShadow: '0 2px 10px rgba(0,0,0,0.8)',
                  }}
                >
                  "May your life shine brighter than a thousand stars, may happiness illuminate your home, and may prosperity follow you in every step."
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Interactive Sky Clicking / Burst Hint */}
        {isInteractive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ marginTop: '16px' }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 'clamp(0.85rem, 2vw, 1.02rem)',
                color: '#a899cc',
                letterSpacing: '0.06em',
                margin: 0,
              }}
            >
              ✦ Tap anywhere in the sky to launch fireworks ✦
            </p>
          </motion.div>
        )}
      </div>

      {/* ── Bottom Controls & Swipe Down ── */}
      <footer
        data-no-burst
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {/* Floating "BURST THE SKY 🎆" Button */}
        {isInteractive && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            onClick={onBurstSkyButton}
            style={{
              background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.25) 0%, rgba(212, 166, 74, 0.45) 100%)',
              border: '1.5px solid rgba(255, 215, 106, 0.75)',
              borderRadius: '50px',
              padding: '10px 24px',
              color: '#FFD76A',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              cursor: 'pointer',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 0 25px rgba(255, 215, 106, 0.4)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 0 35px rgba(255, 215, 106, 0.7)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(255, 215, 106, 0.4)';
            }}
          >
            🎆 BURST THE SKY 🎆
          </motion.button>
        )}

        {/* Swipe Down Button */}
        <button
          onClick={onSwipeDown}
          style={{
            background: 'rgba(5, 5, 8, 0.85)',
            border: '1.5px solid rgba(212, 166, 74, 0.45)',
            borderRadius: '50px',
            padding: '12px 28px',
            color: '#FFD76A',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.84rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 0 20px rgba(212, 166, 74, 0.3)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 106, 0.5)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(212, 166, 74, 0.3)';
          }}
        >
          <span>↓ Swipe or Click Down For Your Blessings ↓</span>
        </button>

        {/* Pulsing Down Chevron */}
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            color: '#FFD76A',
            fontSize: '1.2rem',
            lineHeight: 1,
            opacity: 0.8,
            cursor: 'pointer',
          }}
          onClick={onSwipeDown}
        >
          ▾
        </motion.div>
      </footer>
    </section>
  );
}
