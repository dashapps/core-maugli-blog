# Quick Start Guide: Force Version Updates

## 🚀 What's New?

Now with every build (`npm run build`) the system automatically:

1. **Checks for updates** to core-maugli
2. **Shows new features** in English
3. **Suggests updating** with interactive Y/n choice
4. **Performs full update** when agreed

## 📋 Commands

### For Developers

```bash
npm run build          # Build with version check
npm run build:fast     # Fast build without checking
npm run check-version  # Force version check
```

### For CI/CD

```bash
npm run auto-update    # Auto-update without prompts
npm run build:ci       # Build for CI/CD
```

### For Blog Management

```bash
npm run update-all-blogs /path/to/blog    # Update one blog
```

## ⚙️ Environment Variables

```bash
export SKIP_VERSION_CHECK=true      # Skip version check
export DISABLE_AUTO_UPDATE=true     # Disable auto-updates in CI/CD
export CI=true                      # Activate CI mode
```

## 🌐 Netlify / Vercel Configuration

### Automatic Updates (Recommended)

```toml
# netlify.toml
[build]
  command = "npm run build"  # Will auto-update during build
  publish = "dist"
```

### Disable Auto-Updates

```toml
# netlify.toml
[build.environment]
  DISABLE_AUTO_UPDATE = "true"

[build]
  command = "npm run build:ci"  # Build without version check
  publish = "dist"
```

## 🎯 Result

- ✅ All 100+ blogs can be updated centrally
- ✅ Force check on every build
- ✅ Beautiful interface with update descriptions
- ✅ Automatic mode for CI/CD
- ✅ Full compatibility with all build systems

## 🔄 Example Workflow

```
🔍 Checking for core-maugli updates...
📦 Current version: 1.2.38
📦 Latest version: 1.2.39

🎉 A new version of core-maugli is available!
════════════════════════════════════════════════════════════

📋 What's new in v1.2.39:
• Enhanced image optimization pipeline
• Improved build performance
• Better asset management
• Centralized update system

🔄 Would you like to update now? (Y/n): Y

✅ Update completed successfully!
✅ Proceeding with build...
```

## 🛠️ Integration

The system automatically integrates into any core-maugli project and requires no additional configuration!
