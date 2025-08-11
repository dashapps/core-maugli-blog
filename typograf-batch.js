import Typograf from 'typograf';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import yaml from 'js-yaml';

// Determine locale from Maugli config (single-language site)
let defaultLang = 'en';
try {
    const configRaw = readFileSync('./src/config/maugli.config.ts', 'utf8');
    const match = configRaw.match(/defaultLang:\s*['"]([a-zA-Z-]+)['"]/);
    if (match) defaultLang = match[1];
} catch {
    // use fallback defaultLang
}

const langLocaleMap = {
    en: 'en-US',
    ru: 'ru',
    es: 'es',
    de: 'de',
    pt: 'pt',
    fr: 'fr',
    zh: 'zh',
    ja: 'ja'
};

const locale = langLocaleMap[defaultLang] || defaultLang;
const tp = new Typograf({ locale: [locale] });

const dir = './src/content/blog';
const cacheFile = './.typograf-cache.json';

let cache = {};
if (existsSync(cacheFile)) {
    cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
}

let cacheUpdated = false;

readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .forEach((f) => {
        const file = dir + '/' + f;
        const stats = statSync(file);
        const mtime = stats.mtimeMs;

        // Если не изменялся — скипаем
        if (cache[f] === mtime) return;

        const data = readFileSync(file, 'utf8');
        const parts = data.split('---');
        if (parts.length < 3) return;
        let fm = yaml.load(parts[1]);

        const typografize = (value) => {
            if (Array.isArray(value)) {
                return value.map(typografize);
            }
            if (value && typeof value === 'object') {
                for (const key of Object.keys(value)) {
                    value[key] = typografize(value[key]);
                }
                return value;
            }
            if (typeof value === 'string') {
                if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/') || !isNaN(Date.parse(value))) {
                    return value;
                }
                return tp.execute(value);
            }
            return value;
        };

        fm = typografize(fm);

        const newData = ['---', yaml.dump(fm, { lineWidth: -1, noRefs: true }).trim(), '---', tp.execute(parts.slice(2).join('---'))].join('\n');

        writeFileSync(file, newData);
        cache[f] = mtime;
        cacheUpdated = true;
        console.log(`Typografed: ${file}`);
    });

// Сохраняем кеш только если были изменения
if (cacheUpdated) {
    writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
