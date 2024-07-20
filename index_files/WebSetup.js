async function loadBibleCrossReferences() {
    try {
        const response = await fetch('./index_files/BibleCRef.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonString = await response.text();
        BibleCrossReferences = JSON.parse(jsonString);
        console.log('BibleCrossReferences loaded:', BibleCrossReferences);
    } catch (error) {
        console.error('Failed to load BibleCRef.json:', error);
        alert('Failed to load BibleCRef.json: ' + error.message);
    }
}

async function loadBible() {
    try {
        const response = await fetch('./index_files/Bible.json');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const jsonString = await response.text();
        Bible = JSON.parse(jsonString);  // Assuming you want to store it in a global variable called Bible
        console.log('Bible loaded:', Bible);
    } catch (error) {
        console.error('Failed to load Bible.json:', error);
        alert('Failed to load Bible.json: ' + error.message);
    }
}

function saveHistoryAndBookmarksToWeb() {
    var historyAndBookmarks = {
        history: getHistoryData(),  // Function to get history data
        bookmarks: getBookmarksData(),  // Function to get bookmarks data
        notes: notes
    };
    localStorage.setItem('historyAndBookmarks', JSON.stringify(historyAndBookmarks));
    //alert("saveHistoryAndBookmarksToWeb");
}

function loadHistoryAndBookmarks() {
    var data = localStorage.getItem('historyAndBookmarks');
    if (data) {
        var historyAndBookmarks = JSON.parse(data);
        History = historyAndBookmarks.history;  // Replace with your logic to set history data
        tagManager.deserialize(historyAndBookmarks.bookmarks);  // Replace with your logic to set bookmarks data
        notes = historyAndBookmarks.notes;
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
// Save data before unloading the page
window.addEventListener('beforeunload', saveHistoryAndBookmarksToWeb);

// Periodic autosave
setInterval(saveHistoryAndBookmarksToWeb, 300000);  // Save every 5 minutes
