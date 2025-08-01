import assert from 'assert';
import { maugliConfig } from '../src/config/maugli.config';
import { getFilteredCollection } from '../src/utils/content-loader';

async function run() {
    maugliConfig.showExamples = false;
    const blog = await getFilteredCollection('blog');
    assert.ok(
        blog.every((p) => !(p as any).data.isExample),
        'Blog examples should be filtered'
    );
    const authors = await getFilteredCollection('authors');
    assert.ok(
        authors.every((a) => !(a as any).data.isExample),
        'Author examples should be filtered'
    );
    const products = await getFilteredCollection('products');
    assert.ok(
        products.every((p) => !(p as any).data.isExample),
        'Product examples should be filtered'
    );
    const projects = await getFilteredCollection('projects');
    assert.ok(
        projects.every((p) => !(p as any).data.isExample),
        'Project examples should be filtered'
    );
    console.log('Example filtering works.');
}

run();
