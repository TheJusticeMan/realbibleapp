const BibleSearch = {};
let BibleCrossReferences = {};
var notes = [];

function Load() {
    loadBibleCrossReferences();
    setupEventListeners();
    VersesOpen.push(new BibleRef("GENESIS", 1, 0));
    VersesOpen.push(new BibleRef("JOHN", 3, 15));
    VersesOpen.push(new BibleRef("PSALMS", 23, 1));
    VersesOpen.push(new BibleRef("1 CORINTHIANS", 13, 3));
    VersesOpen.push(new BibleRef("PHILIPPIANS", 4, 12));
    VersesOpen.push(new BibleRef("ROMANS", 8, 27));
    loadVerseListScreen();
    preprocessBible();

    document.getElementById("loadingScreen").style.display = "none";
}

//window.onload = Load;
