class BookmarkTagger {
    constructor() {
        this.tags = {}; // Stores tags with their associated Bible references
    }

    addTag(verseRef, tag) {
        const refKey = BookmarkTagger.getRefKey(verseRef);
        if (!this.tags[tag]) {
            this.tags[tag] = new Set();
        }
        this.tags[tag].add(refKey);
    }

    addTags(verseRefs, tag) {
        if (!this.tags[tag]) {
            this.tags[tag] = new Set();
        }
        verseRefs.forEach(verseRef => {
            this.tags[tag].add(BookmarkTagger.getRefKey(verseRef));
        });
    }

    removeTag(verseRef, tag) {
        const refKey = BookmarkTagger.getRefKey(verseRef);
        if (this.tags[tag]) {
            this.tags[tag].delete(refKey);
            if (this.tags[tag].size === 0) {
                delete this.tags[tag];
            }
        }
    }

    removeTags(verseRefs, tag) {
        if (this.tags[tag]) {
            verseRefs.forEach(verseRef => {
                this.tags[tag].delete(BookmarkTagger.getRefKey(verseRef));
            });

            if (this.tags[tag].size === 0) {
                delete this.tags[tag];
            }
        }
    }

    getVersesByTag(tag) {
        return this.tags[tag] ? Array.from(this.tags[tag]).map(BookmarkTagger.parseRefKey) : [];
    }

    getAllVerses() {
        const allRefs = new Set();
        Object.values(this.tags).forEach(refSet => {
            refSet.forEach(refKey => allRefs.add(refKey));
        });
        return Array.from(allRefs).map(BookmarkTagger.parseRefKey);
    }

    listAllTags() {
        return Object.keys(this.tags);
    }

    getTagsByVerse(verseRef) {
        const refKey = BookmarkTagger.getRefKey(verseRef);
        return Object.keys(this.tags).filter(tag => this.tags[tag].has(refKey));
    }

    getTagsByVerses(verseRefs) {
        const refKeys = verseRefs.map(BookmarkTagger.getRefKey);
        const tagsMap = {};
        
        refKeys.forEach(refKey => {
            tagsMap[refKey] = Object.keys(this.tags).filter(tag => this.tags[tag].has(refKey));
        });

        return tagsMap;
    }

    static getRefKey(verseRef) {
        return `${verseRef.Book}:${verseRef.Chap}:${verseRef.Verse}`;
    }

    static parseRefKey(refKey, index = 0) {
        const [Book, Chap, Verse] = refKey.split(':');
        return new BibleRef(Book, parseInt(Chap), parseInt(Verse), index);
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
        const refKey = BookmarkTagger.getRefKey(verseRef);
        return Object.values(this.tags).some(tagSet => tagSet.has(refKey));
    }
}
// Example usage
//const bibleRef1 = new BibleRef("GENESIS", 1, 1);
//const bibleRef2 = new BibleRef("JOHN", 3, 16);

const bookmarkStore = new BookmarkTagger();

