const BibleSearch = {};
let Biblewordcounts = {};
const Biblewordcount = 793853;
let BibleCrossReferences = {};
var notes = [];
var Settings = {
    "initualized": false,
    "ShowHelp": false,
    "fontSize": "16",
    "debug": false,
    "reset": false,
    "invert-inputs": true,
    "Foreground": "hsl(0,100%,100%)",
    "Background": "hsl(0,100%,0%)",
    "Accent1": "hsl(275,100%,50%)",
    "Accent2": "hsl(105,100%,50%)"
}

function Load() {
    const isDebug = localStorage.getItem("debug") === "true";
    if (isDebug) {
        console.log("Debugging is ON");
        // Add debugging-specific code here
    } else {
        console.log("Debugging is OFF");
        // Add production-specific code here
    }
    loadServiceworker();
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
    setUpSettings(); // in ./functions.js

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
    // Check if debugging is enabled


}

//window.onload = Load;
