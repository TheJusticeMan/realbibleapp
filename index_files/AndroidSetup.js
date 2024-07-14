var BibleCrossReferences = {};
var Bible = {};
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



async function loadBibleCrossReferences() {
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
