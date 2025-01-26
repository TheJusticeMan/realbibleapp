async function loadBibleCrossReferences() {
    try {
        const response = await fetch('./index_files/BibleCRef.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonString = await response.json();
        BibleCrossReferences = jsonString;
        console.log('BibleCrossReferences loaded:');
    } catch (error) {
        console.error('Failed to load BibleCRef.json:', error);
        //alert('Failed to load BibleCRef.json: ' + error);
    }
}

async function loadBibleCount() {
    try {
        const response = await fetch('./index_files/BibleCount.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const bibleData = await response.json();
        Biblewordcounts = bibleData; // Assign it to your global variable or process it as needed
        console.log('Bible loaded:');
    } catch (error) {
        console.error('Failed to load Bible.json:', error);
        //alert('Failed to load Bible.json: ' + error);
    }
}


async function loadBible() {
    try {
        const response = await fetch('./index_files/Bible.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonString = await response.json();
        const Bible = jsonString;
        console.log('Bible loaded:');
    } catch (error) {
        console.error('Failed to load Bible.json:', error);
        //alert('Failed to load Bible.json: ' + error);
    }
}

function saveHistoryAndBookmarksToLocalStorage() {
    try {
        const userData = {
            history: getHistoryData(),
            bookmarks: getBookmarksData(),
            notes: notes,
            Settings: Settings
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('History and bookmarks saved successfully.');
    } catch (error) {
        console.error('Failed to save history and bookmarks:', error);
        //alert('Failed to save history and bookmarks: ' + error);
    }
}

function loadHistoryAndBookmarks() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker
            .register("/service-worker.js")
            .then(registration => {
                console.log("Service Worker registered with scope:", registration.scope);
            })
            .catch(error => {
                console.error("Service Worker registration failed:", error);
            });
    }

    try {
        const data = localStorage.getItem('userData');
        if (data) {
            const userData = JSON.parse(data);
            if (userData.history) History = userData.history;
            if (userData.bookmarks) tagManager.deserialize(userData.bookmarks);
            if (userData.notes) notes = userData.notes;
            if (userData.Settings) Settings = userData.Settings;
            console.log('History and bookmarks loaded successfully.');
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error('Failed to load history and bookmarks:', error);
        //alert('Failed to load history and bookmarks: ' + error);
    }
}

// Example functions to get history and bookmarks data
function getHistoryData() {
    // Your logic to get history data
    return History;
}

function getBookmarksData() {
    // Your logic to get bookmarks data
    return tagManager.serialize();
}
var saveHistoryAndBookmarks = saveHistoryAndBookmarksToLocalStorage;
