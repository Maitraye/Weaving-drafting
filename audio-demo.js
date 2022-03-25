// with howler.js
const threadingPlayButton = document.querySelector('#threading-play');
const treadlingPlayButton = document.querySelector('#treadling-play');
// const tieupPlayButton = document.querySelector('#tieup-play');
var threadingSequence = [];
var treadlingSequence = [];
// var tieupSequence = [];
function createAudioSequence(instrumentName, type) {
	var folderName = 'https://maitraye.github.io/weaving-sounds/';
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
			selectedTreadle = draft.TREADLING[i+1].split(','); 	// adding 1 with the index, since treadling starts from 1 in the 'draft' (pattern.js).
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

function autoplay(i, list, finalCycle, currentCycle) {
	currentCycle = currentCycle || 1;	
    finalCycle   = finalCycle   || 'infinite repeat'; // [1-n]: numeral value expected.
    var sound = new Howl({
        src: [list[i]],
        preload: true,
        html5: true,
        onend: function () {
            if ((i + 1) == list.length) {
                autoplay(0, list, finalCycle, currentCycle);
            } else {
                autoplay(i + 1, list, finalCycle, currentCycle);
            }
        }
    })
    currentCycle===finalCycle+1 && i===0? sound.stop(): sound.play();
    // console.log('currentCycle: ',currentCycle,
    // 			'finalCycle: ',finalCycle,
    //             'Objet number: ',i)
    if(i==list.length-1){ 
    	currentCycle++; 
    }
}

// play audio
threadingPlayButton.addEventListener('click', function() {
	createAudioSequence('Piano', 'threading');
	autoplay(0, threadingSequence,1);
}, false);

treadlingPlayButton.addEventListener('click', function() {
	createAudioSequence('Cello', 'treadling');
	autoplay(0, treadlingSequence,1);
}, false);





// source: https://css-tricks.com/introduction-web-audio-api/
// var context = new (window.AudioContext || window.webkitAudioContext)();
// let sounds = ['sounds/SPiano0.mp3', 'sounds/SPiano1.mp3', 'sounds/SPiano2.mp3', 'sounds/SPiano3.mp3', 'sounds/SPiano4.mp3', 'sounds/SPiano5.mp3', 'sounds/SPiano6.mp3', 'sounds/SPiano7.mp3']

// class Buffer {

//   constructor(context, urls) {  
//     this.context = context;
//     this.urls = urls;
//     this.buffer = [];
//   }

//   loadSound(url, index) {
//     let request = new XMLHttpRequest();
//     request.open('get', url, true);
//     request.responseType = 'arraybuffer';
//     let thisBuffer = this;
//     request.onload = function() {
//       thisBuffer.context.decodeAudioData(request.response, function(buffer) {
//         thisBuffer.buffer[index] = buffer;
//         updateProgress(thisBuffer.urls.length);
//         if(index == thisBuffer.urls.length-1) {
//           thisBuffer.loaded();
//         }       
//       });
//     };
//     request.send();
//   };

//   loadAll() {
//     this.urls.forEach((url, index) => {
//       this.loadSound(url, index);
//     })
//   }

//   loaded() {
//     // what happens when all the files are loaded
//   }

//   getSoundByIndex(index) {
//     return this.buffer[index];
//   }

// }

// // context.decodeAudioData(audioData).then(function(decodedData) {
// //   // use the decoded data here
// // });

// class Sound {

//   constructor(context, buffer) {
//     this.context = context;
//     this.buffer = buffer;
//   }

//   init() {
//     this.gainNode = this.context.createGain();
//     this.source = this.context.createBufferSource();
//     this.source.buffer = this.buffer;
//     this.source.connect(this.gainNode);
//     this.gainNode.connect(this.context.destination);
//   }

//   play() {
//     // this.setup();
//     this.source.start(this.context.currentTime);
//   }  

//   stop() {
//     this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.5);
//     this.source.stop(this.context.currentTime + 0.5);
//   }

// }

// let buffer = new Buffer(context, sounds);
// buffer.loadAll();

// sound = new Sound(context, buffer.getSoundByIndex('#threading-play'));
// sound.play();

// .................................................
// source: https://codepen.io/Rumyra/pen/qyMzqN/
// console.clear();

// // instigate our audio context

// // for cross browser
// const AudioContext = window.AudioContext || window.webkitAudioContext;
// const audioCtx = new AudioContext();

// // load some sound
// const audioElement = document.querySelector('#song');
// // const track = audioCtx.createMediaElementSource(audioElement);

// const playButton = document.querySelector('.tape-controls-play');

// // play pause audio
// playButton.addEventListener('click', function() {
	
// 	// check if context is in suspended state (autoplay policy)
// 	if (audioCtx.state === 'suspended') {
// 		audioCtx.resume();
// 	}
	
// 	if (this.dataset.playing === 'false') {
// 		audioElement.play();
// 		this.dataset.playing = 'true';
// 	// if track is playing pause it
// 	} else if (this.dataset.playing === 'true') {
// 		audioElement.pause();
// 		this.dataset.playing = 'false';
// 	}
	
// 	let state = this.getAttribute('aria-checked') === "true" ? true : false;
// 	this.setAttribute( 'aria-checked', state ? "false" : "true" );
	
// }, false);

// // if track ends
// audioElement.addEventListener('ended', () => {
// 	playButton.dataset.playing = 'false';
// 	playButton.setAttribute( "aria-checked", "false" );
// }, false);

// volume
// const gainNode = audioCtx.createGain();

// const volumeControl = document.querySelector('[data-action="volume"]');
// volumeControl.addEventListener('input', function() {
// 	gainNode.gain.value = this.value;
// }, false);

// // panning
// const pannerOptions = {pan: 0};
// const panner = new StereoPannerNode(audioCtx, pannerOptions);

// const pannerControl = document.querySelector('[data-action="panner"]');
// pannerControl.addEventListener('input', function() {
// 	panner.pan.value = this.value;	
// }, false);

// // connect our graph
// track.connect(gainNode).connect(panner).connect(audioCtx.destination);

// const powerButton = document.querySelector('.control-power');

// powerButton.addEventListener('click', function() {
// 	if (this.dataset.power === 'on') {
// 		audioCtx.suspend();
// 		this.dataset.power = 'off';
// 	} else if (this.dataset.power === 'off') {
// 		audioCtx.resume();
// 		this.dataset.power = 'on';
// 	}
// 	this.setAttribute( "aria-checked", state ? "false" : "true" );
// 	console.log(audioCtx.state);
// }, false);