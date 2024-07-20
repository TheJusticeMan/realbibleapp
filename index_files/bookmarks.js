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
        return JSON.stringify(serializedTags);
    }

    deserialize(jsonString) {
        const parsedTags = JSON.parse(jsonString);
        this.tags = {};
        for (const tag in parsedTags) {
            this.tags[tag] = new Set(parsedTags[tag]);
        }
    }

}

// Example usage
const bibleRef1 = new BibleRef("GENESIS", 1, 1);
const bibleRef2 = new BibleRef("JOHN", 3, 16);

const tagManager = new TagManager();
tagManager.addTag(bibleRef1, "Creation");
tagManager.addTag(bibleRef2, "Salvation");

console.log("Verses tagged with 'Creation':", tagManager.getVersesByTag("Creation"));
console.log("All tags:", tagManager.listAllTags());
console.log("All bookmarked verses:", tagManager.getAllVerses());
