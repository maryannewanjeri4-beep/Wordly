const searchForm = document.getElementById('search-form');
const wordInput = document.getElementById('word-input');
const emptySection = document.getElementById('empty');
const resultsSection = document.getElementById('results');
const messageText = document.getElementById('message');

//actions on the results
const resultWord = document.getElementById('result-word');
const resultPhonetic = document.getElementById('result-phonetic');
const audioButton = document.getElementById('audio-button');
const audioPlayer = document.getElementById('audio-player');
const partOfSpeech = document.getElementById('result-part-of-speech');
const definitionText = document.getElementById('result-definition');
const exampleText = document.getElementById('result-example');
const synonymsText = document.getElementById('result-synonyms');


//to prevents the page from naturally refreshing we need to store the data the user inputs:

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    //incase user puts a space in the string
    const targetWord = wordInput.value.trim();//this extracts the string
    //if a word is typed
    if (targetWord !== "") {
        searchWord(targetWord);
    }
});

function searchWord(word) {
    //to show a loading text in your message element:
    messageText.textContent = "Looking up word...";
    messageText.style.color = "black";
fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    .then(response => {
        if (response.ok === false) {
            throw new Error("Word not found");
        }
        //converts data into readable javascript
        return response.json();


    })
    .then(data => {
        //clear looking up...searching message
        messageText.textContent="";
        //breaking down the data package..........makes the data clean to read
        const wordData = data[0]; 
      const meaning = wordData.meanings[0];
      const definition = meaning.definitions[0];


      //html placeholders are then replaced with text from the server
      resultWord.textContent = wordData.word;
      resultPhonetic.textContent = wordData.phonetic || "";
      partOfSpeech.textContent = meaning.partOfSpeech;
      definitionText.textContent = definition.definition;
      

    //check if there is an example sentence ..if yes place it...if not hide it
     if (definition.example) {
        exampleText.textContent = "Example: " + definition.example;
        exampleText.style.display = "block"; 
      } else {
        exampleText.style.display = "none"; 
      }


        //Check if synonyms exist. If yes, show them. If no, hide them.
      if (meaning.synonyms && meaning.synonyms.length > 0) {
        synonymsText.textContent = "Synonyms: " + meaning.synonyms.join(", ");
        synonymsText.style.display = "block";
      } else {
        synonymsText.style.display = "none";
      }

       // Try to find an audio sound link. If it exists, hook it up to our play button.
      if (wordData.phonetics && wordData.phonetics[0] && wordData.phonetics[0].audio) {
        audioPlayer.src = wordData.phonetics[0].audio;
        audioButton.style.display = "inline-block";
      } else {
        audioButton.style.display = "none";
      }

       //  Swap screens: hide the empty screen, reveal our new results screen!
      emptySection.setAttribute("hidden", "true");
      resultsSection.removeAttribute("hidden");
    })
    .catch(error => {
      //  SAFETY NET: If anything goes wrong, show a friendly red error message
      messageText.textContent = "Sorry, we couldn't find '" + word + "'. Try another word!";
      messageText.style.color = "red";
      
      // Reset the screens back to the home state
      resultsSection.setAttribute("hidden", "true");
      emptySection.removeAttribute("hidden");
    });

}
