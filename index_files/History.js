let History = [];

// We use 'color' to represent the last seen date.

function NewHistory(h) {
    let now = new Date();
    let oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    let existingEntry = History.find(function (entry) {
        return entry.Book === h.Book &&
            entry.Chap === h.Chap &&
            entry.Verse === h.Verse &&
            new Date(entry.color) > oneHourAgo;
    });

    if (existingEntry) {
        if (!(existingEntry instanceof BibleRef)) {
            Object.setPrototypeOf(existingEntry, BibleRef.prototype);
        }
        existingEntry.updateLastSeen();
    } else {
        History.push(new BibleRef(h.Book, h.Chap, h.Verse, new Date()));
    }

    mergeOldEntries();
    sortHistory();
}

function mergeOldEntries() {
    let oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    let mergedHistory = [];
    let mergeMap = new Map();

    History.forEach(function (entry) {
        let color = new Date(entry.color);
        if (color < oneWeekAgo) {
            let key = entry.Book + "-" + entry.Chap + "-" + entry.Verse;
            if (!mergeMap.has(key)) {
                mergeMap.set(key, { ...entry, color: [] });
            }
            mergeMap.get(key).color.push(color);
        } else {
            mergedHistory.push(entry);
        }
    });

    mergeMap.forEach(function (value) {
        let color = value.color;
        let rest = { ...value };
        delete rest.color;

        if (color.length > 1) {
            let uniqueDays = new Set(color.map(function (date) {
                return date.toISOString().split("T")[0];
            }));

            uniqueDays.forEach(function (day) {
                mergedHistory.push({
                    ...rest,
                    color: new Date(day + "T12:00:00.000Z")
                });
            });
        } else {
            mergedHistory.push({
                ...rest,
                color: color[0]
            });
        }
    });

    History = mergedHistory;
}

function sortHistory() {
    History.sort(function (a, b) {
        return new Date(b.color) - new Date(a.color);
    });
}

function UpdateHistoryTime(c) {
    let existingEntry = History.find(function (entry) {
        return entry.Book === c.Book && entry.Chap === c.Chap && entry.Verse === c.Verse;
    });

    if (existingEntry) {
        existingEntry.updateLastSeen();
    } else {
        console.warn("History entry not found for update.");
    }

    sortHistory();
}

function showHistory() {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const historyContainer = document.createElement("div");
    historyContainer.className = "history-container";

    // Sort history entries chronologically
    const sortedHistory = [...History].sort((a, b) => new Date(b.color) - new Date(a.color));

    let lastGroupKey = null;
    let currentGroupContainer = null;

    // Check if two dates fall on the same day.
    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    // Determine the group key based on the entry's date.
    const getGroupKey = (date) => {
        if (isSameDay(date, now)) return "Today";
        if (isSameDay(date, new Date(now.getTime() - oneDay))) return "Yesterday";
        if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
            return date.toLocaleString("default", { month: "long" }) + " " + date.getDate();
        }
        if (date.getFullYear() === now.getFullYear()) {
            return date.toLocaleString("default", { month: "long" });
        }
        return date.getFullYear().toString();
    };

    // Iterate through sorted history and dynamically create groups
    sortedHistory.forEach((entry) => {
        const date = new Date(entry.color);
        const groupKey = getGroupKey(date);

        if (groupKey !== lastGroupKey) {
            // Create new group container
            currentGroupContainer = document.createElement("div");
            currentGroupContainer.className = isNaN(parseInt(groupKey)) ? "month-container" : "year-container";

            const groupHeader = document.createElement("h3");
            groupHeader.textContent = groupKey;
            currentGroupContainer.appendChild(groupHeader);
            historyContainer.appendChild(currentGroupContainer);
            lastGroupKey = groupKey;
        }

        if (!(entry instanceof BibleRef)) {
            Object.setPrototypeOf(entry, BibleRef.prototype);
        }
        const entryElement = entry.HistoryElement;
        currentGroupContainer.appendChild(entryElement);
    });

    // Update the DOM
    const historyListEl = document.getElementById("history-list");
    historyListEl.innerHTML = "";
    historyListEl.appendChild(historyContainer);
}
let popstateTriggered = false;
let BackHistory = [];
let navigatingBack = false;

function SetUpBackTrigger() {
    window.addEventListener("popstate", function () {
        if (popstateTriggered) return;
        popstateTriggered = true;
        setTimeout(function () { popstateTriggered = false; }, 100);

        if (BackHistory.length > 1) {
            navigatingBack = true;
            BackHistory.pop();
            let previousState = BackHistory.pop();
            previousState();
            navigatingBack = false;
        }
    });
}

/**
 * Converts the History array into a compact array of strings.
 * Each string is formatted as: "Book:Chap:Verse:lastSeenNumber"
 */
function exportHistoryAsStrings() {
    return History.map(item =>
        `${item.Book}:${item.Chap}:${item.Verse}:${new Date(item.color).getTime()}`
    );
}

/**
 * Imports an array of history strings.
 * Each string should be in the format: "Book:Chap:Verse:lastSeenNumber"
 */
function importHistoryFromStrings(stringArray) {
    return stringArray.map(str => {
        const [book, chap, verse, color] = str.split(":");
        return new BibleRef(book, chap, verse, new Date(Number(color)));
    }).filter(item => item !== null);
}
