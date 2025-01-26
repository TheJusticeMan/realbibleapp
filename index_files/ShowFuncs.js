let VersesOpen = [];
//let VersesInview = [];
//let VersesInviewIndex = 0;

class BibleRef {
	constructor(Book, Chap, Verse, color = 0) {
		this.Book = Book;
		this.Chap = Number(Chap);
		this.Verse = Number(Verse);
		this.color = color;
	}

	createElement(tag = "div", className = "", contextMenuHandler = null, clickHandler = null, content = "", onSwipeLeft = null, onSwipeRight = null) {
		const element = document.createElement(tag);

		// Set basic properties
		element.className = className;
		Object.assign(element.dataset, {
			Book: this.Book,
			Chap: this.Chap,
			Verse: this.Verse,
		});
		// Assign event handlers if provided
		if (contextMenuHandler) element.oncontextmenu = contextMenuHandler;
		if (clickHandler) element.onclick = clickHandler;

		// Handle content
		if (Array.isArray(content)) {
			// Append each element in the array to the created element
			content.forEach(child => {
				if (child instanceof Node) {
					element.appendChild(child);
				} else {
					console.error("Content array contains non-Node elements:", child);
				}
			});
		} else if (typeof content === "string") {
			element.innerHTML = content;
		} else {
			console.error("Invalid content type:", content);
		}

		if (onSwipeLeft || onSwipeRight) {
			const swipeHandler = new SwipeHandler(element);
			swipeHandler.onSwipeLeft = onSwipeLeft;
			swipeHandler.onSwipeRight = onSwipeRight;
		}

		return element;
	}

	createSpan(className, content) {
		return this.createElement("span", className, null, null, content);
	}

	createHistoryElement(lastSeen) {
		const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
		const formattedTime = lastSeen.toLocaleDateString('en-US', options);
		return this.createElement(
			"span",
			"SearchResult",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span>
				${this.italicsFormatted}
				<span class="last-seen">(${formattedTime})</span>`
		);
	}

	get ChapterElement() {
		const chapterElement = this.createElement();
		Bible[this.Book][this.Chap].forEach((_, i) => {
			let verseRef = new BibleRef(this.Book, this.Chap, i);
			chapterElement.appendChild(verseRef.VerseElement);
		});
		return chapterElement;
	}

	get VerseElement() {
		return this.createElement(
			"p",
			"Contents",
			BibleRef.showVerseMenu,
			null,
			`<span class="VerseNum">${this.Verse + 1}</span> ${this.italicsFormatted}`
		);
	}

	get SearchElement() {
		return this.createElement(
			"span",
			"SearchResult",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span> ${this.italicsFormatted}`
		);
	}

	get BookNameElement() {
		return this.createElement(
			"span",
			"verse-nav-button",
			null,
			loadChapters,
			`${this.Book}`);
	}

	get ChapterNumberElement() {
		return this.createElement(
			"span",
			"verse-nav-button",
			null,
			loadVerses,
			`${this.Chap}`);
	}

	get VerseNumberElement() {
		return this.createElement(
			"span",
			"verse-nav-button",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			`${this.Verse + 1}`
		);
	}

	get singleVerseText() {
		return `${this.VerseContent.replace(/[\]\[]/g, "")} (${this.refText}, KJV)`;
	}

	get verseText() {
		return `${this.Verse + 1}${this.VerseContent.replace(/[\]\[]/g, "")}`;
	}

	get refText() {
		return `${this.Book} ${this.Chap}:${this.Verse + 1}`;
	}

	get wholeChapterText() {
		return Bible[this.Book][this.Chap].map((verse, i) => `${i + 1}${verse.replace(/[\]\[]/g, "")}`).join("");
	}

	get SwipeLink() {
		const content =
			[this.createSpan("VerseNum", this.refText),
			this.createSpan("VerseText", this.italicsFormatted)];
		const element = this.createElement(
			"span",
			"SearchResult",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			content);
		const swipeHandler = new SwipeHandler(element);
		swipeHandler.onSwipeLeft = this.handleSwipeLeft;
		swipeHandler.onSwipeRight = this.handleSwipeRight;
		element.style.borderLeft = `2px solid ${this.HSLcolor}`;
		element.style.borderRight = `2px solid ${this.HSLcolor}`;
		return element;
	}

	handleSwipeLeft(event) {
		var element = event.currentTarget;
		console.log('Swiped left on', element.textContent);
		var ref = BibleRef.getRefFromHTML(event.currentTarget);
		VersesInview = VersesInview.filter(openRef => !openRef.isEqual(ref));
		VersesInview.push(ref);
		element.classList.add("selectedmark");
		element.onclick = BibleRef.loadVersesInview;
	}

	handleSwipeRight(event) {
		console.log('Swiped right on', event.currentTarget.textContent);
		let element = event.currentTarget;
		let verseToRemove = BibleRef.getRefFromHTML(element);

		// Check if there are multiple verses in view
		if (VersesInview.length > 0) {
			if (element.classList.contains("selectedmark")) {
				// Take out all the VersesOpen[] that are in VersesInview[] using VersesOpen[].isEqual(VersesInview[])
				VersesOpen = VersesOpen.filter(verse =>
					!VersesInview.some(viewVerse => viewVerse.isEqual(verse))
				);
			} else {
				VersesOpen = VersesInview;
			}
		} else {
			// Remove the specific verse from VersesOpen if there's only one verse in view
			VersesOpen = VersesOpen.filter(verse =>
				!verse.isEqual(verseToRemove)
			);
		}

		// Reload the verse list screen to reflect changes
		loadVerseListScreen();
	}

	get VerseContent() {
		return Bible[this.Book][this.Chap][this.Verse];
	}

	get italicsFormatted() {
		if (!this.SearchQ) return this.VerseContent
			.replace(/\[([^\]]+)\]/g, "<em>$1</em>")
			.replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>");

		return this.VerseContent
			.replace(this.SearchQ, match => `<span class=resultmark>${match}</span>`)
			.replace(/\[([^\]]+)\]/g, "<em>$1</em>")
			.replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>");
	}

	get HSLcolor() {
		const factor = (3 - Math.sqrt(5)) * 180;
		const hue = (this.color * factor) % 360;
		return `hsl(${hue.toFixed(1)}, 100%, 50%)`;
	}

	isEqual(other) {
		return this.Book === other.Book
			&& this.Chap === other.Chap
			&& this.Verse === other.Verse;
	}

	static showVerseMenu(event) {
		loadVerseContextualInteractionScreen(BibleRef.getRefFromHTML(event.currentTarget));
		event.returnValue = false;
	}

	static goToVerse(event) {
		const ref = BibleRef.getRefFromHTML(event.currentTarget);
		NewHistory(ref);

		// Remove existing reference if it exists and find the lowest available color
		const previousLength = VersesOpen.length;
		VersesOpen = VersesOpen.filter(openRef => !openRef.isEqual(ref));

		//if (previousLength == VersesOpen.length) {
		let takenColors = VersesOpen.map(openRef => openRef.color);
		let freecolor = 0;
		while (takenColors.includes(freecolor)) {
			freecolor++;
		}
		ref.color = freecolor;
		//}

		VersesOpen.push(ref);

		BibleRef.goToRef(ref);
		VersesInview = false;
	}

	static goLeft() {
		if (VersesInview) {
			VersesInview[VersesInviewIndex].Verse = BibleRef.getVerseScroll();
			VersesInviewIndex = Math.min(VersesInviewIndex + 1, VersesInview.length - 1);
			BibleRef.loadVersesInview();
		}
	}

	static goRight() {
		if (VersesInview) {
			VersesInview[VersesInviewIndex].Verse = BibleRef.getVerseScroll();
			VersesInviewIndex = Math.max(VersesInviewIndex - 1, 0);
			BibleRef.loadVersesInview();
		}
	}

	static getVerseScroll() {
		const container = document.getElementById('container');
		const scrollPosition = container.scrollTop + document.getElementById('ReadingHeader').scrollHeight;
		return Number([...document.querySelectorAll('.Contents')]
			.find(verseEl => verseEl.offsetTop >= scrollPosition)?.dataset.Verse);
	}
	
	static scrollToVerse(Verse) {
		const verses = document.querySelectorAll('.Contents');
		const scrollToOffset = verses[Verse].offsetTop;
		document.getElementById('container').scrollTo(0, scrollToOffset - document.getElementById("ReadingHeader").scrollHeight);
	}

	static loadVersesInview() {
		const currentVerse = VersesInview[VersesInviewIndex];
		const { ChapterElement: element, Book, Chap, Verse } = currentVerse;
		const readingHeader = document.getElementById("ReadingHeader");

        if (!topswipehandler) {
            topswipehandler = new SwipeHandler(readingHeader);
        }
        topswipehandler.onSwipeLeft = BibleRef.goLeft;
        topswipehandler.onSwipeRight = BibleRef.goRight;

		const bookTitle = `${VersesInviewIndex > 0 ? "<  " : ""}${Book} ${Chap}${VersesInviewIndex < VersesInview.length - 1 ? "  >" : ""}`;
		currentverseviewing = currentVerse;
		loadDetailedVerseReadingScreen(bookTitle, element, Verse);
	}

	static ShowPreviousChapter(event) {
		var ref = currentverseviewing;
		// Get the current index of the book
		const currentIndex = booksOfTheBible.indexOf(ref.Book);

		if (ref.Chap > 1) {
			// Move to the previous chapter in the same book
			ref.Chap--;
		} else {
			if (currentIndex > 0) {
				// Move to the last chapter of the previous book
				ref.Book = booksOfTheBible[currentIndex - 1];
			} else {
				// Wrap around to the last book
				console.log(booksOfTheBible.length)
				console.log(booksOfTheBible[booksOfTheBible.length - 1])
				ref.Book = booksOfTheBible[booksOfTheBible.length - 1];
			}
			ref.Chap = Bible[ref.Book].length - 1; // Set to the last chapter
		}
		ref.Verse = Bible[ref.Book][ref.Chap].length - 1; // Reset verse to the beginning
		currentverseviewing = ref;
		loadDetailedVerseReadingScreen(`${ref.Book} ${ref.Chap}`, ref.ChapterElement, ref.Verse);
	}

	static ShowNextChapter(event) {
		var ref = currentverseviewing;
		// Get the current index of the book
		const currentIndex = booksOfTheBible.indexOf(ref.Book);

		if (ref.Chap < (Bible[ref.Book].length - 1)) {
			// Move to the next chapter in the same book
			ref.Chap++;
		} else {
			if (currentIndex < (booksOfTheBible.length - 1)) {
				// Move to the first chapter of the next book
				ref.Book = booksOfTheBible[currentIndex + 1];
			} else {
				// Wrap around to the first book
				ref.Book = booksOfTheBible[0];
			}
			ref.Chap = 1; // Start from the first chapter
		}
		ref.Verse = 0; // Reset verse to the beginning
		currentverseviewing = ref;
		loadDetailedVerseReadingScreen(`${ref.Book} ${ref.Chap}`, ref.ChapterElement, ref.Verse);
	}


	static goToRef(ref) {
		currentverseviewing = ref;
		UpdateHistoryTime(ref);
		loadDetailedVerseReadingScreen(`${ref.Book} ${ref.Chap}`, ref.ChapterElement, ref.Verse);
	}

	static getRefFromHTML(element) {
		const { Book, Chap, Verse } = element.dataset;
		return new BibleRef(Book, Chap, Verse);
	}
}

class BibleNote {
	constructor(BibleVerse, note, BookmarkLBL = "") {
		this.BibleVerse = BibleVerse;
		this.Note = note;
		this.BookmarkLBL = BookmarkLBL;
	}
}
