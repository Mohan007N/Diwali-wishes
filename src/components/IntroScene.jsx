import React, { useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const DUST_COUNT = 25;

function GoldenDust() {
  const particles = useMemo(() => {
    return Array.from({ length: DUST_COUNT }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 1.5 + Math.random() * 3,
      duration: 6 + Math.random() * 10,
      delay: Math.random() * 8,
      opacity: 0.15 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 40,
    }));
  }, []);

  return (
    <>
      <style>{`
        @keyframes dustFloat {
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          10% { opacity: var(--dust-opacity); }
          90% { opacity: var(--dust-opacity); }
          100% { transform: translateY(-110vh) translateX(var(--dust-drift)); opacity: 0; }
        }
      `}</style>
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.left}%`,
            bottom: '-5%',
            width: p.size,
            height: p.size,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #FFD76A 0%, #D4A64A 60%, transparent 100%)',
            pointerEvents: 'none',
            '--dust-opacity': p.opacity,
            '--dust-drift': `${p.drift}px`,
            animation: `dustFloat ${p.duration}s ${p.delay}s linear infinite`,
            willChange: 'transform, opacity',
          }}
        />
      ))}
    </>
  );
}

export default function IntroScene({ onStart, onSkipToWish, isActive }) {
  const containerRef = useRef(null);
  const tlRef = useRef(null);
  const particleRef = useRef(null);
  const taglineRef = useRef(null);
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const buttonsRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tlRef.current = tl;

      // Golden particle expand
      tl.fromTo(
        particleRef.current,
        { scale: 0, opacity: 0 },
        { scale: 2.5, opacity: 1, duration: 2.2, ease: 'power2.inOut' }
      );

      // Tagline – stagger each word from below with blur deblur
      const taglineChars = taglineRef.current?.querySelectorAll('.word');
      if (taglineChars?.length) {
        tl.fromTo(
          taglineChars,
          { y: 40, opacity: 0, filter: 'blur(8px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.9,
            stagger: 0.07,
            ease: 'power2.out',
          },
          '-=1.0'
        );
      }

      // DIWALI title
      tl.fromTo(
        titleRef.current,
        { y: 50, opacity: 0, scale: 0.85 },
        { y: 0, opacity: 1, scale: 1, duration: 1.2, ease: 'power3.out' },
        '-=0.3'
      );

      // Subtitle
      tl.fromTo(
        subtitleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.5'
      );

      // Buttons
      tl.fromTo(
        buttonsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        '-=0.3'
      );
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [isActive]);

  const tagline = 'When darkness falls, a thousand lights awaken...';
  const taglineWords = tagline.split(' ');

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 20,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            pointerEvents: 'auto',
          }}
        >
          {/* Floating golden dust */}
          <GoldenDust />

          {/* Golden particle */}
          <div
            ref={particleRef}
            style={{
              position: 'absolute',
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #FFD76A 0%, #D4A64A 40%, transparent 70%)',
              boxShadow:
                '0 0 40px 15px rgba(212,166,74,0.5), 0 0 80px 30px rgba(255,215,106,0.25), 0 0 120px 50px rgba(255,138,36,0.12)',
              opacity: 0,
              transform: 'scale(0)',
              willChange: 'transform, opacity',
            }}
          />

          {/* Tagline */}
          <div
            ref={taglineRef}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic',
              fontSize: 'clamp(1rem, 2.5vw, 1.5rem)',
              color: '#FFF4DD',
              textAlign: 'center',
              marginBottom: 28,
              lineHeight: 1.7,
              maxWidth: '80vw',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '0 0.35em',
            }}
          >
            {taglineWords.map((word, i) => (
              <span key={i} className="word" style={{ display: 'inline-block', opacity: 0 }}>
                {word}
              </span>
            ))}
          </div>

          {/* DIWALI title */}
          <h1
            ref={titleRef}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(3rem, 12vw, 8rem)',
              fontWeight: 700,
              letterSpacing: '0.18em',
              lineHeight: 1,
              background: 'linear-gradient(135deg, #D4A64A 0%, #FFD76A 40%, #FF8A24 70%, #D4A64A 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              textAlign: 'center',
              marginBottom: 14,
              opacity: 0,
              filter: 'drop-shadow(0 0 30px rgba(212,166,74,0.4))',
            }}
          >
            DIWALI
          </h1>

          {/* Subtitle */}
          <p
            ref={subtitleRef}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 'clamp(0.7rem, 1.8vw, 1rem)',
              color: '#D4A64A',
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              marginBottom: 48,
              opacity: 0,
              textAlign: 'center',
            }}
          >
            The Festival of Lights · 2026
          </p>

          {/* Buttons */}
          <div
            ref={buttonsRef}
            style={{
              display: 'flex',
              gap: 18,
              flexWrap: 'wrap',
              justifyContent: 'center',
              opacity: 0,
            }}
          >
            <button
              onClick={onStart}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.9rem',
                letterSpacing: '0.1em',
                padding: '14px 36px',
                border: 'none',
                borderRadius: 6,
                cursor: 'pointer',
                background: 'linear-gradient(135deg, #D4A64A, #FFD76A, #D4A64A)',
                color: '#080817',
                fontWeight: 700,
                boxShadow: '0 0 24px rgba(212,166,74,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 0 36px rgba(212,166,74,0.55)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(212,166,74,0.35)';
              }}
            >
              Begin the Experience
            </button>

            <button
              onClick={onSkipToWish}
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: '0.85rem',
                letterSpacing: '0.08em',
                padding: '14px 30px',
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
              Enter Name →
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
