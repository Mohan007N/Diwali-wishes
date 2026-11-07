import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function NamePromptModal({ onStart }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isAudioTested, setIsAudioTested] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError('Please enter a name to celebrate.');
      return;
    }
    setError('');
    onStart(cleanName);
  };

  const handleTestAudio = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.85);
        setIsAudioTested(true);
      }
    } catch {
      setIsAudioTested(true);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.99) 100%)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: -24 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'linear-gradient(165deg, rgba(16, 12, 24, 0.98) 0%, rgba(5, 5, 8, 0.99) 100%)',
          border: '1.5px solid rgba(212, 166, 74, 0.55)',
          borderRadius: '28px',
          padding: '38px 32px',
          boxShadow: '0 0 60px rgba(212, 166, 74, 0.3), inset 0 0 30px rgba(255, 215, 106, 0.06)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Diya Emblem with glowing aura */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            filter: [
              'drop-shadow(0 0 12px rgba(255,215,106,0.5))',
              'drop-shadow(0 0 25px rgba(255,160,40,0.8))',
              'drop-shadow(0 0 12px rgba(255,215,106,0.5))',
            ],
          }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '16px' }}
        >
          🪔
        </motion.div>

        {/* Small Tagline */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.78rem',
            letterSpacing: '0.3em',
            color: '#FFD76A',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
          }}
        >
          Diwali 2026 · Festival of Lights
        </p>

        {/* Heading */}
        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.75rem, 5vw, 2.3rem)',
            fontWeight: 700,
            margin: '0 0 10px 0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 40%, #D4A64A 75%, #FF8A24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.04em',
          }}
        >
          Celebrate With Light
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: '1.08rem',
            color: '#FFF4DD',
            opacity: 0.9,
            margin: '0 0 20px 0',
            lineHeight: 1.45,
          }}
        >
          Enter a name to witness colorful crackers bursting across the night sky.
        </p>

        {/* ── High-End Audio / Volume Advisory Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '14px 18px',
            marginBottom: '22px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.12) 0%, rgba(212, 166, 74, 0.05) 100%)',
            border: '1px solid rgba(255, 215, 106, 0.35)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.25rem' }}>🎧</span>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.82rem',
                fontWeight: 700,
                color: '#FFD76A',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Turn On Your Volume
            </span>
            <span style={{ fontSize: '1.25rem' }}>🔊</span>
          </div>

          <p
            style={{
              fontFamily: "'Hind', sans-serif",
              fontSize: '0.86rem',
              color: '#FFF4DD',
              opacity: 0.9,
              margin: '0 0 8px 0',
              lineHeight: 1.4,
            }}
          >
            Turn up sound or wear headphones for realistic cracker booms and festive celebration.
          </p>

          {/* Equalizer animation + Test Sound button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '18px' }}>
              {[14, 18, 10, 16, 12, 18, 14].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: ['4px', `${h}px`, '4px'] }}
                  transition={{
                    duration: 0.7 + (i % 3) * 0.2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.1,
                  }}
                  style={{
                    display: 'inline-block',
                    width: '3px',
                    borderRadius: '2px',
                    backgroundColor: '#FFD76A',
                  }}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleTestAudio}
              style={{
                background: 'rgba(255, 215, 106, 0.15)',
                border: '1px solid rgba(255, 215, 106, 0.4)',
                borderRadius: '20px',
                padding: '4px 12px',
                color: '#FFD76A',
                fontSize: '0.74rem',
                fontFamily: "'Cinzel', serif",
                letterSpacing: '0.06em',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 106, 0.28)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 106, 0.15)';
              }}
            >
              {isAudioTested ? '✓ Audio Tested' : 'Test Sound 🔔'}
            </button>
          </div>
        </motion.div>

        {/* Form: One Name at a Time */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'left' }}>
            <label
              htmlFor="recipient-name"
              style={{
                display: 'block',
                fontFamily: "'Cinzel', serif",
                fontSize: '0.76rem',
                letterSpacing: '0.14em',
                color: '#D4A64A',
                marginBottom: '8px',
                textTransform: 'uppercase',
              }}
            >
              Enter Name
            </label>
            <input
              id="recipient-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya or Mohan"
              maxLength={26}
              autoFocus
              style={{
                width: '100%',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1.5px solid rgba(212, 166, 74, 0.5)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFF4DD',
                fontFamily: "'Hind', sans-serif",
                fontSize: '1.1rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFD76A';
                e.target.style.boxShadow = '0 0 20px rgba(255, 215, 106, 0.35)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 166, 74, 0.5)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {error && (
            <p style={{ color: '#FF6B6B', fontSize: '0.85rem', margin: '0', textAlign: 'left' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              marginTop: '6px',
              padding: '16px 30px',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD76A 25%, #D4A64A 65%, #FF8A24 100%)',
              color: '#080817',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.02rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 6px 30px rgba(212, 166, 74, 0.55)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 215, 106, 0.75)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 30px rgba(212, 166, 74, 0.55)';
            }}
          >
            Light The Sky ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
}
