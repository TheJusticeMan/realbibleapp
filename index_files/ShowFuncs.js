var VersesOpen = [];
class BibleRef {   //Referance to a bible passage
	constructor(Book, Chap, Verse) {
		this.Book = Book;
		this.Chap = Chap * 1;
		this.Verse = Verse * 1;
	}
	get VerseContent() {
		return Bible[this.Book][this.Chap][this.Verse];
	}
	RefElement(ElementType, ClassName, OnContextMenu, OnClick, Content) {
		var element = document.createElement(ElementType);
		element.className = ClassName;
		element.dataset.Book = this.Book;
		element.dataset.Chap = this.Chap;
		element.dataset.Verse = this.Verse;
		element.oncontextmenu = OnContextMenu;
		element.onclick = OnClick;
		element.innerHTML = Content;
		return element;
	}

	HistoryElement(lastSeen) {
		const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
		const formattedTime = lastSeen.toLocaleDateString('en-US', options);
		return this.RefElement("span", "SearchResult", ShowThisVerseMenu, GoToAddThisVerse,
			`<span class="VerseNum">${this.RefText()}</span> ${this.fixItal()} <span class="last-seen">(${formattedTime})</span>`);
	}

	WholeChapElement() {
		var chapterElement = this.RefElement("div", "", null, null, "");
		for (var i = 0; i < Bible[this.Book][this.Chap].length; i++) {
			let verseRef = new BibleRef(this.Book, this.Chap, i);
			chapterElement.appendChild(verseRef.Element());
		}
		return chapterElement;
	}
	Element() {
		return this.RefElement("p", "Contents", ShowThisVerseMenu, null,
			`<span class="VerseNum">${this.Verse + 1}</span> ${this.fixItal()}`);
	}
	SearchElement() {
		return this.RefElement("span", "SearchResult", ShowThisVerseMenu, GoToAddThisVerse,
			`<span class="VerseNum">${this.RefText()}</span> ${this.fixItalSearch()}`);
	}
	BookName() {
		return this.RefElement("span", "verse-nav-button", null, loadChapters,
			`${this.Book}`);
	}
	ChapterNumber() {
		return this.RefElement("span", "verse-nav-button", null, loadVerses,
			`${this.Chap + 1}`);
	}
	VerseNumber() {
		return this.RefElement("span", "verse-nav-button", ShowThisVerseMenu, GoToAddThisVerse,
			`${this.Verse + 1}`);
	}
	SingleVerseText() {
		return `${this.VerseContent.replace(/[\]\[]/g, "")} (${this.RefText()}, KJV)`;
	}
	VerseText() {
		return `${this.Verse + 1}${this.VerseContent.replace(/[\]\[]/g, "")}`;
	}
	RefText() {
		return `${this.Book}  ${this.Chap}:${this.Verse + 1}`;
	}
	WholeChapText() {
		let chapterText = "";
		for (var i = 0; i < Bible[this.Book][this.Chap].length; i++) {
			chapterText += `${this.Verse + 1}${this.VerseContent.replace(/[\]\[]/g, "")}`;
		}
		return chapterText;
	}
	VerseSwipeLink() {
		const content = `<SPAN class=VerseNum>${this.RefText()}</SPAN> ${this.fixItal()}`;
		const element = this.RefElement("span", "SearchResult", ShowThisVerseMenu, GoToThisVerse, content);

		const hammer = new Hammer(element);
		hammer.on('swipeleft', () => {
			console.log('Swiped left on', element.textContent);
			VersesInview.push(new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse));
			element.style.backgroundColor = 'darkblue';
			element.onclick = LoadVersesInview;
		});
		hammer.on('swiperight', () => {
			console.log('Swiped right on', element.textContent);
			VersesOpen = VersesOpen.filter(verse => !(verse.Book === element.dataset.Book && verse.Chap === Number(element.dataset.Chap) && verse.Verse === Number(element.dataset.Verse)));
			loadVerseListScreen();
		});

		return element;
	}
	fixItalSearch() {
		if (this.SearchQ) {
			//return ((this.VerseContent).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))
			//	.replace(new RegExp(`(${this.SearchQ})`, "gi"), "<span class=resultmark>$1</span>")
			return ((highlightMatches(this.VerseContent, this.SearchQ)).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))

		} else {
			return ((this.VerseContent).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))
		}
	}
	fixItal() {
		return ((this.VerseContent).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))
	}
};

function GetRefFromHTML(element) {
	return new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse);
}

function ShowThisVerseMenu(event) {  //****
	loadVerseContextualInteractionScreen(GetRefFromHTML(event.currentTarget));
	event.returnValue = false;
}

function GoToAddThisVerse(event) {
	var h = GetRefFromHTML(event.currentTarget);
	NewHistory(h);
	VersesOpen.push(h);
	GoToRef(h);
}

var VersesInviewindex = 0;
function GoToThisVerse(event) {
	GoToRef(GetRefFromHTML(event.currentTarget));
}

function GoLeft() {
	VersesInview[VersesInviewindex].Verse = getVerseScroll();
	VersesInviewindex = Math.min(VersesInviewindex + 1, VersesInview.length - 1);
	LoadVersesInview();
}
function GoRight() {
	VersesInview[VersesInviewindex].Verse = getVerseScroll();
	VersesInviewindex = Math.max(VersesInviewindex - 1, 0);
	LoadVersesInview();
}

function getVerseScroll() {
	var Scroolpoz = window.scrollY + document.getElementById("ReadingHeader").scrollHeight;
	function checkelement(verseel) {
		return verseel.offsetTop >= Scroolpoz;
	}
	var Varses = Array.from(document.querySelectorAll('.Contents'));
	return Number((Varses.find(checkelement)).dataset.Verse);
}

function ScrollToVerse(Verse) {
	if (Verse != 0) {
		var scrooltooffset = document.querySelectorAll('.Contents')[Verse].offsetTop;
		scrooltooffset -= document.getElementById("ReadingHeader").scrollHeight;
		window.scrollTo(0, scrooltooffset);
	} else {
		window.scrollTo(0, 0);
	}
}

function LoadVersesInview() {
	let c = VersesInview[VersesInviewindex];
	let el = c.WholeChapElement();
	const hammer = new Hammer(el);
	hammer.on('swipeleft', GoLeft);
	hammer.on('swiperight', GoRight);
	let booktitle = ((VersesInviewindex > 0) ? "<  " : "") + c.Book + " " + c.Chap + ((VersesInviewindex < (VersesInview.length - 1)) ? "  >" : "");
	loadDetailedVerseReadingScreen(booktitle, el, c.Verse);
}

function GoToRef(c) {
	UpdateHistoryTime(c);
	loadDetailedVerseReadingScreen(c.Book + " " + c.Chap, c.WholeChapElement(), c.Verse);
}

class BibleNote {
	constructor(BibleVerse, thenote, BookmarkLBL = "") {
		this.BibleVerse = BibleVerse;
		this.Note = thenote;
		this.BookmarkLBL = BookmarkLBL;
	}
}
