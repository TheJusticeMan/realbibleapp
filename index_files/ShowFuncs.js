let VersesOpen = [];
//let VersesInview = [];
//let VersesInviewIndex = 0;

class BibleRef {
	constructor(Book, Chap, Verse) {
		this.Book = Book;
		this.Chap = Number(Chap);
		this.Verse = Number(Verse);
	}

	static getRefFromHTML(element) {
		return new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse);
	}

	get VerseContent() {
		return Bible[this.Book][this.Chap][this.Verse];
	}

	createElement(tag, className, contextMenuHandler, clickHandler, content) {
		const element = document.createElement(tag);
		element.className = className;
		element.dataset.Book = this.Book;
		element.dataset.Chap = this.Chap;
		element.dataset.Verse = this.Verse;
		if (contextMenuHandler) element.oncontextmenu = contextMenuHandler;
		if (clickHandler) element.onclick = clickHandler;
		element.innerHTML = content;
		return element;
	}

	createHistoryElement(lastSeen) {
		const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
		const formattedTime = lastSeen.toLocaleDateString('en-US', options);
		return this.createElement(
			"span",
			"SearchResult",
			BibleRef.showVerseMenu,
			BibleRef.goToVerse,
			`<span class="VerseNum">${this.refText}</span> ${this.italicsFormatted} <span class="last-seen">(${formattedTime})</span>`
		);
	}

	get ChapterElement() {
		const chapterElement = this.createElement("div", "", null, null, "");
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
			`<span class="VerseNum">${this.refText}</span> ${this.searchItalicsFormatted}`
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
		const content = `<span class="VerseNum">${this.refText}</span> ${this.italicsFormatted}`;
		const element = this.createElement("span", "SearchResult", BibleRef.showVerseMenu, BibleRef.goToVerse, content);

		const hammer = new Hammer(element);
		hammer.on('swipeleft', () => this.handleSwipeLeft(element));
		hammer.on('swiperight', () => this.handleSwipeRight(element));

		return element;
	}

	handleSwipeLeft(element) {
		console.log('Swiped left on', element.textContent);
		VersesInview.push(new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse));
		element.style.backgroundColor = 'darkblue';
		element.onclick = BibleRef.loadVersesInview;
	}

	handleSwipeRight(element) {
		console.log('Swiped right on', element.textContent);
		VersesOpen = VersesOpen.filter(verse =>
			!(verse.Book === element.dataset.Book && verse.Chap === Number(element.dataset.Chap) && verse.Verse === Number(element.dataset.Verse))
		);
		BibleRef.loadVerseListScreen();
	}

	get searchItalicsFormatted() {
		const content = this.SearchQ ? highlightMatches(this.VerseContent, this.SearchQ) : this.VerseContent;
		return content.replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>");
	}

	get italicsFormatted() {
		return this.VerseContent.replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>");
	}

	static showVerseMenu(event) {
		loadVerseContextualInteractionScreen(BibleRef.getRefFromHTML(event.currentTarget));
		event.returnValue = false;
	}

	static goToVerse(event) {
		const ref = BibleRef.getRefFromHTML(event.currentTarget);
		NewHistory(ref);
		VersesOpen.push(ref);
		BibleRef.goToRef(ref);
	}

	static goLeft() {
		VersesInview[VersesInviewIndex].Verse = BibleRef.getVerseScroll();
		VersesInviewIndex = Math.min(VersesInviewIndex + 1, VersesInview.length - 1);
		BibleRef.loadVersesInview();
	}

	static goRight() {
		VersesInview[VersesInviewIndex].Verse = BibleRef.getVerseScroll();
		VersesInviewIndex = Math.max(VersesInviewIndex - 1, 0);
		BibleRef.loadVersesInview();
	}

	static getVerseScroll() {
		const scrollPosition = window.scrollY + document.getElementById("ReadingHeader").scrollHeight;
		const verses = Array.from(document.querySelectorAll('.Contents'));
		return Number(verses.find(verseEl => verseEl.offsetTop >= scrollPosition).dataset.Verse);
	}

	static scrollToVerse(Verse) {
		const verses = document.querySelectorAll('.Contents');
		const scrollToOffset = verses[Verse].offsetTop;
		window.scrollTo(0, scrollToOffset - document.getElementById("ReadingHeader").scrollHeight);
	}

	static loadVersesInview() {
		const currentVerse = VersesInview[VersesInviewIndex];
		const element = currentVerse.ChapterElement;
		const hammer = new Hammer(element);
		hammer.on('swipeleft', BibleRef.goLeft);
		hammer.on('swiperight', BibleRef.goRight);
		const bookTitle = `${VersesInviewIndex > 0 ? "<  " : ""}${currentVerse.Book} ${currentVerse.Chap}${VersesInviewIndex < VersesInview.length - 1 ? "  >" : ""}`;
		BibleRef.loadDetailedVerseReadingScreen(bookTitle, element, currentVerse.Verse);
	}

	static goToRef(ref) {
		UpdateHistoryTime(ref);
		loadDetailedVerseReadingScreen(`${ref.Book} ${ref.Chap}`, ref.ChapterElement, ref.Verse);
	}
}

class BibleNote {
	constructor(BibleVerse, note, BookmarkLBL = "") {
		this.BibleVerse = BibleVerse;
		this.Note = note;
		this.BookmarkLBL = BookmarkLBL;
	}
}
