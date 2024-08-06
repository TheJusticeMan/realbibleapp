class HistoryItem {
    constructor(book, chap, verse) {
        this.Book = book;
        this.Chap = chap;
        this.Verse = verse;
        this.lastSeen = new Date();
    }

    updateLastSeen() {
        this.lastSeen = new Date();
    }
}

let History = [];

function NewHistory(h) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let existingEntry = History.find(entry =>
        entry.Book === h.Book &&
        entry.Chap === h.Chap &&
        entry.Verse === h.Verse &&
        (new Date(entry.lastSeen) > oneHourAgo)
    );

    if (existingEntry) {
        existingEntry.updateLastSeen();
    } else {
        History.push(new HistoryItem(h.Book, h.Chap, h.Verse));
    }

    mergeOldEntries();
    sortHistory();
}

function mergeOldEntries() {
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);

    const mergedHistory = [];
    const mergeMap = new Map();

    History.forEach(entry => {
        const lastSeen = new Date(entry.lastSeen);
        if (lastSeen < oneWeekAgo) {
            const key = `${entry.Book}-${entry.Chap}-${entry.Verse}`;
            if (!mergeMap.has(key)) {
                mergeMap.set(key, { ...entry, lastSeen: [] });
            }
            mergeMap.get(key).lastSeen.push(lastSeen);
        } else {
            mergedHistory.push(entry);
        }
    });

    mergeMap.forEach((value, key) => {
        const { lastSeen, ...rest } = value;
        if (lastSeen.length > 1) {
            const uniqueDays = new Set(lastSeen.map(date => date.toISOString().split('T')[0]));
            uniqueDays.forEach(day => {
                mergedHistory.push({
                    ...rest,
                    lastSeen: new Date(`${day}T12:00:00.000Z`)
                });
            });
        } else {
            mergedHistory.push({
                ...rest,
                lastSeen: lastSeen[0]
            });
        }
    });

    History.length = 0;
    mergedHistory.forEach(entry => History.push(entry));
}

function sortHistory() {
    History.sort((a, b) => new Date(b.lastSeen) - new Date(a.lastSeen));
}

function UpdateHistoryTime(c) {
    const now = new Date();

    let existingEntry = History.find(entry =>
        entry.Book === c.Book &&
        entry.Chap === c.Chap &&
        entry.Verse === c.Verse
    );

    if (existingEntry) {
        existingEntry.updateLastSeen();
    } else {
        console.warn('History entry not found for update.');
    }

    sortHistory();
}

function showHistory() {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const historyMap = new Map();

    // Group history by day
    History.forEach(entry => {
        const lastSeen = new Date(entry.lastSeen);
        const day = Math.floor((now - lastSeen) / oneDay);

        if (!historyMap.has(day)) {
            historyMap.set(day, []);
        }

        historyMap.get(day).push(entry);
    });

    // Create container for the history display
    const historyContainer = document.createElement('div');
    historyContainer.className = 'history-container';

    // Sort and display history
    [...historyMap.keys()].sort((a, b) => a - b).forEach(day => {
        const dayEntries = historyMap.get(day);
        const dayContainer = document.createElement('div');
        dayContainer.className = 'day-container';

        // Set day label
        let dayLabel;
        if (day === 0) {
            dayLabel = 'Today';
        } else if (day === 1) {
            dayLabel = 'Yesterday';
        } else {
            dayLabel = `${day} days ago`;
        }

        const dayLabelElement = document.createElement('h3');
        dayLabelElement.textContent = dayLabel;
        dayContainer.appendChild(dayLabelElement);

        // Add entries for the day
        dayEntries.forEach(entry => {
            const bibleRef = new BibleRef(entry.Book, entry.Chap, entry.Verse);
            const entryElement = bibleRef.createHistoryElement(new Date(entry.lastSeen));
            dayContainer.appendChild(entryElement);
        });

        historyContainer.appendChild(dayContainer);
    });

    // Append the history container to the document body or a specific element
    document.getElementById("history-list").innerHTML = "";
    document.getElementById("history-list").appendChild(historyContainer);
}
