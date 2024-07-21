var htmlhelp=`
 <div id="screen1" class="screen" style="display: flex;">
    <div class="common-header">
        <button id="searchBtn">Search
            <div class="help-bubble">
                Tap to search for a specific verse or phrase within the Bible.
            </div>
        </button>
        <button id="historyBtn">History
            <div class="help-bubble">
                View your reading history and revisit recently viewed verses.
            </div>
        </button>
        <button id="bookmarksBtn">Bookmarks
            <div class="help-bubble">
                Access your bookmarked verses for quick reference.
            </div>
        </button>
    </div>
    <div id="OPverseList" class="verse-list">
        <span class="SearchResult" data--book="GENESIS" data--chap="1" data--verse="0" style="touch-action: pan-y; user-select: none;">
            <span class="VerseNum">GENESIS 1:1</span> In the beginning God created the heaven and the earth.
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
        <span class="SearchResult" data--book="JOHN" data--chap="3" data--verse="15" style="touch-action: pan-y; user-select: none;">
            <span class="VerseNum">JOHN 3:16</span> ¶ For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
        <span class="SearchResult" data--book="PSALMS" data--chap="23" data--verse="1" style="touch-action: pan-y; user-select: none;">
            <span class="VerseNum">PSALMS 23:2</span> The <strong class="LORDCAPS">Lord</strong> <em>is</em> my shepherd; I shall not want.
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
        <span class="SearchResult" data--book="1 CORINTHIANS" data--chap="13" data--verse="3" style="touch-action: pan-y; user-select: none; background-color: darkblue;">
            <span class="VerseNum">1 CORINTHIANS 13:4</span> Charity suffereth long, <em>and</em> is kind; charity envieth not; charity vaunteth not itself, is not puffed up,
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
        <span class="SearchResult" data--book="PHILIPPIANS" data--chap="4" data--verse="12" style="touch-action: pan-y; user-select: none;">
            <span class="VerseNum">PHILIPPIANS 4:13</span> I can do all things through Christ which strengtheneth me.
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
        <span class="SearchResult" data--book="ROMANS" data--chap="8" data--verse="27" style="touch-action: pan-y; user-select: none; background-color: darkblue;">
            <span class="VerseNum">ROMANS 8:28</span> And we know that all things work together for good to them that love God, to them who are the called according to <em>his</em> purpose.
            <div class="help-bubble">
                Tap to read the full verse. Long press to bookmark. Swipe right to remove from the list. Swipe left to add to reading screen.
            </div>
        </span>
    </div>
    <div class="common-footer">
        <span id="addVerseBtn" class="floating-btn verse-nav-button">+
            <div class="help-bubble">
                Tap to add a new verse to your list.
            </div>
        </span>
    </div>
</div>

<style>
.help-bubble {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    border: 1px solid #ccc;
    padding: 10px;
    border-radius: 5px;
    z-index: 1000;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

button:hover .help-bubble,
.span:hover .help-bubble,
.floating-btn:hover .help-bubble {
    display: block;
}
</style>
`;