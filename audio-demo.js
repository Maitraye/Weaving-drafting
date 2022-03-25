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