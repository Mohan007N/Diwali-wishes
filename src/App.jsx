import React, { useState, useCallback, useRef, useEffect } from 'react';
import ThreeScene from './components/ThreeScene';
import NamePromptModal from './components/NamePromptModal';
import SkyCelebration from './components/SkyCelebration';
import QuoteSection from './components/QuoteSection';
import useAudio from './hooks/useAudio';

export default function App() {
  const [recipient, setRecipient] = useState('');
  const [cinematicStage, setCinematicStage] = useState('ATMOSPHERE');

  // Audio system (ReelAudio-53164 + firecracker SFX)
  const { isMuted, trackName, startAudio, toggleMute, playSound } = useAudio();

  // Fireworks bursts pool for multi-cracker bursts & interactive clicks
  const [fireworkBursts, setFireworkBursts] = useState([]);
  const burstIdRef = useRef(0);
  const autoBurstRef = useRef(null);
  const lastBarrageTimeRef = useRef(0);

  // Add a firework burst to the 3D scene (dual-stage rocket launch + detonation)
  const addBurst = useCallback(
    (x, y, z, count = 260, color = null, type = 'chrysanthemum') => {
      burstIdRef.current++;
      setFireworkBursts((prev) => [
        ...prev.slice(-20), // Keep active bursts pool optimized
        { id: burstIdRef.current, x, y, z, count, color, type },
      ]);
      // Play launch whoosh immediately, followed by detonation boom at peak
      playSound('whoosh');
      setTimeout(() => {
        playSound('boom');
      }, 360);
    },
    [playSound]
  );

  // Launch firework from normalized screen coords on sky click
  const handleLaunchCracker = useCallback(
    (nx, ny) => {
      const types = ['chrysanthemum', 'peony', 'ring', 'willow'];
      const randomType = types[Math.floor(Math.random() * types.length)];
      addBurst((nx - 0.5) * 18, (0.5 - ny) * 10 + 3.2, -7, 280, null, randomType);
    },
    [addBurst]
  );

  // Grand Simultaneous Fireworks Show
  const triggerGrandShow = useCallback(() => {
    const launches = [
      [0, -7.5, 4.4, -7.0, '#FFD700', 'chrysanthemum'], // Left
      [120, 7.5, 4.6, -7.0, '#00F0FF', 'peony'],        // Right
      [280, 0, 5.8, -8.0, '#FF5E13', 'willow'],         // Center high willow
      [450, -4.2, 5.2, -6.5, '#C743FF', 'ring'],        // Left-center ring
      [600, 4.2, 5.0, -6.5, '#FF2A85', 'chrysanthemum'],// Right-center magenta
      [850, -8.0, 3.8, -7.5, '#00FF87', 'peony'],       // Far left emerald
      [1000, 8.0, 4.0, -7.5, '#FFEA00', 'willow'],      // Far right gold
      [1300, -2.5, 6.2, -8.5, '#FFFFFF', 'chrysanthemum'], // Climax white-gold
      [1450, 2.5, 6.0, -8.5, '#FF7A18', 'ring'],        // Climax saffron
      [1750, 0, 6.6, -7.5, '#FFD700', 'willow'],        // Grand finale golden cascade
    ];

    launches.forEach(([delay, x, y, z, color, type]) => {
      setTimeout(() => {
        addBurst(x, y, z, 300, color, type);
      }, delay);
    });
  }, [addBurst]);

  // "BURST THE SKY 🎆" button: Instant flurry of 5 simultaneous fireworks
  const handleBurstSkyButton = useCallback(() => {
    const colors = ['#FFD700', '#00F0FF', '#FF2A85', '#00FF87', '#FF7A18'];
    const types = ['chrysanthemum', 'peony', 'willow', 'ring', 'chrysanthemum'];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const x = -8 + Math.random() * 16;
        const y = 3.2 + Math.random() * 3.8;
        addBurst(x, y, -7, 280, colors[i % colors.length], types[i % types.length]);
      }, i * 90);
    }
  }, [addBurst]);

  // Flurry of colorful skyshots & skycrackers while swiping/scrolling down
  const triggerSkyshotBarrage = useCallback(() => {
    const now = Date.now();
    if (now - lastBarrageTimeRef.current < 2200) return;
    lastBarrageTimeRef.current = now;

    const colors = [
      '#FFD76A', '#FF8A24', '#D83B83', '#00F0FF',
      '#FF2A6D', '#05FFA1', '#9D4EDD', '#FFEA00', '#FFFFFF'
    ];
    const types = ['chrysanthemum', 'peony', 'willow', 'ring', 'chrysanthemum'];

    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const x = -9 + Math.random() * 18;
        const y = 3.5 + Math.random() * 5;
        const c = colors[i % colors.length];
        const t = types[i % types.length];
        addBurst(x, y, -7.5, 260, c, t);
      }, i * 120);
    }
  }, [addBurst]);

  // Step 1: User submits name in initial modal
  const handleStart = useCallback(
    (nameInput) => {
      setRecipient(nameInput);

      // Start music track
      startAudio();

      // Launch single rocket whoosh sound
      playSound('whoosh');

      // Transition to ROCKET_LAUNCH
      setCinematicStage('ROCKET_LAUNCH');
    },
    [startAudio, playSound]
  );

  // Step 2-4: Handlers for 3D cinematic sequence milestones
  const handleSequenceEvent = useCallback(
    (event) => {
      if (event === 'EXPLODE') {
        playSound('boom');
        setCinematicStage('FIREWORK_EXPLOSION');
        setTimeout(() => {
          setCinematicStage('PARTICLE_NAME_REVEAL');
        }, 550);
      } else if (event === 'NAME_FORMED') {
        playSound('bell');
        setCinematicStage('NAME_AND_WISH_REVEAL');
      } else if (event === 'START_GRAND_SHOW') {
        setCinematicStage('GRAND_FIREWORKS');
        triggerGrandShow();
        setTimeout(() => {
          setCinematicStage('INTERACTIVE_CELEBRATION');
        }, 6500);
      }
    },
    [playSound, triggerGrandShow]
  );

  // Ambient celebration fireworks during interactive phase
  useEffect(() => {
    if (cinematicStage !== 'INTERACTIVE_CELEBRATION') return;

    autoBurstRef.current = setInterval(() => {
      const types = ['chrysanthemum', 'peony', 'willow', 'ring'];
      const type = types[Math.floor(Math.random() * types.length)];
      addBurst(
        -8 + Math.random() * 16,
        3.2 + Math.random() * 4.5,
        -7.5 - Math.random() * 2,
        240,
        null,
        type
      );
    }, 2400);

    return () => {
      if (autoBurstRef.current) clearInterval(autoBurstRef.current);
    };
  }, [cinematicStage, addBurst]);

  // Trigger skyshots barrage while swiping / scrolling down
  useEffect(() => {
    if (cinematicStage === 'ATMOSPHERE') return;
    const handleScroll = () => {
      if (window.scrollY > 80 && window.scrollY < 650) {
        triggerSkyshotBarrage();
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [cinematicStage, triggerSkyshotBarrage]);

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
    setCinematicStage('ATMOSPHERE');
    setRecipient('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isStarted = cinematicStage !== 'ATMOSPHERE';

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '100vh', background: '#000000' }}>
      {/* ── Fixed 3D Canvas in the Background ── */}
      <ThreeScene
        recipient={recipient}
        cinematicStage={cinematicStage}
        onSequenceEvent={handleSequenceEvent}
        flameIntensity={isStarted ? 1 : 0.45}
        fireworkBursts={fireworkBursts}
      />

      {/* Gold Accent Borders at Top and Bottom of Viewport */}
      <div className="gold-border-top" />
      <div className="gold-border-bottom" />

      {/* ── 1st: Initial Atmosphere Modal: Asks "Whose Diwali are we illuminating tonight?" ── */}
      {!isStarted && <NamePromptModal onStart={handleStart} />}

      {/* ── 2nd: Night Sky Storytelling Scene (Rocket Launch, Morph, Grand Finale) ── */}
      <main style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        <SkyCelebration
          recipient={recipient}
          cinematicStage={cinematicStage}
          onLaunchCracker={handleLaunchCracker}
          onBurstSkyButton={handleBurstSkyButton}
          onSwipeDown={handleSwipeDown}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          trackName={trackName}
        />

        {/* ── 3rd: Top 10 Curated Blessings & 5 Kindling Diyas ── */}
        {isStarted && (
          <QuoteSection
            recipient={recipient}
            onBackToSky={handleBackToSky}
            onResetName={handleResetName}
            playSound={playSound}
            onNextQuoteCracker={() => {
              addBurst(-4 + Math.random() * 8, 4 + Math.random() * 2.5, -7.5, 240, '#FFD76A', 'chrysanthemum');
              setTimeout(() => {
                addBurst(-4 + Math.random() * 8, 4 + Math.random() * 2.5, -7.5, 240, '#00F0FF', 'peony');
              }, 160);
            }}
            onIgniteDiya={() => {
              addBurst((Math.random() - 0.5) * 6, 2.5 + Math.random() * 2.5, -7.5, 160, '#FFD76A', 'peony');
            }}
          />
        )}
      </main>
    </div>
  );
}
