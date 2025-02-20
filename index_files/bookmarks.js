class TagManager {
    constructor() {
        this.tags = {}; // Stores tags with their associated Bible references
    }

    addTag(verseRef, tag) {
        const refKey = this.getRefKey(verseRef);
        if (!this.tags[tag]) {
            this.tags[tag] = new Set();
        }
        this.tags[tag].add(refKey);
    }

    removeTag(verseRef, tag) {
        const refKey = this.getRefKey(verseRef);
        if (this.tags[tag]) {
            this.tags[tag].delete(refKey);
            if (this.tags[tag].size === 0) {
                delete this.tags[tag]; // Remove the tag if no verses are associated
            }
        }
    }

    getVersesByTag(tag) {
        return this.tags[tag] ? Array.from(this.tags[tag]).map(this.parseRefKey) : [];
    }

    getAllVerses() {
        const allRefs = new Set();
        Object.values(this.tags).forEach(refSet => {
            refSet.forEach(refKey => allRefs.add(refKey));
        });
        return Array.from(allRefs).map(this.parseRefKey);
    }

    listAllTags() {
        return Object.keys(this.tags);
    }

    getRefKey(verseRef) {
        // Creates a unique key for each Bible reference
        return `${verseRef.Book}:${verseRef.Chap}:${verseRef.Verse}`;
    }

    parseRefKey(refKey) {
        // Parses the key back into a BibleRef object
        const [Book, Chap, Verse] = refKey.split(':');
        return new BibleRef(Book, parseInt(Chap), parseInt(Verse));
    }


    serialize() {
        const serializedTags = {};
        for (const tag in this.tags) {
            serializedTags[tag] = Array.from(this.tags[tag]);
        }
        return serializedTags;
    }

    deserialize(jsonString) {
        const parsedTags = typeof jsonString === 'string'
            ? JSON.parse(jsonString)
            : jsonString;

        for (const tag in parsedTags) {
            // If the tag already exists, merge the sets; otherwise, create a new set.
            if (this.tags[tag]) {
                for (const value of parsedTags[tag]) {
                    this.tags[tag].add(value);
                }
            } else {
                this.tags[tag] = new Set(parsedTags[tag]);
            }
        }
    }

    isBookmarked(verseRef) {
        const refKey = this.getRefKey(verseRef);
        return Object.values(this.tags).some(tagSet => tagSet.has(refKey));
    }
}

// Example usage
//const bibleRef1 = new BibleRef("GENESIS", 1, 1);
//const bibleRef2 = new BibleRef("JOHN", 3, 16);

const tagManager = new TagManager();
//tagManager.addTag(bibleRef1, "Creation");
//tagManager.addTag(bibleRef2, "Salvation");

