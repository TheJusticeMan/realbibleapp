let VersesOpen = [];

class BibleRef {
	constructor(Book, Chap, Verse, color = 0) {
		this.Book = Book;
		this.Chap = Number(Chap);
		this.Verse = Number(Verse);
		this.color = color;
		if (color instanceof RegExp) this.SearchQ = color;
		this.validateReference();
	}

	toString() {
		return `${this.Book}:${this.Chap}:${this.Verse}:${this.color}`;
	}

	// A static method that returns a new BibleRef from a string.
	static fromString(str) {
		let [Book, Chap, Verse, color] = str.split(":");
		return new BibleRef(Book, Chap, Verse, Number(color));
	}

	/**
	 * Validates that the BibleRef has a valid book name,
	 * chapter, and verse number. If any value is invalid,
	 * the reference defaults to GENESIS 1:1.
	 *
	 * @returns {boolean} true if the reference was valid, 
	 * or false if it had to be defaulted.
	 */
	validateReference() {
		let isValid = true;

		if (!booksOfTheBible.includes(this.Book)) {
			console.warn(`Invalid book "${this.Book}". Defaulting to GENESIS.`);
			this.Book = "GENESIS";
			isValid = false;
		}

		const maxChapters = Bible[this.Book]?.length || 1;
		if (this.Chap < 1 || this.Chap >= maxChapters) {
			console.warn(`Invalid chapter "${this.Chap}" in "${this.Book}". Defaulting to chapter 1.`);
			this.Chap = 1;
			isValid = false;
		}

		const maxVerses = Bible[this.Book][this.Chap]?.length || 1;
		if (this.Verse < 1 || this.Verse >= maxVerses) {
			console.warn(`Invalid verse "${this.Verse}" in "${this.Book} ${this.Chap}". Defaulting to verse 1.`);
			this.Verse = 1;
			isValid = false;
		}

		return isValid;
	}

	createElement(tag = "div", className = "", contextMenuHandler = null, clickHandler = null, content = "", onSwipeLeft = null, onSwipeRight = null) {
		const element = Object.assign(document.createElement(tag), {
			oncontextmenu: contextMenuHandler,
			onclick: clickHandler,
			className: className
		});
		Object.assign(element.dataset, this);
		if (typeof content === "string") content = [Object.assign(document.createElement("span"), { innerHTML: content })];

		content.forEach(child => child instanceof Node ? element.appendChild(child) : console.error("Invalid content:", child));

		if (onSwipeLeft || onSwipeRight) {
			Object.assign(new SwipeHandler(element), { onSwipeLeft, onSwipeRight });
		}

		return element;
	}

	createSpan(className, content) {
		return this.createElement("span", className, null, null, content);
	}

	get HistoryElement() {
		const content = [
			this.createSpan("VerseNum", this.refText),
			this.createSpan("italic", this.italicsFormatted),
			this.createSpan("last-seen", this.DateString)
		]
		return this.createElement("span", "SearchResult", BibleRef.showVerseMenu, BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span>
			${this.italicsFormatted}
			<span class="last-seen">(${this.DateString})</span>`);
	}

	get DateString() {
		return new Date(this.color).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
	}

	get ChapterElement() {
		const chapterElement = this.createElement("div", "chapterElement");
		Bible[this.Book][this.Chap].slice(1).forEach((_, i) => chapterElement.appendChild(new BibleRef(this.Book, this.Chap, i + 1).VerseElement));
		return chapterElement;
	}

	get VerseElement() {
		const BookMarktag = bookmarkStore.isBookmarked(this) ? ' BookmarkNumber' : '';
		const NoteTag = notes.some(verse => this.isEqual(verse.BibleVerse)) ? ' NoteNumber' : '';
		const content = [
			this.createSpan(`VerseNum${BookMarktag}${NoteTag}`, `${this.Verse}`),
			this.createSpan("VerseText", this.italicsFormatted)
		];
		return this.createElement("p", "Contents", BibleRef.showVerseMenu, BibleRef.selectverse, content);
		//`<span class="VerseNum${BookMarktag}${NoteTag}">${this.Verse + 1}</span> ${this.italicsFormatted}`);
	}

	get SearchElement() {
		return this.createElement("span", "SearchResult", BibleRef.showVerseMenu, BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span>${this.italicsFormatted}`);
	}

	get CrossRefElement() {
		const content = [
			this.createSpan("VerseNum", this.refText),
			this.createSpan("VerseText", this.italicsFormatted),
			this.createSpan("last-seen", `${Math.floor(this.color)} ${this.color % 1 !== 0 ? "v=" + (1 / (1 - (this.color % 1))).toFixed() : ""}`)
		];
		return this.createElement("span", "SearchResult", BibleRef.showVerseMenu, BibleRef.goToVerse, content);
	}

	get BookNameElement() {
		return this.createElement("span", "verse-nav-button", null, loadChapters, this.Book);
	}

	get ChapterNumberElement() {
		return this.createElement("span", "verse-nav-button", loadVerses, BibleRef.goToVerse, `${this.Chap}`);
	}

	get VerseNumberElement() {
		return this.createElement("span", "verse-nav-button", BibleRef.showVerseMenu, BibleRef.goToVerse, `${this.Verse}`);
	}

	get RefElement() {
		return this.createElement("span", "VerseNum", BibleRef.showVerseMenu, BibleRef.goToVerse, this.refText);
	}

	get singleVerseElement() {
		return this.createElement("p", "Contents", BibleRef.showVerseMenu, BibleRef.goToVerse,
			`${this.italicsFormatted}<p><span class="VerseNum">${this.refText}</span></p>`);
	}

	get BookIndex() {
		return booksOfTheBible.indexOf(this.Book);
	}

	get singleVerseMarkdown() {
		return `${this.VerseContent.replace(/[\]\[]/g, "*")} [${this.refText}, KJV](https://thejusticeman.github.io/realbibleapp/?verse=${encodeURIComponent(this.toString())})`;
	}

	get refText() {
		return `${this.Book} ${this.Chap}:${this.Verse}`;
	}

	get SwipeLink() {
		const content =
			[this.createSpan("VerseNum", this.refText),
			this.createSpan("VerseText", this.italicsFormatted)];
		const element = this.createElement("span", "SearchResult", BibleRef.showVerseMenu, BibleRef.goToVerse, content, BibleRef.handleSwipeLeft, BibleRef.handleSwipeRight);
		element.style.borderLeftColor = `${this.HSLcolor}`;
		element.style.borderRightColor = `${this.HSLcolor}`;
		return element;
	}

	static handleSwipeLeft(event) {
		const element = event.currentTarget;
		const ref = BibleRef.getRefFromHTML(element);
		console.log('Swiped left on', element.textContent);
		VerseGroup = VerseGroup.filter(openRef => !openRef.isEqual(ref));
		VerseGroup.push(ref);
		element.classList.add("selectedmark");
		element.onclick = BibleRef.loadVerseGroup;
	}

	static handleSwipeRight(event) {
		const element = event.currentTarget;
		const verseToRemove = BibleRef.getRefFromHTML(element);
		console.log('Swiped right on', element.textContent);

		VersesOpen = VerseGroup.length > 0
			? element.classList.contains("selectedmark")
				? VersesOpen.filter(verse => !VerseGroup.some(viewVerse => viewVerse.isEqual(verse)))
				: [...VerseGroup]
			: VersesOpen.filter(verse => !verse.isEqual(verseToRemove));

		refreshListScreen();
	}

	get VerseContent() {
		return Bible[this.Book][this.Chap][this.Verse];
	}

	get italicsFormatted() {
		return this.VerseContent
			.replace(/#/g, "¶")
			.replace(this.SearchQ || /(?!)/, match => `<span class=resultmark>${match}</span>`)
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

	updateLastSeen() {
		this.color = new Date();
	}

	static showVerseMenu(event) {
		loadVerseContextualInteractionScreen(BibleRef.getRefFromHTML(event.currentTarget));
		event.returnValue = false;
	}

	static copy(event) {
		const CElement = event.currentTarget;
		const verseText = BibleRef.getRefFromHTML(CElement).singleVerseMarkdown;

		if (navigator.share) {
			// If sharing is supported, open the share dialog
			navigator.share({
				title: "Bible Verse",
				text: verseText
			}).catch(err => console.error("Sharing failed", err));
		} else {
			// Fallback: Copy to clipboard
			navigator.clipboard.writeText(verseText).then(() => {
				CElement.classList.add("copymark");

				event.returnValue = false;

				// Remove the visual feedback after 1 second
				setTimeout(() => {
					CElement.classList.remove("copymark");
				}, 1000);
			}).catch(err => console.error("Copy failed", err));
		}
	}

	static goToVerse(event) {
		const ref = BibleRef.getRefFromHTML(event.currentTarget);
		NewHistory(ref);

		// Remove existing reference and assign the lowest available color
		VersesOpen = VersesOpen.filter(openRef => !openRef.isEqual(ref));
		ref.color = BibleRef.getFreeColor(VersesOpen);

		VersesOpen.push(ref);
		BibleRef.goToRef(ref);

		VerseGroup = false;
	}

	static getFreeColor(VerseArray) {
		const takenColors = new Set(VerseArray.map(({ color }) => color));

		let freecolor = 0;
		while (takenColors.has(freecolor)) freecolor++;

		return freecolor;
	}

	static goLeft() {
		if (VerseGroup) {
			VerseGroup[VerseGroupIndex].Verse = BibleRef.getVerseScroll();
			VerseGroupIndex = Math.min(VerseGroupIndex + 1, VerseGroup.length - 1);
			BibleRef.loadVerseGroup();
		}
	}

	static goRight() {
		if (VerseGroup) {
			VerseGroup[VerseGroupIndex].Verse = BibleRef.getVerseScroll();
			VerseGroupIndex = Math.max(VerseGroupIndex - 1, 0);
			BibleRef.loadVerseGroup();
		}
	}

	static getVerseScroll() {
		const scrollPosition =
			document.getElementById('container').scrollTop +
			document.getElementById('ReadingHeader').scrollHeight;
		return Number([...document.querySelectorAll('.Contents')]
			.find(verseEl => verseEl.offsetTop >= scrollPosition)?.dataset.Verse) - 1;
	}

	static scrollToVerse(Verse) {
		const verses = document.querySelectorAll('.Contents');
		const scrollToOffset = verses[Verse - 1].offsetTop;
		document.querySelector('.Contents.selectedmark')?.classList.remove("selectedmark");
		verses[Verse - 1].classList.add("selectedmark");
		document.getElementById('container').scrollTo(0, scrollToOffset - document.getElementById("ReadingHeader").scrollHeight);
	}

	static loadVerseGroup() {
		viewingVerse = VerseGroup[VerseGroupIndex];
		const { Book, Chap } = viewingVerse;
		const readingHeader = document.getElementById("ReadingHeader");

		topswipehandler ||= new SwipeHandler(readingHeader);
		topswipehandler.cycleSwipe = true;
		topswipehandler.onSwipeLeft = BibleRef.goLeft;
		topswipehandler.onSwipeRight = BibleRef.goRight;

		const bookTitle = `${VerseGroupIndex > 0 ? "<  " : ""}${Book} ${Chap}${VerseGroupIndex < VerseGroup.length - 1 ? "  >" : ""}`;
		loadDetailedVerseReadingScreen(viewingVerse, bookTitle);
	}

	static ShowPreviousChapter() {
		const currentIndex = booksOfTheBible.indexOf(viewingVerse.Book);

		if (viewingVerse.Chap > 1) {
			viewingVerse.Chap--; // Move to the previous chapter in the same book
		} else {
			// Move to the last chapter of the previous book or wrap around to the last book
			viewingVerse.Book = booksOfTheBible[currentIndex > 0 ? currentIndex - 1 : booksOfTheBible.length - 1];
			viewingVerse.Chap = Bible[viewingVerse.Book].length; // Last chapter of new book
		}

		viewingVerse.Verse = Bible[viewingVerse.Book][viewingVerse.Chap].length - 1; // Last verse of new chapter

		loadDetailedVerseReadingScreen(viewingVerse);
	}

	static ShowNextChapter() {
		const currentIndex = booksOfTheBible.indexOf(viewingVerse.Book);

		if (viewingVerse.Chap < Bible[viewingVerse.Book].length) {
			viewingVerse.Chap++; // Move to the next chapter in the same book
		} else {
			// Move to the first chapter of the next book or wrap around to the first book
			viewingVerse.Book = booksOfTheBible[currentIndex < booksOfTheBible.length - 1 ? currentIndex + 1 : 0];
			viewingVerse.Chap = 1; // Start at the first chapter
		}

		viewingVerse.Verse = 1; // Reset verse to the beginning

		loadDetailedVerseReadingScreen(viewingVerse);
	}

	static selectverse(event) {
		const selectedRef = BibleRef.getRefFromHTML(event.currentTarget);

		document.querySelector('.Contents.selectedmark')?.classList.remove("selectedmark");
		event.currentTarget.classList.add("selectedmark");

		Object.assign(viewingVerse, selectedRef);
	}

	static goToRef(ref) {
		viewingVerse = ref;
		UpdateHistoryTime(ref);
		loadDetailedVerseReadingScreen(ref);
	}

	static getRefFromHTML(element) {
		const { Book, Chap, Verse, color } = element.dataset;
		return new BibleRef(Book, Chap, Verse, color);
	}
}

class BibleRange {
	constructor(start, end = null) {
		// Handle array input correctly (e.g. [book, chap, verse])
		if (Array.isArray(start)) {
			this.start = new BibleRef(...start);
			this.end = end ? new BibleRef(...end) : this.start;
			return;
		}

		// If start isn’t an array, we assume it's already a BibleRef.
		// Default to the same reference if no range is given.
		this.start = start;
		this.end = end || start;
	}

	toString() {
		// Only show range if start and end are different
		return this.start.refText + (this.start !== this.end ? `-${this.end.refText}` : '');
	}

	// Create a BibleRange from an OSIS formatted string.
	static fromOsis(osis) {
		if (!osis) return null; // Return null if input is empty

		// Split on '-' for a range then on '.' for each component.
		const parts = osis.split('-').map(part => part.split('.'));
		const startParts = parts[0];
		const endPartsRaw = parts[1] || null;
		if (!startParts[0]) return null; // Ensure book name exists

		// Lookup the book from a short name (e.g. "Gen") using an array of short names.
		const bookIndex = BookShortNames.indexOf(startParts[0]);
		if (bookIndex === -1) return null; // Invalid book name

		const book = booksOfTheBible[bookIndex];
		// Default chapter is 1 and default verse is 0 if not specified
		const chapter = parseInt(startParts[1] || 1, 10);
		const verse = parseInt(startParts[2] || 1, 10);

		const startRef = new BibleRef(book, chapter, verse);
		let endRef = startRef; // Default end to start

		// If end parts are provided, adjust the specificity.
		if (endPartsRaw) {
			// Prepend missing parts from startParts.
			while (endPartsRaw.length < startParts.length) {
				endPartsRaw.unshift(startParts[startParts.length - endPartsRaw.length - 1]);
			}

			const endBookIndex = BookShortNames.indexOf(endPartsRaw[0]);
			const endBook = endBookIndex !== -1 ? booksOfTheBible[endBookIndex] : book;
			const endChapter = parseInt(endPartsRaw[1] || 1, 10);
			const endVerse = parseInt(endPartsRaw[2] || 1, 10);

			endRef = new BibleRef(endBook, endChapter, endVerse);
		}

		return new BibleRange(startRef, endRef);
	}

	// Returns an element representing the reference range.
	get RefElement() {
		return this.start.createElement(
			"span",
			"VerseNum",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			this.refText
		);
	}

	get SearchElement() {
		// Create a search result element using the start reference and
		// including formatted text for the range.
		if (this.start === this.end) {
			return this.start.createElement(
				"span",
				"SearchResult",
				BibleRef.showVerseMenu,
				BibleRef.goToVerse,
				`<span class="VerseNum">${this.start.refText}</span> ${this.start.italicsFormatted}`
			);
		}
		return this.start.createElement(
			"span",
			"SearchResult",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span> ${this.italicsFormatted}`
		);
	}

	get verses() {
		const verses = [];
		const { start, end } = this;
		const startBookIndex = start.BookIndex;
		const endBookIndex = end.BookIndex;

		// Loop through each book in the range
		for (let i = startBookIndex; i <= endBookIndex; i++) {
			const book = booksOfTheBible[i];
			// For the starting book, start at the given chapter; otherwise default to 1.
			const startChap = i === startBookIndex ? start.Chap : 1;
			// For the ending book, end at the given chapter; otherwise go to the last chapter.
			const endChap = i === endBookIndex ? end.Chap : Bible[book].length - 1;

			// Loop through each chapter within the current book.
			for (let j = startChap; j <= endChap; j++) {
				const chapter = Bible[book][j];
				// For the starting chapter of the starting book, start at the given verse; otherwise start at verse 0.
				const startVerse = (i === startBookIndex && j === start.Chap) ? start.Verse : 1;
				// For the ending chapter of the ending book, end at the given verse; otherwise go to the last verse.
				const endVerse = (i === endBookIndex && j === end.Chap) ? end.Verse : chapter.length - 1;

				for (let k = startVerse; k <= endVerse; k++) {
					verses.push(new BibleRef(book, j, k));
				}
			}
		}
		return verses;
	}

	get italicsFormatted() {
		// Combine each verse’s formatted text into a single string.
		return this.verses
			.map((verse, index) =>
				index === 0
					? verse.italicsFormatted
					: `<span class="VerseNum">${verse.Verse + 1}</span> ${verse.italicsFormatted}`
			)
			.join(" ");
	}

	get refText() {
		// Provide a human-readable range reference.
		// If both references are in the same book...
		if (this.start.Book === this.end.Book) {
			// ...and same chapter, show a single chapter with a verse range.
			if (this.start.Chap === this.end.Chap) {
				if (this.start.Verse === this.end.Verse) {
					return `${this.start.Book} ${this.start.Chap}:${this.start.Verse + 1}`;
				}
				return `${this.start.Book} ${this.start.Chap}:${this.start.Verse + 1}-${this.end.Verse + 1}`;
			}
			// If different chapters in the same book, show both chapters.
			return `${this.start.Book} ${this.start.Chap}:${this.start.Verse + 1} - ${this.end.Chap}:${this.end.Verse + 1}`;
		}

		// Otherwise, show full start and end references.
		return `${this.start.refText} - ${this.end.refText}`;
	}

	static fromString(input, isOsis = true) {
		if (!input) return null; // Return null if the input is empty

		// Split the input on '-' for a range and then on '.' for each component.
		const parts = input.split('-').map(part => part.split('.'));
		const startParts = parts[0];
		if (!startParts[0]) return null; // Ensure a book name exists

		// Determine the start book.
		let startBook;
		if (isOsis) {
			const bookIndex = BookShortNames.indexOf(startParts[0]);
			if (bookIndex === -1) return null; // Invalid book name
			startBook = booksOfTheBible[bookIndex];
		} else {
			startBook = startParts[0].trim().toUpperCase();
		}

		// Parse chapter and verse, using defaults if needed.
		const chapter = parseInt(startParts[1] || 1, 10);
		const verse = parseInt(startParts[2] || 1, 10);
		const startRef = new BibleRef(startBook, chapter, verse);
		let endRef = startRef; // Default end reference is the start

		// Process the end part of the range if it exists.
		if (parts[1]) {
			const endParts = parts[1];

			// Prepend any missing parts from the start.
			while (endParts.length < startParts.length) {
				endParts.unshift(startParts[startParts.length - endParts.length - 1]);
			}

			let endBook;
			if (isOsis) {
				const endBookIndex = BookShortNames.indexOf(endParts[0]);
				// If the book name is invalid, use the start book.
				endBook = endBookIndex !== -1 ? booksOfTheBible[endBookIndex] : startBook;
			} else {
				endBook = endParts[0].trim().toUpperCase();
			}

			const endChapter = parseInt(endParts[1] || 1, 10);
			const endVerse = parseInt(endParts[2] || 1, 10);
			endRef = new BibleRef(endBook, endChapter, endVerse);
		}

		return new BibleRange(startRef, endRef);
	}

	static fromOsis(osis) {
		return BibleRange.fromString(osis, true);
	}

	static fromText(text) {
		return BibleRange.fromString(text, false);
	}

}

class BibleNote {
	constructor(BibleVerse, note, BookmarkLBL = "") {
		this.BibleVerse = BibleVerse;
		this.Note = note;
		this.BookmarkLBL = BookmarkLBL;
	}
	static fromObject(obj) {
		if (typeof obj.BibleVerse === 'string') {
			obj.BibleVerse = BibleRef.fromString(obj.BibleVerse);
		}
		return new BibleNote(
			new BibleRef(obj.BibleVerse.Book, obj.BibleVerse.Chap, obj.BibleVerse.Verse),
			obj.Note,
			obj.BookmarkLBL
		);
	}
	toObject() {
		return {
			BibleVerse: this.BibleVerse.toString(),
			Note: this.Note,
			BookmarkLBL: this.BookmarkLBL
		};
	}
}

