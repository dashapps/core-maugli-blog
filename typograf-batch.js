import Typograf from 'typograf';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';
import yaml from 'js-yaml';

const tp = new Typograf({ locale: ['ru', 'en-US'] });

const defaultDirs = [
    './src/content/blog',
    './src/content/pages',
    './src/content/projects',
    './src/content/products',
    './src/content/tags',
    './src/content/authors'
];

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
    dirs.push(...defaultDirs);
}

const cacheFile = './.typograf-cache.json';
let cache = {};
if (existsSync(cacheFile)) {
    cache = JSON.parse(readFileSync(cacheFile, 'utf8'));
}

let cacheUpdated = false;

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

const processFile = (file) => {
    const stats = statSync(file);
    const mtime = stats.mtimeMs;

    // Если не изменялся — скипаем
    if (cache[file] === mtime) return;

    const data = readFileSync(file, 'utf8');
    const parts = data.split('---');
    if (parts.length < 3) return;
    let fm = yaml.load(parts[1]);
    fm = typografize(fm);

    const newData = ['---', yaml.dump(fm, { lineWidth: -1, noRefs: true }).trim(), '---', tp.execute(parts.slice(2).join('---'))].join('\n');

    writeFileSync(file, newData);
    cache[file] = mtime;
    cacheUpdated = true;
    console.log(`Typografed: ${file}`);
};

const walk = (dir) => {
    readdirSync(dir, { withFileTypes: true }).forEach((entry) => {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')) {
            processFile(fullPath);
        }
    });
};

dirs.forEach((dir) => {
    if (existsSync(dir) && statSync(dir).isDirectory()) {
        walk(dir);
    }
});

// Сохраняем кеш только если были изменения
if (cacheUpdated) {
    writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
