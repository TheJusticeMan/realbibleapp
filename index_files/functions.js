const booksOfTheBible = ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "1 SAMUEL", "2 SAMUEL", "1 KINGS", "2 KINGS", "1 CHRONICLES", "2 CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "SONG SOLOMON", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "1 CORINTHIANS", "2 CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "1 THESSALONIANS", "2 THESSALONIANS", "1 TIMOTHY", "2 TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "1 PETER", "2 PETER", "1 JOHN", "2 JOHN", "3 JOHN", "JUDE", "REVELATION"];
const BookShortNames = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
/**
 * 
 * All screens
 * 
 * */

function handleBackButton() {
    if (BackHistory.length > 1) {
        BackHistory.pop();
        const previousState = BackHistory.pop();
        console.log(previousState);
        previousState();
    } else {
        loadVerseListScreen();
    }
}

let ScreenCleanup = null;

var UniqueNumber = 0;

function navigateToScreen(screenId) {
    const [containerElement, Cscreen, readingHeader] = getElementsByIds("container", `screen${screenId}`, "ReadingHeader");
    console.log(`Screen: ${screenId}`);
    if (ScrollPastScreen3) ScrollPastScreen3.destroy();// make sure the chapter changing dosnt happen
    if (ScreenCleanup) {
        ScreenCleanup();
        ScreenCleanup = null;
    }
    if (VersesInview.length <= 1) {
        topswipehandler ||= new SwipeHandler(readingHeader);
        topswipehandler.cycleSwipe = true;
        topswipehandler.onSwipeLeft = BibleRef.ShowNextChapter;
        topswipehandler.onSwipeRight = BibleRef.ShowPreviousChapter;
    }

    containerElement.scrollTo(0, 0);
    saveHistoryAndBookmarks();

    document.querySelectorAll('.screen').forEach(screen => {
        screen.style.display = 'none';
        screen.classList.remove("activeK");
    });

    Cscreen.style.display = 'flex';

    requestAnimationFrame(() => Cscreen.classList.add('activeK'));

    currentScreen = screenId;
    const index = `${BackHistory.length}_${UniqueNumber++}_screen_${screenId}`
    if (!navigatingBack) {
        history.replaceState(null, "", location.pathname);  // Clear the state
        history.pushState({ section: index, time: Date.now() }, "", `#${index}`);
    }
}

/**
 * 
 * Verse list screen
 * - Load verse list screen
 * 
 * */

let VersesInview = [];
let VersesInviewIndex = 0;

function loadVerseListScreen() {
    //saveHistoryAndBookmarks();
    VersesInviewIndex = 0;
    VersesInview = [];

    const verseList = document.getElementById('OPverseList');
    verseList.innerHTML = ""; // Clear existing content
    [...VersesOpen].reverse().forEach(verse => verseList.appendChild(verse.SwipeLink));

    navigateToScreen(1);
    BackHistory.push(() => loadVerseListScreen());
}




/**
 * 
 * Verse Lookup Screen
 * 
 */

function loadVerseSelectionScreen() {
    toggleDisplay(["booksList", "chapterList", "verseList"], "none");
    toggleDisplay(["oldTestamentBtn", "newTestamentBtn"], "");
    GetRelevantVerses();
    document.getElementById("VerseSelectScreenHeader").innerText = "Select Verse";
    navigateToScreen(2);
    BackHistory.push(() => loadVerseSelectionScreen());
}

function GetRelevantVerses() {
    const versesRefs = [];

    // Collect relevant verses
    VersesOpen.forEach(verse => {
        const refBookShort = BookShortNames[booksOfTheBible.indexOf(verse.Book)];
        const chapterRefs = BibleCrossReferences[refBookShort]?.[verse.Chap];
        const verseRefs = chapterRefs?.[verse.Verse + 1];

        if (verseRefs) {
            verseRefs.forEach(ref => {
                versesRefs.push(new BibleRef(booksOfTheBible[ref[0]], ref[1], ref[2] - 1, ref[3]));
            });
        }
    });

    // Merge duplicate verses by summing their colors
    const mergedVerses = new Map();
    versesRefs.forEach(verse => {
        const key = verse.refText;
        if (mergedVerses.has(key)) {
            mergedVerses.get(key).color += verse.color;
        } else {
            mergedVerses.set(key, verse);
        }
    });

    // Sort by color
    const sortedVerses = [...mergedVerses.values()].sort((a, b) => a.color - b.color);

    // Remove already open verses
    const verseList = document.getElementById('booksList');
    verseList.innerHTML = "";
    sortedVerses.forEach(ref => {
        if (!VersesOpen.some(openVerse => openVerse.isEqual(ref))) {
            verseList.appendChild(ref.SearchElement);
        }
    });

    verseList.style.display = "";
}

function loadBooks(testament) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = '';
    const start = testament === "Old" ? 0 : 39;
    const end = testament === "Old" ? 39 : 66;
    document.getElementById("VerseSelectScreenHeader").innerText = "Select Book";

    for (let i = start; i < end; i++) {
        const Booklink = new BibleRef(booksOfTheBible[i], 1, 0);
        booksList.appendChild(Booklink.BookNameElement);
    }

    toggleDisplay(["oldTestamentBtn", "newTestamentBtn", "chapterList", "verseList"], "none");
    toggleDisplay(["booksList"], "");
}

function loadChapters(event) {
    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    const Book = event.currentTarget.dataset.Book;
    document.getElementById("VerseSelectScreenHeader").innerText = "Select Chapter";

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
    document.getElementById("VerseSelectScreenHeader").innerText = "Select Verse";

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

function goToBibleReference(distanceThrough) {
    if (distanceThrough < 0 || distanceThrough > 1) {
        throw new Error("Distance must be between 0 and 1.");
    }

    const targetWord = Math.floor(distanceThrough * Biblewordcount);
    if (targetWord === 0) return new BibleRef(booksOfTheBible[0], 1, 0);

    for (let i = 1; i < booksOfTheBible.length; i++) {
        const book = booksOfTheBible[i];
        const bookWordCount = Biblewordcounts[book][0];
        if (bookWordCount > targetWord) {
            const previousBook = i > 0 ? booksOfTheBible[i - 1] : book;
            for (const chapter in Biblewordcounts[previousBook]) {
                const cumulativeWords = Biblewordcounts[previousBook][chapter];

                if (cumulativeWords >= targetWord) {
                    const previousWords = chapter > 1 ? Biblewordcounts[previousBook][chapter - 1] : 0;
                    const versePosition = Math.ceil(
                        (targetWord - previousWords) /
                        ((cumulativeWords - previousWords) / Bible[previousBook][parseInt(chapter)].length)
                    ) - 1;
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

/**
 * 
 * Main Reading screen
 * 
 * */


let currentverseviewing;
let currentScreen;
let topswipehandler = null;
let ScrollPastScreen3 = null;

function loadDetailedVerseReadingScreen(cverse, ChapterTitle = "") {
    navigateToScreen(3);
    const [textDisplayElement, chapterTitleElement] = getElementsByIds("textDisplayArea", "chapterTitle");
    document.body.style.setProperty("--FontSize", Settings.fontSize + "px");
    textDisplayElement.innerText = "";
    textDisplayElement.appendChild(cverse.ChapterElement);
    chapterTitleElement.innerText = ChapterTitle ? ChapterTitle : `${cverse.Book} ${cverse.Chap}`;
    setupScrollPast();
    BibleRef.scrollToVerse(cverse.Verse);
    BackHistory.push(() => loadDetailedVerseReadingScreen(cverse, ChapterTitle));
}


let fontSize = 18, oldFontSize = 0, zoomSpeed = 1;
let focusedVerseElement = null, containerElement = null, headerHeight = 0;

function setupZoom() {
    new ZoomHandler(document.getElementById('container'), {
        onZoomStart: () => {
            oldFontSize = fontSize;
            const verseIndex = BibleRef.getVerseScroll();
            focusedVerseElement = document.querySelectorAll('.Contents')[verseIndex];
            containerElement = document.getElementById('container');
            headerHeight = document.getElementById('ReadingHeader').scrollHeight;
        },
        onZoom: (zoomFactor) => {
            fontSize = Math.min(64, Math.max(4, oldFontSize * (1 + (zoomFactor - 1) * zoomSpeed)));
            document.getElementById('textDisplayArea').style.fontSize = `${fontSize}px`;
            if (focusedVerseElement) {
                containerElement.scrollTo({ top: focusedVerseElement.offsetTop - headerHeight, behavior: 'auto' });
            }
        },
        onZoomEnd: () => {
            Settings.fontSize = Math.floor(fontSize);
            document.body.style.setProperty("--FontSize", Settings.fontSize + "px");
            saveHistoryAndBookmarks();
        }
    });
}


function setupScrollPast() {
    ScrollPastScreen3 = new ScrollPastBoundsHandler(document.getElementById('container'), {
        onScrollPastTop: () => {
            BibleRef.ShowPreviousChapter(currentverseviewing);
        },
        onScrollPastBottom: () => {
            BibleRef.ShowNextChapter(currentverseviewing);
        }
    });
    ScrollPastScreen3.cycleSwipe = true;
}

/**
 * 
 * Search Screen 
 * 
 * */

function loadSearchScreen() {
    navigateToScreen(4);
    updateSearchResults("");
    document.getElementById('searchInput').focus();
    BackHistory.push(() => loadSearchScreen());
}

let bibleSearchInstance = new BibleSearchClass("", "Phrase", false, false, "ig");
let query = "";
let insearchstart = false;
let searchCleared = true;
let FastSearchQTY = 50;
let SearchingBible = true;

function MakeSearchingPlaceToggleButton() {
    const c = document.createElement("span");
    c.className = "SearchResult";
    c.innerText = SearchingBible ? "Do Topic Search" : "Do Bible Search";
    c.style.fontSize = "2em";
    c.style.textAlign = "center";
    c.id = "searchingPlaceToggle";
    c.addEventListener("click", () => {
        SearchingBible = !SearchingBible;
        document.getElementById('searchingPlaceToggle').innerText = SearchingBible ? "Do Topic Search" : "Do Bible Search";
        document.getElementById('searchInput').placeholder = SearchingBible ? "Search Bible..." : "Search Topics...";
        updateSearchResults(document.getElementById('searchInput').value);
    });
    document.getElementById('searchInput').placeholder = SearchingBible ? "Search Bible..." : "Search Topics...";
    return c;
}

let topicShowing = "";

function updateSearchResults(query2) {
    const [clearSearchButton, resultsContainer, searchInput] = getElementsByIds("clearSearchButton", "searchResults", "searchInput");
    insearchstart = false;
    searchCleared = false;
    clearSearchButton.innerText = "Clear search";
    document.getElementById('container').scrollTo(0, 0);

    if (query2 === "") {
        searchInput.value = '';
        clearSearchButton.innerText = "back";
        resultsContainer.innerHTML = '';
        resultsContainer.appendChild(MakeSearchingPlaceToggleButton());
        searchCleared = true;
        return;
    }

    if (!SearchingBible) {
        showTopics(query2.toLowerCase(), resultsContainer, clearSearchButton, searchInput);
    } else {
        performBibleSearch(query2, resultsContainer, clearSearchButton);
    }
    resultsContainer.appendChild(MakeSearchingPlaceToggleButton());
}


function performBibleSearch(query2, resultsContainer, clearSearchButton) {
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
        clearSearchButton.innerText = `${results.length} result${results.length > 1 ? "s" : ""}`;
    }
}

function showTopics(query2, resultsContainer, clearSearchButton, searchInput) {
    resultsContainer.innerHTML = '';
    const results = FindTopic(query2);
    if (!results) return;

    if (results.length === 1) query2 = results[0];

    if (topics[query2]) {
        VersesOfTopic(query2).forEach(result => {
            resultsContainer.appendChild(result.verse.SearchElement);
        });

        if (topicShowing !== query2) {
            searchInput.value = query2.replace(/\b\w/g, char => char.toUpperCase());
            topicShowing = query2;
        }
        if (TopicDescriptionList) {
            const TopicDescription = document.createElement("div");
            TopicDescription.className = "TopicDescription";
            TopicDescription.innerHTML = TopicDescriptionList[query2].replace(
                // Updated regex: capture optional end verse (group 4)
                /\(?\b([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3})(?:-?(\d{1,3}))?\)?/g,
                (match, book, chapter, verse, endVerse) => {
                    console.log("Full Match:", match);
                    console.log("Book:", book.trim().toUpperCase());
                    console.log("Chapter:", chapter);
                    console.log("Verse:", verse);

                    if (endVerse) {
                        console.log("End Verse:", endVerse);
                        // Create a BibleRange if an end verse is provided
                        const range = new BibleRange(
                            new BibleRef(book.trim().toUpperCase(), parseInt(chapter, 10), parseInt(verse, 10) - 1),
                            new BibleRef(book.trim().toUpperCase(), parseInt(chapter, 10), parseInt(endVerse, 10) - 1)
                        );
                        // Use the range's SearchElement (or RefElement if you add one) to generate clickable HTML
                        return range.RefElement.outerHTML;
                    } else {
                        // Otherwise, create a single BibleRef element as before
                        const verseElement = new BibleRef(book.trim().toUpperCase(), parseInt(chapter, 10), parseInt(verse, 10) - 1);
                        return verseElement.RefElement.outerHTML;
                    }
                }
            );
            TopicDescription.querySelectorAll(".VerseNum").forEach(element => {
                element.oncontextmenu = BibleRef.showVerseMenu;
                element.onclick = BibleRef.goToVerse;
            });
            resultsContainer.appendChild(TopicDescription);
        }
    } else {
        results.sort((a, b) => {
            return (a.startsWith(query2) ? -1 : 0) + (b.startsWith(query2) ? 1 : 0);
        });

        results.forEach(result => {
            const c = document.createElement("span");
            c.className = "SearchResult";
            c.innerText = result.replace(/\b\w/g, char => char.toUpperCase());
            resultsContainer.appendChild(c);

            c.addEventListener("click", () => {
                searchInput.value = result;
                updateSearchResults(result);
            });
        });
    }

    clearSearchButton.innerText = `${results.length} result${results.length > 1 ? "s" : ""}`;
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
        bibleSearchInstance.MAX_RESULTS = 10000;
        const results = bibleSearchInstance.search(query);
        const resultsContainer = document.getElementById('searchResults');
        document.getElementById('clearSearchButton').innerText =
            `${results.length < bibleSearchInstance.MAX_RESULTS ? results.length : "-Infinity"} results`;
        resultsContainer.innerHTML = '';
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement);
        });
        bibleSearchInstance.MAX_RESULTS = FastSearchQTY;
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


/**
 * 
 * History Screen
 * 
 * */

function loadHistoryScreen() {
    showHistory();
    navigateToScreen(5);
    BackHistory.push(() => loadHistoryScreen());
}

/**
 * 
 * Bookmarkes Screen 
 * 
 * */

function loadBookmarksScreen() {
    populateTagFilter();
    loadBookmarks();
    navigateToScreen(6);
    BackHistory.push(() => loadBookmarksScreen());
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


/**
 * 
 *  Contextual Interaction Screen
 * 
 * */

function loadVerseContextualInteractionScreen(theVerse) {
    currentverseviewing = theVerse;
    const [noteEditor, selectedVerseText, crossReferencesList, containerElement] = getElementsByIds("noteEditor", "selectedVerseText", "crossReferencesList", "container");
    // Create and set up the verse display element
    selectedVerseText.innerHTML = "";
    const theVerseElament = theVerse.singleVerseElement;
    theVerseElament.oncontextmenu=BibleRef.copy;
    selectedVerseText.appendChild(theVerseElament);

    // Load existing note, if any
    const existingNote = notes.find(verse => theVerse.isEqual(verse.BibleVerse));
    noteEditor.value = existingNote ? existingNote.Note : "";

    // Display the selected verse

    // Clear cross-references list
    crossReferencesList.innerHTML = "";

    // Retrieve cross-references
    const bookIndex = booksOfTheBible.indexOf(theVerse.Book);
    if (bookIndex === -1) return;

    const chapterRefs = BibleCrossReferences[BookShortNames[bookIndex]]?.[theVerse.Chap];
    const versesRefs = chapterRefs?.[theVerse.Verse + 1];
    if (!versesRefs) return;

    // Populate cross-references
    versesRefs.forEach(ref => {
        const refBookLongForm = booksOfTheBible[ref[0]];
        if (refBookLongForm) {
            crossReferencesList.appendChild(new BibleRef(refBookLongForm, ref[1], ref[2] - 1).SearchElement);
        }
    });

    // Scroll to top and navigate
    containerElement.scrollTo(0, 0);
    populateTagList();
    BackHistory.push(() => loadVerseContextualInteractionScreen(theVerse));
    navigateToScreen(7);
    ScreenCleanup = saveChanges;
}

function populateTagList() {
    const tagList = document.getElementById('tagList');
    tagList.innerHTML = '';

    const selectedTags = new Set(tagManager.listAllTags().filter(tag =>
        tagManager.getVersesByTag(tag).some(ref => ref.isEqual(currentverseviewing))
    ));

    tagManager.listAllTags().forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = 'tag-item';
        tagItem.textContent = tag;
        tagItem.dataset.tag = tag;
        if (selectedTags.has(tag)) tagItem.classList.add('selected');

        tagItem.addEventListener('click', () => {
            if (selectedTags.has(tag)) {
                tagManager.removeTag(currentverseviewing, tag);
                selectedTags.delete(tag);
                tagItem.classList.remove('selected');
                console.log(`Tag removed: ${tag}`);
            } else {
                tagManager.addTag(currentverseviewing, tag);
                selectedTags.add(tag);
                tagItem.classList.add('selected');
                console.log(`Verse bookmarked with tag: ${tag}`);
            }
        });

        tagList.appendChild(tagItem);
    });

    const addTagItem = document.createElement('input');
    Object.assign(addTagItem, {
        type: 'text',
        inputMode: 'search',
        className: 'tag-item add-tag',
        placeholder: 'add tag',
        value: ''
    });

    const addTag = (e) => {
        const newTag = e.currentTarget.value.trim();
        if (newTag) {
            tagManager.addTag(currentverseviewing, newTag);
            populateTagList();
        }
    };

    addTagItem.addEventListener('keydown', e => e.key === 'Enter' && addTag(e));
    addTagItem.addEventListener('blur', addTag);

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
    const noteEditor = document.getElementById('noteEditor');
    const note = noteEditor.value.trim();
    //if (note.length === 0) return;
    console.log(note);
    const theVerse = currentverseviewing;
    if (note.length == 0) {
        notes = notes.filter(note => !note.BibleVerse.isEqual(theVerse));
        console.log("Note deleted");
        return;
    }
    for (let a = 0; a < notes.length; a++) {
        if (notes[a].BibleVerse.isEqual(theVerse)) {
            notes[a] = new BibleNote(currentverseviewing, note);
            return;
        }
    }
    notes.push(new BibleNote(currentverseviewing, note));
    //loadVerseListScreen();
}

/**
 * 
 * Settings Screen
 * 
 * */

function loadSettingsScreen() {
    loadSettings();
}

function loadSettings() {
    setUpSettings();
    navigateToScreen(9);
    BackHistory.push(() => loadSettingsScreen());
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