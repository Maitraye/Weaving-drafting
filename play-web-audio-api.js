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
    for (var i=draft.WARP.Threads; i>0; i--) {
      selectedElement = draft.WEAVING.Shafts - draft.THREADING[i];
      audioFileName = folderName + instrumentName + selectedElement + '.mp3';
      threadingSequence.push(audioFileName);
    }
  }
  else if (type == 'treadling') {
    for (var i=0; i<draft.WEFT.Threads; i++) {
      // splitting the treadle csv list by ',' and looping through all selected treadles.
      selectedElement = draft.TREADLING[i+1].split(',');  // adding 1 with the index, since treadling starts from 1 in the 'draft' (pattern.js).
      for (var j=0; j<selectedElement.length;j++) {
        if (selectedElement[j] != "") {
          // and subtracting 1 from treadle value to play the appropriate music note file which starts with index 0
          audioFileName = folderName + instrumentName + (selectedElement[j]-1) + '.mp3';
          treadlingSequence.push(audioFileName);
        }
      } 
    }
  }
  else { //type == "tieup"
    if (tieupReadBy == "Row") {
      if (tieupTone == "Musical") {
        for (var i=draft.WEAVING.Shafts; i>0; i--) { //counting down because tieup number 1 refers to top row/shaft
          // splitting the treadle csv list by ',' and looping through all selected treadles.
          selectedElement = draft.TIEUP[i].split(','); 
          for (var j=0; j<selectedElement.length;j++) {
            if (selectedElement[j] != "") {
              // and subtracting 1 from treadle value to play the appropriate music note file which starts with index 0
              audioFileName = folderName + instrumentName + (selectedElement[j]-1) + '.mp3';
              tieupSequence.push(audioFileName);
              tieupPanSequence.push(panValues[7-i]);
              tieupGainSequence.push(gainValues[7-i]);
            }
          }
        } 
      } 
      else { //tieupTone == On-off
        for (var i=draft.WEAVING.Shafts; i>0; i--) { //counting down because tieup number 1 refers to top row/shaft
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
        }
      } 
    }
    else { //tieupReadBy == Column

    }
  }
}

var context;
var bufferLoader;

// function audioListPlay(audioURLs, panValue = 0) {
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
  console.log(tieupSequence);
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