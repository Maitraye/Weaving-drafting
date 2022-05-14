// define variables
var threadingSequence = [];
var treadlingSequence = [];
var tieupSequence = [];
var tieupGainSequence = [];
var tieupPanSequence = [];
 
var threadingPlayButton = document.querySelector('#threading-play');
var treadlingPlayButton = document.querySelector('#treadling-play');
var tieupPlayButton = document.querySelector('#tieup-play');

function createAudioSequence(instrumentName, type) {
  var folderName = 'https://maitraye.github.io/Weaving-drafting/sounds/';
  
  // clearing previous sequence
  threadingSequence = [];
  treadlingSequence = [];
  tieupSequence = [];
  tieupGainSequence = [];
  tieupPanSequence = [];
  var audioFileName = "";
  var selectedElement = [];

  if (type == 'threading') {
    for (var i=1; i<=draft.WARP.Threads; i++) { //starting i with 1, since threading starts from 1 in the 'draft' (pattern.js).
      if (audioFormat == "Musical") {
        selectedElement = draft.THREADING[i]-1;
        audioFileName = folderName + instrumentName + selectedElement + '.mp3';
        threadingSequence.push(audioFileName);
      }
      else {
        threadingSequence.push(ttsFilenames[draft.THREADING[i]]);
      }
    }
  }
  else if (type == 'treadling') {
    for (var i=1; i<=draft.WEFT.Threads; i++) { //starting i with 1, since treadling starts from 1 in the 'draft' (pattern.js).
      // splitting the treadle csv list by ',' and looping through all selected treadles.
      selectedElement = draft.TREADLING[i].split(',');  
      selectedElement.sort(); //making sure that the lower number treadles in a row plays first
      for (var j=0; j<selectedElement.length;j++) {
        if (selectedElement[j] != "") {
          if (audioFormat == "Musical") {
            // and subtracting 1 from treadle value to play the appropriate music note file which starts with index 0
            audioFileName = folderName + instrumentName + (selectedElement[j]-1) + '.mp3';
            treadlingSequence.push(audioFileName);
          }
          else {
            treadlingSequence.push(ttsFilenames[selectedElement[j]]);
          }
        }
      }
      treadlingSequence.push(earconFileNames.off); 
    }
  }
  else { //type == "tieup"
    if (tieupReadBy == "Column") {
      if (tieupTone == "Musical") {
        for (var i=1; i<=draft.WEAVING.Shafts; i++) {
          // splitting the treadle csv list by ',' and looping through all selected treadles.
          selectedElement = draft.TIEUP[i].split(','); 
          selectedElement.sort();
          for (var j=0; j<selectedElement.length;j++) {
            if (selectedElement[j] != "") {
              // and subtracting 1 from treadle value to play the appropriate music note file which starts with index 0
              audioFileName = folderName + instrumentName + (selectedElement[j]-1) + '.mp3';
              tieupSequence.push(audioFileName);
              tieupPanSequence.push(panValues[i]);
              tieupGainSequence.push(gainValues[i]);
            }
          }
        } 
      } 
      else { //tieupTone == On-off
        for (var i=1; i<=draft.WEAVING.Shafts; i++) {
          // splitting the treadle csv list by ',' and looping through all selected treadles.
          selectedElement = draft.TIEUP[i].split(',');
          for (var j=1; j<=draft.WEAVING.Treadles; j++) {
            if (selectedElement.includes(j.toString())) { //if the treadle number is in the selectedTreadle list
              tieupSequence.push(earconFileNames.on);
            }
            else {
              tieupSequence.push(earconFileNames.off);
            }
          }
          tieupSequence.push(earconFileNames.silence);
          tieupSequence.push(earconFileNames.silence);
        }
      } 
    }
    else { //tieupReadBy == Row

    }
  }
}

var context;
var bufferLoader;

function audioListPlay(audioURLs, gainOrPanValues = [], selectedTieupOption = "") {
  // Fix up prefixing -- important to create a new context instance here; otherwise does not work
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  context = new AudioContext();

  function finishedLoading(bufferList) {
    // Create multiple sources and play them in 0.5s distance.

    for (var i=0; i<bufferList.length; i++) {
      var source = context.createBufferSource();
      source.buffer = bufferList[i];
      source.connect(context.destination);
      source.start(i*0.5);
    }
  }

  function finishedLoadingGain(bufferList) {
    for (var i=0; i<bufferList.length; i++) {
      var source = context.createBufferSource();
      source.buffer = bufferList[i];
      var gainNode = context.createGain();
      gainNode.gain.value = gainOrPanValues[i];
      source.connect(gainNode).connect(context.destination);
      source.start(i*0.5);
    }
  }

  function finishedLoadingPan(bufferList) {
    for (var i=0; i<bufferList.length; i++) {
      var source = context.createBufferSource();
      source.buffer = bufferList[i];
      var panNode = context.createStereoPanner();
      panNode.pan.value = gainOrPanValues[i];
      source.connect(panNode).connect(context.destination);
      source.start(i*0.5);
    }
  }

  if (selectedTieupOption == "") {
    bufferLoader = new BufferLoader(context, audioURLs, finishedLoading);
    bufferLoader.load();
  }
  else if (selectedTieupOption == "Loudness") {
    bufferLoader = new BufferLoader(context, audioURLs, finishedLoadingGain);
    bufferLoader.load();
  }
  else if (selectedTieupOption == "Panning") {
    bufferLoader = new BufferLoader(context, audioURLs, finishedLoadingPan);
    bufferLoader.load();
  }
}

threadingPlayButton.addEventListener('click', function() {
  createAudioSequence(warpInstrument, 'threading');
  audioListPlay(threadingSequence);
}, false);

treadlingPlayButton.addEventListener('click', function() {
  createAudioSequence(weftInstrument, 'treadling');
  audioListPlay(treadlingSequence);
}, false);

tieupPlayButton.addEventListener('click', function() {
  createAudioSequence(tieupInstrument, 'tieup');
  if (tieupTone == "On-off") {
    audioListPlay(tieupSequence);
  }
  else { //TieupTone == Musical
    if (tieupOption == "Loudness") {
      audioListPlay (tieupSequence, tieupGainSequence, tieupOption);
    }
    else { //tieupOption == Panning
      audioListPlay (tieupSequence, tieupPanSequence, tieupOption);
    }
  }
}, false);


// stop.onclick = function() {
//   source.stop(0);
//   // play.removeAttribute('disabled');
// }