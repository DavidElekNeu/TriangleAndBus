# Ride the Bus – Client

This React (+ Vite) application is the mobile-first front-end for the Ride the Bus online card game.

## Getting started

```bash
# inside /client
npm install
npm run dev
```

The dev server runs on http://localhost:5173 and connects to the WebSocket server on port 8080 by default.

## Structure

- `src/` – Application source code
  - `pages/` – Route components (Home, Lobby, Game, Results)
  - `context/` – React context for WebSocket connection
  - `App.tsx` – Router setup
  - `main.tsx` – Entry point

## TODO
- Implement detailed Lobby UI with player list & rules config
- Build Pyramid and Bus views with interactive controls
- Synchronise real-time state via WebSocket protocol