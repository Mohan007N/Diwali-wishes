/* ═══════════════════════════════════════════════
   DIWALI — Navigation & Overlay Controls
   ═══════════════════════════════════════════════ */
import React from 'react';

export default function Navigation({
  currentScene,
  chapterName,
  sceneNames,
  chapterNames,
  onNavigate,
  isMuted,
  onToggleSound,
  onToggleFullscreen,
}) {
  return (
    <>
      {/* Chapter Indicator — top right */}
      <div
        id="chapter"
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '16px',
          right: '20px',
          zIndex: 50,
          fontFamily: "'Cinzel', serif",
          fontSize: '0.7rem',
          letterSpacing: '0.2em',
          color: 'var(--antique-gold)',
          opacity: 0.6,
          pointerEvents: 'none',
          textTransform: 'uppercase',
        }}
      >
        Chapter {String(currentScene + 1).padStart(2, '0')} · {chapterName}
      </div>

      {/* Top Controls — top center */}
      <div
        id="controls"
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 50,
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          pointerEvents: 'auto',
        }}
      >
        <button
          className="ctrl-btn"
          id="btn-sound"
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}
          style={{
            background: 'rgba(12, 8, 30, 0.7)',
            border: '1px solid var(--line)',
            borderRadius: '50px',
            padding: '8px 18px',
            color: 'var(--muted)',
            fontSize: '0.82rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: "'Hind', sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          <span className="ctrl-icon" style={{ fontSize: '1.1rem', lineHeight: 1 }}>
            {isMuted ? '🔇' : '🔊'}
          </span>
        </button>

        <button
          className="ctrl-btn"
          id="btn-fullscreen"
          onClick={onToggleFullscreen}
          aria-label="Toggle fullscreen"
          style={{
            background: 'rgba(12, 8, 30, 0.7)',
            border: '1px solid var(--line)',
            borderRadius: '50px',
            padding: '8px 18px',
            color: 'var(--muted)',
            fontSize: '0.82rem',
            letterSpacing: '0.12em',
            cursor: 'pointer',
            fontFamily: "'Hind', sans-serif",
            fontWeight: 600,
            textTransform: 'uppercase',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            transition: 'color 0.2s, border-color 0.2s',
          }}
        >
          ⛶
        </button>
      </div>

      {/* Nav Dots — fixed right */}
      <nav
        id="nav"
        aria-label="Scene navigation"
        style={{
          position: 'fixed',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'auto',
        }}
      >
        {sceneNames.map((name, idx) => {
          const isActive = idx === currentScene;
          return (
            <button
              key={name}
              className={`nav-dot ${isActive ? 'active' : ''}`}
              onClick={() => onNavigate(idx)}
              aria-label={chapterNames[idx]}
              title={chapterNames[idx]}
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: isActive ? 'var(--antique-gold)' : 'rgba(255, 255, 255, 0.25)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transform: isActive ? 'scale(1.4)' : 'scale(1)',
                transition: 'background 0.3s, transform 0.3s',
              }}
            />
          );
        })}
      </nav>
    </>
  );
}

