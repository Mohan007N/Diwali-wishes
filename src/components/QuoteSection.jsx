import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { downloadGreetingCard, copyToClipboard } from '../utils/shareUtils';
import { TOP_10_QUOTES, getQuoteByIndex } from '../utils/wishGenerator';

const BLESSING_DIYAS = [
  { id: 'health', label: 'Health', color: '#FF8A24' },
  { id: 'joy', label: 'Joy', color: '#FFD76A' },
  { id: 'wealth', label: 'Wealth', color: '#D4A64A' },
  { id: 'love', label: 'Love', color: '#D83B83' },
  { id: 'peace', label: 'Peace', color: '#FFF4DD' },
];

export default function QuoteSection({
  recipient,
  onBackToSky,
  onResetName,
  playSound,
  onIgniteDiya,
  onNextQuoteCracker,
}) {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [litDiyas, setLitDiyas] = useState({
    health: true,
    joy: true,
    wealth: false,
    love: false,
    peace: false,
  });
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const cardRef = useRef(null);
  const touchStartY = useRef(0);

  const currentQuote = getQuoteByIndex(recipient, quoteIndex);

  const handleNextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % TOP_10_QUOTES.length);
    playSound?.('bell');
    onNextQuoteCracker?.();
  };

  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e) => {
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    if (deltaY > 60 && window.scrollY < 120) {
      onBackToSky?.();
    }
  };

  const toggleDiya = (id) => {
    setLitDiyas((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!prev[id]) {
        playSound?.('ignite');
        onIgniteDiya?.();
      }
      return next;
    });
  };

  const handleCopy = async () => {
    const text = `🪔 Happy Diwali 2026, ${recipient || 'Friend'}!\n\n"${currentQuote}"`;
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      await downloadGreetingCard(cardRef.current, `diwali-2026-${recipient || 'blessing'}.png`);
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const litCount = Object.values(litDiyas).filter(Boolean).length;

  return (
    <section
      id="quote-section"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position: 'relative',
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '52px 20px 60px',
        boxSizing: 'border-box',
        background: 'linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(8, 6, 12, 0.92) 45%, #000000 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }}
    >
      {/* Scroll back to sky floating button */}
      <button
        onClick={onBackToSky}
        style={{
          marginBottom: '28px',
          background: 'rgba(6, 6, 10, 0.9)',
          border: '1.5px solid rgba(212, 166, 74, 0.45)',
          borderRadius: '50px',
          padding: '10px 24px',
          color: '#FFD76A',
          fontFamily: "'Cinzel', serif",
          fontSize: '0.82rem',
          letterSpacing: '0.12em',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 20px rgba(212, 166, 74, 0.25)',
          transition: 'transform 0.2s, border-color 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.borderColor = '#FFD76A';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'rgba(212, 166, 74, 0.45)';
        }}
      >
        <span>↑ Return to Sky Skyshots</span>
      </button>

      {/* Main Luxury Blessing Card */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        style={{
          width: '100%',
          maxWidth: '700px',
          background: 'linear-gradient(145deg, rgba(14, 10, 20, 0.96) 0%, rgba(2, 2, 4, 0.99) 100%)',
          border: '1.5px solid rgba(212, 166, 74, 0.5)',
          borderRadius: '28px',
          padding: '42px 36px',
          boxShadow: '0 0 60px rgba(212, 166, 74, 0.22), inset 0 0 40px rgba(255, 215, 106, 0.05)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Sacred Diya Emblem */}
        <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '14px' }}>
          🪔
        </div>

        {/* Small Header */}
        <p
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '0.8rem',
            letterSpacing: '0.28em',
            color: '#FFD76A',
            textTransform: 'uppercase',
            margin: '0 0 8px 0',
          }}
        >
          Diwali 2026 · Sacred Blessing
        </p>

        {/* Recipient Name */}
        <h2
          style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 'clamp(2rem, 6vw, 3.2rem)',
            fontWeight: 700,
            margin: '0 0 16px 0',
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FFD76A 40%, #FF8A24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.06em',
          }}
        >
          {recipient}
        </h2>

        {/* Quote Counter Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 14px',
            borderRadius: '20px',
            background: 'rgba(212, 166, 74, 0.12)',
            border: '1px solid rgba(212, 166, 74, 0.3)',
            color: '#FFD76A',
            fontFamily: "'Cinzel', serif",
            fontSize: '0.72rem',
            letterSpacing: '0.1em',
            marginBottom: '20px',
          }}
        >
          <span>✦ Blessing {quoteIndex + 1} of 10 ✦</span>
        </div>

        {/* The Inspiring Quote */}
        <AnimatePresence mode="wait">
          <motion.div
            key={quoteIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            style={{
              padding: '26px 22px',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.03)',
              borderLeft: '3px solid #D4A64A',
              borderRight: '3px solid #D4A64A',
              margin: '0 0 24px 0',
              minHeight: '110px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            }}
          >
            <p
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 'clamp(1.18rem, 3.5vw, 1.45rem)',
                color: '#FFF4DD',
                lineHeight: 1.65,
                margin: 0,
              }}
            >
              "{currentQuote}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Next Quote Button */}
        <div data-html2canvas-ignore style={{ marginBottom: '28px' }}>
          <button
            onClick={handleNextQuote}
            style={{
              padding: '11px 26px',
              borderRadius: '50px',
              border: '1.5px solid rgba(255, 215, 106, 0.6)',
              background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.2) 0%, rgba(212, 166, 74, 0.35) 100%)',
              color: '#FFD76A',
              fontFamily: "'Cinzel', serif",
              fontSize: '0.85rem',
              fontWeight: 700,
              letterSpacing: '0.08em',
              cursor: 'pointer',
              boxShadow: '0 0 20px rgba(255, 215, 106, 0.25)',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.04)';
              e.currentTarget.style.boxShadow = '0 0 28px rgba(255, 215, 106, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = '0 0 20px rgba(255, 215, 106, 0.25)';
            }}
          >
            Next Blessing ✨ ({quoteIndex + 1}/10)
          </button>
        </div>

        {/* ── 5 Interactive Blessing Diyas ── */}
        <div style={{ margin: '0 0 32px 0' }}>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: '0.75rem',
              letterSpacing: '0.15em',
              color: '#a899cc',
              textTransform: 'uppercase',
              marginBottom: '16px',
            }}
          >
            Tap Diyas to Kindle Blessings ({litCount} of 5 lit)
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 'clamp(10px, 3vw, 20px)',
              flexWrap: 'wrap',
            }}
          >
            {BLESSING_DIYAS.map((d) => {
              const isLit = litDiyas[d.id];
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDiya(d.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 12px',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  title={`Tap to ${isLit ? 'extinguish' : 'light'} ${d.label} diya`}
                >
                  {/* Flame */}
                  <div
                    style={{
                      width: '14px',
                      height: '24px',
                      borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                      background: isLit
                        ? `radial-gradient(ellipse at 50% 70%, #fff8d0 0%, ${d.color} 50%, #FF8A24 90%)`
                        : 'transparent',
                      boxShadow: isLit
                        ? `0 0 16px 6px ${d.color}88, 0 -6px 20px 4px rgba(255,215,106,0.4)`
                        : 'none',
                      opacity: isLit ? 1 : 0.1,
                      transform: isLit ? 'scale(1)' : 'scale(0.3)',
                      transition: 'opacity 0.3s, transform 0.3s',
                    }}
                  />
                  {/* Diya Bowl */}
                  <div
                    style={{
                      width: '38px',
                      height: '14px',
                      borderRadius: '3px 3px 38px 38px',
                      background: isLit
                        ? `linear-gradient(180deg, ${d.color}, #8b3a0b)`
                        : 'linear-gradient(180deg, #443322, #221810)',
                      boxShadow: isLit ? `0 2px 10px ${d.color}44` : 'none',
                    }}
                  />
                  {/* Label */}
                  <span
                    style={{
                      fontFamily: "'Hind', sans-serif",
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: isLit ? '#FFD76A' : '#a899cc',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {d.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Action Buttons (Clean & No WhatsApp) ── */}
        <div
          data-html2canvas-ignore
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          <button
            onClick={handleCopy}
            style={{
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(212, 166, 74, 0.5)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: '#FFF4DD',
              fontFamily: "'Hind', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(212, 166, 74, 0.15)';
              e.currentTarget.style.borderColor = '#FFD76A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(212, 166, 74, 0.5)';
            }}
          >
            <span>{copied ? '✓ Copied to Clipboard!' : '📋 Copy Blessing'}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={downloading}
            style={{
              padding: '12px 24px',
              borderRadius: '50px',
              border: '1px solid rgba(212, 166, 74, 0.5)',
              background: 'linear-gradient(135deg, rgba(255, 215, 106, 0.18) 0%, rgba(212, 166, 74, 0.28) 100%)',
              color: '#FFD76A',
              fontFamily: "'Hind', sans-serif",
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'transform 0.2s',
            }}
          >
            <span>{downloading ? 'Capturing…' : '📥 Save Card'}</span>
          </button>

          <button
            onClick={onResetName}
            style={{
              padding: '12px 22px',
              borderRadius: '50px',
              border: '1px solid rgba(168, 153, 204, 0.35)',
              background: 'transparent',
              color: '#a899cc',
              fontFamily: "'Hind', sans-serif",
              fontSize: '0.88rem',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFF4DD';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#a899cc';
              e.currentTarget.style.borderColor = 'rgba(168, 153, 204, 0.35)';
            }}
          >
            <span>↺ Celebrate Another Name</span>
          </button>
        </div>
      </motion.div>
    </section>
  );
}
