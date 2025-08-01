import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';
import { maugliConfig } from '../src/config/maugli.config.ts';

async function loadFiles(dir) {
    const files = await fs.readdir(dir);
    const result = [];
    for (const file of files) {
        const content = await fs.readFile(path.join(dir, file), 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---/);
        let data = {};
        if (match) {
            data = yaml.load(match[1]);
        }
        const isExample = !!data.isExample;
        if (maugliConfig.showExamples || !isExample) {
            result.push(file);
        }
    }
    return result;
}

async function run() {
    maugliConfig.showExamples = false;
    const posts = await loadFiles(path.join('src', 'content', 'blog'));
    console.log('Blog posts after filtering:', posts);
}
run();
