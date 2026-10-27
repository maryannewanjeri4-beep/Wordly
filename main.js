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
const definitionsContainer = document.getElementById('definitions-container');


//to prevents the page from naturally refreshing we need to store the data the user inputs:

searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    //incase user puts a space in the string
    const targetWord = wordInput.value.trim();//this extracts the string
    //if a word is typed
    if (targetWord !== "") {
        searchWord(targetWord);
    } else {
      messageText.textContent = "Please type a word.";
      messageText.style.color = "white";
      wordInput.focus();
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


      //html placeholders are then replaced with text from the server
      resultWord.textContent = wordData.word;
      resultPhonetic.textContent = wordData.phonetic || "";

      definitionsContainer.replaceChildren();
      (wordData.meanings || []).forEach(meaning => {
        const meaningSection = document.createElement('section');
        meaningSection.className = 'meaning-group';

        const heading = document.createElement('h4');
        heading.className = 'meaning-part-of-speech';
        heading.textContent = meaning.partOfSpeech || 'Meaning';
        meaningSection.appendChild(heading);

        if (meaning.synonyms?.length) {
          const synonyms = document.createElement('p');
          synonyms.className = 'meaning-synonyms';
          synonyms.textContent = 'Synonyms: ' + meaning.synonyms.join(', ');
          meaningSection.appendChild(synonyms);
        }

        (meaning.definitions || []).forEach(definition => {
          const definitionEntry = document.createElement('article');
          definitionEntry.className = 'definition-entry';

          const definitionText = document.createElement('p');
          definitionText.className = 'definition-text';
          definitionText.textContent = definition.definition;
          definitionEntry.appendChild(definitionText);

          if (definition.example) {
            const example = document.createElement('p');
            example.className = 'definition-example';
            example.textContent = 'Example: ' + definition.example;
            definitionEntry.appendChild(example);
          }

          if (definition.synonyms?.length) {
            const synonyms = document.createElement('p');
            synonyms.className = 'definition-synonyms';
            synonyms.textContent = 'Synonyms: ' + definition.synonyms.join(', ');
            definitionEntry.appendChild(synonyms);
          }

          meaningSection.appendChild(definitionEntry);
        });

        definitionsContainer.appendChild(meaningSection);
      });

       // Use the first phonetic entry that actually has an audio recording.
      const audioUrl = wordData.phonetics?.find(phonetic => phonetic.audio?.trim())?.audio;
      if (audioUrl) {
        audioPlayer.src = audioUrl.startsWith('//') ? `https:${audioUrl}` : audioUrl;
        audioButton.style.display = "inline-block";
      } else {
        audioPlayer.removeAttribute('src');
        audioPlayer.load();
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
//Word options hook up
const wordOptions = document.querySelectorAll('.word-option');  //to create a nodelist
wordOptions.forEach(button => {
  button.addEventListener('click', function() {
    const targetWord = button.textContent;
    wordInput.value = targetWord; // Sync text input window automatically
    searchWord(targetWord);
  });
});
// Trigger Audio Playback Safely
audioButton.addEventListener('click', function() {
  if (audioPlayer.src) {
    audioPlayer.play().catch(speakWord);
  } else {
    speakWord();
  }
})

function speakWord() {
  if (!('speechSynthesis' in window)) {
    messageText.textContent = "Sorry, pronunciation audio is unavailable.";
    messageText.style.color = "red";
    return;
  }

  window.speechSynthesis.cancel();
  const pronunciation = new SpeechSynthesisUtterance(resultWord.textContent);
  pronunciation.lang = 'en-US';
  window.speechSynthesis.speak(pronunciation);
  messageText.textContent = "Playing spoken pronunciation.";
  messageText.style.color = "black";
}