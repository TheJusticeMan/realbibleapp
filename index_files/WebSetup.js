     // Function to load the JSON file
    async function loadBibleCrossReferences() {
        try {
            const response = await fetch('./index_files/BibleCRef.json'); // Replace with the correct path to your JSON file
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            BibleCrossReferences = await response.json();
            console.log('BibleCrossReferences loaded:', BibleCrossReferences);
            //alert(BibleCrossReferences["Gen"][1][1]);
        } catch (error) {
            console.error('Failed to load BibleCRef.json:', error);
        }
    }

