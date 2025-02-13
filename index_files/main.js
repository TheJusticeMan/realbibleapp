const BibleSearch = {};
let Biblewordcounts = {};
const Biblewordcount = 793853;
let BibleCrossReferences = {};
let TopicDescriptionList=null;
var notes = [];
var Settings = {
    "initialized": true,
    "ShowHelp": false,
    "fontSize": "16",
    "debug": true,
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
    handleDebugMode();
    initializeApp();

    // Preload Verses
    preloadVerses();

    // Final UI setup
    document.getElementById("loadingScreen").style.display = "none";
    loading = false;

    // Lazy load additional features
    setTimeout(() => {
        setupZoom();
        preprocessBible();
    }, 100);

    // Initialize Sharing
    setupSharing();
}

function handleDebugMode() {
    const isDebug = localStorage.getItem("debug") === "true";
    console.log(`Debugging is ${isDebug ? "ON" : "OFF"}`);
    if (isDebug) {
        // Add debugging-specific code here
    }
}

function initializeApp() {
    try {
        loadServiceworker();
        loadHistoryAndBookmarks();
        loadBibleCrossReferences();
        loadtopics();
        loadBibleCount();
        //loadTopicDescriptionList();

        if (!Settings.initialized) {
            Settings.initialized = true;
            Settings.ShowHelp = false;  // Disable help screen after first load
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
}

// 🔥 Sharing Functionality
function setupSharing() {
    const shareButton = document.getElementById("shareButton"); // Ensure this button exists in your HTML
    if (!shareButton) return;

    shareButton.addEventListener("click", async () => {
        const selectedVerse = getSelectedVerse(); // Custom function to fetch the verse text
        if (!selectedVerse) {
            alert("No verse selected to share.");
            return;
        }

        const shareData = {
            title: "Bible Verse",
            text: `"${selectedVerse.text}" - ${selectedVerse.ref}`,
            url: window.location.href // Allows linking to the specific verse if supported
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
                console.log("Successfully shared.");
            } catch (err) {
                console.error("Error sharing:", err);
            }
        } else {
            fallbackShare(shareData);
        }
    });
}

// Fallback for browsers that don’t support Web Share API
function fallbackShare(shareData) {
    const shareText = `${shareData.text}\n\nRead more: ${shareData.url}`;
    navigator.clipboard.writeText(shareText).then(() => {
        alert("Verse copied to clipboard! You can manually share it.");
    }).catch(err => {
        console.error("Clipboard copy failed:", err);
    });
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
