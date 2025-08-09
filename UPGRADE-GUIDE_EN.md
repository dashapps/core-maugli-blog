# Upgrade Guide for Maugli Blog Users

## Fix PWA Build Error (v1.2.68)

### Problem
When building the project with `npm run build` command, you encounter the error:
```
ENOTDIR: not a directory, mkdir '/path/to/project/dist/sw.js/'
```

### Solution
Update to version **1.2.68** or higher:

```bash
npm update core-maugli
```

After updating automatically:
1. ✅ PWA plugin will be properly configured in astro.config.mjs
2. ✅ Service Worker will be generated without conflicts
3. ✅ Project build will complete successfully

---

## Fix PWA Service Worker Warnings (v1.2.67)

### Problem
When running `npm run dev` command, you see warnings:
```
[WARN] [router] A `getStaticPaths()` route pattern was matched, but no matching static path was found for requested path `/sw.js`
```

### Solution
Update to version **1.2.67** or higher:

```bash
npm update core-maugli
```

After updating automatically:
1. ✅ PWA routing warnings will disappear from development console
2. ✅ File `src/pages/sw.js.astro` will be created for correct routing
3. ✅ PWA functionality will work without conflicts

---

## Fix Image Size Issues in Lighthouse

If your Lighthouse report shows large unoptimized images, this means that automatic image preview generation is not working.

## Solution

Update to version **1.2.6** or higher:

```bash
npm update core-maugli
```

After updating automatically:

1. ✅ Preview generation scripts will be copied to your project
2. ✅ Build process will be updated to include preview generation
3. ✅ Version in package.json will be updated

## Verification

After updating, check your `package.json`:

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

## Run Preview Generation

Now optimized previews (400x210px) will be automatically created for all blog images during each build.

```bash
npm run build
```

## Result

After this, your blog images will:

- ⚡ Load faster
- 📱 Display correctly on all devices
- 🟢 Get high scores in Lighthouse
