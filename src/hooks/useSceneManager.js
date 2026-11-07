import { useState, useCallback, useRef } from 'react';
import gsap from 'gsap';

const SCENE_NAMES = ['intro', 'diya', 'rangoli', 'fireworks', 'wish', 'finale'];
const CHAPTER_NAMES = [
  'The Awakening',
  'The Sacred Light',
  'Festival of Colours',
  'Grand Fireworks',
  'Your Wish',
  'Grand Finale',
];

/**
 * useSceneManager – orchestrates scene transitions for the Diwali experience.
 * Drives GSAP cross-fade opacity transitions between scenes 0-5.
 */
export function useSceneManager() {
  const [currentScene, setCurrentScene] = useState(0);
  const [previousScene, setPreviousScene] = useState(-1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [direction, setDirection] = useState('forward'); // 'forward' | 'backward'
  const transitionLock = useRef(false);

  /**
   * Navigate to a specific scene index with a GSAP cross-fade.
   * @param {number} index – target scene (0–5)
   */
  const goToScene = useCallback(
    (index) => {
      if (transitionLock.current) return;
      if (index < 0 || index >= SCENE_NAMES.length) return;
      if (index === currentScene) return;

      transitionLock.current = true;
      setIsTransitioning(true);
      setDirection(index > currentScene ? 'forward' : 'backward');
      setPreviousScene(currentScene);

      const outEl = document.querySelector(`[data-scene="${SCENE_NAMES[currentScene]}"]`);
      const inEl = document.querySelector(`[data-scene="${SCENE_NAMES[index]}"]`);

      // Ensure incoming element is visible but transparent
      if (inEl) {
        gsap.set(inEl, { opacity: 0, display: 'block', pointerEvents: 'none' });
      }

      const tl = gsap.timeline({
        onComplete: () => {
          // Hide outgoing scene completely
          if (outEl) {
            gsap.set(outEl, { display: 'none', pointerEvents: 'none' });
          }
          if (inEl) {
            gsap.set(inEl, { pointerEvents: 'auto' });
          }
          setCurrentScene(index);
          setIsTransitioning(false);
          transitionLock.current = false;
        },
      });

      // Cross-fade: out ➜ 0, in ➜ 1
      tl.to(outEl || {}, { opacity: 0, duration: 0.8, ease: 'power2.inOut' }, 0);
      tl.to(inEl || {}, { opacity: 1, duration: 0.8, ease: 'power2.inOut' }, 0.15);
    },
    [currentScene],
  );

  /** Advance to the next scene. */
  const nextScene = useCallback(() => {
    goToScene(currentScene + 1);
  }, [currentScene, goToScene]);

  /** Go back to the previous scene. */
  const prevScene = useCallback(() => {
    goToScene(currentScene - 1);
  }, [currentScene, goToScene]);

  /** Replay from the intro scene. */
  const replay = useCallback(() => {
    goToScene(0);
  }, [goToScene]);

  return {
    currentScene,
    previousScene,
    sceneName: SCENE_NAMES[currentScene],
    chapterName: CHAPTER_NAMES[currentScene],
    goToScene,
    nextScene,
    prevScene,
    replay,
    isTransitioning,
    direction,
    sceneNames: SCENE_NAMES,
    chapterNames: CHAPTER_NAMES,
  };
}

export default useSceneManager;
