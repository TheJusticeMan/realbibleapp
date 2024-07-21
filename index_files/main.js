const BibleSearch = {};
let BibleCrossReferences = {};
var notes = [];
var Settings = {};

function Load() {
    loadHistoryAndBookmarks();
    loadBibleCrossReferences();
    if (!Settings.initualized) {
        Settings.initualized = true;
        Settings.ShowHelp = true;
    }
    setupEventListeners();
    populateTagFilter();
    loadBookmarks();

    VersesOpen.push(new BibleRef("GENESIS", 1, 0));
    VersesOpen.push(new BibleRef("JOHN", 3, 15));
    VersesOpen.push(new BibleRef("PSALMS", 23, 1));
    VersesOpen.push(new BibleRef("1 CORINTHIANS", 13, 3));
    VersesOpen.push(new BibleRef("PHILIPPIANS", 4, 12));
    VersesOpen.push(new BibleRef("ROMANS", 8, 27));
    loadVerseListScreen();
    if (Settings.ShowHelp) {
        ShowHelpScreen();
        Settings.ShowHelp = false;
    }
    preprocessBible();

    document.getElementById("loadingScreen").style.display = "none";
}

//window.onload = Load;
