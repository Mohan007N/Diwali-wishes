import React from 'react';
import { motion } from 'framer-motion';

export default function SkyCelebration({
  recipient,
  onLaunchCracker,
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
    // Swiping finger up (pulling lower page up) by more than 40px
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
    // Avoid triggering if clicked on top controls or bottom button
    if (e.target.closest('button') || e.target.closest('[data-no-burst]')) return;
    const nx = e.clientX / window.innerWidth;
    const ny = e.clientY / window.innerHeight;
    if (onLaunchCracker) {
      onLaunchCracker(nx, ny);
    }
  };

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
        cursor: 'crosshair',
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
              letterSpacing: '0.2em',
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

      {/* ── Middle: Grand Name & Diwali Reveal ── */}
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
        }}
      >
        {/* Top spark emblem */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(0.75rem, 2.5vw, 1.05rem)',
            letterSpacing: '0.35em',
            color: '#FFD76A',
            textTransform: 'uppercase',
            marginBottom: '10px',
            textShadow: '0 0 15px rgba(255, 215, 106, 0.5)',
          }}
        >
          ✨ A Celestial Celebration For ✨
        </motion.div>

        {/* The Recipient's Name in Metallic Gold */}
        <motion.h1
          initial={{ opacity: 0, y: 30, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            margin: '0',
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2.8rem, 10vw, 6.8rem)',
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 25%, #D4A64A 60%, #FF8A24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 35px rgba(255, 215, 106, 0.65)) drop-shadow(0 0 70px rgba(255, 138, 36, 0.35))',
          }}
        >
          {letters.map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.05 }}
              style={{ display: 'inline-block' }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </motion.h1>

        {/* Happy Diwali Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.1rem, 3.8vw, 2.2rem)',
            fontWeight: 700,
            letterSpacing: '0.22em',
            color: '#FFF4DD',
            textTransform: 'uppercase',
            marginTop: '12px',
            textShadow: '0 0 20px rgba(212, 166, 74, 0.6)',
          }}
        >
          Happy Diwali 2026
        </motion.div>

        {/* Sky Tap Hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 'clamp(0.85rem, 2vw, 1.05rem)',
            color: '#a899cc',
            marginTop: '14px',
            letterSpacing: '0.05em',
          }}
        >
          ✦ Tap anywhere in the sky to burst colorful crackers ✦
        </motion.p>
      </div>

      {/* ── Bottom: Swipe Down Indicator ── */}
      <motion.div
        data-no-burst
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        style={{
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <button
          onClick={onSwipeDown}
          style={{
            background: 'rgba(5, 5, 8, 0.85)',
            border: '1.5px solid rgba(212, 166, 74, 0.45)',
            borderRadius: '50px',
            padding: '12px 28px',
            color: '#FFD76A',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.85rem',
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
          <span>↓ Swipe or Click Down For Your Blessing ↓</span>
        </button>

        {/* Pulsing down chevron */}
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
      </motion.div>
    </section>
  );
}

