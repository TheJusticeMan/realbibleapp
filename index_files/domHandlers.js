function getElementsByIds(...ids) {
    return ids.map(id => document.getElementById(id) || null);
}

function addclickhandler(ID, Function) {
    //if ID and Function are arrays
    if (Array.isArray(ID) && Array.isArray(Function)) {
        for (let i = 0; i < ID.length; i++) {
            document.getElementById(ID[i]).addEventListener('click', Function[i]);
        }
        return;
    }
    document.getElementById(ID).addEventListener('click', Function);
    //document.getElementById(ID).onclick = Function;
}

function setupEventListeners() {
    // Screen 1
    addclickhandler('searchBtn', loadSearchScreen);
    addclickhandler('historyBtn', loadHistoryScreen);
    addclickhandler('bookmarksBtn', loadBookmarksScreen);
    addclickhandler('addVerseBtn', loadVerseSelectionScreen);
    addclickhandler('SettingsBtn', loadSettings);
    // Screen 2
    addclickhandler('backButton1', handleBackButton);
    addclickhandler('oldTestamentBtn', () => loadBooks('Old'));
    // Load Old Testament books
    addclickhandler('newTestamentBtn', () => loadBooks('New')); // Load New Testament books
    addclickhandler('addVerseBtn2', loadVerseSelectionScreen);
    // Screen 3
    addclickhandler('backButton2', loadVerseListScreen);
    // Screen 4
    document.getElementById('searchInput').addEventListener('input', (event) => updateSearchResults(event.target.value));
    addclickhandler('clearSearchButton', clearSearchResults);
    document.getElementById('container').addEventListener('scroll', loadMoreResults);
    // Screen 5
    addclickhandler('backButton3', handleBackButton);
    // Screen 6
    addclickhandler('backButton4', handleBackButton);
    document.getElementById('tagFilter').addEventListener('change', function () {
        loadBookmarks(this.value);
    });
    //addclickhandler('categoryFilter', (event) => filterBookmarksByCategory(event.target.value));
    addclickhandler('backButton5', handleBackButton);
    // Screen 7
    //addclickhandler('addNewLabel', addNewLabel);
    document.getElementById('crossReferenceSearch').addEventListener('input', (event) => updateCrossReferences(event.target.value));
    addclickhandler('closeMenu', handleBackButton);
    addclickhandler('ShareButton', () => { navigateToScreen(10) });
    addclickhandler('SyncButton', () => navigateToScreen(11));
    addclickhandler('backButton6', () => { navigateToScreen(9) });
    addclickhandler('ShareLink1', shareLink);
    //importDataFromClipboard
    //document.getElementById('container').innerHTML+=""
    // Screen 11
    addclickhandler('backButton7', handleBackButton);
    addclickhandler('ImportData', importDataFromClipboard);
    addclickhandler('CopySettingsLink', copyHistoryAndBookmarksToClipboard);
    addclickhandler('downloadData',downloadHistoryAndBookmarks)
    addclickhandler('uploadData',uploadHistoryAndBookmarks)
}

async function shareLink() {
    const shareData = {
        title: 'Real Bible App',
        text: 'Check out this Bible app!',
        url: 'https://thejusticeman.github.io/realbibleapp/'
    };

    try {
        await navigator.share(shareData);
        console.log("MDN shared successfully");
    } catch (err) {
        //copy "https://thejusticeman.github.io/realbibleapp/" to the clipboard
        navigator.clipboard.writeText(shareData.url).then(() => {
            console.LOG("Link copied to clipboard");
        }).catch(err => {
            console.error("Clipboard copy failed:", err);
        });
        console.log(`Error: ${err}`);
    }
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
        this._onSwipeLeft = onSwipeLeft || null;
        this._onSwipeRight = onSwipeRight || null;

        this.startX = 0;
        this.startY = 0;
        this.currentX = 0;
        this.endX = 0;
        this.endY = 0;
        this.threshold = 50; // Minimum swipe distance to trigger
        this.cycleSwipe = false;

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.updateEventListeners();
    }

    updateEventListeners() {
        this.removeEventListeners();
        if (this._onSwipeLeft || this._onSwipeRight) {
            this.addEventListeners();
        }
    }

    addEventListeners() {
        this.element.addEventListener("touchstart", this.handleTouchStart, { passive: true });
        this.element.addEventListener("touchmove", this.handleTouchMove, { passive: true });
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
        this.element.style.transition = "none";
    }

    handleTouchMove(event) {
        const touch = event.touches[0];
        const distanceX = touch.clientX - this.startX;
        const distanceY = touch.clientY - this.startY;

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
            if (distanceX > 0 && this._onSwipeRight) {
                this._onSwipeRight(event);
                this.animateSwipe("right");
            } else if (distanceX < 0 && this._onSwipeLeft) {
                this._onSwipeLeft(event);
                this.animateSwipe("left");
            } else {
                this.resetPosition();
            }
        } else {
            this.resetPosition();
        }

        this.element.style.transition = "transform 0.3s ease";
    }

    animateSwipe(direction) {
        this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
        this.element.style.opacity = "0";

        if (direction === "right" && this._onSwipeRight) {
            this.element.style.transform = "translateX(100vw)";
        } else if (direction === "left" && this._onSwipeLeft) {
            this.element.style.transform = "translateX(-100vw)";
        }

        setTimeout(() => {
            if (this.cycleSwipe) {
                // Place the element on the wrong side before bringing it back
                this.element.style.transition = "none"; // Disable transition to move instantly
                this.element.style.transform = direction === "right" ? "translateX(-100vw)" : "translateX(100vw)";

                // Allow reflow before applying transition back to original position
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-in";
                        this.element.style.transform = "translateX(0)";
                        this.element.style.opacity = "1";
                    });
                });
            } else {
                // Normal behavior
                this.element.style.transform = "translateX(0)";
                this.element.style.opacity = "1";
                this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-in";
            }
        }, 300);
    }

    resetPosition() {
        this.element.style.transform = "translateX(0)";
    }

    destroy() {
        this.removeEventListeners();
    }

    get onSwipeLeft() {
        return this._onSwipeLeft;
    }

    set onSwipeLeft(callback) {
        this._onSwipeLeft = callback;
        this.updateEventListeners();
    }

    get onSwipeRight() {
        return this._onSwipeRight;
    }

    set onSwipeRight(callback) {
        this._onSwipeRight = callback;
        this.updateEventListeners();
    }
}

class ScrollPastBoundsHandler {
    /**
     * @param {HTMLElement} element - The scrollable element to monitor.
     * @param {Object} options - Optional configuration.
     * @param {Function} options.onScrollPastTop - Callback when scrolling past the top.
     * @param {Function} options.onScrollPastBottom - Callback when scrolling past the bottom.
     */
    constructor(element, { onScrollPastTop, onScrollPastBottom } = {}) {
        this.element = element;
        this._onScrollPastTop = onScrollPastTop || null;
        this._onScrollPastBottom = onScrollPastBottom || null;

        this.startY = 0;
        this.currentY = 0;
        this.isAtTop = false;
        this.isAtBottom = false;
        this.buffer = 60; // Buffer for certain browsers
        this.cycleSwipe = false;
        this.threshold = 100;

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.updateEventListeners();
    }

    updateEventListeners() {
        this.removeEventListeners();
        if (this._onScrollPastTop || this._onScrollPastBottom) {
            this.addEventListeners();
        }
    }

    addEventListeners() {
        this.element.addEventListener("touchstart", this.handleTouchStart, { passive: true });
        this.element.addEventListener("touchmove", this.handleTouchMove, { passive: false });
        this.element.addEventListener("touchend", this.handleTouchEnd);
    }

    removeEventListeners() {
        this.element.removeEventListener("touchstart", this.handleTouchStart);
        this.element.removeEventListener("touchmove", this.handleTouchMove);
        this.element.removeEventListener("touchend", this.handleTouchEnd);
    }

    handleTouchStart(event) {
        if (event.touches.length > 1) return;

        this.startY = event.touches[0].pageY;
        const { scrollTop, offsetHeight, scrollHeight } = this.element;
        this.isAtTop = scrollTop <= 0;
        this.isAtBottom = scrollTop + offsetHeight >= scrollHeight - this.buffer;
    }

    handleTouchMove(event) {
        if (event.touches.length > 1) return;

        const { scrollTop, offsetHeight, scrollHeight } = this.element;
        if (!this.isAtTop && !this.isAtBottom && (scrollTop <= 0 || scrollTop + offsetHeight >= scrollHeight - this.buffer)) {
            this.handleTouchStart(event);
        }
        this.isAtTop = scrollTop <= 0;
        this.isAtBottom = scrollTop + offsetHeight >= scrollHeight - this.buffer;

        this.currentY = event.touches[0].pageY;
        const distance = this.currentY - this.startY;

        if ((this.isAtTop && distance > 0) || (this.isAtBottom && distance < 0)) {
            this.element.style.transition = "";
            this.element.style.transform = `translateY(${100 * (1 - Math.exp(-Math.abs(distance) / 200)) * Math.sign(distance)}px)`;
        }
    }

    handleTouchEnd() {
        this.element.style.transition = "transform 0.3s ease-out";
        this.element.style.transform = "none";
        if (this.isAtTop || this.isAtBottom) {
            const distance = this.currentY - this.startY;

            if (distance > this.threshold && this._onScrollPastTop && this.isAtTop) {
                this._onScrollPastTop();
                this.animateSwipe("down");
            }
            if (distance < -this.threshold && this._onScrollPastBottom && this.isAtBottom) {
                this._onScrollPastBottom();
                this.animateSwipe("up");
            }
            this.isAtTop = false;
            this.isAtBottom = false;
        }
    }

    animateSwipe(direction) {
        this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-out";
        this.element.style.opacity = "0";

        if (direction === "up") {
            this.element.style.transform = "translateY(-100vh)";
        } else if (direction === "down") {
            this.element.style.transform = "translateY(100vh)";
        }

        setTimeout(() => {
            if (this.cycleSwipe) {
                // Secretly place the element on the opposite side
                this.element.style.transition = "none";
                this.element.style.transform = direction === "up" ? "translateY(100vh)" : "translateY(-100vh)";

                // Allow reflow before applying transition
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-in";
                        this.element.style.transform = "translateY(0)";
                        this.element.style.opacity = "1";
                        this.element.addEventListener("transitionend", () => {
                            this.element.style.transition = "";
                            this.element.style.transform = "";
                        }, { once: true });
                    });
                });
            } else {
                // Normal return behavior
                this.element.style.transform = "translateY(0)";
                this.element.style.opacity = "1";
                this.element.style.transition = "transform 0.3s ease-out, opacity 0.3s ease-in";
            }
        }, 300);
    }

    destroy() {
        this.removeEventListeners();
    }

    get onScrollPastTop() {
        return this._onScrollPastTop;
    }

    set onScrollPastTop(callback) {
        this._onScrollPastTop = callback;
        this.updateEventListeners();
    }

    get onScrollPastBottom() {
        return this._onScrollPastBottom;
    }

    set onScrollPastBottom(callback) {
        this._onScrollPastBottom = callback;
        this.updateEventListeners();
    }
}

class ZoomHandler {
    /**
     * @param {HTMLElement} element - The element to attach zoom listeners to.
     * @param {Object} options - Optional configuration.
     * @param {Function} options.onZoomStart - Callback for when zooming starts.
     * @param {Function} options.onZoom - Callback for zooming with scale.
     * @param {Function} options.onZoomEnd - Callback when zooming ends.
     */
    constructor(element, { onZoomStart, onZoom, onZoomEnd } = {}) {
        this.element = element;
        this._onZoomStart = onZoomStart || null;
        this._onZoom = onZoom || null;
        this._onZoomEnd = onZoomEnd || null;

        this.initialDistance = 0;
        this.scale = 1;
        this.isZooming = false;

        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);

        this.updateEventListeners();
    }

    updateEventListeners() {
        this.removeEventListeners();
        if (this._onZoomStart || this._onZoom || this._onZoomEnd) {
            this.addEventListeners();
        }
    }

    addEventListeners() {
        this.element.addEventListener("touchstart", this.handleTouchStart, { passive: true });
        this.element.addEventListener("touchmove", this.handleTouchMove, { passive: false });
        this.element.addEventListener("touchend", this.handleTouchEnd);
    }

    removeEventListeners() {
        this.element.removeEventListener("touchstart", this.handleTouchStart);
        this.element.removeEventListener("touchmove", this.handleTouchMove);
        this.element.removeEventListener("touchend", this.handleTouchEnd);
    }

    handleTouchStart(event) {
        if (event.touches.length === 2) {
            this.isZooming = true;
            this.initialDistance = this.getDistance(event.touches[0], event.touches[1]);
            if (this._onZoomStart) this._onZoomStart();
        }
    }

    handleTouchMove(event) {
        if (this.isZooming && event.touches.length === 2) {
            event.preventDefault();
            const currentDistance = this.getDistance(event.touches[0], event.touches[1]);
            this.scale = currentDistance / this.initialDistance;
            if (this._onZoom) this._onZoom(this.scale);
        }
    }

    handleTouchEnd(event) {
        if (event.touches.length < 2 && this.isZooming) {
            this.isZooming = false;
            if (this._onZoomEnd) this._onZoomEnd(this.scale);
        }
    }

    getDistance(touch1, touch2) {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    destroy() {
        this.removeEventListeners();
    }

    get onZoomStart() {
        return this._onZoomStart;
    }

    set onZoomStart(callback) {
        this._onZoomStart = callback;
        this.updateEventListeners();
    }

    get onZoom() {
        return this._onZoom;
    }

    set onZoom(callback) {
        this._onZoom = callback;
        this.updateEventListeners();
    }

    get onZoomEnd() {
        return this._onZoomEnd;
    }

    set onZoomEnd(callback) {
        this._onZoomEnd = callback;
        this.updateEventListeners();
    }
}




// Usage Example
//const element = document.getElementById("swipeable-element");
//const swipeHandler = new SwipeHandler(element, {
//  onSwipeLeft: () => console.log("Swiped left!"),
//  onSwipeRight: () => console.log("Swiped right!"),
//});
