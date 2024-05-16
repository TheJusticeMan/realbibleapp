 class BibleRef {   //Referance to a bible passage
	constructor(Book, Chap, Verse) {
		this.Book = Book;
		this.Chap = Chap;
		this.Verse = Verse;
	}
	WholeChapElement() {   //cast the whole Chapter as a HTML Element
		var Cbible = document.createElement("div");
		Cbible.dataset.Book = this.Book;
		Cbible.dataset.Chap = this.Chap;
		var Cverse;
		for (var i = 0; i < Bible[this.Book][this.Chap].length; i++) {
			Cverse = new BibleRef(this.Book, this.Chap, i);
			Cbible.appendChild(Cverse.Element());
		}
		return Cbible;
	}
	Element() {   //cast as a HTML Element
		var Cbible = document.createElement("p");
		Cbible.className = "Contents";
		Cbible.dataset.Book = this.Book;  //store some values in the HTML DOM for recall by event handlers
		Cbible.dataset.Chap = this.Chap;
		Cbible.dataset.Verse = this.Verse;
		Cbible.oncontextmenu = ShowThisVerseMenu;
		Cbible.innerHTML = "<SPAN class=VerseNum>" + (this.Verse + 1) + "</SPAN> " + this.fixItal();
		return Cbible;
	}
	SearchElement() {   //cast as a HTML search Element
		var Cbible = document.createElement("span");
		Cbible.className = "SearchResult";
		Cbible.dataset.Book = this.Book;  //store some values in the HTML DOM for recall by event handlers
		Cbible.dataset.Chap = this.Chap;
		Cbible.dataset.Verse = this.Verse;
		Cbible.oncontextmenu = ShowThisVerseMenu;
		Cbible.onclick = GoToThisVerse;
		Cbible.innerHTML = "<SPAN class=VerseNum>" + this.Book + " : " + this.Chap + ":" + (this.Verse + 1) + "</SPAN>  " + this.fixItal();
		return Cbible;
	}
	SingleVerseText() {   //cast as Text
		return (Bible[Book][Chap][Verse].replace(/[\]\[]/g, "") + " (" + Book + "  " + (Chap) + ":" + (Verse + 1) + ", KJV)");
	}
	VerseText() {   //cast as Text
		return ((Verse + 1) + Bible[Book][Chap][Verse].replace(/[\]\[]/g, ""));
	}
	WholeChapText() {   //cast whole Chapter as Text
		var Cbible = "";
		for (var i = 0; i < Bible[this.Book][this.Chap].length; i++) {
			Cbible += ((Verse + 1) + Bible[Book][Chap][Verse].replace(/[\]\[]/g, "")) + "";
		}
		return Cbible;
	}
    fixItal(_string) {
        return ((Bible[this.Book][this.Chap][this.Verse]).replace(/\[/g, "<em>").replace(/\]/g, "</em>").replace(/LORD/g, "<strong class=LORDCAPS>Lord</strong>"))
    }

};

