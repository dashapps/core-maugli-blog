# 🖼️ User Images Management

## Image Directory Structure

```
public/
├── img/
│   ├── uploads/         # Your uploaded images (preserved)
│   ├── blog/           # Blog post images (preserved)  
│   ├── authors/        # Author avatars (preserved)
│   ├── products/       # Product images (preserved)
│   ├── projects/       # Project images (preserved)
│   ├── default/        # Default fallback images (managed by core)
│   └── examples/       # Example content (managed by core)
├── favicon.svg         # System icons (managed by core)
├── logo-icon.svg       # System logos (managed by core)
└── flags/             # Country flags (managed by core)
```

## What's Protected During Updates

✅ **Your content is SAFE during npm updates:**
- `public/img/uploads/` - Your uploaded images
- `public/img/blog/` - Your blog post images
- `public/img/authors/` - Your author photos
- `public/img/products/` - Your product images
- `public/img/projects/` - Your project images

❌ **System files are UPDATED automatically:**
- `public/favicon.svg`, `public/logo-icon.svg` - System icons
- `public/flags/` - Country flags
- `public/img/default/` - Default fallback images
- `public/img/examples/` - Example content

## Best Practices

1. **Use descriptive names:**
   ```
   ✅ public/img/blog/my-awesome-post.webp
   ✅ public/img/authors/john-smith.webp
   ❌ public/img/blog/image1.jpg
   ```

2. **Use WebP format for better performance:**
   ```bash
   # Convert to WebP
   cwebp input.jpg -o output.webp -q 80
   ```

3. **Optimize images before upload:**
   - Blog posts: max 1200px width
   - Author avatars: 400x400px
   - Product images: max 1200px width

## Automatic Image Processing

The system automatically generates:
- `image-400.webp` (mobile)
- `image-800.webp` (tablet) 
- `image-1200.webp` (desktop)
- `previews/image.webp` (thumbnails)

Original files are preserved, resized versions are auto-generated.

## Commands

```bash
# Setup user image directories
npm run setup-images

# Generate image previews
npm run generate-previews

# Resize all images
node resize-all.cjs
```
