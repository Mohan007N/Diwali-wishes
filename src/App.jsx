import React, { useState, useCallback, useRef, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import NamePromptModal from './components/NamePromptModal';
import SkyCelebration from './components/SkyCelebration';
import QuoteSection from './components/QuoteSection';
import useAudio from './hooks/useAudio';

export default function App() {
  const [recipient, setRecipient] = useState('');
  const [hasStarted, setHasStarted] = useState(false);

  // Audio system (ReelAudio-53164 + firecracker SFX)
  const { isMuted, trackName, startAudio, toggleMute, playSound } = useAudio();

  // Fireworks bursts pool
  const [fireworkBursts, setFireworkBursts] = useState([]);
  const burstIdRef = useRef(0);
  const autoBurstRef = useRef(null);
  const lastBarrageTimeRef = useRef(0);

  // Add a firework burst to the 3D scene (dual-stage rocket launch + detonation)
  const addBurst = useCallback(
    (x, y, z, count = 200, color = null, type = 'chrysanthemum') => {
      burstIdRef.current++;
      setFireworkBursts((prev) => [
        ...prev.slice(-16), // Keep active bursts pool optimized
        { id: burstIdRef.current, x, y, z, count, color, type },
      ]);
      // Play launch whoosh immediately, followed by detonation boom at peak
      playSound('whoosh');
      setTimeout(() => {
        playSound('boom');
      }, 340);
    },
    [playSound]
  );

  // Launch firework from normalized screen coords
  const handleLaunchCracker = useCallback(
    (nx, ny) => {
      const types = ['chrysanthemum', 'peony', 'ring', 'willow'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      addBurst((nx - 0.5) * 20, (0.5 - ny) * 11 + 3, -8, 240, null, randomType);
    },
    [addBurst]
  );

  // Flurry of colorful skyshots & skycrackers while swiping/scrolling down
  const triggerSkyshotBarrage = useCallback(() => {
    const now = Date.now();
    if (now - lastBarrageTimeRef.current < 2200) return; // Prevent excessive overlaps
    lastBarrageTimeRef.current = now;

    const colors = [
      '#FFD76A', '#FF8A24', '#D83B83', '#00F0FF',
      '#FF2A6D', '#05FFA1', '#9D4EDD', '#FFEA00', '#FFFFFF'
    ];
    const types = ['chrysanthemum', 'peony', 'willow', 'ring', 'chrysanthemum'];

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = -9 + Math.random() * 18;
        const y = 3.5 + Math.random() * 6;
        const c = colors[i % colors.length];
        const t = types[i % types.length];
        addBurst(x, y, -8, 240, c, t);
      }, i * 130);
    }
  }, [addBurst]);

  // Opening sequence when user submits name
  const handleStart = useCallback(
    (nameInput) => {
      setRecipient(nameInput);
      setHasStarted(true);

      // Start ReelAudio-53164 music track
      startAudio();

      // Launch grand opening celebration crackers
      const openingVolley = [
        [100, -5, 4, -8, '#FFD76A', 'chrysanthemum'],
        [300, 5, 5, -8, '#FF8A24', 'peony'],
        [550, 0, 7, -8, '#FFD76A', 'ring'],
        [850, -3, 6, -8, '#D83B83', 'willow'],
        [1100, 3, 6.5, -8, '#00F0FF', 'chrysanthemum'],
      ];

      openingVolley.forEach(([delay, x, y, z, color, type]) => {
        setTimeout(() => addBurst(x, y, z, 240, color, type), delay);
      });
    },
    [startAudio, addBurst]
  );

  // Continuous festive crackers in the night sky
  useEffect(() => {
    if (!hasStarted) return;

    autoBurstRef.current = setInterval(() => {
      const types = ['chrysanthemum', 'peony', 'willow', 'ring'];
      const type = types[Math.floor(Math.random() * types.length)];
      addBurst(
        -8 + Math.random() * 16,
        3 + Math.random() * 5.5,
        -8 - Math.random() * 2,
        200,
        null,
        type
      );
    }, 1800);

    return () => {
      if (autoBurstRef.current) clearInterval(autoBurstRef.current);
    };
  }, [hasStarted, addBurst]);

  // Trigger skyshots barrage while swiping / scrolling down
  useEffect(() => {
    if (!hasStarted) return;
    const handleScroll = () => {
      if (window.scrollY > 80 && window.scrollY < 650) {
        triggerSkyshotBarrage();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasStarted, triggerSkyshotBarrage]);

  // Smooth scroll to Quote Section with celebratory skyshots
  const handleSwipeDown = () => {
    triggerSkyshotBarrage();
    const el = document.getElementById('quote-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Smooth scroll back to Sky Section
  const handleBackToSky = () => {
    const el = document.getElementById('sky-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Reset to enter another name
  const handleResetName = () => {
    setHasStarted(false);
    setRecipient('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      {/* ── Fixed 3D Canvas in the Background ── */}
      <ThreeScene
        currentScene={hasStarted ? 3 : 0}
        flameIntensity={hasStarted ? 1 : 0.4}
        fireworkBursts={fireworkBursts}
      />

      {/* Gold Accent Borders at Top and Bottom of Viewport */}
      <div className="gold-border-top" />
      <div className="gold-border-bottom" />

      {/* ── 1st: Ask the Name Modal ── */}
      {!hasStarted && <NamePromptModal onStart={handleStart} />}

      {/* ── 2nd: Night Sky with Crackers, Music & Name in the Middle ── */}
      {hasStarted && (
        <main style={{ position: 'relative', zIndex: 1, width: '100%' }}>
          <SkyCelebration
            recipient={recipient}
            onLaunchCracker={handleLaunchCracker}
            onSwipeDown={handleSwipeDown}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            trackName={trackName}
          />

          {/* ── 3rd: After Swiping Down: Dedicated Quote (Top 10) & Blessings ── */}
          <QuoteSection
            recipient={recipient}
            onBackToSky={handleBackToSky}
            onResetName={handleResetName}
            playSound={playSound}
            onNextQuoteCracker={() => {
              addBurst(-4 + Math.random() * 8, 4 + Math.random() * 3, -8, 220, '#FFD76A', 'chrysanthemum');
              setTimeout(() => {
                addBurst(-4 + Math.random() * 8, 4 + Math.random() * 3, -8, 220, '#00F0FF', 'peony');
              }, 160);
            }}
            onIgniteDiya={() => {
              addBurst(
                (Math.random() - 0.5) * 6,
                2 + Math.random() * 3,
                -8,
                140,
                '#FFD76A',
                'peony'
              );
            }}
          />
        </main>
      )}
    </div>
  );
}
