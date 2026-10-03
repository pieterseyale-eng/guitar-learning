# Major Scale Trainer

A small React + TypeScript + Vite app for practicing major scale degrees.

## Features

- One quiz question at a time (example: "What is the 5th degree of D major?")
- Covers all 12 major keys
- Accepts answers like `C`, `F#`, `Bb`
- Shows correct/incorrect feedback
- Tracks score
- Includes a **Next Question** button
- Separates scale data and quiz logic into dedicated files

## Project structure

- `src/scaleData.ts`: major scale definitions
- `src/quizLogic.ts`: question generation and answer checking
- `src/App.tsx`: UI and app state

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start dev server:

   ```bash
   npm run dev
   ```

3. Open the local URL shown by Vite (usually `http://localhost:5173`).

## Build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```
