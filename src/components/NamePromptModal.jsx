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
      setError('Please enter a name to illuminate.');
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
        background: 'radial-gradient(ellipse at 50% 50%, rgba(0, 0, 0, 0.82) 0%, rgba(0, 0, 0, 0.96) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.85, y: -40, filter: 'blur(10px)' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: '470px',
          background: 'linear-gradient(165deg, rgba(16, 12, 24, 0.96) 0%, rgba(4, 4, 6, 0.99) 100%)',
          border: '1.5px solid rgba(212, 166, 74, 0.6)',
          borderRadius: '30px',
          padding: '40px 34px',
          boxShadow: '0 0 70px rgba(212, 166, 74, 0.32), inset 0 0 35px rgba(255, 215, 106, 0.08)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Sacred Glowing Diya Emblem */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            filter: [
              'drop-shadow(0 0 14px rgba(255,215,106,0.6))',
              'drop-shadow(0 0 28px rgba(255,160,40,0.85))',
              'drop-shadow(0 0 14px rgba(255,215,106,0.6))',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          style={{ fontSize: '3.2rem', lineHeight: 1, marginBottom: '18px' }}
        >
          🪔
        </motion.div>

        {/* Cinematic Header */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.34em',
            color: '#FFD76A',
            textTransform: 'uppercase',
            margin: '0 0 6px 0',
          }}
        >
          Diwali 2026
        </p>

        <h1
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(1.55rem, 4.5vw, 2.1rem)',
            fontWeight: 700,
            margin: '0 0 14px 0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 40%, #D4A64A 75%, #FF8A24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.06em',
            lineHeight: 1.25,
          }}
        >
          A Celestial Celebration of Light
        </h1>

        {/* Core Prompt */}
        <p
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: '1.25rem',
            color: '#FFF4DD',
            opacity: 0.95,
            margin: '0 0 24px 0',
            lineHeight: 1.45,
          }}
        >
          "Whose Diwali are we illuminating tonight?"
        </p>

        {/* Audio / Volume Indicator Card */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '12px 16px',
            marginBottom: '22px',
            borderRadius: '16px',
            background: 'rgba(255, 215, 106, 0.08)',
            border: '1px solid rgba(255, 215, 106, 0.28)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎧</span>
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.78rem',
                fontWeight: 700,
                color: '#FFD76A',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
              }}
            >
              Turn On Your Volume
            </span>
            <span style={{ fontSize: '1.1rem' }}>🔊</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '16px' }}>
              {[12, 16, 9, 15, 11, 16, 12].map((h, i) => (
                <motion.span
                  key={i}
                  animate={{ height: ['4px', `${h}px`, '4px'] }}
                  transition={{
                    duration: 0.65 + (i % 3) * 0.2,
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
                background: 'rgba(255, 215, 106, 0.16)',
                border: '1px solid rgba(255, 215, 106, 0.45)',
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
                e.currentTarget.style.background = 'rgba(255, 215, 106, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 215, 106, 0.16)';
              }}
            >
              {isAudioTested ? '✓ Audio Tested' : 'Test Sound 🔔'}
            </button>
          </div>
        </div>

        {/* Form: Name Input + Launch Button */}
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
              Recipient Name
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
                padding: '15px 18px',
                borderRadius: '16px',
                border: '1.5px solid rgba(212, 166, 74, 0.55)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#FFF4DD',
                fontFamily: "'Hind', sans-serif",
                fontSize: '1.12rem',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.25s, box-shadow 0.25s',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#FFD76A';
                e.target.style.boxShadow = '0 0 22px rgba(255, 215, 106, 0.4)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(212, 166, 74, 0.55)';
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
              padding: '16px 32px',
              borderRadius: '50px',
              border: 'none',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #FFD76A 25%, #D4A64A 65%, #FF8A24 100%)',
              color: '#080817',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.05rem',
              fontWeight: 700,
              letterSpacing: '0.1em',
              cursor: 'pointer',
              boxShadow: '0 6px 32px rgba(212, 166, 74, 0.6)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 10px 42px rgba(255, 215, 106, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 32px rgba(212, 166, 74, 0.6)';
            }}
          >
            Launch My Celebration ✨
          </button>
        </form>
      </motion.div>
    </div>
  );
}
