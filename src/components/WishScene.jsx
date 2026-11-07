import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getWish, buildWhatsAppUrl } from '../utils/wishGenerator';
import { copyToClipboard } from '../utils/shareUtils';

const typewriterCSS = `
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
  @keyframes charReveal {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const glassPanel = {
  background: 'rgba(8, 8, 23, 0.6)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(212,166,74,0.18)',
  borderRadius: 18,
  padding: '28px 32px 24px',
  maxWidth: 560,
  width: '100%',
};

const goldBtn = {
  fontFamily: "'Cinzel', serif",
  fontSize: '0.85rem',
  letterSpacing: '0.08em',
  padding: '12px 28px',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  background: 'linear-gradient(135deg, #D4A64A, #FFD76A, #D4A64A)',
  color: '#080817',
  fontWeight: 700,
  boxShadow: '0 0 20px rgba(212,166,74,0.3)',
  transition: 'transform 0.2s, box-shadow 0.2s',
};

const outlineBtn = {
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
  transition: 'border-color 0.2s, background 0.2s',
};

const inputStyle = {
  fontFamily: "'Hind', sans-serif",
  fontSize: '0.95rem',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid rgba(212,166,74,0.3)',
  background: 'rgba(23,13,43,0.7)',
  color: '#FFF4DD',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
  transition: 'border-color 0.2s',
};

export default function WishScene({ isActive, onPrev, onFinale, playSound }) {
  const [state, setState] = useState('input'); // 'input' | 'display'
  const [recipient, setRecipient] = useState('');
  const [sender, setSender] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [wish, setWish] = useState('');
  const [cycleIndex, setCycleIndex] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const [copyStatus, setCopyStatus] = useState('');
  const typewriterRef = useRef(null);
  const cursorRef = useRef(null);

  // Typewriter effect
  useEffect(() => {
    if (state !== 'display' || !wish) return;

    setTypedText('');
    setShowCursor(true);
    let idx = 0;
    const text = wish;

    const interval = setInterval(() => {
      idx++;
      setTypedText(text.slice(0, idx));
      if (idx >= text.length) {
        clearInterval(interval);
        // Keep cursor blinking for a moment then hide
        setTimeout(() => setShowCursor(false), 1500);
      }
    }, 35);

    typewriterRef.current = interval;
    return () => clearInterval(interval);
  }, [state, wish]);

  const handleSubmit = useCallback(() => {
    const trimRecipient = recipient.trim();
    const trimSender = sender.trim();

    if (!trimRecipient) {
      setError("Please enter the recipient's name.");
      return;
    }
    if (!trimSender) {
      setError('Please enter your name.');
      return;
    }

    setError('');
    const generatedWish = getWish(trimRecipient, trimSender, message.trim(), cycleIndex);
    setWish(generatedWish);
    setState('display');
    if (playSound) playSound('chime');
  }, [recipient, sender, message, cycleIndex, playSound]);

  const handleAnotherWish = useCallback(() => {
    const nextIdx = cycleIndex + 1;
    setCycleIndex(nextIdx);
    const generatedWish = getWish(recipient.trim(), sender.trim(), message.trim(), nextIdx);
    setWish(generatedWish);
    setTypedText('');
  }, [cycleIndex, recipient, sender, message]);

  const handleCopy = useCallback(async () => {
    const fullText = `Happy Diwali, ${recipient.trim()}!\n\n${wish}\n\nWith love,\n${sender.trim()}`;
    const success = await copyToClipboard(fullText);
    setCopyStatus(success ? '✓ Copied!' : 'Failed to copy');
    setTimeout(() => setCopyStatus(''), 2500);
  }, [recipient, sender, wish]);

  const handleWhatsApp = useCallback(() => {
    const url = buildWhatsAppUrl(recipient.trim(), sender.trim(), wish);
    window.open(url, '_blank');
  }, [recipient, sender, wish]);

  const handleReset = useCallback(() => {
    setState('input');
    setTypedText('');
    setWish('');
    setCopyStatus('');
  }, []);

  const recipientChars = recipient.trim().split('');

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
            inset: 0,
            zIndex: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            pointerEvents: 'auto',
          }}
        >
          <style>{typewriterCSS}</style>

          <AnimatePresence mode="wait">
            {state === 'input' ? (
              /* =================== INPUT FORM =================== */
              <motion.div
                key="input"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                style={{
                  ...glassPanel,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                    letterSpacing: '0.12em',
                    margin: 0,
                    textAlign: 'center',
                    background: 'linear-gradient(135deg, #D4A64A, #FFD76A)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Your Personalised Wish
                </h2>

                {/* Recipient name */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      fontSize: '0.78rem',
                      color: '#a899cc',
                      display: 'block',
                      marginBottom: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Recipient's Name
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="e.g. Priya"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A64A')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(212,166,74,0.3)')}
                  />
                </div>

                {/* Sender name */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      fontSize: '0.78rem',
                      color: '#a899cc',
                      display: 'block',
                      marginBottom: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Your Name
                  </label>
                  <input
                    type="text"
                    maxLength={24}
                    placeholder="e.g. Mohan"
                    value={sender}
                    onChange={(e) => setSender(e.target.value)}
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A64A')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(212,166,74,0.3)')}
                  />
                </div>

                {/* Optional message */}
                <div>
                  <label
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      fontSize: '0.78rem',
                      color: '#a899cc',
                      display: 'block',
                      marginBottom: 6,
                      letterSpacing: '0.04em',
                    }}
                  >
                    Personal Message (optional)
                  </label>
                  <textarea
                    rows={3}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a personal touch..."
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: 60,
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#D4A64A')}
                    onBlur={(e) => (e.target.style.borderColor = 'rgba(212,166,74,0.3)')}
                  />
                </div>

                {/* Error */}
                {error && (
                  <p
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      fontSize: '0.82rem',
                      color: '#D83B83',
                      margin: 0,
                      textAlign: 'center',
                    }}
                  >
                    {error}
                  </p>
                )}

                {/* Buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: 12,
                    justifyContent: 'center',
                    flexWrap: 'wrap',
                    marginTop: 4,
                  }}
                >
                  <button
                    onClick={handleSubmit}
                    style={goldBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.04)';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(212,166,74,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(212,166,74,0.3)';
                    }}
                  >
                    Light Their Lamp ✦
                  </button>
                  <button
                    onClick={onPrev}
                    style={outlineBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#FFD76A';
                      e.currentTarget.style.background = 'rgba(212,166,74,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(212,166,74,0.5)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    ← Fireworks
                  </button>
                </div>
              </motion.div>
            ) : (
              /* =================== WISH DISPLAY =================== */
              <motion.div
                key="display"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                style={{
                  ...glassPanel,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 18,
                  textAlign: 'center',
                }}
              >
                {/* Happy Diwali label */}
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: '0.75rem',
                    letterSpacing: '0.2em',
                    color: '#D4A64A',
                    textTransform: 'uppercase',
                  }}
                >
                  Happy Diwali
                </span>

                {/* Recipient name – letter by letter */}
                <h2
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 'clamp(1.8rem, 7vw, 3.2rem)',
                    fontWeight: 700,
                    margin: 0,
                    lineHeight: 1.15,
                    background: 'linear-gradient(135deg, #D4A64A 0%, #FFD76A 40%, #FF8A24 80%, #D4A64A 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    filter: 'drop-shadow(0 0 16px rgba(212,166,74,0.3))',
                  }}
                >
                  {recipientChars.map((char, i) => (
                    <span
                      key={i}
                      className="char"
                      style={{
                        display: 'inline-block',
                        animation: `charReveal 0.5s ${i * 0.06}s ease-out both`,
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </h2>

                {/* Typewriter wish text */}
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: 'clamp(0.9rem, 2.2vw, 1.1rem)',
                    color: '#FFF4DD',
                    lineHeight: 1.7,
                    margin: 0,
                    minHeight: 60,
                    maxWidth: 460,
                  }}
                >
                  {typedText}
                  {showCursor && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: '1em',
                        background: '#D4A64A',
                        marginLeft: 2,
                        verticalAlign: 'text-bottom',
                        animation: 'blink 0.8s step-end infinite',
                      }}
                    />
                  )}
                </p>

                {/* Signature */}
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: '0.95rem',
                    color: '#D4A64A',
                    margin: 0,
                    opacity: typedText.length >= wish.length ? 1 : 0.3,
                    transition: 'opacity 0.5s',
                  }}
                >
                  With love, {sender.trim()}
                </p>

                {/* Action buttons */}
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    marginTop: 4,
                  }}
                >
                  <button
                    onClick={handleCopy}
                    style={{
                      ...outlineBtn,
                      fontSize: '0.72rem',
                      padding: '8px 16px',
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
                    {copyStatus || 'Copy Wish'}
                  </button>

                  <button
                    onClick={handleAnotherWish}
                    style={{
                      ...outlineBtn,
                      fontSize: '0.72rem',
                      padding: '8px 16px',
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
                    Another Wish
                  </button>

                  <button
                    onClick={handleWhatsApp}
                    style={{
                      ...outlineBtn,
                      fontSize: '0.72rem',
                      padding: '8px 16px',
                      borderColor: 'rgba(37,211,102,0.5)',
                      color: '#25D366',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#25D366';
                      e.currentTarget.style.background = 'rgba(37,211,102,0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(37,211,102,0.5)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    Share on WhatsApp
                  </button>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                  }}
                >
                  <button
                    onClick={() => onFinale?.(recipient.trim(), sender.trim(), wish)}
                    style={{
                      ...goldBtn,
                      fontSize: '0.78rem',
                      padding: '10px 22px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.04)';
                      e.currentTarget.style.boxShadow = '0 0 30px rgba(212,166,74,0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = '0 0 20px rgba(212,166,74,0.3)';
                    }}
                  >
                    Grand Finale →
                  </button>

                  <button
                    onClick={handleReset}
                    style={{
                      ...outlineBtn,
                      fontSize: '0.7rem',
                      padding: '8px 16px',
                      borderColor: 'rgba(168,153,204,0.3)',
                      color: '#a899cc',
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
                    ↩ New Name
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
