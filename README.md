# Maugli Blog - Astro & Tailwind CSS Theme by maugli.cfd

Hi-perfomance, SEO&AI-SEO optimised

## Introduction

Maugli is a lightweight, agent-friendly blog that can integrate into an existing site or run as a standalone project. Link the blog's logo to your primary site by setting `brand.logoHref` in [`src/config/maugli.config.ts`](src/config/maugli.config.ts).

The theme includes a `product` entity for showcasing offerings. Rename it (for example, to "services") and hide or customize related menu items by editing the `navLinks` array in the same configuration file.

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dashapps/core-maugli-blog)

The Netlify deployment button automatically uses your repository URL configured in [`src/config/maugli.config.ts`](src/config/maugli.config.ts). When you run `npx core-maugli init`, it will ask for your repository URL and configure the deployment button accordingly.

You can also use the dynamic `<NetlifyButton />` component in your Astro pages:

```astro
---
import NetlifyButton from '../components/NetlifyButton.astro';
---

<NetlifyButton />
```

Using Netlify CLI instead:

```
npm install -g netlify-cli
netlify init
netlify deploy --prod
```

## Getting started

To start a new project in an empty folder run:

```bash
npx core-maugli init my-blog
cd my-blog
npm run dev
```

To initialize inside the current folder use:

```bash
npx core-maugli init .
```

The init script lets you choose a language or pass one with `--lang`. Available codes: `ru`, `en`, `es`, `de`, `pt`, `fr`, `zh`, `ja`.

Example:

```bash
npx core-maugli init my-blog --lang es
```

You pick the language only once during project creation; updates won't ask again.

Your blog will be available at `http://localhost:4321/`

1. **Install dependencies**

   If you created your project using the provided `init` script, the
   dependencies are already installed and you can skip this step.

   ```bash
   npm install
   ```

   During installation the `upgrade-config` script runs automatically
   and updates your `maugli.config.ts` with any new fields. You can run
   this manually later with:

   ```bash
   npm run upgrade
   ```

2. **Run the development server**

   ```bash
   npm run dev
   ```

3. **Build the project**

```bash
 npm run build
```

## 🖼️ Image Management

Maugli Blog uses a **smart image management system** that separates user content from system assets:

### Your Images Are Protected ✅

During npm updates, **your images are preserved**:
- `public/img/blog/` - Your blog post images
- `public/img/authors/` - Your author photos  
- `public/img/uploads/` - Your uploaded content
- `public/img/products/` - Your product images
- `public/img/projects/` - Your project images

### System Assets Are Updated 🔄

These are managed automatically by npm updates:
- `public/favicon.svg`, logos, icons
- `public/flags/` - Country flags
- `public/img/default/` - Default fallback images

### Automatic Image Optimization

The system automatically generates responsive versions:
```bash
# From: my-post.webp
# Creates: my-post-400.webp (mobile)
#         my-post-800.webp (tablet)  
#         my-post-1200.webp (desktop)
#         previews/my-post.webp (thumbnail)
```

**Best practices:**
- Use WebP format for better performance
- Blog images: max 1200px width
- Author avatars: 400x400px recommended

See [detailed image management guide](docs/USER-IMAGES.md) for more information.

## Component Updates & Customization

⸻

**Important**: Maugli Blog is designed for centralized component updates. All core components (`src/components/`, `src/layouts/`, `src/pages/`, etc.) are automatically updated to the latest version when you run:

```bash
npm install --save core-maugli@latest
```

This ensures that you always receive the latest:
- **Features**
- **Bug fixes** 
- **Performance improvements**
- **Accessibility enhancements**
- **Lighthouse-validated optimizations**

### Why Centralized Updates?

**1. Automation First**  
Manual component maintenance is time-consuming and error-prone. Centralized updates free you from technical debt, allowing you to focus on content creation and business growth instead of code maintenance.

**2. Lighthouse & Performance Excellence**  
All Maugli components are crafted to comply with strict Lighthouse, Web Vitals, and AI-indexability guidelines. Every component update includes:
- **Mobile UX optimization** (48px touch targets, responsive design)
- **Performance optimization** (proper image loading, minimal layout shift)
- **SEO compliance** (structured data, semantic HTML, accessibility)
- **Core Web Vitals** (LCP, FID, CLS optimization)

Manual changes may negatively affect your site's score in:
- **SEO**
- **Performance** 
- **Accessibility**
- **Best Practices**

⚠️ **We do not recommend editing core components manually.** If you do, re-test your site with Lighthouse and search engine validators after every change.

⸻

This centralized update approach **does not affect**:

- Your content (`src/content/`)
- Your configuration (`src/config/maugli.config.ts`)
- Your styles (`src/styles/global.css`) — preserved if customized
- Your project files (`package.json`, `astro.config.mjs`, etc.)

⸻

`npm run build` runs [`scripts/verify-assets.js`](scripts/verify-assets.js)
before the Astro build. This script checks the SHA-256 hashes of the
floating label component and footer badge to ensure they haven't been
modified. The floating label's hash is validated to ensure compliance
with licensing.

If you hold a commercial license and legitimately change the label,
generate its new SHA-256 hash and replace the value for
`src/components/MaugliFloatingLabel.astro` in the `files` object of
[`scripts/verify-assets.js`](scripts/verify-assets.js). For example:

```bash
node -e "import { createHash } from 'crypto'; import { readFileSync } from 'fs'; console.log(createHash('sha256').update(readFileSync('src/components/MaugliFloatingLabel.astro')).digest('hex'))"
```

If you change these assets without updating their hashes in the
script, the build will fail.

### Customizing fonts

This project uses [Fontsource](https://fontsource.org/) for typography. To add a different font, install the desired package:

```bash
npm install @fontsource-variable/roboto
```

Then replace or add the corresponding `@import` line in [`src/styles/global.css`](src/styles/global.css):

```css
@import '@fontsource-variable/roboto/wght.css' layer(base);
```

Update the `--font-sans` or `--font-serif` variables in the same file so Tailwind uses the new font:

```css
--font-sans: 'Roboto Variable', sans-serif;
/* or */
--font-serif: 'Roboto Variable', sans-serif;
```

Repeat these steps for any other fonts you want to include.

### Configuring PWA colors and icons

Progressive Web App options live under the `pwa` key in [`src/config/maugli.config.ts`](src/config/maugli.config.ts). The section accepts:

- `themeColor` – used for the manifest's `theme_color` and the `<meta name="theme-color">` tag
- `backgroundColor` – controls the manifest's `background_color`
- `icons` – array of icon definitions with `src`, `sizes`, `type`, and optional `purpose`

Example configuration:

```ts
// src/config/maugli.config.ts
export const maugliConfig = {
  // ...other fields
  pwa: {
    themeColor: '#0cbf11',
    backgroundColor: '#ffffff',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  }
};
```

These values are referenced in `astro.config.mjs` when generating the manifest:

```js
// astro.config.mjs
import { maugliConfig } from './src/config/maugli.config';

export const pwaOptions = {
  manifest: {
    background_color: maugliConfig.pwa?.backgroundColor,
    theme_color: maugliConfig.pwa?.themeColor,
    icons: maugliConfig.pwa?.icons
  }
};
```

Updating the values in `maugli.config.ts` automatically refreshes the PWA manifest generated by Astro.

### Testing

Run the test suite to verify that example content is filtered correctly:

```bash
npm test
```

All tests should complete without errors.

If you want to hide the example content included with this theme, set
`showExamples: false` in `src/config/maugli.config.ts`. Example files are
marked with `isExample: true` in their frontmatter.

To restore the default example posts and other sample content later, run:

```bash
npx core-maugli init .
```

### Useful npm scripts

| Script                           | Description                                                 |
| -------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                    | Start local dev server                                      |
| `npm start`                      | Alias for `npm run dev`                                     |
| `npm run build`                  | Format content, verify assets, then create production build |
| `npm run typograf`               | Run typograf on all posts                                   |
| `npm run astro`                  | Access the Astro CLI                                        |
| `npm run featured:add <slug>`    | Mark a post as featured                                     |
| `npm run featured:remove <slug>` | Remove featured mark from a post                            |
| `npm run featured:list`          | List all featured posts                                     |
| `npm run upgrade`                | Manually update `maugli.config.ts`                          |
| `npm run backup-update`          | Backup key files then run `npm update`                      |

## Checking installed version

See which version of the theme is installed:

```bash
npm list core-maugli
```

## Updating the theme

To update to the latest version of core-maugli, use:

```bash
npm install core-maugli@latest --save
```

If you just run `npm install core-maugli`, it will install the version specified in your package.json. Only with `--save` (или вручную обновив package.json) вы получите самую свежую версию.

To back up key files and then update, run:

```bash
npm run backup-update
```

Both commands replace the theme's components and layouts with the latest versions. Content under `src/content/**`, your stylesheet `src/styles/global.css` and your `src/config/maugli.config.ts` file are kept. Commit any local changes before updating.

## Licensing

This theme is dual-licensed:

- **GPL-3.0-or-later** – use, study and modify the code under the terms of the
  GNU General Public License.
- **Commercial license** – use the theme without GPL obligations.

Removing the "Created with Maugli" badge (for example the
`MaugliFloatingLabel.astro` component and the footer image) requires the
commercial license.

Contact <licensing@maugli.cfd> or visit
<https://maugli.cfd/licensing> for more information.
