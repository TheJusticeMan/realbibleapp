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
        previousState();
    } else {
        loadVerseListScreen();
    }
}

let ScreenCleanup = null;

let UniqueNumber = 0;

function navigateToScreen(screenId) {
    const [containerElement, Cscreen, readingHeader] = getElementsByIds("container", `screen${screenId}`, "ReadingHeader");
    //console.log(`Screen: ${screenId}`);
    if (ScrollPastScreen3) ScrollPastScreen3.destroy();// make sure the chapter changing dosnt happen
    if (ScreenCleanup) {
        ScreenCleanup();
        ScreenCleanup = null;
    }
    if (VerseGroup.length <= 1) {
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
        history.pushState({ section: index, time: Date.now() }, "");
    }
}

/**
 * 
 * Verse list screen
 * - Load verse list screen
 * 
 * */

let VerseGroup = [], VerseGroupIndex = 0, TagShown = "";

function loadVerseListScreen() {
    refreshListScreen();
    navigateToScreen(1);
    BackHistory.push(loadVerseListScreen);
}


function refreshListScreen() {
    VerseGroupIndex = 0;
    VerseGroup = [];

    const verseList = document.getElementById('OPverseList');
    verseList.innerHTML = "";
    populateTagSaver();

    [...VersesOpen].reverse().forEach(verse => verseList.appendChild(verse.SwipeLink));
    saveHistoryAndBookmarks();
}

function populateTagSaver() {
    const SaveToTag = document.getElementById('SaveToTag');

    // Clear existing options and add the default 'All Tags' option
    SaveToTag.replaceChildren(new Option('New Tag', 'New__pg'));
    SaveToTag.add(new Option("Save list to bookmark tag", "Cancel__pg"));
    SaveToTag.value = "Cancel__pg";

    // Add other tags using the add method
    bookmarkStore.listAllTags().forEach(tag => {
        SaveToTag.add(new Option(tag, tag));
    });
}

function saveListToTag(event) {
    const tag = event.currentTarget.value;
    const element = document.getElementById("SaveToTag");
    if (tag === "Cancel__pg") {
        return;
    } else if (tag === "New__pg") {
        const prompt = new CustomPrompt();
        prompt.show('Enter a name for the new bookmark:', (result) => {
            if (result) {
                bookmarkStore.tags[result] = new Set();
                bookmarkStore.addTags(VersesOpen, result);
                refreshListScreen();
            } else {
                element.value = "Cancel__pg";
            }
        });

    } else {
        bookmarkStore.addTags(VersesOpen, tag);
        refreshListScreen();
    }
}

/**
 * 
 * Verse Lookup Screen
 * 
 */

function loadVerseSelectionScreen() {
    toggleDisplay(["Lookup"], ["booksList", "chapterList", "verseList"])
    GetRelevantVerses();
    if (Settings.flipPages) {
        SetUpFlipping();
    }
    document.getElementById("VerseSelectScreenHeader").innerText = "Select Verse";
    navigateToScreen(2);
    BackHistory.push(() => loadVerseSelectionScreen());
}

function SetUpFlipping() {
    document.querySelectorAll(".Flipline").forEach((el, i) => {
        el.innerText = goToBibleReference(i / 32).refText;
        el.ontouchstart = SetUpFlipping2;
        el.dataset.index = i;
    });
}

function SetUpFlipping2(event) {
    event.preventDefault();
    const i = parseFloat(event.currentTarget.dataset.index) || 0;
    document.querySelectorAll(".Flipline")
        .forEach((el, l) => {
            const newIndex = i + l / 32;
            const Ref = goToBibleReference(newIndex / 32) || {};
            Ref.index = newIndex;

            el.innerText = Ref.refText; // Assuming refText is a getter
            Object.assign(el.dataset, Ref);

            let lastTouch = { x: null, y: null };

            el.ontouchmove = (event) => {
                event.preventDefault();
                ({ clientX: lastTouch.x, clientY: lastTouch.y } = event.touches[0]);
            };

            el.ontouchend = (event) => {
                const element = lastTouch.x !== null && lastTouch.y !== null
                    ? document.elementFromPoint(lastTouch.x, lastTouch.y)
                    : null;

                if (element && element !== el) {
                    element.dispatchEvent(new Event("touchend"));
                } else {
                    BibleRef.goToVerse(event);
                }
            };
        });
}

function GetRelevantVerses() {
    const verseList = document.getElementById('booksList');
    verseList.innerHTML = "<H1>Related Verses</H1>";
    verseList.style.display = "";

    // Collect and process relevant verses

    [...(VersesOpen
        .flatMap(({ Book, Chap, Verse }) =>
            BibleCrossReferences[Book]?.[Chap]?.[Verse + 1]
        )
        // Merge duplicate verses by summing their color weight
        .reduce((acc, verse) => {
            const key = verse.refText;
            verse.i = 1;

            if (acc.has(key)) {
                acc.get(key).color += verse.color;
                acc.get(key).i++;
            } else {
                acc.set(key, verse);
            }

            return acc;
        }, new Map())).values()]
        // change the color to vote value
        .map(({ Book, Chap, Verse, i, color }) => new BibleRef(Book, Chap, Verse, i - (1 / color)))
        // sort from most to least relevent
        .sort((a, b) => b.color - a.color)
        // Remove already open verses
        .forEach(ref => {
            if (!VersesOpen.some(openVerse => openVerse.isEqual(ref)))
                verseList.appendChild(ref.CrossRefElement);
        });
}

function OpenAllReleventVerses() {
    const verseList = document.getElementById('booksList');
    verseList.innerHTML = "<H1>Related Verses</H1>";
    verseList.style.display = "";
    const VersesOpen2 = [];

    [...(VersesOpen
        .flatMap(({ Book, Chap, Verse }) =>
            BibleCrossReferences[Book]?.[Chap]?.[Verse + 1]
        )
        // Merge duplicate verses by summing their color weight
        .reduce((acc, verse) => {
            const key = verse.refText;
            verse.i = 1;

            if (acc.has(key)) {
                acc.get(key).color += verse.color;
                acc.get(key).i++;
            } else {
                acc.set(key, verse);
            }

            return acc;
        }, new Map())).values()]
        // change the color to vote value
        .map(({ Book, Chap, Verse, i, color }) => new BibleRef(Book, Chap, Verse, i - (1 / color)))
        // sort from most to least relevent
        .sort((a, b) => b.color - a.color)
        // Remove already open verses
        .forEach(ref => {
            if (!VersesOpen.some(openVerse => openVerse.isEqual(ref)))
                VersesOpen2.push(ref);
        });
    const VOPlength=VersesOpen.length;
    VersesOpen2.reverse().forEach(({ Book, Chap, Verse }, i) => VersesOpen.push(new BibleRef(Book, Chap, Verse, i + VOPlength)))
    loadVerseListScreen();
}

function toggleDisplay(showIds = [], hideIds = []) {
    hideIds.forEach(id => document.getElementById(id).style.display = "none");
    showIds.forEach(id => document.getElementById(id).style.display = "");
}

function createSectionHeader(name) {
    const header = document.createElement("h2");
    header.innerText = name;
    return header;
}

function loadBooks() {
    const [booksList, VerseSelectScreenHeader] = getElementsByIds("booksList", "VerseSelectScreenHeader");
    booksList.innerHTML = '';
    VerseSelectScreenHeader.innerText = "Select Book";

    const sections = [
        ["Pentateuch (Law)", 0, 5],
        ["Historical Books", 5, 17],
        ["Poetry & Wisdom", 17, 22],
        ["Major Prophets", 22, 27],
        ["Minor Prophets", 27, 39],
        ["Gospels & Acts", 39, 44],
        ["Pauline Epistles", 44, 57],
        ["General Epistles & Revelation", 57, 66]
    ];

    sections.forEach(([name, start, end]) => {
        booksList.appendChild(createSectionHeader(name));
        for (let i = start; i < end; i++) {
            booksList.appendChild(new BibleRef(booksOfTheBible[i], 1, 0).BookNameElement);
        }
    });

    toggleDisplay(["booksList"], ["Lookup", "chapterList", "verseList"]);
}

function loadChapters(event) {
    const [chapterList, VerseSelectScreenHeader] = getElementsByIds("chapterList", "VerseSelectScreenHeader");
    const Book = event.currentTarget.dataset.Book;
    chapterList.innerHTML = '';
    VerseSelectScreenHeader.innerText = "Select Chapter";

    Bible[Book].slice(1).forEach((_, index) => {
        chapterList.appendChild(new BibleRef(Book, index + 1, 0).ChapterNumberElement);
    });

    toggleDisplay(["chapterList"], ["Lookup", "booksList", "verseList"]);
}

function loadVerses(event) {
    const [verseList, VerseSelectScreenHeader] = getElementsByIds("verseList", "VerseSelectScreenHeader");
    const { Book, Chap } = event.currentTarget.dataset;
    verseList.innerHTML = '';
    VerseSelectScreenHeader.innerText = "Select Verse";

    Bible[Book][Chap].forEach((_, index) => {
        verseList.appendChild(new BibleRef(Book, Chap, index).VerseNumberElement);
    });

    toggleDisplay(["verseList"], ["Lookup", "booksList", "chapterList"]);
}

function goToBibleReference(distanceThrough) {
    if (distanceThrough < 0 || distanceThrough > 1) {
        throw new Error("Distance must be between 0 and 1.");
    }
    const targetWord = Math.floor(distanceThrough * Biblewordcount);
    for (const book of booksOfTheBible) {
        const chapters = Biblewordcounts[book];
        for (let i = 0; i < chapters.length - 1; i++) {
            if (targetWord >= chapters[i] && targetWord < chapters[i + 1]) {
                const versePosition = Math.floor(((targetWord - chapters[i]) / (chapters[i + 1] - chapters[i])) * Bible[book][i + 1].length);
                return new BibleRef(book, i + 1, versePosition);
            }
        }
    }
    const lastBook = booksOfTheBible[booksOfTheBible.length - 1];
    const lastChapterIndex = Bible[lastBook].length - 1;
    const lastVerseIndex = Bible[lastBook][lastChapterIndex].length - 1;
    return new BibleRef(lastBook, lastChapterIndex, lastVerseIndex);
}

/**
 * 
 * Main Reading screen
 * 
 * */


let viewingVerse;
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
            BibleRef.ShowPreviousChapter(viewingVerse);
        },
        onScrollPastBottom: () => {
            BibleRef.ShowNextChapter(viewingVerse);
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

let bibleSearchInstance = null;
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
            searchInput.value = query2?.replace(/\b\w/g, char => char.toUpperCase());
            topicShowing = query2;
        }

        if (TopicDescriptionList && TopicDescriptionList[query2]) {
            const TopicDescription = document.createElement("div");
            TopicDescription.className = "TopicDescription";
            TopicDescription.innerHTML = TopicDescriptionList[query2].replace(
                // Updated regex: capture optional end verse (group 4)
                /\(?\b([1-3]?\s?[A-Za-z]+)\s+(\d{1,3}):(\d{1,3})(?:-?(\d{1,3}))?\)?/g,
                (match, book, chapter, verse, endVerse) => {

                    if (endVerse) {
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
            ).replace("Biblical Explanation", "Biblical Explanation by a bot");
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

    // Clear existing options and add the default 'All Tags' option
    tagFilter.replaceChildren(new Option('All Tags', 'all__pg'));

    // Add other tags using the add method
    bookmarkStore.listAllTags().forEach(tag => {
        tagFilter.add(new Option(tag, tag));
    });
}

function loadBookmarks(tag = 'all__pg') {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';
    const verses = tag === 'all__pg' ? bookmarkStore.getAllVerses() : bookmarkStore.getVersesByTag(tag);

    if (verses.length === 0) {
        document.querySelector('.empty-state').style.display = 'block';
        return;
    }

    document.querySelector('.empty-state').style.display = 'none';
    verses.forEach(verse => {
        bookmarksList.appendChild(verse.SearchElement);
    });
}

function openAllBookmarks() {
    const tag = document.getElementById('tagFilter').value;
    const verses = tag === 'all__pg' ? bookmarkStore.getAllVerses() : bookmarkStore.getVersesByTag(tag);
    VersesOpen.push(...verses);
    loadVerseListScreen();
}


/**
 * 
 *  Contextual Interaction Screen
 * 
 * */

function loadVerseContextualInteractionScreen(theVerse) {
    viewingVerse = theVerse;
    const [noteEditor, selectedVerseText, crossReferencesList, containerElement] = getElementsByIds(
        "noteEditor", "selectedVerseText", "crossReferencesList", "container"
    );

    // Display the selected verse
    selectedVerseText.innerHTML = "";
    const theVerseElament = theVerse.singleVerseElement;
    theVerseElament.oncontextmenu = BibleRef.copy;
    selectedVerseText.appendChild(theVerseElament);

    // Load existing note
    const existingNote = notes.find(verse => theVerse.isEqual(verse.BibleVerse));
    noteEditor.value = existingNote?.Note || "";

    // Load cross-references
    crossReferencesList.innerHTML = "<h1>Related Verses</h1>";
    BibleCrossReferences[theVerse.Book]?.[theVerse.Chap]?.[theVerse.Verse + 1]
        ?.sort((a, b) => b.color - a.color)
        .forEach(Ref =>
            crossReferencesList.appendChild(Ref.CrossRefElement)
        );

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

    const selectedTags = new Set(bookmarkStore.getTagsByVerse(viewingVerse));

    bookmarkStore.listAllTags().forEach(tag => {
        const tagItem = document.createElement('div');
        tagItem.className = `tag-item${selectedTags.has(tag) ? ' selected' : ''}`;
        tagItem.textContent = tag;
        tagItem.dataset.tag = tag;

        tagItem.addEventListener('click', () => {
            selectedTags.has(tag) ? bookmarkStore.removeTag(viewingVerse, tag) : bookmarkStore.addTag(viewingVerse, tag);
            populateTagList();
        });

        tagList.appendChild(tagItem);
    });

    const addTagItem = Object.assign(document.createElement('input'), {
        type: 'text',
        inputMode: 'search',
        className: 'tag-item',
        placeholder: 'add tag',
        value: ''
    });

    const addTag = (e) => {
        const newTag = e.currentTarget.value.trim();
        if (newTag) {
            bookmarkStore.addTag(viewingVerse, newTag);
            populateTagList();
        }
    };

    addTagItem.addEventListener('keydown', e => e.key === 'Enter' && addTag(e));
    addTagItem.addEventListener('blur', addTag);

    tagList.appendChild(addTagItem);
}

function saveChanges() {
    const noteEditor = document.getElementById('noteEditor');
    const note = noteEditor.value.trim();
    const theVerse = viewingVerse;
    if (note.length == 0) {
        notes = notes.filter(note => !note.BibleVerse.isEqual(theVerse));
        console.log("Note deleted");
        return;
    }
    notes.forEach(note => {
        if (note.BibleVerse.isEqual(theVerse)) {
            note.Note = noteEditor.value;
            return;
        }
    });
    notes.push(new BibleNote(viewingVerse, note));
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

function setUpShareScreen() {
    const shareScreen = document.getElementById("Version_Number");
    shareScreen.innerHTML = `Running Version: ${VERSION}`;
    navigateToScreen(10);
}
