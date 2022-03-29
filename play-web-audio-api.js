// define variables
var threadingSequence = [];
var treadlingSequence = [];
var tieupSequence = [];

var threadingPlayButton = document.querySelector('#threading-play');
var treadlingPlayButton = document.querySelector('#treadling-play');

function createAudioSequence(instrumentName, type) {
  var folderName = 'https://maitraye.github.io/Weaving-drafting/sounds/';
  // clearing previous sequence
  threadingSequence = [];
  treadlingSequence = [];
  // tieupSequence = [];

  if (type == 'threading') {
    for (var i=draft.WARP.Threads; i>0; i--) {
      var selectedShaft = draft.WEAVING.Shafts - draft.THREADING[i];
      var audioFileName = folderName + instrumentName + selectedShaft + '.mp3';
      threadingSequence.push(audioFileName);
    }
  }
  else if (type == 'treadling') {
    var selectedTreadle;
    for (var i=0; i<draft.WEFT.Threads; i++) {
      // splitting the treadle csv list by ',' and looping through all selected treadles.
      selectedTreadle = draft.TREADLING[i+1].split(',');  // adding 1 with the index, since treadling starts from 1 in the 'draft' (pattern.js).
      for (var j=0; j<selectedTreadle.length;j++) {
        if (selectedTreadle[j] != "") {
          // and subtracting 1 from treadle value to play the appropriate music note file which starts with index 0
          var audioFileName = folderName + instrumentName + (selectedTreadle[j]-1) + '.mp3';
          treadlingSequence.push(audioFileName);
        }
      } 
    }
  }
}

var context;
var bufferLoader;

// function audioListPlay(audioURLs, panValue = 0) {
function audioListPlay(audioURLs, gainValue = 1, panValue = 0, tieupMode = "") {
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
      gainNode.gain.value = gainValue;
      source.connect(gainNode).connect(context.destination);
      source.start(i*0.5);
    }
  }

  function finishedLoadingPan(bufferList) {
    for (var i=0; i<bufferList.length; i++) {
      var source = context.createBufferSource();
      source.buffer = bufferList[i];
      var panNode = context.createStereoPanner();
      panNode.pan.value = panValue;
      source.connect(panNode).connect(context.destination);
      source.start(i*0.5);
    }
  }

  if (tieupMode == "") {
    bufferLoader = new BufferLoader(context, audioURLs, finishedLoading);
    bufferLoader.load();
  }
  else if (tieupMode == "Loudness") {
    bufferLoader = new BufferLoader(context, audioURLs, finishedLoadingGain);
    bufferLoader.load();
  }
  else if (tieupMode == "Panning") {
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


// stop.onclick = function() {
//   source.stop(0);
//   // play.removeAttribute('disabled');
// }