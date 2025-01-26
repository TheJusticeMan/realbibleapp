const Word = /("[^"]+"|'[^']+'|[^ ]*[a-zA-Z_]+[^ ]*)/g;
const nWord = /[^"]*?(?=[^ ]*[a-zA-Z_]+[^ ]*|"[^"]+"|'[^']+')/g;
const DRegExp = /([\](\\\.)?^$|\*\+\{\}\[])/g;


class BibleSearchClass {
    constructor(searchFor, searchType, regExpOn = false, useWholeWords = false, tags = "g") {
        this.MAX_RESULTS = 20; // Define the maximum number of results
        this.results = [];
        this.currentBookIndex = "GENESIS";
        this.currentChapterIndex = 1;
        this.currentVerseIndex = 0;
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
            //alert(this.searchForCpt);
            if (this.useWholeWords) this.searchForCpt = "\\b" + this.searchForCpt + "\\b";
            this.searchForCpt = new RegExp(this.searchForCpt, this.tags);
        } else {
            this.searchForCpt = new LogicalSearch(this.searchForCpt, this.tags, this.searchType, this.regExpOn, this.useWholeWords);
        }

        this.status = 2;
    }

    search() {
        if (this.status < 2) this.setupSearch();
        let Started = false;
        let highlight = this.searchForCpt;
        if (!(highlight instanceof RegExp)) {
            highlight = new RegExp(
                highlight.wdList.map(creg => creg.source).join("|"),
                "g"
            );
        }

        outerLoop: for (const B in BibleSearch) { // Iterate through each book
            if (B != this.currentBookIndex && Started == false) {
                //alert(B);
                continue
            }
            Started = true;
            const chapters = BibleSearch[B];
            for (let C = this.currentChapterIndex; C < chapters.length; C++) { // Iterate through each chapter
                const verses = chapters[C];
                for (let V = this.currentVerseIndex; V < verses.length; V++) { // Iterate through each verse
                    if (this.searchForCpt.test(verses[V])) { // Check if the verse includes the query
                        const bibleRef = new BibleRef(B, C, V);
                        bibleRef.index = this.searchForCpt.test(verses[V]);
                        bibleRef.SearchQ = highlight;
                        this.results.push(bibleRef);
                        if (this.results.length >= this.MAX_RESULTS) { // Check if max results are reached
                            this.currentBookIndex = B;
                            this.currentChapterIndex = C;
                            this.currentVerseIndex = V + 1;
                            break outerLoop; // Break out of all loops
                        }
                    }
                }
                this.currentVerseIndex = 0; // Reset verse index for the next chapter
            }
            this.currentChapterIndex = 1; // Reset chapter index for the next book
            this.currentBookIndex = B;
        }


        return this.results;
    }

    reset() {
        this.results = [];
        this.currentBookIndex = "GENESIS";
        this.currentChapterIndex = 1;
        this.currentVerseIndex = 0;
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
            alert(`Search error: ${e.message}`);
            this.test = () => false;
            return;
        }

        // Dynamically create the test function
        try {
            this.test = new Function("s", `return (${logiTests});`);
        } catch (e) {
            alert(`Search error: ${e.message}`);
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

// Example of how to instantiate and use the updated class
//const searchInstance = new BibleSearchClass("search term", "Phrase", true, false, "i");
//searchInstance.search();
//searchInstance.showContent();
