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
    const historyGroups = new Map();
    const toMonthString = now.toLocaleString("default", { month: "long" });

    // Check if two dates fall on the same day.
    const isSameDay = (d1, d2) =>
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();

    // Determine the grouping info based on the entry's date.
    const getGroupInfo = (date) => {
        let groupKey, sortValue;
        if (isSameDay(date, now)) {
            groupKey = "Today";
            sortValue = now.getTime();
        } else if (isSameDay(date, new Date(now.getTime() - oneDay))) {
            groupKey = "Yesterday";
            sortValue = now.getTime() - oneDay;
        } else if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) {
            groupKey = toMonthString + " " + date.getDate();
            // Use noon of that day for sorting.
            sortValue = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
        } else if (date.getFullYear() === now.getFullYear()) {
            groupKey = date.toLocaleString("default", { month: "long" });
            sortValue = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
        } else {
            groupKey = date.getFullYear().toString();
            sortValue = new Date(date.getFullYear(), 0, 1).getTime();
        }

        // Determine container class based on the group key.
        const containerClass =
            groupKey === "Today" ||
                groupKey === "Yesterday" ||
                groupKey.startsWith("Day ")
                ? "day-container"
                : isNaN(parseInt(groupKey))
                    ? "month-container"
                    : "year-container";

        return { groupKey, sortValue, containerClass };
    };

    // Group history entries.
    History.forEach((entry) => {
        const date = new Date(entry.color);
        const { groupKey, sortValue } = getGroupInfo(date);
        if (!historyGroups.has(groupKey)) {
            historyGroups.set(groupKey, { sortValue, entries: [] });
        }
        historyGroups.get(groupKey).entries.push(entry);
    });

    // Create the main container.
    const historyContainer = document.createElement("div");
    historyContainer.className = "history-container";

    // Sort group keys by sortValue (newest first).
    const sortedGroupKeys = [...historyGroups.keys()].sort(
        (a, b) => historyGroups.get(b).sortValue - historyGroups.get(a).sortValue
    );

    // Build and append each group container.
    sortedGroupKeys.forEach((groupKey) => {
        // Use the first entry's date to determine the container class.
        const { containerClass } = getGroupInfo(new Date(historyGroups.get(groupKey).entries[0].color));
        const groupContainer = document.createElement("div");
        groupContainer.className = containerClass;

        const groupHeader = document.createElement("h3");
        groupHeader.textContent = groupKey;
        groupContainer.appendChild(groupHeader);

        historyGroups.get(groupKey).entries.forEach((entry) => {
            const bibleRef = new BibleRef(entry.Book, entry.Chap, entry.Verse);
            const entryElement = bibleRef.createHistoryElement(new Date(entry.color));
            groupContainer.appendChild(entryElement);
        });

        historyContainer.appendChild(groupContainer);
    });

    // Update the DOM.
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
        const parts = str.split(":");
        if (parts.length !== 4) {
            console.warn("Skipping invalid history string:", str);
            return null;
        }
        return new BibleRef(
            parts[0],
            parts[1],
            parts[2],
            new Date(Number(parts[3]))
        );
    }).filter(item => item !== null);
}
