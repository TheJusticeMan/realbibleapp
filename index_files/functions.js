const booksOfTheBible = ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "1 SAMUEL", "2 SAMUEL", "1 KINGS", "2 KINGS", "1 CHRONICLES", "2 CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "SONG SOLOMON", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "1 CORINTHIANS", "2 CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "1 THESSALONIANS", "2 THESSALONIANS", "1 TIMOTHY", "2 TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "1 PETER", "2 PETER", "1 JOHN", "2 JOHN", "3 JOHN", "JUDE", "REVELATION"];
const BookShortNames = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
let VersesInview = [];
let currentverseviewing;
let currentScreen;
let topswipehandler = null;

function handleBackButton() {
    loadVerseListScreen();
}

function loadVerseListScreen() {
    VersesInviewIndex = 0;
    VersesInview = [];
    const verseList = document.getElementById('OPverseList');
    verseList.innerText = "";
    for (const verse of [...VersesOpen].reverse()) {
        verseList.appendChild(verse.SwipeLink);
    }
    navigateToScreen(1);
}

function loadVerseSelectionScreen() {
    toggleDisplay(["booksList", "chapterList", "verseList"], "none");
    toggleDisplay(["oldTestamentBtn", "newTestamentBtn"], "");
    GetRelevantVerses();
    navigateToScreen(2);
}

function loadDetailedVerseReadingScreen(TheTitle, TheContent, Verse) {
    //currentverseviewing=Verse;
    const textDisplayArea = document.getElementById('textDisplayArea');
    textDisplayArea.innerText = "";
    textDisplayArea.appendChild(TheContent);
    document.getElementById("chapterTitle").innerText = TheTitle;
    navigateToScreen(3);
    BibleRef.scrollToVerse(Verse);
}

function loadSearchScreen() {
    navigateToScreen(4);
    document.getElementById('searchInput').focus();
}

function loadHistoryScreen() {
    showHistory();
    navigateToScreen(5);
}

function loadBookmarksScreen() {
    populateTagFilter();
    loadBookmarks();
    navigateToScreen(6);
}

function loadVerseContextualInteractionScreen(theVerse) {
    currentverseviewing = theVerse;
    const TheVerse = document.createElement("div");
    TheVerse.className = "BibleContents";
    TheVerse.appendChild(theVerse.VerseElement);

    const referenceSpan = document.createElement("span");
    referenceSpan.className = "BibleReference";
    referenceSpan.textContent = theVerse.refText;
    const notetoload = notes.filter(verse => (theVerse.isEqual(verse.BibleVerse)));
    document.getElementById('noteEditor').value = "";
    if (notetoload.length > 0) {
        document.getElementById('noteEditor').value = notetoload[0].Note;
    }

    TheVerse.appendChild(referenceSpan);
    document.getElementById("crossReferencesList").innerHTML = "";
    document.getElementById("selectedVerseText").innerText = "";
    document.getElementById("selectedVerseText").appendChild(TheVerse);
    try {
        const refBookShortForm = BookShortNames[booksOfTheBible.indexOf(currentverseviewing.Book)];
        const versesRefs = BibleCrossReferences[refBookShortForm][currentverseviewing.Chap][currentverseviewing.Verse + 1];
        versesRefs.forEach((ref, index) => {
            const refBookLongForm = booksOfTheBible[ref[0]];
            const RefVerse = new BibleRef(refBookLongForm, ref[1], ref[2] - 1);
            document.getElementById("crossReferencesList").appendChild(RefVerse.SearchElement);
        });
    } catch (e) { }
    document.getElementById('container').scrollTo(0, 0);
    populateTagList();
    navigateToScreen(7);
}

function navigateToScreen(screenId) {
    if (VersesInview.length <= 1) {
        const readingHeader = document.getElementById("ReadingHeader");
        if (!topswipehandler) {
            topswipehandler = new SwipeHandler(readingHeader);
        }
        topswipehandler.onSwipeLeft = BibleRef.ShowNextChapter;
        topswipehandler.onSwipeRight = BibleRef.ShowPreviousChapter;
    }
    currentScreen = screenId;
    document.getElementById('container').scrollTo(0, 0);
    saveHistoryAndBookmarks();
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById(`screen${screenId}`).style.display = 'flex';
}

function GetRelevantVerses() {
    const versesRefs = [];

    VersesOpen.forEach(verse => {
        const refBookShortForm = BookShortNames[booksOfTheBible.indexOf(verse.Book)];
        const chapterRefs = BibleCrossReferences[refBookShortForm]?.[verse.Chap];
        const verseRefs = chapterRefs?.[verse.Verse + 1];

        if (verseRefs) {
            versesRefs.push(...verseRefs);
        }
    });

    for (let i = 0; i < versesRefs.length - 1; i++) {
        for (let j = i + 1; j < versesRefs.length; j++) {
            if (
                versesRefs[i][0] === versesRefs[j][0] &&
                versesRefs[i][1] === versesRefs[j][1] &&
                versesRefs[i][2] === versesRefs[j][2]
            ) {
                versesRefs[i][3] += versesRefs[j][3];
                versesRefs.splice(j, 1);
                j--;
            }
        }
    }

    versesRefs.sort((a, b) => a[3] - b[3]);

    const isVerseInVersesOpen = (R) => {
        return VersesOpen.some(openVerse =>
            openVerse.isEqual(R)
        );
    };

    versesRefs.forEach((ref, index) => {
        const refBookLongForm = booksOfTheBible[ref[0]];
        versesRefs[index] = new BibleRef(refBookLongForm, ref[1], ref[2] - 1);
    });

    const verseList = document.getElementById('booksList');
    verseList.innerText = "";
    versesRefs.forEach(ref => {
        if (!isVerseInVersesOpen(ref))
            verseList.appendChild(ref.SearchElement);
    });

    document.getElementById("booksList").style.display = "";
}

function loadBooks(testament) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';
    const start = testament === "Old" ? 0 : 39;
    const end = testament === "Old" ? 39 : 66;

    for (let i = start; i < end; i++) {
        const Booklink = new BibleRef(booksOfTheBible[i], 0, 0);
        booksList.appendChild(Booklink.BookNameElement);
    }

    toggleDisplay(["oldTestamentBtn", "newTestamentBtn", "chapterList", "verseList"], "none");
    toggleDisplay(["booksList"], "");
}

function loadChapters(event) {
    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    const Book = event.currentTarget.dataset.Book;

    Bible[Book].slice(1).forEach((_, index) => {
        const Chaplink = new BibleRef(Book, index + 1, 0);
        chapterList.appendChild(Chaplink.ChapterNumberElement);
    });

    toggleDisplay(["oldTestamentBtn", "newTestamentBtn", "booksList", "verseList"], "none");
    toggleDisplay(["chapterList"], "");
}

function loadVerses(event) {
    const verseList = document.getElementById('verseList');
    verseList.innerHTML = '';
    const { Book, Chap } = event.currentTarget.dataset;

    Bible[Book][Chap].forEach((_, index) => {
        const verselink = new BibleRef(Book, Chap, index);
        verseList.appendChild(verselink.VerseNumberElement);
    });

    toggleDisplay(["oldTestamentBtn", "newTestamentBtn", "booksList", "chapterList"], "none");
    toggleDisplay(["verseList"], "");
}

function toggleDisplay(ids, displayStyle) {
    ids.forEach(id => document.getElementById(id).style.display = displayStyle);
}

function toggleNightMode() {
    const body = document.body;
    body.classList.toggle('light-theme');
}

let fontSize = 18;
let oldFontSize = 0;
let initialDistance = null;
let verseScrolledTo = 0;

let focusedVerseElement = null; // Store the currently focused verse element

function handleTouchMove(e) {
    if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);

        if (currentDistance !== initialDistance) {
            // Smooth out the zoom factor using a damping effect
            const zoomFactor = 1 + (currentDistance - initialDistance) / initialDistance; // Dampen zoom
            fontSize = oldFontSize * zoomFactor;

            // Constrain font size between minimum and maximum
            fontSize = Math.min(64, Math.max(4, fontSize));

            // Update the font size in the UI
            document.getElementById('textDisplayArea').style.fontSize = `${fontSize}px`;

            // Use the stored element to scroll directly
            if (focusedVerseElement) {
                const container = document.getElementById('container');
                const headerHeight = document.getElementById('ReadingHeader').scrollHeight;

                container.scrollTo({
                    top: focusedVerseElement.offsetTop - headerHeight,
                    behavior: 'auto', // Avoid smooth scrolling for speed
                });
            }
        }
    }
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        oldFontSize = fontSize;

        // Store the focused verse element
        const verseIndex = BibleRef.getVerseScroll();
        focusedVerseElement = document.querySelectorAll('.Contents')[verseIndex];
    }
}

function handleTouchEnd(e) {
    // Reset on touch end
    if (e.touches.length < 2) {
        initialDistance = null;
    }
}

function setupScrollPastMobile() {
    const container = document.getElementById('container');

    let startY = 0;
    let currentY = 0;
    let isAtTop = false;
    let isAtBottom = false;
    let activatedTop = false;
    let activatedBottom = false;

    container.addEventListener('touchstart', (event) => {
        if (event.touches.length > 1) return;
        activatedTop = false;
        activatedBottom = false;
        startY = event.touches[0].pageY;

        // Check if the user is at the top or bottom of the container
        if (currentScreen == 3) {
            isAtTop = container.scrollTop <= 0;
            isAtBottom = container.scrollTop + container.offsetHeight >= container.scrollHeight - 60;
            // 60px buffer for chrome
        } else {
            isAtTop = false;
            isAtBottom = false;
        }
    });

    container.addEventListener('touchmove', (event) => {
        if (event.touches.length > 1) return;
        currentY = event.touches[0].pageY;
        const distance = currentY - startY;

        if (isAtTop && distance > 0) {
            // Handle scrolling past the top
            event.preventDefault();
            const bounceDistance = Math.min(distance / 2, 100); // Limit bounce effect
            container.style.transform = `translateY(${bounceDistance}px)`;
            if (distance > 50) {
                activatedTop = true;
                container.style.transform = `translateY(-100vh)`;
            }
        } else if (isAtBottom && distance < 0) {
            // Handle scrolling past the bottom
            event.preventDefault();
            const bounceDistance = Math.max(distance / 2, -100); // Limit bounce effect
            container.style.transform = `translateY(${bounceDistance}px)`;
            if (distance < -50) {
                activatedBottom = true;
                container.style.transform = `translateY(100vh)`;
            }
        }
    });

    container.addEventListener('touchend', () => {
        if (isAtTop || isAtBottom) {
            // Smoothly reset the transform property
            container.style.transition = 'transform 0.3s ease-out';
            container.style.transform = 'none'; // Reset completely

            // Trigger actions if activated
            if (activatedTop) {
                BibleRef.ShowPreviousChapter(currentverseviewing); // Action for top
                activatedTop = false;
            }
            if (activatedBottom) {
                BibleRef.ShowNextChapter(currentverseviewing); // Action for bottom
                activatedBottom = false;
            }

            // Clean up transition after animation
            container.addEventListener(
                'transitionend',
                () => {
                    container.style.transition = ''; // Clear transition
                },
                { once: true }
            );
        }
    });
}

let bibleSearchInstance = new BibleSearchClass("", "Phrase", false, false, "ig");
let query = "";
let insearchstart = false;
let searchCleared = true;
let FastSearchQTY = 50;

function updateSearchResults(query2) {
    insearchstart = false;
    searchCleared = false;
    document.getElementById('clearSearchButton').innerText = "Clear search";
    document.getElementById('container').scrollTo(0, 0);
    const resultsContainer = document.getElementById('searchResults');
    if (query2 == "") {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearchButton').innerText = "back";
        resultsContainer.innerHTML = '';
        searchCleared = true;
    } else {
        query = query2;
        insearchstart = true;
        bibleSearchInstance = new BibleSearchClass(query2, "Phrase", false, false, "ig");
        bibleSearchInstance.MAX_RESULTS = FastSearchQTY;
        const results = bibleSearchInstance.search(query2);
        resultsContainer.innerHTML = '';
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement);
        });
        if (results.length < bibleSearchInstance.MAX_RESULTS) {
            document.getElementById('clearSearchButton').innerText = `${results.length} result${results.length > 1 ? "s" : ""}`;
        }
    }
}

function clearSearchResults() {
    if (searchCleared) {
        loadVerseListScreen();
    } else {
        updateSearchResults("");
        document.getElementById('clearSearchButton').innerText = "back";
        searchCleared = true;
    }
}

function loadMoreResults() {
    if (query && bibleSearchInstance.MAX_RESULTS == FastSearchQTY && insearchstart) {
        bibleSearchInstance.MAX_RESULTS = 1000;
        const results = bibleSearchInstance.search(query);
        const resultsContainer = document.getElementById('searchResults');
        document.getElementById('clearSearchButton').innerText =
            `${results.length < bibleSearchInstance.MAX_RESULTS ? results.length : "-Infinity"} results`;
        resultsContainer.innerHTML = '';
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement);
        });
    }
    insearchstart = false;
}

function preprocessBible() {
    for (const book in Bible) {
        BibleSearch[book] = [];
        const chapters = Bible[book];
        for (let C = 1; C < chapters.length; C++) {
            BibleSearch[book][C] = [];
            const verses = chapters[C];
            for (let V = 0; V < verses.length; V++) {
                BibleSearch[book][C][V] = verses[V].toLowerCase().replace(/[] .,:;[]]+/g, " ");
            }
        }
    }
    return BibleSearch;
}

function populateTagFilter() {
    const tagFilter = document.getElementById('tagFilter');
    tagFilter.innerHTML = '<option value="all">All Tags</option>';
    tagManager.listAllTags().forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        tagFilter.appendChild(option);
    });
}

function loadBookmarks(tag = 'all') {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';
    const verses = tag === 'all' ? tagManager.getAllVerses() : tagManager.getVersesByTag(tag);

    if (verses.length === 0) {
        document.querySelector('.empty-state').style.display = 'block';
        return;
    }

    document.querySelector('.empty-state').style.display = 'none';
    verses.forEach(verse => {
        bookmarksList.appendChild(verse.SearchElement);
    });
}

let existingTags = [];

function populateTagList() {
    const tagList = document.getElementById('tagList');
    tagList.innerHTML = '';

    existingTags = tagManager.listAllTags().filter(tag =>
        tagManager.getVersesByTag(tag).some(ref =>
            ref.isEqual(currentverseviewing)
        )
    );

    tagManager.listAllTags().forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        tagItem.textContent = tag;
        if (existingTags.includes(tag)) {
            tagItem.classList.add('selected');
        }
        tagItem.dataset.tag = tag;
        tagItem.addEventListener('click', function (event) {
            const tag = event.currentTarget.dataset.tag;
            const tagItem = event.currentTarget;
            if (existingTags.includes(tag)) {
                tagManager.removeTag(currentverseviewing, tag);
                tagItem.classList.remove('selected');
                existingTags = existingTags.filter(t => t !== tag);
                console.log(`Tag removed: ${tag}`);
            } else {
                tagManager.addTag(currentverseviewing, tag);
                tagItem.classList.add('selected');
                existingTags.push(tag);
                console.log(`Verse bookmarked with tag: ${tag}`);
            }
        });
        tagList.appendChild(tagItem);
    });

    const addTagItem = document.createElement('input');
    addTagItem.type = 'text';
    addTagItem.inputmode = "search";
    addTagItem.className = 'tag-item add-tag';
    addTagItem.placeholder = 'add tag';
    addTagItem.value = '';
    addTagItem.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            const newTag = e.currentTarget.value;
            if (newTag) {
                tagManager.addTag(currentverseviewing, newTag);
                populateTagList();
            }
        }
    });
    addTagItem.addEventListener('blur', function (e) {
        const newTag = e.currentTarget.value;
        if (newTag) {
            tagManager.addTag(currentverseviewing, newTag);
            populateTagList();
        }
    });
    tagList.appendChild(addTagItem);
}

function addNewLabel() {
    const newLabel = prompt("Enter new label name:");
    const dropdown = document.getElementById('bookmarkDropdown');
    const option = document.createElement('option');
    option.value = newLabel.toLowerCase();
    option.text = newLabel;
    dropdown.appendChild(option);
}

function updateCrossReferences(query) {
    const results = ['Psalm 23:1 - The Lord is my shepherd', 'Ephesians 2:8 - For by grace you have been saved...'];
    const list = document.getElementById('crossReferencesList');
    list.innerHTML = '';
    results.forEach(result => {
        const li = document.createElement('li');
        li.textContent = result;
        list.appendChild(li);
    });
}

function saveChanges() {
    const theVerse = currentverseviewing;
    for (let a = 0; a < notes.length; a++) {
        if (notes[a].BibleVerse.isEqual(theVerse)) {
            notes[a] = new BibleNote(currentverseviewing, document.getElementById('noteEditor').value);
            return;
        }
    }
    notes.push(new BibleNote(currentverseviewing, document.getElementById('noteEditor').value));
    loadVerseListScreen();
}
const helpBubbles = [
    { id: "helpBubble1", element: "#searchBtn2", position: "bottom" },
    { id: "helpBubble2", element: "#historyBtn2", position: "bottom" },
    { id: "helpBubble3", element: "#bookmarksBtn2", position: "bottom" },
    { id: "helpBubble4", element: "#OPverseList2", position: "top" },
    { id: "helpBubble5", element: "#addVerseBtn2", position: "top" }
];

function ShowHelpScreen() {

    let currentBubbleIndex = 0;

    function showNextBubble() {
        document.getElementById("helpBubbleEnd").style.display = "none";
        if (currentBubbleIndex > 0) {
            const prevElement = document.querySelector(helpBubbles[currentBubbleIndex - 1].element);
            document.getElementById(helpBubbles[currentBubbleIndex - 1].id).style.display = "none";
            prevElement.classList.remove("glow");
        }

        if (currentBubbleIndex < helpBubbles.length) {
            const bubble = helpBubbles[currentBubbleIndex];
            const element = document.querySelector(bubble.element);
            const rect = element.getBoundingClientRect();
            const helpBubble = document.getElementById(bubble.id);

            element.classList.add("glow");

            helpBubble.style.display = "block";

            if (bubble.position === "bottom") {
                helpBubble.style.top = (rect.top + window.scrollY + rect.height + 10) + "px";
                helpBubble.style.left = (rect.left + window.scrollX) + "px";
            } else {
                helpBubble.style.top = (rect.top + window.scrollY - helpBubble.offsetHeight - 10) + "px";
                helpBubble.style.left = (rect.left + window.scrollX) + "px";
            }

            // Ensure bubble is on screen
            const bubbleRect = helpBubble.getBoundingClientRect();
            if (bubbleRect.right > window.innerWidth - 20) {
                helpBubble.style.left = (window.innerWidth - 310) + "px";
            }
            if (bubbleRect.left < 0) {
                helpBubble.style.left = "10px";
            }
            if (bubbleRect.top < 0) {
                helpBubble.style.top = (rect.top + window.scrollY + rect.height + 10) + "px";
            }
            if (bubbleRect.bottom > window.innerHeight) {
                helpBubble.style.top = (rect.top + window.scrollY - helpBubble.offsetHeight - 10) + "px";
            }

            currentBubbleIndex++;
        } else {
            // Show the end tutorial bubble in the center of the screen
            const endBubble = document.getElementById("helpBubbleEnd");
            endBubble.style.display = "block";
            endBubble.style.top = "50%";
            endBubble.style.left = "50%";
            endBubble.style.transform = "translate(-50%, -50%)";
            endBubble.onclick = function () {
                endBubble.style.display = "none";
                loadVerseListScreen();
            };
            currentBubbleIndex = 0;
        }
    }

    document.addEventListener("click", showNextBubble);
    navigateToScreen(8);
    showNextBubble();
}

/**
 * Generates a color in HSL format based on the golden ratio.
 * @param {number} n - The position index to generate the color for.
 * @returns {string} - The color in HSL format (e.g., "hsl(137.5, 100%, 50%)").
 */
function generateColor(n) {
    const GOLDEN_ANGLE = (3 - Math.sqrt(5)) * 180; // Derived from the golden ratio
    const HUE_START = 0; // Starting hue (red)

    // Calculate the hue for the given position
    const hue = (HUE_START + (n * GOLDEN_ANGLE)) % 360;

    // Fixed saturation and lightness for vivid and consistent colors
    const saturation = 100;
    const lightness = 50;

    // Return the color in HSL format
    return `hsl(${hue.toFixed(1)}, ${saturation}%, ${lightness}%)`;
}


function goToBibleReference(distanceThrough) {
    if (distanceThrough < 0 || distanceThrough > 1) {
        throw new Error("Distance must be between 0 and 1.");
    }

    const targetWord = Math.floor(distanceThrough * Biblewordcount);
    if (targetWord === 0) return new BibleRef(booksOfTheBible[0], 1, 0);

    for (let i = 1; i < booksOfTheBible.length; i++) {
        const book = booksOfTheBible[i];
        const bookWordCount = Biblewordcounts[book][Object.keys(Biblewordcounts[book]).pop()];
        if (bookWordCount > targetWord) {
            const previousBook = i > 0 ? booksOfTheBible[i - 1] : book;
            for (const chapter in Biblewordcounts[previousBook]) {
                const cumulativeWords = Biblewordcounts[previousBook][chapter];

                if (cumulativeWords >= targetWord) {
                    const previousWords = chapter > 1 ? Biblewordcounts[previousBook][chapter - 1] : 0;
                    const versePosition = Math.ceil(
                        (targetWord - previousWords) /
                        ((cumulativeWords - previousWords) / Bible[previousBook][parseInt(chapter)].length)
                    );
                    return new BibleRef(previousBook, parseInt(chapter), versePosition);
                }
            }
            throw new Error("Bible reference could not be determined.");
        }
    }

    const lastBook = booksOfTheBible[booksOfTheBible.length - 1];
    for (const chapter in Biblewordcounts[lastBook]) {
        const cumulativeWords = Biblewordcounts[lastBook][chapter];
        if (cumulativeWords >= targetWord) {
            const previousWords = chapter > 1 ? Biblewordcounts[lastBook][chapter - 1] : 0;
            const versePosition = Math.ceil(
                (targetWord - previousWords) /
                ((cumulativeWords - previousWords) / Bible[lastBook][parseInt(chapter)].length)
            );
            return new BibleRef(lastBook, parseInt(chapter), versePosition);
        }
    }

    throw new Error("Bible reference could not be determined.");
}
