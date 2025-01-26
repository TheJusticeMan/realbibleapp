const BibleSearch = {};
let Biblewordcounts = {};
const Biblewordcount = 793853;
let BibleCrossReferences = {};
var notes = [];
var Settings = { initualized: false };

function Load() {
    loadHistoryAndBookmarks(); // in ./WebSetup.js
    loadBibleCrossReferences(); // in ./WebSetup.js
    loadBibleCount();
    if (!Settings.initualized) {
        Settings.initualized = true;
        Settings.ShowHelp = false;  // Change the help screen
    }
    setupEventListeners(); // in ./domHandlers.js
    populateTagFilter(); // in ./functions.js
    loadBookmarks();  // in ./functions.js

    VersesOpen.push(new BibleRef("ROMANS", 8, 27, 5));
    VersesOpen.push(new BibleRef("PHILIPPIANS", 4, 12, 4));
    VersesOpen.push(new BibleRef("1 CORINTHIANS", 13, 3, 3));
    VersesOpen.push(new BibleRef("PSALMS", 23, 1, 2));
    VersesOpen.push(new BibleRef("JOHN", 3, 15, 1));
    VersesOpen.push(new BibleRef("GENESIS", 1, 0, 0));
    loadVerseListScreen();
    if (Settings.ShowHelp) {
        ShowHelpScreen();
        Settings.ShowHelp = false;
    }
    preprocessBible(); // in ./functions.js

    document.getElementById("loadingScreen").style.display = "none";
    setupScrollPastMobile();

}

//window.onload = Load;
