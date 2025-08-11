import Typograf from 'typograf';
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';

import path from 'path';
import yaml from 'js-yaml';

const tp = new Typograf({ locale: ['ru', 'en-US'] });
const cacheFile = './.typograf-cache.json';

// Directories to process are provided via CLI arguments.
// If none are passed, default collections are used.
const dirs = process.argv.slice(2);
if (dirs.length === 0) {
    dirs.push('./src/content/blog', './src/content/pages', './src/content/projects', './src/content/products', './src/content/tags');
}


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


    // Skip if unchanged

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

        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walk(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {

            processFile(fullPath);
        }
    });
};


dirs.forEach((d) => walk(d));


// Save cache only if updated
if (cacheUpdated) {
    writeFileSync(cacheFile, JSON.stringify(cache, null, 2));
}
