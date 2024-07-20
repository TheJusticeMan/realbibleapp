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
        alert('Failed to load BibleCRef.json:' + error);
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

        //var Bible = JSON.parse(jsonString);
        console.log('BibleCrossReferences loaded:', BibleCrossReferences);
    } catch (error) {
        console.error('Failed to load BibleCRef.json:', error);
        alert('Failed to load BibleCRef.json:' + error);
    }
}

function saveHistoryAndBookmarksToAndroid() {
    var historyAndBookmarks = {
        history: getHistoryData(),  // Function to get history data
        bookmarks: getBookmarksData(),  // Function to get bookmarks data
        notes: notes
    };
    Android.saveData(JSON.stringify(historyAndBookmarks));
}

function loadHistoryAndBookmarks() {
    var data = Android.loadData();
    if (data) {
        var historyAndBookmarks = JSON.parse(data);
        History=historyAndBookmarks.history;  // Replace with your logic to set history data
        tagManager.deserialize(historyAndBookmarks.bookmarks);  // Replace with your logic to set bookmarks data
        notes=historyAndBookmarks.notes;
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

