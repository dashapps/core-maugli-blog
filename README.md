# Maugli Blog - Astro & Tailwind CSS Theme by maugli.cfd

Hi-perfomance, SEO&AI-SEO optimised

## Introduction

Maugli is a lightweight, agent-friendly blog that can integrate into an existing site or run as a standalone project. Link the blog's logo to your primary site by setting `brand.logoHref` in [`src/config/maugli.config.ts`](src/config/maugli.config.ts).

The theme includes a `product` entity for showcasing offerings. Rename it (for example, to "services") and hide or customize related menu items by editing the `navLinks` array in the same configuration file.

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dashapps/maugli-astro-theme)

Before deploying, push this project to your own Git repository. Update the
`repository=` parameter in the link above so it points to your repository or
connect the repo through the Netlify UI.

Example link:
`https://app.netlify.com/start/deploy?repository=https://github.com/your-user/your-repo`

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

`npm run build` runs [`scripts/verify-assets.js`](scripts/verify-assets.js)
before the Astro build. This script checks the SHA-256 hashes of the
floating label component and footer badge to ensure they haven't been
modified. If you change these assets without updating their hashes in
the script, the build will fail.

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

| Script                           | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `npm run dev`                    | Start local dev server                      |
| `npm start`                      | Alias for `npm run dev`                     |
| `npm run build`                  | Format content, verify assets, then create production build |
| `npm run typograf`               | Run typograf on all posts                   |
| `npm run astro`                  | Access the Astro CLI                        |
| `npm run featured:add <slug>`    | Mark a post as featured                     |
| `npm run featured:remove <slug>` | Remove featured mark from a post            |
| `npm run featured:list`          | List all featured posts                     |
| `npm run upgrade`                | Manually update `maugli.config.ts`          |
| `npm run backup-update`          | Backup key files then run `npm update`      |

## Checking installed version

See which version of the theme is installed:

```bash
npm list core-maugli
```

## Updating

Upgrade to the latest release:

```bash
npm update
```

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
