
function setupEventListeners() {
    // Screen 1
    document.getElementById('searchBtn').onclick = loadSearchScreen;
    document.getElementById('historyBtn').onclick = loadHistoryScreen;
    document.getElementById('bookmarksBtn').onclick = loadBookmarksScreen;
    document.getElementById('addVerseBtn').onclick = loadVerseSelectionScreen;

    // Screen 2
    document.getElementById('backButton1').onclick = loadVerseListScreen;
    document.getElementById('oldTestamentBtn').addEventListener('click', () => loadBooks('Old'));
    document.getElementById('newTestamentBtn').addEventListener('click', () => loadBooks('New'));

    // Screen 3
    document.getElementById('backButton2').onclick = loadVerseListScreen;
    document.getElementById('textDisplayArea').addEventListener('touchstart', handleTouchStart);
    document.getElementById('textDisplayArea').addEventListener('touchmove', handleTouchMove);
    document.getElementById('textDisplayArea').addEventListener('touchend', handleTouchEnd);
    document.getElementById('theme-selector').addEventListener('change', function () {
        document.body.className = this.value;
    });

    // Screen 4
    document.getElementById('searchInput').addEventListener('input', (event) => updateSearchResults(event.target.value));
    document.getElementById('clearSearchButton').addEventListener('click', () => updateSearchResults(''));

    window.addEventListener('scroll', loadMoreResults);

    // Screen 5
    document.getElementById('backButton3').onclick = loadVerseListScreen;

    // Screen 6
    document.getElementById('backButton4').onclick = loadVerseListScreen;
    document.getElementById('categoryFilter').addEventListener('change', (event) => filterBookmarksByCategory(event.target.value));
    document.getElementById('findVerseButton').onclick = loadDetailedVerseReadingScreen;

    // Screen 7
    document.getElementById('addNewLabel').addEventListener('click', addNewLabel);
    document.getElementById('crossReferenceSearch').addEventListener('input', (event) => updateCrossReferences(event.target.value));
    document.getElementById('saveChanges').addEventListener('click', saveChanges);
    document.getElementById('closeMenu').addEventListener('click', loadVerseListScreen);
    document.getElementById('moreOptions').addEventListener('click', () => {
        // Show more options such as share, copy, etc.
    });
}
