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
            if (typeof Android !== 'undefined' && Android.loadJSONFromAsset) {
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
        bookmarks: getBookmarksData()  // Function to get bookmarks data
    };
    Android.saveData(JSON.stringify(historyAndBookmarks));
}

// Example functions to get history and bookmarks data
function getHistoryData() {
    // Your logic to get history data
    return History;
}

function getBookmarksData() {
    // Your logic to get bookmarks data
    return [];
}

