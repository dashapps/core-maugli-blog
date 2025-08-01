# Maugli Blog - Astro & Tailwind CSS Theme by maugli.cfd

Hi-perfomance, SEO&AI-SEO optimised

[![Deploy to Netlify Button](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/dashapps/maugli-astro-theme)

## Getting started

1. **Install dependencies**

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

If you want to hide the example content included with this theme, set
`showExamples: false` in `src/config/maugli.config.ts`. Example files are
marked with `isExample: true` in their frontmatter.

### Useful npm scripts

| Script                           | Description                                 |
| -------------------------------- | ------------------------------------------- |
| `npm run dev`                    | Start local dev server                      |
| `npm start`                      | Alias for `npm run dev`                     |
| `npm run build`                  | Format content then create production build |
| `npm run typograf`               | Run typograf on all posts                   |
| `npm run astro`                  | Access the Astro CLI                        |
| `npm run featured:add <slug>`    | Mark a post as featured                     |
| `npm run featured:remove <slug>` | Remove featured mark from a post            |
| `npm run featured:list`          | List all featured posts                     |
| `npm run upgrade`                | Manually update `maugli.config.ts`          |
