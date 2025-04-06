const Word = /("[^"]*"|'[^']*'|[a-zA-Z_]+)/gm;
const nWord = /[^"]*?(?=[^ ]*[a-zA-Z_]+[^ ]*|"[^"]+"|'[^']+')/g;// Don't say it.
const DRegExp = /[\\^$*+?.()|[\]{}]/g;


class BibleSearchClass {
    constructor(searchFor, searchType, regExpOn = false, useWholeWords = false, tags = "g") {
        this.MAX_RESULTS = 20; // Define the maximum number of results
        this.results = [];
        this.LastS=new BibleRef("GENESIS",1,1);
        this.status = 0; // 0: nothing, 1: data collected, 2: set up, 3: searched, 4: shown

        // Initialize search parameters
        this.searchType = searchType;
        this.regExpOn = regExpOn;
        this.useWholeWords = useWholeWords;
        this.searchFor = searchFor;
        this.searchForCpt = "";
        this.tags = tags;

        // Setup the search logic
        this.setupSearch();
    }

    setupSearch() {
        this.searchForCpt = this.searchFor;

        if (this.searchType === "Phrase") {
            if (!this.regExpOn) this.searchForCpt = this.searchForCpt.replace(DRegExp, "\\$1");
            if (this.useWholeWords) this.searchForCpt = "\\b" + this.searchForCpt + "\\b";
            this.searchForCpt = new RegExp(this.searchForCpt, this.tags);
        } else {
            this.searchForCpt = new LogicalSearch(this.searchForCpt, this.tags, this.searchType, this.regExpOn, this.useWholeWords);
        }

        this.status = 2;
    }

    search() {
        if (this.status < 2) this.setupSearch();
        let started = false;
        let highlight = this.searchForCpt instanceof RegExp 
            ? this.searchForCpt 
            : new RegExp(this.searchForCpt.wdList.map(creg => creg.source).join("|"), "g");

        for (const B in BibleSearch) { 
            if (!started && B != this.LastS.Book) continue;
            started = true;
            const chapters = BibleSearch[B];
            for (let C = this.LastS.Chap; C < chapters.length; C++) {
                const verses = chapters[C];
                for (let V = this.LastS.Verse; V < verses.length; V++) {
                    if (!this.searchForCpt.test(verses[V])) continue;
                    this.results.push(new BibleRef(B, C, V, highlight));
                    if (this.results.length >= this.MAX_RESULTS) {
                        this.LastS=new BibleRef(B, C, V);
                        return this.results;
                    }
                }
                this.LastS.Verse = 1;
            }
            this.LastS.Chap = 1;
        }
        return this.results;
    }

    reset() {
        this.results = [];
        this.LastS = new BibleRef("GENESIS", 1, 1);
        this.status = 0;
    }

    historyText() {
        return `Results for: '${this.searchFor}'`;
    }
}

// Update the LogicalSearch class to remove dependencies on global variables
class LogicalSearch {
    constructor(find, flags, searchType, regExpOn, useWholeWords) {
        this.find = find;
        this.wdList = find.match(Word);
        if (!this.wdList) {
            this.test = () => false;
            return;
        }

        // Construct the logical tests based on the search type
        const logiTests = (searchType === "All words")
            ? this.wdList.map((_, i) => `this.wdList[${i}].test(s)`).join(" && ")
            : find.replace(Word, (match, i) => `this.wdList[${i}].test(s)`);

        // Compile the word list into regular expressions
        try {
            this.wdList = this.wdList.map(word => {
                let pattern = word.toString().replace(/^['"]|['"]$/g, ""); // Remove quotes
                if (!regExpOn) pattern = pattern.replace(DRegExp, "\\$1"); // Escape special characters
                if (useWholeWords) pattern = `\\b${pattern}\\b`; // Match whole words
                return new RegExp(pattern, flags);
            });
        } catch (e) {
            console.error(`Search error: ${e.message}`);
            this.test = () => false;
            return;
        }

        // Dynamically create the test function
        try {
            this.test = new Function("s", `return (${logiTests});`);
        } catch (e) {
            console.error(`Search error: ${e.message}`);
            this.test = () => false;
        }
    }

    toString() {
        return this.find;
    }
}

function sortSearch(r1, r2) {
    return r2.index - r1.index;
}

