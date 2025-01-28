

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
	document.getElementById('addVerseBtn2').onclick = loadVerseSelectionScreen;

	// Screen 3
	document.getElementById('backButton2').onclick = loadVerseListScreen;
	document.getElementById('textDisplayArea').addEventListener('touchstart', handleTouchStart);
	document.getElementById('textDisplayArea').addEventListener('touchmove', handleTouchMove);
	document.getElementById('textDisplayArea').addEventListener('touchend', handleTouchEnd);

	// Screen 4
	document.getElementById('searchInput').addEventListener('input', (event) => updateSearchResults(event.target.value));
	document.getElementById('clearSearchButton').addEventListener('click', clearSearchResults);

	document.getElementById('container').addEventListener('scroll', loadMoreResults);

	// Screen 5
	document.getElementById('backButton3').onclick = loadVerseListScreen;

	// Screen 6
	document.getElementById('backButton4').onclick = loadVerseListScreen;
	document.getElementById('tagFilter').addEventListener('change', function () {
		loadBookmarks(this.value);
	});
	//document.getElementById('categoryFilter').addEventListener('change', (event) => filterBookmarksByCategory(event.target.value));
	//document.getElementById('findVerseButton').onclick = loadDetailedVerseReadingScreen;
    
	document.getElementById('backButton5').onclick = loadVerseListScreen;
	document.getElementById('SettingsBtn').onclick = loadSettings;
    
    

	// Screen 7
	//document.getElementById('addNewLabel').addEventListener('click', addNewLabel);
	document.getElementById('addBookmarkButton').addEventListener('click', function () {
		const tagList = document.getElementById('tagList');
		tagList.style.display = tagList.style.display === 'none' ? 'block' : 'none';
		if (tagList.style.display === 'block') {
			populateTagList();
		}
	});
    

	document.getElementById('crossReferenceSearch').addEventListener('input', (event) => updateCrossReferences(event.target.value));
	document.getElementById('saveChanges').addEventListener('click', saveChanges);
	document.getElementById('closeMenu').addEventListener('click', loadVerseListScreen);
	document.getElementById('moreOptions').addEventListener('click', () => {
		// Show more options such as share, copy, etc.
	});
}


class SwipeHandler {
    /**
     * @param {HTMLElement} element - The element to attach swipe listeners to.
     * @param {Object} options - Optional configuration.
     * @param {Function} options.onSwipeLeft - Callback for swipe left.
     * @param {Function} options.onSwipeRight - Callback for swipe right.
     */
    constructor(element, { onSwipeLeft, onSwipeRight } = {}) {
        this.element = element;
        this.onSwipeLeft = onSwipeLeft || null; // Null if not provided
        this.onSwipeRight = onSwipeRight || null; // Null if not provided

        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.endX = 0;
        this.endY = 0;
        this.threshold = 50; // Minimum swipe distance to trigger

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.addEventListeners();
    }

    addEventListeners() {
        this.element.addEventListener("touchstart", this.handleTouchStart);
        this.element.addEventListener("touchmove", this.handleTouchMove);
        this.element.addEventListener("touchend", this.handleTouchEnd);
    }

    removeEventListeners() {
        this.element.removeEventListener("touchstart", this.handleTouchStart);
        this.element.removeEventListener("touchmove", this.handleTouchMove);
        this.element.removeEventListener("touchend", this.handleTouchEnd);
    }

    handleTouchStart(event) {
        this.startX = event.touches[0].clientX;
        this.startY = event.touches[0].clientY;
        this.currentX = this.startX;
        this.element.style.transition = "none"; // Disable smooth transition for real-time updates
    }

    handleTouchMove(event) {
        const touch = event.touches[0];
        const distanceX = touch.clientX - this.startX;
        const distanceY = touch.clientY - this.startY;

        // Only move horizontally if horizontal movement is greater than vertical
        if (Math.abs(distanceX) > Math.abs(distanceY)) {
            this.currentX = distanceX;
            this.element.style.transform = `translateX(${distanceX}px)`;
        }
    }

    handleTouchEnd(event) {
        this.endX = event.changedTouches[0].clientX;
        this.endY = event.changedTouches[0].clientY;
        const distanceX = this.endX - this.startX;
        const distanceY = this.endY - this.startY;

        if (Math.abs(distanceX) > Math.abs(distanceY) && Math.abs(distanceX) > this.threshold) {
            if (distanceX > 0 && this.onSwipeRight) {
                this.onSwipeRight(event);
                this.animateSwipe("right");
            } else if (distanceX < 0 && this.onSwipeLeft) {
                this.onSwipeLeft(event);
                this.animateSwipe("left");
            } else {
                this.resetPosition(); // Reset if swipe direction is not active
            }
        } else {
            this.resetPosition(); // Reset position if no valid swipe
        }

        this.element.style.transition = "transform 0.3s ease"; // Re-enable smooth transition
    }

    animateSwipe(direction) {
        if (direction === "right" && this.onSwipeRight) {
            this.element.style.transition = "transform 0.3s ease-out";
            this.element.style.transform = "translateX(100vw)";
            setTimeout(() => {
                this.element.style.transform = "translateX(0)";
            }, 300);
        } else if (direction === "left" && this.onSwipeLeft) {
            this.element.style.transition = "transform 0.3s ease-out";
            this.element.style.transform = "translateX(-100vw)";
            setTimeout(() => {
                this.element.style.transform = "translateX(0)";
            }, 300);
        }
    }

    resetPosition() {
        this.element.style.transform = "translateX(0)";
    }

    destroy() {
        this.removeEventListeners();
    }
}


// Usage Example
//const element = document.getElementById("swipeable-element");
//const swipeHandler = new SwipeHandler(element, {
//  onSwipeLeft: () => console.log("Swiped left!"),
//  onSwipeRight: () => console.log("Swiped right!"),
//});
