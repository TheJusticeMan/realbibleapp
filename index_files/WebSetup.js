// Helper functions for fetching resources
async function loadJSON(target, url) {
    try {
        Object.assign(target, await (await fetch(url)).json());
        console.log(`${url} loaded`);
    } catch (error) {
        console.error(`Failed to load ${url}:`, error);
    }
}

async function fetchText(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Network response was not ok for ${url}`);
    }
    return response.text();
}


async function loadTopicsText() {
    try {
        const text = await fetchText('./index_files/topic-scores.txt');
        console.log('BibleTopics loaded');
        return text;
    } catch (error) {
        console.error('Failed to load topic-scores.txt:', error);
        return null;
    }
}

// Simplified localStorage functions
function getUserData() {
    return {
        history: exportHistoryAsStrings(),
        bookmarks: bookmarkStore.serialize(),
        notes: notes.map(note => note.toObject()),
        Settings: Settings,
        VersesOpen: VersesOpen
    };
}

function saveHistoryAndBookmarks() {
    try {
        const userData = getUserData();
        localStorage.setItem('userData', JSON.stringify(userData));
        console.log('History and bookmarks saved successfully.');
    } catch (error) {
        console.error('Failed to save history and bookmarks:', error);
    }
}

async function copyHistoryAndBookmarksToClipboard() {
    try {
        const userData = getUserData();
        const jsonString = JSON.stringify(userData, null, 2); // Pretty-print with indentation
        await navigator.clipboard.writeText(jsonString);
        console.log('History and bookmarks copied to clipboard successfully.');
    } catch (error) {
        console.error('Failed to copy history and bookmarks to clipboard:', error);
    }
}

function downloadHistoryAndBookmarks() {
    try {
        const userData = getUserData();
        const jsonString = JSON.stringify(userData, null, 2); // Pretty-print with indentation
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'userData.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        URL.revokeObjectURL(url);
        console.log('History and bookmarks downloaded successfully.');
    } catch (error) {
        console.error('Failed to download history and bookmarks:', error);
    }
}

function processUserData(userData) {
    if (userData.history) History.push(...importHistoryFromStrings(userData.history));
    if (userData.bookmarks) bookmarkStore.deserialize(userData.bookmarks);
    if (userData.notes) notes.push(...userData.notes.map(note => BibleNote.fromObject(note)));
    if (userData.Settings) Settings = mergeSettings(Settings, userData.Settings);
    if (userData.VersesOpen)
        VersesOpen = userData.VersesOpen.map(({ Book, Chap, Verse, color }) => new BibleRef(Book, Chap, Verse, color));
}

function loadHistoryAndBookmarks() {
    try {
        const data = localStorage.getItem('userData');
        if (!data) {
            throw new Error('No data found');
        }
        const userData = JSON.parse(data);
        processUserData(userData);
        console.log('History and bookmarks loaded successfully.');
    } catch (error) {
        console.error('Failed to load history and bookmarks:', error);
    }
}

async function importDataFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (!text.trim()) {
            return alert("Clipboard is empty! Copy data first.");
        }
        const userData = JSON.parse(text);
        processUserData(userData);
        alert("Data imported successfully!");
    } catch (error) {
        console.error("Failed to import data:", error);
        alert("Invalid data format. Make sure you copied the correct JSON.");
    }
}

function uploadHistoryAndBookmarks() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const userData = JSON.parse(e.target.result);
                processUserData(userData); // Replace history data
                console.log('History and bookmarks uploaded successfully.');
            } catch (error) {
                console.error('Failed to parse the uploaded file:', error);
                alert('Invalid file format. Please upload a valid JSON file.');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function loadServiceworker() {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js").then(registration => {
            console.log("Service Worker registered with scope:", registration.scope);

            fetch('version')
                .then(response => response.text())
                .then(version => VERSION = version)
                .catch(error => console.error('Error fetching version:', error));
        }).catch(error => {
            console.error("Service Worker registration failed:", error);
        });
    }
}
