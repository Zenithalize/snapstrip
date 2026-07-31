# SnapStrip — Real-Time K-Pop Photobooth Web App

SnapStrip is a real-time browser-based photobooth app designed in the style of physical K-pop photobooth machines. Users open the app, point their webcam at themselves, and go through a guided countdown shoot sequence. Captured frames are automatically composited into a 2-column × 3-row polaroid-style photo strip with iridescent holographic sheens, pastel frames, stickers, filters, and custom text overlays.

---

## 🌟 Core Features

- **Guided Shoot Sequence**: 6 automatic shots with a 3-second countdown per shot, 180px animated bouncing numbers, Web Audio API sound cues (440Hz ticks, 880Hz capture beep, shutter click, success chime), and a 150ms full-screen white flash overlay.
- **High-Res 2X Canvas Composition**: Generates 1600px × 2400px (2x scale of 800×1200) print-ready polaroid photo strips with rounded corners (`roundRect` with polyfill), object-fit center cropping, baked CSS filters, and thin inner borders.
- **5 Background Themes**: Holographic Rainbow Sheen, Soft Pink Lace, Mint Cream, Starry Night, and Custom Pastel Color.
- **9 Live Filter Presets**: Natural, Soft Pastel, Vivid K-Pop, Vintage 90s, Noir Mono, Dreamy Pink, Golden Hour, Cool Breeze, Y2K Glow.
- **K-Pop Cute Stickers & Custom Text**: Place SVG stickers (hearts, stars, sparkles, flowers, crowns, bunny) and add custom text overlays with font choices (Caveat handwritten, Playfair Display serif, Space Mono).
- **Full Export Suite**: Download crisp PNG, compact JPG (0.92 compression), share via mobile Web Share API (`navigator.share`), or print via browser print dialog.
- **2-Player Co-Op Mode**: Online multiplayer photobooth mode powered by Node.js + Socket.IO allowing friends in separate locations to take alternating shots in a shared room code.
- **Fallback Image Upload**: Upload 6 local photos directly if camera access is unavailable or denied.
- **Privacy First**: Photos stay entirely in local browser memory and are never uploaded to remote servers in solo mode.

---

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Sound**: Web Audio API (`AudioContext`) — zero external MP3 assets
- **Multiplayer**: Node.js, Express, Socket.IO
- **Testing**: Vitest, `@testing-library/react`, `jsdom`

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Solo Photobooth App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Start Co-Op Multiplayer Server (Optional)
```bash
node server/server.js
```
The signaling server will start on `http://localhost:3001`.

### 4. Run Test Suite
```bash
npx vitest run
```

### 5. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
Photobooth/
├── index.html                  # Google Fonts & metadata
├── vite.config.ts              # Vite & Vitest configuration
├── package.json                # Project dependencies
├── server/
│   └── server.js               # Node.js + Socket.IO multiplayer server
├── src/
│   ├── App.tsx                 # Core state machine coordinator
│   ├── index.css               # Design tokens, keyframes, holographic sheen, print CSS
│   ├── types/
│   │   └── photobooth.ts       # TypeScript interfaces & type definitions
│   ├── hooks/
│   │   ├── useCamera.ts        # MediaStream lifecycle & un-mirrored frame capture
│   │   ├── useCountdown.ts     # Per-shot countdown, audio cues & flash timing
│   │   ├── usePhotoStrip.ts    # Frame array state, reorder & slot actions
│   │   └── useCoOp.ts          # Socket.IO multiplayer room connection
│   ├── components/
│   │   ├── HeaderBar.tsx       # Navigation header & privacy badge
│   │   ├── LandingSetup.tsx    # Theme & filter preset landing selector
│   │   ├── CameraView.tsx      # Live preview, K-pop frame, countdown overlay & flash
│   │   ├── FilterPicker.tsx    # Filter preset thumbnails
│   │   ├── StripEditor.tsx     # Frame slot manager, stickers, text overlay
│   │   ├── StripPreview.tsx    # 150ms debounced canvas renderer
│   │   ├── ExportView.tsx      # PNG/JPG download, Web Share & Print
│   │   └── CoOpModal.tsx       # Multiplayer room creation & joining modal
│   ├── utils/
│   │   ├── audio.ts            # Web Audio API sound synthesizer
│   │   ├── canvasCompose.ts    # 2X Canvas rendering engine with roundRect clip
│   │   ├── filters.ts          # Filter CSS definitions
│   │   └── export.ts           # Blob download, share & print handlers
│   └── test/
│       ├── useCountdown.test.ts
│       ├── canvasCompose.test.ts
│       └── filters.test.ts
```

---

## 🌐 Deploy to Vercel / Netlify

This single-page React app can be deployed to Vercel or Netlify with no build server configuration required:

1. Push code to GitHub.
2. Import repository into **Vercel** or **Netlify**.
3. Framework preset: **Vite**.
4. Build command: `npm run build`
5. Output directory: `dist`

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)
