var booksOfTheBible = ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY", "JOSHUA", "JUDGES", "RUTH", "1 SAMUEL", "2 SAMUEL", "1 KINGS", "2 KINGS", "1 CHRONICLES", "2 CHRONICLES", "EZRA", "NEHEMIAH", "ESTHER", "JOB", "PSALMS", "PROVERBS", "ECCLESIASTES", "SONG SOLOMON", "ISAIAH", "JEREMIAH", "LAMENTATIONS", "EZEKIEL", "DANIEL", "HOSEA", "JOEL", "AMOS", "OBADIAH", "JONAH", "MICAH", "NAHUM", "HABAKKUK", "ZEPHANIAH", "HAGGAI", "ZECHARIAH", "MALACHI", "MATTHEW", "MARK", "LUKE", "JOHN", "ACTS", "ROMANS", "1 CORINTHIANS", "2 CORINTHIANS", "GALATIANS", "EPHESIANS", "PHILIPPIANS", "COLOSSIANS", "1 THESSALONIANS", "2 THESSALONIANS", "1 TIMOTHY", "2 TIMOTHY", "TITUS", "PHILEMON", "HEBREWS", "JAMES", "1 PETER", "2 PETER", "1 JOHN", "2 JOHN", "3 JOHN", "JUDE", "REVELATION"];
var BibleSearch = Bible;
var VersesInview = [];
var currentverseviewing;
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

    navigateToScreen(7);
};
//var loadScreen=
function navigateToScreen(screenId) {
    // Logic to hide all screens and show the selected one
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById(`screen${screenId}`).style.display = 'flex';
    //loadScreen
}

function Load() {

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
                const button = document.createElement('button');
                button.textContent = booksOfTheBible[i];
                button.className = 'list-item-button';
                button.dataset.Book = booksOfTheBible[i];  //store some values in the HTML DOM for recall by event handlers
                button.onclick = loadChapters;
                booksList.appendChild(button);
            }
        } else {
            for (var i = 39; i < 66; i++) {
                const button = document.createElement('button');
                button.textContent = booksOfTheBible[i];
                button.className = 'list-item-button';
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
                const button = document.createElement('button');
                button.textContent = `Chapter ${index}`;
                button.className = 'list-item-button';
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
            const button = document.createElement('button');
            button.textContent = `Verse ${index + 1}`;
            button.className = 'list-item-button';
            button.dataset.Book = Book;  //store some values in the HTML DOM for recall by event handlers
            button.dataset.Chap = Chap;
            button.dataset.Verse = index;
            button.onclick = (e) => {
                AddThisVerse(e);
                loadVerseListScreen();
            };
            verseList.appendChild(button);
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

    // Implement pinch to zoom functionality
    const textDisplayArea = document.getElementById('textDisplayArea');
    var fontSize = 18;
    var oldfontsize=0;

    // Night mode toggle
    document.getElementById('nightModeToggle').addEventListener('click', () => {
        const body = document.body;
        body.classList.toggle('light-theme');
        //body.style.backgroundColor = body.classList.contains('night-mode') ? '#333' : '#fff';
        //textDisplayArea.style.color = body.classList.contains('night-mode') ? '#fff' : '#333';
    });

    const zoomArea = document.getElementById('textDisplayArea');
    let initialDistance = null;
    let versescrolledto=0;
    function getDistance(touches) {
        const touch1 = touches[0];
        const touch2 = touches[1];
        const dx = touch1.pageX - touch2.pageX;
        const dy = touch1.pageY - touch2.pageY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    zoomArea.addEventListener('touchstart', function (e) {
        if (e.touches.length === 2) { // Check if two fingers are used for touch
            initialDistance = getDistance(e.touches);
            oldfontsize=fontSize;
            versescrolledto=getVerseScroll();
        }
    });

    zoomArea.addEventListener('touchmove', function (e) {
        if (e.touches.length === 2 && initialDistance !== null) {
            e.preventDefault(); // Prevent the default action (scroll / zoom)
            const currentDistance = getDistance(e.touches);
            if (currentDistance !== initialDistance) {
                const zoomFactor = currentDistance / initialDistance;
                console.log(`Zoom factor: ${zoomFactor}`);
                fontSize=oldfontsize*zoomFactor;
                fontSize= Math.min(24, fontSize);
                fontSize= Math.max(12, fontSize);
                textDisplayArea.style.fontSize = `${fontSize}px`;
                //zoomArea.textContent = `Zoom factor: ${zoomFactor.toFixed(2)}`;
                ScrollToVerse(versescrolledto);
            }
        }
    });

    zoomArea.addEventListener('touchend', function (e) {
        if (e.touches.length < 2) {
            initialDistance = null; // Reset initial distance on finger release
        }
    });

    // Font size adjustments
    document.getElementById('zoomInButton').addEventListener('click', () => {
        fontSize = Math.min(24, fontSize + 1);
        textDisplayArea.style.fontSize = `${fontSize}px`;
    });
    document.getElementById('zoomOutButton').addEventListener('click', () => {
        fontSize = Math.max(12, fontSize - 1);
        textDisplayArea.style.fontSize = `${fontSize}px`;
    });

    // JavaScript interactions for Screen 4
    document.getElementById('searchInput').addEventListener('input', (event) => {
        const query = event.target.value;
        updateSearchResults(query);
    });

    document.getElementById('clearSearchButton').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = '';
    });

    // Implement voice search functionality (if applicable)
    document.getElementById('voiceSearchButton').addEventListener('click', () => {
        // Trigger speech to text
    });

    function updateSearchResults(query) {
        // Simulate fetching search results based on the query
        const results = simulateSearch(query); // This function should return search results
        const resultsContainer = document.getElementById('searchResults');
        resultsContainer.innerHTML = ''; // Clear previous results
        results.forEach(result => {
            resultsContainer.appendChild(result.SearchElement());
        });
    }

    function simulateSearch(query) {
        // Placeholder for search logic
        var results = [];
        for (Book in BibleSearch) {     //Books
            for (var C = 1; C < BibleSearch[Book].length; C++) {     //Chaps
                for (var V = 0; V < BibleSearch[Book][C].length; V++) {     //Verse
                    //if (this.SearchForCpt.test(BibleSearch[Book][C][V].toString()) > 0) {
                    if (BibleSearch[Book][C][V].toLowerCase().includes(query.toLowerCase())) {
                        results.push(new BibleRef(Book, C, V));
                        //this.FoundVerses.push(new BibleRef(Book, C, V));
                        //this.FoundVerses[this.FoundVerses.length - 1].index = this.SearchForCpt.test(BibleSearch[Book][C][V].toString());
                        //this.NoMatches++;
                        if (results.length > 19) {
                            return results;
                        }
                    }
                }
            }
        }
        return results;
        return ['Genesis 1:1 In the beginning...', 'John 3:16 For God so loved the world...'].filter(r => r.toLowerCase().includes(query.toLowerCase()));
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
}
