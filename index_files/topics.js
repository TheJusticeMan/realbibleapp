const topics = {};
let listOfAllTopics=[];// in lowercase
let listOfAllTopicslowercase=[];// in lowercase
let topicsLoaded = false;

async function loadtopics() {

    function convertOsisToBibleRef(osis) {
        if (!osis) return null;

        const rangeParts = osis.split('-');
        const startParts = rangeParts[0].split('.');

        if (startParts.length < 2 || isNaN(startParts[1])) return null;

        const Book = booksOfTheBible[BookShortNames.indexOf(startParts[0])];
        const Chap = parseInt(startParts[1], 10);
        const Verse = (startParts.length > 2 && !isNaN(startParts[2])) ? parseInt(startParts[2], 10) : 1;

        return new BibleRef(Book, Chap, Verse-1);
    }

    const data = (await loadTopicsText()).trim();
    const lines = data.split('\n');

    lines.slice(1).forEach(line => {
        const parts = line.split('\t');
        if (parts.length < 3) return;

        const [topic, osis, quality] = parts;
        const bibleRef = convertOsisToBibleRef(osis);
        if (!bibleRef || isNaN(quality)) return;

        if (!topics[topic]) {
            topics[topic] = [];
        }
        topics[topic].push({
            verse: bibleRef,
            qualityScore: parseInt(quality, 10)
        });
    });
    listOfAllTopics = Object.keys(topics);
}

function FindTopic(query) {
    const topic = query.trim().toLowerCase();
    //find topics that have the query in their name
    const matches = listOfAllTopics.filter(t => t.includes(topic));
    if (matches.length > 0) {
        return matches;
    }
    return null;
}

function VersesOfTopic(topic) {
    if (!topics[topic]) return null;
    return topics[topic].sort((a, b) => b.qualityScore - a.qualityScore);
}

