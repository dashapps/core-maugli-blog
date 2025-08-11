export default function customSlugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u0400-\u04FF\s-]/g, ' ')
    .trim()
    .replace(/[\s-]+/g, '-');
}
