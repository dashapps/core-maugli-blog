# Maugli Blog - Astro & Tailwind CSS2. **Interface Language** - Choose from:
   - 🇺🇸 English (default)
   - 🇷🇺 Русский
   - 🇪🇸 Español  
   - 🇩🇪 Deutsch
   - 🇵🇹 Português
   - 🇫🇷 Français
   - 🇨🇳 中文
   - 🇯🇵 日本語
3. **Main Domain** - Do you have a main domain to link this blog to? (e.g., mybrand.com - leave empty if none)
4. **Multilingual Support** - Enable/disable multiple languages (disabled by default)maugli.cfd

Hi-perfomance, SEO&AI-SEO optimised

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

To start a new project, run the interactive setup:

```bash
npx core-maugli init my-blog
cd my-blog
npm run dev
```

### Interactive Setup

The setup wizard will ask you to configure:

1. **Blog Name** - The display name for your blog (can be changed later in config)
2. **Interface Language** - Choose from:
   - 🇺🇸 English (default)
   - 🇸 Español  
   - 🇩🇪 Deutsch
   - �� Português
   - �� Français
   - 🇨🇳 中文
   - 🇯🇵 日本語
3. **Main Domain** - Your main website URL (leave empty for local blog)
4. **Multilingual Support** - Enable/disable multiple languages (disabled by default)

Your blog will be available at `http://localhost:4321/`

### Manual Installation

If you prefer to install without the interactive setup:

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

### Testing

Run the test suite to verify that example content is filtered correctly:

```bash
npm test
```

All tests should complete without errors.

## Configuration

### Initial Setup
The interactive setup automatically configures your blog based on your choices. All settings can be changed later in `src/config/maugli.config.ts`.

### Customization Options
- **Blog Name & Description** - Change `brand.name` and `brand.description`
- **Language Settings** - Modify `defaultLang` and `features.enableMultiLang`
- **Domain Configuration** - Update `brand.logoHref` for your main site link
- **Example Content** - Set `showExamples: false` to hide demo content
- **Theme & Features** - Enable/disable various blog features

Example files are marked with `isExample: true` in their frontmatter.

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
| `npm run backup-update`          | Backup key files then run `npm update`      |

## Updating

Running `npm update` will replace the theme's components and layouts with the latest versions. Content under `src/content/**`, your stylesheet `src/styles/global.css` and your `src/config/maugli.config.ts` file are kept. Commit any local changes before updating.

Use `npm run backup-update` to copy these files to a timestamped `maugli-backup-*` directory before updating.

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
