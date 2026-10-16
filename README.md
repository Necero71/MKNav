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

## Android app (Capacitor)

The same web files are also packaged as a real Android app. The web version and the GitHub Pages site are unchanged.

- App id: `io.github.necero71.mknavkit`. This can't be changed after people install it, so settle it before the first release.
- `npm install`, then `npm run sync` copies the web files into `android/`. `npm run open` opens Android Studio.
- The service worker is skipped inside the app (files are bundled, so it isn't needed).
- Range card and pace settings are stored inside the app, separate from the web/PWA copy, so re-enter them once.

### One-time signing setup

Every update has to be signed with the **same key** as the first release, or Android refuses to install it over the old one. Back the keystore up somewhere safe (password manager plus an offline copy). Lose it and nobody can update.

```bash
keytool -genkeypair -v -keystore release.keystore -alias mkkey -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.keystore    # paste this output into the first secret below
```

Repo **Settings > Secrets and variables > Actions**, add:

| Secret | Value |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | output of the `base64` command |
| `ANDROID_KEYSTORE_PASSWORD` | keystore password |
| `ANDROID_KEY_ALIAS` | `mkkey` (or whatever you used) |
| `ANDROID_KEY_PASSWORD` | key password |

One keystore can sign both MK apps. Never commit it (`*.keystore` is git-ignored).

### Releasing and updating

```bash
git tag v1.0.0 && git push origin v1.0.0
```

GitHub Actions builds a signed APK and attaches it to a GitHub Release. Every new tag (`v1.0.1`, `v1.1.0`...) is an update. The version code is derived from the tag (`1.2.3` becomes `10203`), so tags must go up.

- **Install:** download the APK from the Releases page and allow installs from unknown sources.
- **Auto-updates on the phone:** add this repo's URL to [Obtainium](https://github.com/ImranR98/Obtainium) and it will pick up new releases.
- **Test build:** Actions tab, *Android APK*, *Run workflow*. With no secrets set it makes a debug APK (artifact only, never published). Debug and release builds are signed differently, so uninstall one before installing the other.
