const BibleSearch = {};
let Biblewordcounts = {};
const Biblewordcount = 793853;
let BibleCrossReferences = {};
let TopicDescriptionList = null;
var notes = [];
var Settings = {
    "initialized": false,
    "ShowHelp": false,
    "fontSize": "16",
    "debug": false,
    "reset": false,
    "invert-inputs": true,
    "Foreground": "hsl(0,100%,100%)",
    "Background": "hsl(0,100%,0%)",
    "Accent1": "hsl(275,100%,50%)",
    "Accent2": "hsl(105,100%,50%)",
    "EnhanceSpacing": true,
    "Font": "Fontserif"
}

function Load() {
    const params = new URLSearchParams(window.location.search);
    const verseRef = params.get("verse"); // e.g., JOHN:3:16:0
    initializeApp();

    // Preload Verses
    preloadVerses();
    if (verseRef) {
        try {
            const bibleRef = BibleRef.fromString(verseRef);
            VersesOpen.push(bibleRef);
            BibleRef.goToRef(bibleRef);
        } catch (error) {
            console.error("Error parsing verse reference:", error);
        }
    }

    // Final UI setup
    document.getElementById("loadingScreen").style.display = "none";
    loading = false;

    // Lazy load additional features
    setTimeout(() => {
        setupZoom();
        preprocessBible();
    }, 100);
}

function handleDebugMode() {
    console.log(`Debugging is ${Settings.debug ? "ON" : "OFF"}`);
    if (Settings.debug) {
        // Add debugging-specific code here
    }
}

async function initializeApp() {
    try {
        loadServiceworker();
        loadHistoryAndBookmarks();
        await loadBibleCrossReferences();
        await loadtopics();
        await loadBibleCount();
        //loadTopicDescriptionList();

        if (!Settings.initialized) {
            Settings.initialized = true;
            Settings.ShowHelp = false;  // Disable help screen after first load
            const bibleRef1 = new BibleRef("GENESIS", 1, 0, 0);
            const bibleRef2 = new BibleRef("MATTHEW", 1, 0, 0);
            tagManager.addTag(bibleRef1, "Creation");
            tagManager.addTag(bibleRef2, "Salvation");
        }
        handleDebugMode();

        if (Settings.debug) {
            //testHistory();
            //testtagManager();
            //testNotes();
            //console.log("Debug mode is on");
            console.log("Settings:", Settings);
            console.log("History:", History);
            console.log("Bookmarks:", tagManager.deserialize);
            console.log("Notes:", notes);
            console.log("VersesOpen:", VersesOpen);
        }

        setupEventListeners();
        populateTagFilter();
        loadBookmarks();
        setUpSettings();
        SetUpBackTrigger();
    } catch (error) {
        console.error("Error initializing app:", error);
    }
}

function preloadVerses() {
    if (VersesOpen.length == 0) {
        VersesOpen.push(new BibleRef("ROMANS", 8, 27, 5));
        VersesOpen.push(new BibleRef("PHILIPPIANS", 4, 12, 4));
        VersesOpen.push(new BibleRef("1 CORINTHIANS", 13, 3, 3));
        VersesOpen.push(new BibleRef("PSALMS", 23, 1, 2));
        VersesOpen.push(new BibleRef("JOHN", 3, 15, 1));
        VersesOpen.push(new BibleRef("GENESIS", 1, 0, 0));
    } else {
        VersesOpen = VersesOpen.map(ref => new BibleRef(ref.Book, ref.Chap, ref.Verse, ref.color));
    }
    loadVerseListScreen();

    if (Settings.ShowHelp) {
        ShowHelpScreen();
        Settings.ShowHelp = false;
    }
}

// Example function to fetch selected verse (modify based on your app's logic)
function getSelectedVerse() {
    const selectedElement = document.querySelector(".verse.selected"); // Assumes a selected class
    if (!selectedElement) return null;

    return {
        text: selectedElement.innerText,
        ref: selectedElement.getAttribute("data-ref") || "Unknown Reference"
    };
}

//window.onload = Load;

function testHistory() {
    const now = Date.now();
    // Define a range of 30 days (in milliseconds)
    const daterange = 2 * 360 * 24 * 60 * 60 * 1000;// 2 years
    History = [];
    for (let i = 0; i < 100; i++) {
        const bibleRef = goToBibleReference(Math.random());
        // Generate a date within the past 30 days
        const randomDate = new Date(now - Math.random() * daterange);
        History.push(new BibleRef(bibleRef.Book, bibleRef.Chap, bibleRef.Verse, randomDate));
    }
}

function testtagManager() {
    tagManager.tags = {};
    for (let i = 0; i < 10; i++) {
        tagManager.addTag(goToBibleReference(Math.random()), "Creation");
        tagManager.addTag(goToBibleReference(Math.random()), "Salvation");
        tagManager.addTag(goToBibleReference(Math.random()), "Jesus");
        tagManager.addTag(goToBibleReference(Math.random()), "Christ");
    }
}

function testNotes() {
    notes = [];
    for (let i = 0; i < 100; i++) {
        const bibleRef = goToBibleReference(Math.random());
        notes.push(new BibleNote(bibleRef, "This is a note"));
    }
}