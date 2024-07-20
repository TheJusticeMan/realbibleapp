async function loadBibleCrossReferences() {
    try {
        const jsonString = await new Promise((resolve, reject) => {
            if (typeof Android !== 'undefined' && Android.loadJSONFromAsset) {
                resolve(Android.loadJSONFromAsset());
            } else {
                reject('Android interface not available');
            }
        });

        BibleCrossReferences = JSON.parse(jsonString);
        console.log('BibleCrossReferences loaded:', BibleCrossReferences);
    } catch (error) {
        console.error('Failed to load BibleCRef.json:', error);
        alert('Failed to load BibleCRef.json: ' + error);
    }
}

async function loadBible() {
    try {
        const jsonString = await new Promise((resolve, reject) => {
            if (typeof Android !== 'undefined' && Android.loadBibleJSONFromAsset) {
                resolve(Android.loadBibleJSONFromAsset());
            } else {
                reject('Android interface not available');
            }
        });

        const Bible = JSON.parse(jsonString);
        console.log('Bible loaded:', Bible);
    } catch (error) {
        console.error('Failed to load Bible.json:', error);
        alert('Failed to load Bible.json: ' + error);
    }
}

function saveHistoryAndBookmarksToAndroid() {
    try {
        const historyAndBookmarks = {
            history: getHistoryData(),
            bookmarks: getBookmarksData(),
            notes: notes
        };
        Android.saveData(JSON.stringify(historyAndBookmarks));
        console.log('History and bookmarks saved successfully.');
    } catch (error) {
        console.error('Failed to save history and bookmarks:', error);
        alert('Failed to save history and bookmarks: ' + error);
    }
}

function loadHistoryAndBookmarks() {
    try {
        const data = Android.loadData();
        if (data) {
            const historyAndBookmarks = JSON.parse(data);
            History = historyAndBookmarks.history;
            tagManager.deserialize(historyAndBookmarks.bookmarks);
            notes = historyAndBookmarks.notes;
            console.log('History and bookmarks loaded successfully.');
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error('Failed to load history and bookmarks:', error);
        alert('Failed to load history and bookmarks: ' + error);
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
var saveHistoryAndBookmarks=saveHistoryAndBookmarksToAndroid;