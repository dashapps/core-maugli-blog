# Upgrade Guide for Maugli Blog Users

## PWA Build Error Fix (v1.2.68)

### Problem

When building the project with `npm run build` command, an error occurs:

```
ENOTDIR: not a directory, mkdir '/path/to/project/dist/sw.js/'
```

### Solution

Update to version **1.2.68** or higher:

```bash
npm update core-maugli
```

After update automatically:

1. ✅ PWA plugin will be properly configured in astro.config.mjs
2. ✅ Service Worker will be generated without conflicts
3. ✅ Project build will complete successfully

---

## PWA Service Worker Warnings Fix (v1.2.67)

### Problem

When running `npm run dev` command, warnings appear:

```
[WARN] [router] A `getStaticPaths()` route pattern was matched, but no matching static path was found for requested path `/sw.js`
```

### Solution

Update to version **1.2.67** or higher:

```bash
npm update core-maugli
```

After update automatically:

1. ✅ File `src/pages/sw.js.astro` will be created for correct PWA routing
2. ✅ Development console warnings will disappear
3. ✅ PWA functionality will work without conflicts

---

## Lighthouse Image Size Problem

If your Lighthouse report shows large unoptimized images (as shown in screenshot), this means automatic image preview generation is not working.

## Solution

Update to version **1.2.6** or higher:

```bash
npm update core-maugli
```

After update automatically:

1. ✅ Preview generation scripts will be copied to your project
2. ✅ Build process will be updated to include preview generation
3. ✅ Version in package.json will be updated

## Verification

After update, check your `package.json`:

```json
{
  "scripts": {
    "build": "node scripts/generate-previews.js && astro build"
  },
  "dependencies": {
    "core-maugli": "^1.2.6"
  }
}
```

## Running Preview Generation

Now with every build, optimized previews (400x210px) will be automatically created for all blog images.

```bash
npm run build
```

## Result

After this, your blog card images will:

- ⚡ Load faster
- 📱 Display correctly on all devices
- 🟢 Get high Lighthouse scores

Image size will decrease from ~130KB to ~20-30KB!
