# MK NAVKIT

Offline-capable field companion for Arma Reforger on Xbox. Runs on your phone or tablet next to the console.

**Tools:** mil range estimator, grid-to-grid distance and bearing, plot-a-contact, pace count and ETA, and a personal range card.

## Run it

It's plain HTML/CSS/JS, no build step.

- **Quick look:** open `index.html` in a browser (the offline/install bits need hosting, below).
- **Local server:** `python3 -m http.server 8000` in this folder, then open `http://localhost:8000`.

## Host it on GitHub Pages

1. Create a repo and push these files to the root of the `main` branch.
2. Repo **Settings > Pages**, source `main` / root.
3. Open the Pages URL on your phone and use **Add to Home Screen** (iOS Safari) or **Install app** (Chrome on Android).
4. https://necero71.github.io/MKNav/
After the first load it works with no signal.

## Updating

The service worker is stale-while-revalidate: installed copies load instantly from cache, then refresh in the background, so edits show up on the next launch (close and reopen the app once or twice).

Bump `CACHE` in `sw.js` (`mknav-v2` to `mknav-v3`) when you add, rename or remove files, so old caches get cleared and the new file list is precached.

Deep links work: `index.html#grid`, `#plot`, `#pace`, `#card`, `#range`. The manifest uses them for long-press home-screen shortcuts.

## Notes

- Grid input accepts 4, 6, 8 or 10 digits. Six digits (3 + 3) means 100 m precision.
- Bearings are grid bearings in degrees or NATO mils (6400 per circle). No declination is applied.
- Target-size presets are rough; edit the size field if you know the real number.
- Range card entries and pace settings are saved on the device only.
- Math lives in `core.js` and is independent of the UI.
