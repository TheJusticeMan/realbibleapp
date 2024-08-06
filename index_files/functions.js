const booksOfTheBible = ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "1 SAMUEL", "2 SAMUEL", "1 KINGS", "2 KINGS", "1 CHRONICLES", "2 CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "SONG SOLOMON", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "1 CORINTHIANS", "2 CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "1 THESSALONIANS", "2 THESSALONIANS", "1 TIMOTHY", "2 TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "1 PETER", "2 PETER", "1 JOHN", "2 JOHN", "3 JOHN", "JUDE", "REVELATION"];
const BookShortNames = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
let VersesInview = [];
let currentverseviewing;

function handleBackButton() {
    loadVerseListScreen();
}

function loadVerseListScreen() {
    VersesInviewIndex = 0;
    VersesInview = [];
    const verseList = document.getElementById('OPverseList');
    verseList.innerText = "";
    for (let i = 0; i < VersesOpen.length; i++) {
        verseList.appendChild(VersesOpen[i].SwipeLink);
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
    const textDisplayArea = document.getElementById('textDisplayArea');
    textDisplayArea.innerText = "";
    textDisplayArea.appendChild(TheContent);
    document.getElementById("chapterTitle").innerText = TheTitle;
    navigateToScreen(3);
    BibleRef.scrollToVerse(Verse);
}

function loadSearchScreen() {
    navigateToScreen(4);
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
    window.scrollTo(0, 0);
    populateTagList();
    navigateToScreen(7);
}

function navigateToScreen(screenId) {
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

function getDistance(touches) {
    const [touch1, touch2] = touches;
    const dx = touch1.pageX - touch2.pageX;
    const dy = touch1.pageY - touch2.pageY;
    return Math.sqrt(dx * dx + dy * dy);
}

function handleTouchStart(e) {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        oldFontSize = fontSize;
        verseScrolledTo = BibleRef.getVerseScroll();
    }
}

function handleTouchMove(e) {
    if (e.touches.length === 2 && initialDistance !== null) {
        e.preventDefault();
        const currentDistance = getDistance(e.touches);
        if (currentDistance !== initialDistance) {
            const zoomFactor = currentDistance / initialDistance;
            fontSize = oldFontSize * zoomFactor;
            fontSize = Math.min(24, Math.max(12, fontSize));
            document.getElementById('textDisplayArea').style.fontSize = `${fontSize}px`;
            BibleRef.scrollToVerse(verseScrolledTo);
        }
    }
}

function handleTouchEnd() {
    initialDistance = null;
}

let bibleSearchInstance = new BibleSearchClass("", "Phrase", false, false, "i");
let query = "";
let insearchstart = false;

function updateSearchResults(query2) {
    insearchstart = false;
    window.scrollTo(0, 0);
    const resultsContainer = document.getElementById('searchResults');
    if (query2 == "") {
        document.getElementById('searchInput').value = '';
        resultsContainer.innerHTML = '';
    } else {
        query = query2;
        insearchstart = true;
        bibleSearchInstance = new BibleSearchClass(query2, "Phrase", false, false, "i");
        const results = bibleSearchInstance.search(query2);
        resultsContainer.innerHTML = '';
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement);
        });
    }
}

function loadMoreResults() {
    if (query && bibleSearchInstance.MAX_RESULTS == 20 && insearchstart) {
        bibleSearchInstance.MAX_RESULTS = 10000;
        const results = bibleSearchInstance.search(query);
        const resultsContainer = document.getElementById('searchResults');
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
                BibleSearch[book][C][V] = verses[V].toLowerCase();
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

    const addTagItem = document.createElement('div');
    addTagItem.className = 'tag-item add-tag';
    addTagItem.textContent = '+';
    addTagItem.addEventListener('click', function () {
        const newTag = prompt("Enter new tag:");
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



