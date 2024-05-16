var VersesOpen=[];
function loadVerseListScreen(){
    for(var i=0;i<VersesOpen.length;i++){
        document.getElementById('verseList').appendChild(VersesOpen.VerseSwipeLink());
    }
    navigateToScreen( 1);
};
function loadVerseSelectionScreen(){
    navigateToScreen( 2);
};
function loadDetailedVerseReadingScreen(){
    navigateToScreen( 3);
};
function loadSearchScreen(){
    navigateToScreen( 4);
};
function loadHistoryScreen(){
    navigateToScreen( 5);
};
function loadBookmarksScreen(){
    navigateToScreen( 6);
};
function loadVerseContextualInteractionScreen(){
    navigateToScreen(7);
};
//var loadScreen=
function navigateToScreen(screenId) {
    // Logic to hide all screens and show the selected one
    document.querySelectorAll('.screen').forEach(screen => screen.style.display = 'none');
    document.getElementById(`screen${screenId}`).style.display = 'block';
    //loadScreen
}


// JavaScript interactions for Screen 1

document.getElementById('searchBtn').addEventListener('click', () => {
    // Navigate to Screen 4
    loadSearchScreen();
});

document.getElementById('historyBtn').addEventListener('click', () => {
    // Navigate to Screen 5
    loadHistoryScreen();
});

document.getElementById('bookmarksBtn').addEventListener('click', () => {
    // Navigate to Screen 6
    loadBookmarksScreen();
});

document.getElementById('addVerseBtn').addEventListener('click', () => {
    // Navigate to Screen 2
    loadVerseSelectionScreen();
});

// Implementing interactions for the verse list
const verseList = document.getElementById('verseList');
verseList.addEventListener('click', (event) => {
    if (event.target.tagName === 'LI') {
        // Open full verse in Screen 3
    }
});
verseList.addEventListener('contextmenu', (event) => {
    event.preventDefault();
    if (event.target.tagName === 'LI') {
        // Open contextual menu (Screen 7) for bookmarking
    }
});


// JavaScript interactions for Screen 2
// Event listeners for Testament buttons
document.getElementById('oldTestamentBtn').addEventListener('click', () => {
    loadBooks('Old Testament');
});
document.getElementById('newTestamentBtn').addEventListener('click', () => {
    loadBooks('New Testament');
});

document.getElementById('backButton1').addEventListener('click', () => {
    // Return to Screen 1
    loadVerseListScreen();
});

// Dummy Bible data structure
const Bible = {
    "Genesis": [["Book description"], ["In the beginning God created the heaven and the earth.", "And the earth was without form, and void;"], ["Now the serpent was more subtil than any beast of the field which the Lord God had made."]],
    "Matthew": [["Book description"], ["The book of the generation of Jesus Christ, the son of David, the son of Abraham."]]
};

// Function to initialize the data
function initialize() {
    document.getElementById('oldTestamentBtn').addEventListener('click', () => loadBooks('Old'));
    document.getElementById('newTestamentBtn').addEventListener('click', () => loadBooks('New'));
    document.getElementById('confirmBtn').addEventListener('click', displayVerse);
}

// Load books based on Testament selection
function loadBooks(testament) {
    const booksList = document.getElementById('booksList');
    booksList.innerHTML = ''; // Clear previous entries
    Object.keys(Bible).forEach(book => {
        if ((testament === 'Old' && Bible[book][0][0].includes('Old Testament description')) ||
            (testament === 'New' && Bible[book][0][0].includes('New Testament description'))) {
            const button = document.createElement('button');
            button.textContent = book;
            button.className = 'list-item-button';
            button.onclick = () => loadChapters(book);
            booksList.appendChild(button);
        }
    });
}

// Load chapters of a selected book
function loadChapters(book) {
    const chapterList = document.getElementById('chapterList');
    chapterList.innerHTML = '';
    Bible[book].forEach((_, index) => {
        if (index > 0) {  // Skip the book description
            const button = document.createElement('button');
            button.textContent = `Chapter ${index}`;
            button.className = 'list-item-button';
            button.onclick = () => loadVerses(book, index);
            chapterList.appendChild(button);
        }
    });
}

// Load verses of a selected chapter
function loadVerses(book, chapter) {
    const verseList = document.getElementById('verseList');
    verseList.innerHTML = '';
    Bible[book][chapter].forEach((verse, index) => {
        const button = document.createElement('button');
        button.textContent = `Verse ${index + 1}`;
        button.className = 'list-item-button';
        button.onclick = () => {
            document.getElementById('confirmBtn').disabled = false;
            sessionStorage.setItem('selectedVerse', verse);
        };
        verseList.appendChild(button);
    });
}

// Display the selected verse
function displayVerse() {
    alert(sessionStorage.getItem('selectedVerse'));
}

// Initial setup
document.addEventListener('DOMContentLoaded', initialize);

// Confirm selection and navigate to Screen 3
document.getElementById('confirmBtn').addEventListener('click', () => {
    // Navigate to Screen 3
    loadDetailedVerseReadingScreen();
});

// Additional logic for managing chapter and verse selection


// JavaScript interactions for Screen 3
document.getElementById('backButton2').addEventListener('click', () => {
    // Return to Screen 1
    loadVerseListScreen();
});

// Implement pinch to zoom functionality
const textDisplayArea = document.getElementById('textDisplayArea');
let fontSize = 18;
textDisplayArea.addEventListener('gestureend', (event) => {
    if (event.scale < 1.0) {
        // User pinched together
        fontSize = Math.max(12, fontSize - 1);
    } else if (event.scale > 1.0) {
        // User pinched apart
        fontSize = Math.min(24, fontSize + 1);
    }
    textDisplayArea.style.fontSize = `${fontSize}px`;
});

// Night mode toggle
document.getElementById('nightModeToggle').addEventListener('click', () => {
    const body = document.body;
    body.classList.toggle('night-mode');
    body.style.backgroundColor = body.classList.contains('night-mode') ? '#333' : '#fff';
    textDisplayArea.style.color = body.classList.contains('night-mode') ? '#fff' : '#333';
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

// Bookmarking functionality
document.getElementById('bookmarkButton').addEventListener('click', () => {
    // Add bookmark logic here
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
        const resultDiv = document.createElement('div');
        resultDiv.textContent = result;
        resultDiv.addEventListener('click', () => {
            // Open result in Screen 3
        });
        resultsContainer.appendChild(resultDiv);
    });
}

function simulateSearch(query) {
    // Placeholder for search logic
    return ['Genesis 1:1 In the beginning...', 'John 3:16 For God so loved the world...'].filter(r => r.toLowerCase().includes(query.toLowerCase()));
}



// JavaScript interactions for Screen 5
document.getElementById('backButton3').addEventListener('click', () => {
    // Return to the main menu or previous screen
    loadVerseListScreen();
});

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
document.getElementById('backButton4').addEventListener('click', () => {
    // Return to the main menu or previous screen
    loadVerseListScreen();
});

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

document.getElementById('findVerseButton').addEventListener('click', () => {
    // Navigate to the search screen or a suggested verse
    loadDetailedVerseReadingScreen();
});

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
    // Save changes logic
    alert('Changes saved!');
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
