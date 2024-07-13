var booksOfTheBible = ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "1 SAMUEL", "2 SAMUEL", "1 KINGS", "2 KINGS", "1 CHRONICLES", "2 CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "SONG SOLOMON", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "1 CORINTHIANS", "2 CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "1 THESSALONIANS", "2 THESSALONIANS", "1 TIMOTHY", "2 TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "1 PETER", "2 PETER", "1 JOHN", "2 JOHN", "3 JOHN", "JUDE", "REVELATION"];
const BookShortNames = ["Gen", "Exod", "Lev", "Num", "Deut", "Josh", "Judg", "Ruth", "1Sam", "2Sam", "1Kgs", "2Kgs", "1Chr", "2Chr", "Ezra", "Neh", "Esth", "Job", "Ps", "Prov", "Eccl", "Song", "Isa", "Jer", "Lam", "Ezek", "Dan", "Hos", "Joel", "Amos", "Obad", "Jonah", "Mic", "Nah", "Hab", "Zeph", "Hag", "Zech", "Mal", "Matt", "Mark", "Luke", "John", "Acts", "Rom", "1Cor", "2Cor", "Gal", "Eph", "Phil", "Col", "1Thess", "2Thess", "1Tim", "2Tim", "Titus", "Phlm", "Heb", "Jas", "1Pet", "2Pet", "1John", "2John", "3John", "Jude", "Rev"];
const BibleSearch = {};
var VersesInview = [];
var currentverseviewing;
var BibleCrossReferences = {};
VersesOpen.push(new BibleRef("GENESIS", 1, 0));
VersesOpen.push(new BibleRef("JOHN", 3, 15));
VersesOpen.push(new BibleRef("PSALMS", 23, 1));
VersesOpen.push(new BibleRef("1 CORINTHIANS", 13, 3));
VersesOpen.push(new BibleRef("PHILIPPIANS", 4, 12));
VersesOpen.push(new BibleRef("ROMANS", 8, 27));
var notes = [];
function loadVerseListScreen() {
    VersesInviewindex = 0;
    VersesInview = [];
    var verseList = document.getElementById('OPverseList');
    verseList.innerText = "";
    for (var i = 0; i < VersesOpen.length; i++) {
        verseList.appendChild(VersesOpen[i].VerseSwipeLink());
    }
    //alert(VersesOpen.length);
    navigateToScreen(1);
};
function loadVerseSelectionScreen() {
    document.getElementById("oldTestamentBtn").style.display = "";
    document.getElementById("newTestamentBtn").style.display = "";
    document.getElementById("booksList").style.display = "none";
    document.getElementById("chapterList").style.display = "none";
    document.getElementById("verseList").style.display = "none";
    GetRelevantVerses();
    navigateToScreen(2);
};
function loadDetailedVerseReadingScreen(TheTitle, TheContent, Verse) {
    var textDisplayArea = document.getElementById('textDisplayArea')
    textDisplayArea.innerText = "";
    textDisplayArea.appendChild(TheContent);
    document.getElementById("chapterTitle").innerText = TheTitle;
    navigateToScreen(3);
    ScrollToVerse(Verse);
};
function loadSearchScreen() {
    navigateToScreen(4);
};
function loadHistoryScreen() {
    navigateToScreen(5);
};
function loadBookmarksScreen() {
    navigateToScreen(6);
};
function loadVerseContextualInteractionScreen(theVerse) {
    //var theVerse = new BibleRef(Book, Chap, Verse);
    currentverseviewing = theVerse;
    var TheVerse = document.createElement("div");
    TheVerse.className = "BibleContents";
    TheVerse.appendChild(theVerse.Element());

    // Create a new span element for the Bible reference
    var referenceSpan = document.createElement("span");
    referenceSpan.className = "BibleReference";
    referenceSpan.textContent = theVerse.RefText();
    let notetoload = notes.filter(verse => (verse.BibleVerse.Book === theVerse.Book && verse.BibleVerse.Chap === theVerse.Chap && verse.BibleVerse.Verse === theVerse.Verse));
    document.getElementById('noteEditor').value = "";
    if (notetoload.length > 0) {
        document.getElementById('noteEditor').value = notetoload[0].Note;
    }

    // Append the reference span to the TheVerse div
    TheVerse.appendChild(referenceSpan);
    document.getElementById("selectedVerseText").innerText = "";
    document.getElementById("selectedVerseText").appendChild(TheVerse);
    try {
        const refBookShortForm = BookShortNames[booksOfTheBible.indexOf(currentverseviewing.Book)];
        versesRefs = BibleCrossReferences[refBookShortForm][currentverseviewing.Chap + 1][currentverseviewing.Verse + 1];
        versesRefs.forEach((ref, index) => {
            const refBookLongForm = booksOfTheBible[ref[0]];
            const RefVerse = new BibleRef(refBookLongForm, ref[1], ref[2] - 1);
            document.getElementById("crossReferencesList").appendChild(RefVerse.SearchElement());
        });
    } catch (e) { }
	window.scrollTo(0, 0);
    navigateToScreen(7);
};


//var loadScreen=
function navigateToScreen(screenId) {
    // Logic to hide all screens and show the selected one
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById(`screen${screenId}`).style.display = 'flex';
    //loadScreen
}

function GetRelevantVerses() {
    const versesRefs = [];

    // Collect relevant verse references
    VersesOpen.forEach(verse => {
        const refBookShortForm = BookShortNames[booksOfTheBible.indexOf(verse.Book)];
        const chapterRefs = BibleCrossReferences[refBookShortForm]?.[verse.Chap + 1];
        const verseRefs = chapterRefs?.[verse.Verse + 1];

        if (verseRefs) {
            versesRefs.push(...verseRefs);
        }
    });

    // Merge duplicate references
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

    // Sort references by relevance
    versesRefs.sort((a, b) => a[3] - b[3]);

    const isVerseInVersesOpen = (R) => {
        return VersesOpen.some(openVerse =>
            openVerse.Book === R.Book && openVerse.Chap === R.Chap && openVerse.Verse === R.Verse
        );
    };


    // Convert short book names to long form
    versesRefs.forEach((ref, index) => {
        const refBookLongForm = booksOfTheBible[ref[0]];
        versesRefs[index] = new BibleRef(refBookLongForm, ref[1], ref[2] - 1);
    });

    // Display the verses
    const verseList = document.getElementById('booksList');
    verseList.innerText = "";
    versesRefs.forEach(ref => {
        if (!isVerseInVersesOpen(ref))
            verseList.appendChild(ref.SearchElement());
    });

    document.getElementById("booksList").style.display = "";
}

function Load() {

    // Initialize the variable to store the cross-references

    // Function to load the JSON file
    async function loadBibleCrossReferences() {
        try {
            const response = await fetch('./index_files/BibleCRef.json'); // Replace with the correct path to your JSON file
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            BibleCrossReferences = await response.json();
            console.log('BibleCrossReferences loaded:', BibleCrossReferences);
            //alert(BibleCrossReferences["Gen"][1][1]);
        } catch (error) {
            console.error('Failed to load BibleCRef.json:', error);
        }
    }

    // Call the function to load the JSON file
    loadBibleCrossReferences();

    // JavaScript interactions for Screen 1

    document.getElementById('searchBtn').onclick = loadSearchScreen;

    document.getElementById('historyBtn').onclick = loadHistoryScreen;

    document.getElementById('bookmarksBtn').onclick = loadBookmarksScreen;

    document.getElementById('addVerseBtn').onclick = loadVerseSelectionScreen;

    // JavaScript interactions for Screen 2
    // Event listeners for Testament buttons

    document.getElementById('backButton1').onclick = loadVerseListScreen;

    document.getElementById('oldTestamentBtn').addEventListener('click', () => loadBooks('Old'));
    document.getElementById('newTestamentBtn').addEventListener('click', () => loadBooks('New'));

    // Load books based on Testament selection
    function loadBooks(testament) {
        const booksList = document.getElementById('booksList');
        booksList.innerHTML = ''; // Clear previous entries
        if (testament == "Old") {
            for (var i = 0; i < 39; i++) {
                const button = document.createElement('span');
                button.textContent = booksOfTheBible[i];
                button.className = 'verse-nav-button';
                button.dataset.Book = booksOfTheBible[i];  //store some values in the HTML DOM for recall by event handlers
                button.onclick = loadChapters;
                booksList.appendChild(button);
            }
        } else {
            for (var i = 39; i < 66; i++) {
                const button = document.createElement('span');
                button.textContent = booksOfTheBible[i];
                button.className = 'verse-nav-button';
                button.dataset.Book = booksOfTheBible[i];  //store some values in the HTML DOM for recall by event handlers
                button.onclick = loadChapters;
                booksList.appendChild(button);
            }
        }
        document.getElementById("oldTestamentBtn").style.display = "none";
        document.getElementById("newTestamentBtn").style.display = "none";
        document.getElementById("booksList").style.display = "";
        document.getElementById("chapterList").style.display = "none";
        document.getElementById("verseList").style.display = "none";
    }

    // Load chapters of a selected book
    function loadChapters(event) {
        const chapterList = document.getElementById('chapterList');
        chapterList.innerHTML = '';
        var Book = event.currentTarget.dataset.Book;
        Bible[Book].forEach((_, index) => {
            if (index > 0) {  // Skip the book description
                const button = document.createElement('span');
                button.textContent = `${index}`;
                button.className = 'verse-nav-button';
                button.dataset.Book = Book;  //store some values in the HTML DOM for recall by event handlers
                button.dataset.Chap = index;
                button.onclick = loadVerses;
                chapterList.appendChild(button);
            }
        });
        document.getElementById("oldTestamentBtn").style.display = "none";
        document.getElementById("newTestamentBtn").style.display = "none";
        document.getElementById("booksList").style.display = "none";
        document.getElementById("chapterList").style.display = "";
        document.getElementById("verseList").style.display = "none";
    }

    // Load verses of a selected chapter
    function loadVerses(event) {
        const verseList = document.getElementById('verseList');
        verseList.innerHTML = '';
        var Book = event.currentTarget.dataset.Book;
        var Chap = event.currentTarget.dataset.Chap * 1;
        Bible[Book][Chap].forEach((Verse, index) => {
            const verselink = new BibleRef(Book, Chap, index);
            verseList.appendChild(verselink.VerseNumber());
            // const button = document.createElement('button');
            // button.textContent = `Verse ${index + 1}`;
            // button.className = 'list-item-button';
            // button.dataset.Book = Book;  //store some values in the HTML DOM for recall by event handlers
            // button.dataset.Chap = Chap;
            // button.dataset.Verse = index;
            // button.onclick = (e) => {
            //     AddThisVerse(e);
            //     loadVerseListScreen();
            // };
            // verseList.appendChild(button);
        });
        //alert([Book,Chap]);
        document.getElementById("oldTestamentBtn").style.display = "none";
        document.getElementById("newTestamentBtn").style.display = "none";
        document.getElementById("booksList").style.display = "none";
        document.getElementById("chapterList").style.display = "none";
        document.getElementById("verseList").style.display = "";
    }

    // Display the selected verse
    function displayVerse() {
        alert(sessionStorage.getItem('selectedVerse'));
    }



    // JavaScript interactions for Screen 3
    document.getElementById('backButton2').onclick = loadVerseListScreen;


    // Night mode toggle
    document.getElementById('nightModeToggle').addEventListener('click', () => {
        const body = document.body;
        body.classList.toggle('light-theme');
    });

    // Implement pinch to zoom functionality
    let fontSize = 18;
    let oldFontSize = 0;
    let initialDistance = null;
    let verseScrolledTo = 0;

    const zoomArea = document.getElementById('textDisplayArea');

    function getDistance(touches) {
        const [touch1, touch2] = touches;
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoomArea.addEventListener('touchstart', (e) => {
        if (e.touches.length === 2) { // Check if two fingers are used for touch
            initialDistance = getDistance(e.touches);
            oldFontSize = fontSize;
            verseScrolledTo = getVerseScroll();
        }
    });

    zoomArea.addEventListener('touchmove', (e) => {
        if (e.touches.length === 2 && initialDistance !== null) {
            e.preventDefault(); // Prevent the default action (scroll / zoom)
            const currentDistance = getDistance(e.touches);
            if (currentDistance !== initialDistance) {
                const zoomFactor = currentDistance / initialDistance;
                console.log(`Zoom factor: ${zoomFactor}`);
                fontSize = oldFontSize * zoomFactor;
                fontSize = Math.min(24, Math.max(12, fontSize)); // Clamp font size between 12 and 24
                zoomArea.style.fontSize = `${fontSize}px`;
                ScrollToVerse(verseScrolledTo);
            }
        }
    });

    zoomArea.addEventListener('touchend', () => {
        if (e.touches.length < 2) {
            initialDistance = null; // Reset initial distance on finger release
        }
    });

    zoomArea.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            initialDistance = null; // Reset initial distance on finger release
        }
    });

    // JavaScript interactions for Screen 4
    let bibleSearchInstance = new BibleSearchClass("", "Phrase", false, false, "i");
    var query = "";
    let insearchstart=false;

    // JavaScript interactions for Screen 4
    document.getElementById('searchInput').addEventListener('input', (event) => {
        query = event.target.value;
        updateSearchResults(query);
    });

    document.getElementById('clearSearchButton').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
        bibleSearchInstance.reset(); // Reset the search instance
        query = "";
    });

    // Implement voice search functionality (if applicable)
    document.getElementById('voiceSearchButton').addEventListener('click', () => {
        // Trigger speech to text
        // After getting the voice input, call updateSearchResults with the input text
        const voiceInput = "voice detected text"; // Replace with actual voice input
        document.getElementById('searchInput').value = voiceInput;
        updateSearchResults(voiceInput);
    });

    function updateSearchResults(query) {
        insearchstart=true;
        // Update the search instance with the new query
        bibleSearchInstance = new BibleSearchClass(query, "Phrase", false, false, "i");
        //bibleSearchInstance.reset(); // Ensure a fresh search each time
        //bibleSearchInstance.searchFor = query;
        //bibleSearchInstance.setupSearch();

        // Perform the search
        const results = bibleSearchInstance.search(query);

        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = ''; // Clear previous results
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement());
        });
    }

    function loadMoreResults() {
        if (query) {
            if (bibleSearchInstance.MAX_RESULTS == 20) {
                bibleSearchInstance.MAX_RESULTS = 10000;
                // Fetch the next set of results
                const results = bibleSearchInstance.search(query);

                const resultsContainer = document.getElementById('searchResults');
                resultsContainer.innerHTML = ''; // Clear previous results
                results.forEach(result => {
                    resultsContainer.appendChild(result.SearchElement());
                });
            }
        }
    }

    window.addEventListener('scroll', () => {
        //if (insearchstart) {
            // User has scrolled to the bottom
            loadMoreResults();
            insearchstart=false;
        //}
    });


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
    preprocessBible();



    function simulateSearch(query) {
        const MAX_RESULTS = 20; // Define the maximum number of results
        const results = [];
        const lowerCaseQuery = query.toLowerCase(); // Convert query to lowercase once

        outerLoop: for (const B in BibleSearch) { // Iterate through each book
            const chapters = BibleSearch[B];
            for (let C = 1; C < chapters.length; C++) { // Iterate through each chapter
                const verses = chapters[C];
                for (let V = 0; V < verses.length; V++) { // Iterate through each verse
                    if (verses[V].includes(lowerCaseQuery)) { // Check if the verse includes the query
                        results.push(new BibleRef(B, C, V)); // Add the result
                        results[results.length - 1].SearchQ = lowerCaseQuery;
                        if (results.length >= MAX_RESULTS) { // Check if max results are reached
                            break outerLoop; // Break out of all loops
                        }
                    }
                }
            }
        }

        return results;
    }


    // JavaScript interactions for Screen 5
    document.getElementById('backButton3').onclick = loadVerseListScreen;

    // Function to load history from local storage or a database
    function loadHistory() {
        const history = getHistory(); // Placeholder for fetching history data
        const timeline = document.getElementById('timeline');
        const list = document.getElementById('history-list');
        if (history.length === 0) {
            document.querySelector('.no-history-message').style.display = 'block';
        } else {
            history.forEach(entry => {
                // Add timeline marker
                const marker = document.createElement('div');
                marker.textContent = entry.date; // Use more descriptive or visual markers as needed
                timeline.appendChild(marker);

                // Add list entry
                const listItem = document.createElement('div');
                listItem.textContent = `${entry.date} - ${entry.verse}`;
                listItem.addEventListener('click', () => {
                    // Open full passage in Screen 3
                });
                list.appendChild(listItem);
            });
        }
    }

    // Sample function to simulate history data fetching
    function getHistory() {
        return [
            { date: '2023-05-01', verse: 'John 3:16', snippet: 'For God so loved the world...' },
            { date: '2023-05-02', verse: 'Genesis 1:1', snippet: 'In the beginning God created the heaven and the earth...' }
        ];
    }

    document.getElementById('startReadingButton').addEventListener('click', () => {
        // Navigate to a suggested starting point or daily verse
    });



    // JavaScript interactions for Screen 6
    document.getElementById('backButton4').onclick = loadVerseListScreen;

    document.getElementById('categoryFilter').addEventListener('change', (event) => {
        filterBookmarksByCategory(event.target.value);
    });

    function loadBookmarks() {
        const bookmarks = getBookmarks(); // Placeholder for fetching bookmark data
        const list = document.getElementById('bookmarksList');
        if (bookmarks.length === 0) {
            document.querySelector('.empty-state').style.display = 'block';
        } else {
            bookmarks.forEach(bookmark => {
                const listItem = document.createElement('li');
                listItem.textContent = `${bookmark.verse} - ${bookmark.snippet}`;
                listItem.style.borderColor = bookmark.color; // Color-coded by category
                listItem.addEventListener('click', () => {
                    // Open full passage in Screen 3
                    loadDetailedVerseReadingScreen();
                });
                list.appendChild(listItem);
            });
        }
    }

    function getBookmarks() {
        return [
            { verse: 'Psalm 23:1', snippet: 'The Lord is my shepherd...', color: 'green' },
            { verse: 'John 3:16', snippet: 'For God so loved the world...', color: 'blue' }
        ];
    }

    document.getElementById('findVerseButton').onclick = loadDetailedVerseReadingScreen;
    // Function to filter bookmarks based on selected category
    function filterBookmarksByCategory(category) {
        // Placeholder function to demonstrate filtering logic
    }

    // Sample call to load bookmarks on page load
    loadBookmarks();


    // JavaScript interactions for Screen 7
    document.getElementById('addNewLabel').addEventListener('click', () => {
        const newLabel = prompt("Enter new label name:");
        const dropdown = document.getElementById('bookmarkDropdown');
        const option = document.createElement('option');
        option.value = newLabel.toLowerCase();
        option.text = newLabel;
        dropdown.appendChild(option);
    });

    document.getElementById('crossReferenceSearch').addEventListener('input', (event) => {
        updateCrossReferences(event.target.value);
    });

    document.getElementById('saveChanges').addEventListener('click', () => {
        theVerse = currentverseviewing;
        for (let a = 0; a < notes.length; a++) {
            if (notes[a].BibleVerse.Book === theVerse.Book && notes[a].BibleVerse.Chap === theVerse.Chap && notes[a].BibleVerse.Verse === theVerse.Verse) {
                notes[a] = new BibleNote(currentverseviewing, document.getElementById('noteEditor').value);
                return;
            }
        }
        notes.push(new BibleNote(currentverseviewing, document.getElementById('noteEditor').value));
        // Save changes logic
        //alert('Changes saved!');
        loadVerseListScreen();
    });

    document.getElementById('closeMenu').addEventListener('click', () => {
        // Close Screen 7
        loadVerseListScreen();
    });

    document.getElementById('moreOptions').addEventListener('click', () => {
        // Show more options such as share, copy, etc.
    });

    function updateCrossReferences(query) {
        // Simulate fetching cross references based on the query
        const results = ['Psalm 23:1 - The Lord is my shepherd', 'Ephesians 2:8 - For by grace you have been saved...']; // Placeholder
        const list = document.getElementById('crossReferencesList');
        list.innerHTML = '';
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result;
            list.appendChild(li);
        });
    }
    loadVerseListScreen();
    document.getElementById("loadingScreen").style.display="none";
}
