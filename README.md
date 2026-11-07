# DIWALI 2026 — The Festival of Lights 🪔
### Premium Cinematic 3D WebGL Celebration Experience

An extraordinary, cinematic interactive Diwali 2026 celebration experience built with **React**, **Three.js**, **React Three Fiber**, **Framer Motion**, and **Tailwind CSS**.

---

## ✨ Features

- **Audio & Volume Advisory**: High-end headphone/speaker indicator with animated soundwave equalizers and interactive test chime before stepping into the festival.
- **Single Name Entrance**: Elegant royal gold input for celebrating friends, family, and loved ones.
- **Night Sky & 3D Celestial Reveal**: Jet-black starlit sky (`#000000`) with 1,600 twinkling multi-spectral stars and the recipient's name rendered in giant metallic gold 3D typography (`Cinzel`, drop shadow, festive sparkles).
- **Photorealistic Skyshots & Skycrackers**:
  - Dual-stage rocket launch from ground level (`y = -7.5`) with a 32-particle incandescent comet trail.
  - Multi-tier detonation: 320+ Fibonacci sphere starburst with metallic salt palettes, white-hot core burst, and cascading weeping willow streamers.
  - Dynamic explosion flash lighting with post-processing cinematic Bloom.
  - Interactive click/tap anywhere in the sky to launch custom skycrackers.
- **Swipe-Down Skyshot Barrage**: Swiping or scrolling down launches a barrage of 10 synchronized skycrackers and reveals the dedicated blessing section.
- **Top 10 Curated Diwali 2026 Blessings**:
  - Cycle one-by-one with `Next Blessing ✨ (X/10)`.
  - 5 interactive blessing diyas (*Health, Joy, Wealth, Love, Peace*).
  - High-resolution postcard greeting card export (`html2canvas`).
- **Soundtrack & SFX**:
  - Background music (`ReelAudio-53164.mp3`) with mute/unmute control.
  - Realistic cracker launch whoosh, detonation booms, and temple chimes.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 8
- **3D & Visuals:** Three.js, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`
- **Animations:** Framer Motion
- **Styling:** Tailwind CSS 4
- **Audio:** HTML5 Audio + Web Audio API synthesizer
- **Export:** `html2canvas` for greeting card PNG export

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
npm run build
```
Outputs optimized static assets to `dist/`.
