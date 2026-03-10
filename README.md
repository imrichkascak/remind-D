# Remind·D Web

A lightweight vitamin D sun tracker, inspired by D-Minder iOS/Android — built for the web.

## Features

- 📍 **Geolocation** — detects your position automatically
- ☀️ **Real UV index** — fetches live data from Open-Meteo (free, no API key needed)
- 🧬 **Personalized** — Fitzpatrick skin type, body exposure %, age & weight
- ⏱ **Session timer** — start/stop sun sessions, tracks safe exposure time
- 💊 **Vitamin D calculator** — estimates IU earned per session based on UV, skin, exposure
- 📈 **Daily progress** — tracks toward 1000 IU/day goal
- 🗂 **History** — view past sessions
- 📊 **UV hourly forecast** — visual chart for the day
- 🌅 **Solar times** — sunrise, solar noon, sunset
- 💾 **Persistent** — data saved to localStorage

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **SunCalc** — solar position calculations
- **Open-Meteo API** — free UV index data (no key needed)

## Local Dev

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

### CLI
```bash
npm i -g vercel
vercel
```

### GitHub → Vercel Dashboard
1. Push to GitHub
2. vercel.com → New Project → Import repo
3. Click Deploy — zero config needed

## Scientific Notes

Vitamin D calculations are based on:
- Holick MF (2004) — Sunlight and vitamin D
- Webb AR (1988) — UV-B dose / D3 production
- Fitzpatrick MED values for each skin type

These are **estimates**. Consult a healthcare provider for medical advice.
