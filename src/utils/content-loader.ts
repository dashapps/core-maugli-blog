import { getCollection, type CollectionEntry, type AnyEntryMap } from 'astro:content';
import { maugliConfig } from '../config/maugli.config';

/**
 * Load a collection and filter out demo/example content when showExamples is disabled.
 * @param name Name of the collection
 */
export async function getFilteredCollection<C extends keyof AnyEntryMap>(name: C): Promise<CollectionEntry<C>[]> {
    const items = await getCollection(name);
    if (maugliConfig.showExamples) {
        return items as CollectionEntry<C>[];
    }
    return items.filter((item: any) => !item.data.isExample) as CollectionEntry<C>[];
}
