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
        const historyAndBookmarks = {
            history: getHistoryData(),
            bookmarks: getBookmarksData(),
            notes: notes,
            Settings: Settings
        };
        localStorage.setItem('historyAndBookmarks', JSON.stringify(historyAndBookmarks));
        console.log('History and bookmarks saved successfully.');
    } catch (error) {
        console.error('Failed to save history and bookmarks:', error);
        //alert('Failed to save history and bookmarks: ' + error);
    }
}

function loadHistoryAndBookmarks() {
    try {
        const data = localStorage.getItem('historyAndBookmarks');
        if (data) {
            const historyAndBookmarks = JSON.parse(data);
            History = historyAndBookmarks.history;
            tagManager.deserialize(historyAndBookmarks.bookmarks);
            notes = historyAndBookmarks.notes;
            console.log('History and bookmarks loaded successfully.');
            Settings = historyAndBookmarks.Settings;
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