import Typograf from 'typograf';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import yaml from 'js-yaml';

const localeMap = { ru: 'ru', en: 'en-US', es: 'es', fr: 'fr', de: 'de-DE' };
const tpCache = {};
function getTp(lang = 'ru') {
  const locale = localeMap[lang] || 'ru';
  if (!tpCache[locale]) {
    tpCache[locale] = new Typograf({ locale: [locale] });
  }
  return tpCache[locale];
}

const dir = './src/content/blog';
const cacheFile = './.typograf-cache.json';

let cache = {};
if (existsSync(cacheFile)) {
  cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
}

let cacheUpdated = false;

readdirSync(dir)
  .filter(f => f.endsWith('.md'))
  .forEach(f => {
    const file = dir + '/' + f;
    const stats = statSync(file);
    const mtime = stats.mtimeMs;

    // Если не изменялся — скипаем
    if (cache[f] === mtime) return;

    const data = readFileSync(file, 'utf8');
    const parts = data.split('---');
    if (parts.length < 3) return;
    let fm = yaml.load(parts[1]) || {};
    const tp = getTp(fm.inLanguage);
    if (fm.title) fm.title = tp.execute(fm.title);
    if (fm.description) fm.description = tp.execute(fm.description);

    const newData = [
      '---',
      yaml.dump(fm).trim(),
      '---',
      tp.execute(parts.slice(2).join('---'))
    ].join('\n');

    writeFileSync(file, newData);
    cache[f] = mtime;
    cacheUpdated = true;
    console.log(`Typografed: ${file}`);
  });

// Сохраняем кеш только если были изменения
if (cacheUpdated) {
  writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
