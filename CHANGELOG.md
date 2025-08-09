# Changelog

## [1.2.68] - 2025-08-09

### Fixed
- 🔧 **PWA Build Fix**: Fixed critical build error `ENOTDIR: not a directory, mkdir 'dist/sw.js/'`
- ⚙️ **PWA Configuration**: Properly connected VitePWA plugin in astro.config.mjs
- 🚫 **PWA Routing**: Added `/^\/sw\.js$/` to navigateFallbackDenylist for correct service worker handling
- 🌐 **Localization**: Updated all console messages to English for international users

### Removed
- ❌ `src/pages/sw.js.astro` (caused build conflict)
- ❌ `src/middleware.ts` (no longer needed)
- ❌ `public/sw.js` (placeholder no longer needed)

## [1.2.67] - 2025-08-09

### Fixed
- 🔧 **PWA Service Worker routing**: Fixed warnings `[WARN] [router] A \`getStaticPaths()\` route pattern was matched, but no matching static path was found for requested path \`/sw.js\``
- 🧹 **Scripts cleanup**: Removed 6 unused scripts from `/scripts` folder
- ⚡ **Auto-update**: Update script now automatically creates `src/pages/sw.js.astro` for correct PWA functionality

### Added
- 📄 File `src/pages/sw.js.astro` for handling PWA service worker requests
- 📚 Updated UPGRADE-GUIDE.md with PWA fix instructions

### Removed
- ❌ `scripts/check-version-old.js` (unused)
- ❌ `scripts/copy-content-images.cjs` (unused)
- ❌ `scripts/copy-netlify-config-simple.js` (unused)
- ❌ `scripts/generate-previews-build.js` (unused)
- ❌ `scripts/test-package-update.js` (unused)
- ❌ `scripts/test-version-update.js` (unused)

## [1.2.66] - 2025-08-08

### Previous Changes
- Basic blog functionality
- Image preview generation system
- PWA support
