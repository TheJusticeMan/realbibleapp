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
        const userData = {
            history: History,
            bookmarks: tagManager.serialize(),
            notes: notes,
            Settings: Settings
        };
        Android.saveData(JSON.stringify(userData));
        console.log('User Data saved successfully.');
    } catch (error) {
        console.error('Failed to save User Data:', error);
        alert('Failed to save User Data: ' + error);
    }
}

function loadHistoryAndBookmarks() {
    try {
        const data = Android.loadData();
        if (data) {
            const userData = JSON.parse(data);
            if( userData.history) History = userData.history;
            if( userData.bookmarks) tagManager.deserialize(userData.bookmarks);
            if( userData.notes) notes = userData.notes;
            if( userData.Settings) Settings = userData.Settings;
            console.log('User Data loaded successfully.');
        } else {
            throw new Error('No data found');
        }
    } catch (error) {
        console.error('Failed to load User Data:', error);
        alert('Failed to load User Data: ' + error);
    }
}

const saveHistoryAndBookmarks = saveHistoryAndBookmarksToAndroid;