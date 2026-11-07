import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useAudio – Handles background music (ReelAudio-53164)
 * and realistic firecracker sound effects.
 */
export function useAudio() {
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackName, setTrackName] = useState('ReelAudio-53164');

  const audioElRef = useRef(null);
  const ctxRef = useRef(null);
  const masterRef = useRef(null);

  // Initialize Web Audio Context for sound effects
  const getAudioContext = useCallback(() => {
    if (ctxRef.current && ctxRef.current.state !== 'closed') {
      if (ctxRef.current.state === 'suspended') {
        ctxRef.current.resume();
      }
      return ctxRef.current;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    const master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);

    ctxRef.current = ctx;
    masterRef.current = master;
    return ctx;
  }, []);

  /**
   * Start Music: Plays the attached ReelAudio-53164.mp3 track.
   */
  const startAudio = useCallback(() => {
    getAudioContext();
    setIsPlaying(true);

    try {
      if (!audioElRef.current) {
        const audio = new Audio();
        audio.src = '/ReelAudio-53164.mp3';
        audio.loop = true;
        audio.volume = 0.8;
        audioElRef.current = audio;

        audio
          .play()
          .then(() => {
            setTrackName('ReelAudio-53164');
          })
          .catch(() => {
            // Try fallback path if root is different
            audio.src = '/audio/zaalima.mp3';
            audio
              .play()
              .then(() => {
                setTrackName('ReelAudio-53164');
              })
              .catch((err) => {
                console.warn('Audio auto-play blocked or waiting for user interaction:', err);
              });
          });
      } else {
        audioElRef.current.play().catch(() => {});
      }
    } catch (e) {
      console.warn('Audio play error:', e);
    }
  }, [getAudioContext]);

  // Sound effects: Rocket launch ascent whistle/whoosh
  const playWhoosh = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.35, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / data.length) * Math.PI);
      }

      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      src.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(1600, now + 0.3);
      filter.Q.value = 3.5;

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(masterRef.current || ctx.destination);

      src.start(now);
      src.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, isMuted]);

  // Sound effects: Firecracker shell explosion boom
  const playBoom = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. Low-end boom oscillator
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.55);

      oscGain.gain.setValueAtTime(0.65, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc.connect(oscGain);
      oscGain.connect(masterRef.current || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);

      // 2. Crackling noise burst
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
      }

      const src = ctx.createBufferSource();
      const filter = ctx.createBiquadFilter();
      const noiseGain = ctx.createGain();

      src.buffer = buffer;
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, now);
      filter.frequency.exponentialRampToValueAtTime(200, now + 0.45);

      noiseGain.gain.setValueAtTime(0.45, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      src.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(masterRef.current || ctx.destination);

      src.start(now);
      src.stop(now + 0.55);
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, isMuted]);

  // Sound effects: Diya ignite whoosh
  const playIgnite = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.25);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(masterRef.current || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.38);
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, isMuted]);

  // Sound effects: Temple bell chime
  const playBell = useCallback(() => {
    if (isMuted) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const freqs = [587.33, 880, 1174.66]; // D5, A5, D6 harmonic chime
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        const initialVol = 0.16 / (idx + 1);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(initialVol, now + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(masterRef.current || ctx.destination);

        osc.start(now);
        osc.stop(now + 1.8);
      });
    } catch {
      // Audio fallback
    }
  }, [getAudioContext, isMuted]);

  const playSound = useCallback(
    (type) => {
      if (type === 'whoosh' || type === 'launch') playWhoosh();
      else if (type === 'boom') playBoom();
      else if (type === 'ignite') playIgnite();
      else if (type === 'bell' || type === 'chime') playBell();
    },
    [playWhoosh, playBoom, playIgnite, playBell]
  );

  // Toggle Mute
  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      if (masterRef.current) {
        masterRef.current.gain.value = next ? 0 : 0.7;
      }
      if (audioElRef.current) {
        audioElRef.current.muted = next;
      }
      return next;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
      if (ctxRef.current && ctxRef.current.state !== 'closed') {
        try {
          ctxRef.current.close();
        } catch {}
      }
    };
  }, []);

  return {
    isMuted,
    isPlaying,
    trackName,
    startAudio,
    toggleMute,
    playSound,
  };
}

export default useAudio;
