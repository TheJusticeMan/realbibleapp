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
		return this.RefElement("span", "SearchResult", ShowThisVerseMenu, GoToThisVerse,
			`<span class="VerseNum">${this.RefText}</span> ${this.fixItal()}`);
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
		const onClick = (event) => {
			const Book = event.currentTarget.dataset.Book;
			const Chap = Number(event.currentTarget.dataset.Chap);
			const Verse = Number(event.currentTarget.dataset.Verse);
			if (VersesInview.length !== 0) {
				VersesInview.push(new BibleRef(this.Book, this.Chap, this.Verse));
				const textDisplayArea = document.getElementById('textDisplayArea');
				textDisplayArea.innerText = "";
				VersesInview.forEach(verse => {
					textDisplayArea.appendChild(verse.WholeChapElement());
				});
				navigateToScreen(3);
			} else {
				GoToVerse(Book, Chap, Verse);
			}
		};

		const element = this.RefElement("span", "SearchResult", ShowThisVerseMenu, onClick, content);

		const hammer = new Hammer(element);
		hammer.on('swipeleft', () => {
			console.log('Swiped left on', element.textContent);
			VersesInview.push(new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse));
			element.style.backgroundColor = 'darkblue';
		});
		hammer.on('swiperight', () => {
			console.log('Swiped right on', element.textContent);
			VersesOpen = VersesOpen.filter(verse => !(verse.Book === element.dataset.Book && verse.Chap === Number(element.dataset.Chap) && verse.Verse === Number(element.dataset.Verse)));
			loadVerseListScreen();
		});

		return element;
	}
	fixItal() {
		return ((Bible[this.Book][this.Chap][this.Verse]).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))
	}
};

function GetRefFromHTML(element) {
	return new BibleRef(element.dataset.Book, element.dataset.Chap, element.dataset.Verse);
}

function ShowThisVerseMenu(event) {  //****
	loadVerseContextualInteractionScreen(GetRefFromHTML(event.currentTarget));
	event.returnValue = false;
}

function GoToThisVerse(event) {
	var Book = event.currentTarget.dataset.Book;
	var Chap = event.currentTarget.dataset.Chap * 1;
	var Verse = event.currentTarget.dataset.Verse * 1;
	GoToVerse(Book, Chap, Verse);
}

function AddThisVerse(event) {
	var Book = event.currentTarget.dataset.Book;
	var Chap = event.currentTarget.dataset.Chap * 1;
	var Verse = event.currentTarget.dataset.Verse * 1;
	VersesOpen.push(new BibleRef(Book, Chap, Verse));
}

function GoToVerse(Book, Chap, Verse) {
	var Cbible = new BibleRef(Book, Chap, Verse);
	loadDetailedVerseReadingScreen(Book + " " + Chap, Cbible.WholeChapElement());
}
