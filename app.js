var threadWidth = 62; // cell width; for instructor view max value was 48 for 6 shafts and col-md-8
var threadSpacing = 10; // drawdown gridlines

var mode = "Read";

var warpColor;
var weftColor;
var tieupColor = "#555";

function RGBToHex(rgb) {
  rgb = rgb.split(',');

  let r = (+rgb[0]).toString(16),
      g = (+rgb[1]).toString(16),
      b = (+rgb[2]).toString(16);

  if (r.length == 1)
    r = "0" + r;
  if (g.length == 1)
    g = "0" + g;
  if (b.length == 1)
    b = "0" + b;

  return "#" + r + g + b;
}

// load sounds
var threadingSounds = [];
var treadlingSounds = [];
var tieupSounds = [];
var warpInstrument = "Guitar";
var weftInstrument = "Cello";

var panValues = {
	1: -1, //treadle 1 in far left stereo (-1)
	2: -0.6,
	3: -0.2,
	4: 0.2,
	5: 0.6,
	6: 1 //treadle 6 in far right stereo (1)
};

var gainValues = {
	1: 3, //treadle 1 is 0.5 times default volume
	2: 2.5,
	3: 2,
	4: 1.5,
	5: 1,
	6: 0.5 //treadle 6 in 3 times default volume
};

function loadSounds(instrumentName, soundArray) {
	// to align with CORR policy, cannot load local files. Needs to use an url.
	var folderName = 'https://maitraye.github.io/Weaving-drafting/sounds/';
	// if (instrumentName == 'Piano') { //for tieup, load full organ audio list
	// 	for (var j=0; j<6; j++) {
	// 		for (var i=0; i<7; i++) {
	// 			audioName = folderName + instrumentName + j + '-'+ i + '.mp3';
	// 			soundArray.push(audioName);	
	// 		}
	// 	}
	// }
	// else {
	for (var i=0; i<8; i++) {
		audioName = folderName + instrumentName + i + '.mp3';
		soundArray.push(audioName);
	}
	// }
}

// If you include your js files in the head of your document, make sure to wait for the DOM to be loaded:
// This is not an issue if you include your js at the bottom.
// I included svg at the bottom but still have this here to load sounds and other elements

SVG.on(document, 'DOMContentLoaded', function() {
	threading = SVG('threading'); // get an element from DOM, id = 'threading' in index.html
	tieup = SVG('tieup');					// get an element from DOM, id = 'tieup' in index.html
	drawdown = SVG('drawdown');		// get an element from DOM, id = 'drawdown' in index.html
	treadling = SVG('treadling');	// get an element from DOM, id = 'treadling' in index.html

	loadSounds(warpInstrument, threadingSounds);
	loadSounds(weftInstrument, treadlingSounds);
	loadSounds('Piano', tieupSounds);

	warpColor = RGBToHex(draft['COLOR TABLE'][draft.WARP.Color]);
	weftColor = RGBToHex(draft['COLOR TABLE'][draft.WEFT.Color]);
	computeNewDraft();
});

// updating warp and weft color based on user input in drawdown button
$('#warpColor').change(function () {
  var selectedWarpColor = $(this).find("option:selected").text();
  draft.WARP.Color = selectedWarpColor;
  warpColor = RGBToHex(draft['COLOR TABLE'][draft.WARP.Color]);
  computeNewDraft();
});

$('#weftColor').change(function () {
  var selectedWeftColor = $(this).find("option:selected").text();
  draft.WEFT.Color = selectedWeftColor;
  weftColor = RGBToHex(draft['COLOR TABLE'][draft.WEFT.Color]);
  computeNewDraft();
});

$('#warpInstrument').change(function () {
  warpInstrument = $(this).find("option:selected").text();
  threadingSounds.length = 0;
  loadSounds(warpInstrument, threadingSounds);
});

$('#weftInstrument').change(function () {
  weftInstrument = $(this).find("option:selected").text();
  treadlingSounds.length = 0;
  loadSounds(weftInstrument, treadlingSounds);
});

// updating reading or editing mode
$('#mode').change(function () {
  var selectedMode = $(this).find("option:selected").text();
  mode = selectedMode;
});

var ttsFilenames = {
	'warp' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/warp.mp3',
	'weft' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/weft.mp3',
	'shaft' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/shaft.mp3',
	'treadle' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/treadle.mp3',
	'pedal' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/pedal.mp3',
	'on' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/on.mp3',
	'off' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/off.mp3',
	'tiedup' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/tiedup.mp3',
	'notTiedup' : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/notTiedup.mp3',
	1 :  'https://maitraye.github.io/Weaving-drafting/sounds/tts/one.mp3',
	2 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/two.mp3',
	3 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/three.mp3',
	4 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/four.mp3',
	5 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/five.mp3',
	6 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/six.mp3',
	7 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/seven.mp3',
	8 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/eight.mp3',
	9 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/nine.mp3',
	10 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/ten.mp3',
	11 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/eleven.mp3',
	12 : 'https://maitraye.github.io/Weaving-drafting/sounds/tts/twelve.mp3',
}



// to implement double tap
var timeout;
var lastTap = 0;
var lastTouchEventX = 0;
var lastTouchEventY = 0;

function tapHandler(element, elementType, draftSequence, cellColor, event) {
  var currentTime = new Date().getTime();
  var tapLength = currentTime - lastTap;
  clearTimeout(timeout);

	if (tapLength < 500 && tapLength > 0) { // double-tap detected
  	// this is same function as click by mouse

  	if (mode == "Edit") {
	  	// When multi-touch happens in different heddles, that can be detected as double-tap. 
	  	// To address that, calculating if double tap happened within a very close region. 
		  if (Math.abs(event.changedTouches[0].pageX - lastTouchEventX) < 50 && Math.abs(event.changedTouches[0].pageY - lastTouchEventY) < 50) {
		  	if (elementType == "threading") {

		  		// to make sure that only one is selected in a column of heddles
					var heddles = element.siblings();
					element.fill(cellColor);

					audioListPlay([ttsFilenames.shaft, ttsFilenames[element.shaftNumber], 
						ttsFilenames.warp, ttsFilenames[element.warpNumber], ttsFilenames.on]);

					for (var h=0; h<heddles.length; h++) {
						if (heddles[h]!=element) {
							heddles[h].fill("#fff");
						}
					}
					// update the draft
					draftSequence[element.warpNumber] = element.shaftNumber;
					updateDraft();
		  	}

		  	// for both treadling and tieup
		  	else if (elementType == "treadlingOrTieup"){
		  		if (element.selected) {
						element.selected = false;
						element.fill("#fff");
						draftSequence[element.weftNumber] = csvRemove(draftSequence[element.weftNumber], element.treadleNumber);
					}
					else {
						element.selected = true;
						element.fill(cellColor);
						draftSequence[element.weftNumber] = csvAdd(draftSequence[element.weftNumber], element.treadleNumber);
					}
					updateDraft();
		  	}
		  }
		}

    event.preventDefault(); // to prevent the default zoom event on double-tap
  } 
  else { //single tap detected

  	// this is same as mouseout function
    element.stroke({color:'#000', width:10}); //gridline color and width when touchend -- similar to mouseout

    timeout = setTimeout(function() {
      clearTimeout(timeout);
    }, 500);
  }
  
  lastTap = currentTime;
  lastTouchEventX = event.changedTouches[0].pageX;
  lastTouchEventY = event.changedTouches[0].pageY;
}

// ------- Draft display and manipulation ----------

// drawdownArray is a list of lists, each one containing an SVG group with a warp and a weft in it
// the group can receive a warpUp or warpDown event, which shuffles the svg order of the rects

var drawdownArray = [null];

function computeNewDraft() {
	// clearing previous sequences to compute and save new ones after user clicks

	threading.clear();
	treadling.clear();
	tieup.clear();
	drawdown.clear();
	drawdownArray = [null]; 

	// for threading sequence
	// setting the size of the threading entire grid
	threading.size(draft.WARP.Threads * threadWidth, draft.WEAVING.Shafts * threadWidth);
	computeThreading();

	// for tieup 
	tieup.size(draft.WEAVING.Treadles * threadWidth, draft.WEAVING.Shafts * threadWidth);
	computeTreadlingTieup(tieup, "tieup", draft.WEAVING.Shafts, draft.TIEUP, tieupColor, tieupSounds);

	// for treadling sequence
	treadling.size(draft.WEAVING.Treadles * threadWidth, draft.WEFT.Threads * threadWidth);
	computeTreadlingTieup(treadling, "treadling", draft.WEFT.Threads, draft.TREADLING, weftColor, treadlingSounds);

	// for drawdown
	drawdown.size(draft.WARP.Threads * threadWidth, draft.WEFT.Threads * threadWidth);
	computeDrawdown();
	
	updateDraft();
}

function computeThreading () {
	for (var i=0; i<draft.WARP.Threads; i++) {

		// Grouping elements can be useful if you want to transform a set of elements as if it were one. 
		// All element within a group, maintain their position relative to the group they belong to. 
		var currentWarp = threading.group();
		
		for (var j=0; j<draft.WEAVING.Shafts; j++) {
			// Move method moves an element by its upper left corner to a given x and y position
			// Here, creating column of heddles/rects for each warp thread; 
			// total no of heddles/rects in each column equals to number of shafts
			var heddle = threading.rect(threadWidth, threadWidth).move(i*threadWidth, j*threadWidth); 

			// stroke is a SVG method that can fill an element with a color/image; can set width or opacity
			heddle.stroke({color:'#000', width:10}); //gridline color and width in threading sequence

			// addTo is a SVG method that sets the calling element as a child node of the argument. Returns the child.
			// Each new heddle is added to the currentWarp/threading group
			heddle.addTo(currentWarp);

			heddle.warpNumber = i+1;
			heddle.shaftNumber = j+1;

			// filling heddle rect with warpColor if the heddle is selected in draft pattern
			if (heddle.shaftNumber == parseInt(draft.THREADING[heddle.warpNumber])) heddle.fill(warpColor);
			else heddle.fill("#fff");

			heddle.click(function (event) {
			// only when Edit mode is on
			// only when clicked by a mouse -- so that this function is not executed by default when single tap happens

				if (mode == "Edit" && event.pointerType == "mouse") {
					// to make sure that only one is selected in a column of heddles
					var heddles = this.siblings();
					this.fill(warpColor);
					audioListPlay([ttsFilenames.shaft, ttsFilenames[this.shaftNumber], 
						ttsFilenames.warp, ttsFilenames[this.warpNumber], ttsFilenames.on]);
					for (var h=0; h<heddles.length; h++) {
						if (heddles[h]!=this) {
							heddles[h].fill("#fff");
						}
					}
					// update the draft
					draft.THREADING[this.warpNumber] = this.shaftNumber;
					updateDraft();
				}
			});

			heddle.mouseover(function () {
				this.stroke({color:'#06f', width:15}); // gridline color and width when mouseover
				
				// play sound only when edit mode OR when not in edit mode (i.e., read mode), play only when the cell is selected
				if (this.shaftNumber == parseInt(draft.THREADING[this.warpNumber]) || mode == "Edit") {

					// the topmost shaft is numbered 1, so subtract the shaft number from the total shafts 
					// to play notes in the increasing order starting from bottom shafts
					// threadingSounds[draft.WEAVING.Shafts - this.shaftNumber].play();
					// audioListPlay is defined in play-web-audio-api.js; takes a list of audio filenames as input
					audioListPlay([threadingSounds[draft.WEAVING.Shafts - this.shaftNumber]]);
				}
				
			});

			heddle.mouseout(function () {
				this.stroke({color:'#000', width:10}); //gridline color and width when mouseout
			});

			// same work as mouseover event -- gridline color and width change to blue when touchstart
			heddle.touchstart(function (event) {
				this.stroke({color:'#06f', width:15}); 
				// play sound only when edit mode OR when not in edit mode (i.e., read mode), play only when the cell is selected
				if (this.shaftNumber == parseInt(draft.THREADING[this.warpNumber]) || mode == "Edit") {
					// threadingSounds[draft.WEAVING.Shafts - this.shaftNumber].play();
					audioListPlay([threadingSounds[draft.WEAVING.Shafts - this.shaftNumber]]);
				}
			});

			heddle.touchend(function(event){
				tapHandler (this, "threading", draft.THREADING, warpColor, event);
			});
		}
	}
}

function computeTreadlingTieup (grid, gridType, jStopvalue, draftSequence, cellColor, soundArray) {
	// grid = treadling or tieup
	// jStopvalue = draft.WEFT.Threads (for treadling) or draft.WEAVING.Shafts (for tieup)
	
	for (var j=0; j<jStopvalue; j++) {
		var currentRow = grid.group();
		
		for (var i=0; i<draft.WEAVING.Treadles; i++) {
			// creating row of treadles for each weft thread; 
			// total no. of rects in each row equals to number of total treadles
			var treadle = grid.rect(threadWidth, threadWidth).move(i*threadWidth, j*threadWidth);
			treadle.stroke({color:'#000', width:10}); //gridline color and width in tieup and treadling
			treadle.addTo(currentRow);
			treadle.weftNumber = j+1;
			treadle.treadleNumber = i+1;

			treadle.fill("#fff");
			treadle.selected = false;

			// multiple treadles can be pressed at once (in treadling) or a treadle can be tied to multiple shafts (in tieup)
			// splitting the sequence saved in draft pattern by ',' and looping through all selected treadles.
			// draftSequence is draft.TREADLING or draft.TIEUP
			var currentRowDraft = (draftSequence[treadle.weftNumber] + "").split(",");
			for (var t=0; t<currentRowDraft.length; t++) {
				if (parseInt(currentRowDraft[t]) == treadle.treadleNumber) {
					treadle.selected = true;
					treadle.fill({color: cellColor});
				}
			}

			// unselect a treadle if selected already, else select.
			treadle.click(function () {
				// only when Edit mode is on
				// only when clicked by a mouse -- to change the default tap behavior
				if (mode == "Edit" && event.pointerType == "mouse") {
					if (this.selected) {
						this.selected = false;
						this.fill("#fff");
						draftSequence[this.weftNumber] = csvRemove(draftSequence[this.weftNumber], this.treadleNumber);
					}
					else {
						this.selected = true;
						this.fill(cellColor);
						draftSequence[this.weftNumber] = csvAdd(draftSequence[this.weftNumber], this.treadleNumber);
					}

					updateDraft();
				}
			});

			treadle.mouseover(function () {
				this.stroke({color:'#06f', width:15}); // gridline color and width when mouseover

				// play sound only when edit mode OR when not in edit mode (i.e., read mode), play only when the cell is selected
				if (this.selected || mode == "Edit") {
					// the leftmost treadle is numbered 1, so subtract 1 
					// to play notes in the increasing order from left to right
					// soundArray[this.treadleNumber-1].play();
					if (gridType == "treadling") {
						audioListPlay([soundArray[this.treadleNumber-1]]);
					}
					// for tieup play notes in the increasing order from bottom to top, so 6-weftNumber
					
					else if (gridType == "tieup") { 
						// tieupSounds [14-20] is C4-B4 (regular octave) for Organ sounds changing by octave
						// audioListPlay([soundArray[7*(this.treadleNumber-1) + (6-this.weftNumber)]]);

						audioListPlay([soundArray[6-this.weftNumber]], gainValues[this.treadleNumber], 0, "Loudness");
						// audioListPlay([soundArray[6-this.weftNumber+14]], 0, panValues[this.treadleNumber], "Panning");
						// audioListPlay([soundArray[6-this.weftNumber+14]]);
					}
				}
			});

			treadle.mouseout(function () {
				this.stroke({color:'#000', width:10}); // gridline color and width when mouseout
			});

			// same work as mouseover event -- gridline color and width change to blue when touchstart
			treadle.touchstart(function (event) {
				this.stroke({color:'#06f', width:15}); 

				if (this.selected || mode == "Edit") {
					if (gridType == "treadling") {
						audioListPlay([soundArray[this.treadleNumber-1]]);
					}
					else if (gridType == "tieup") { 
						// audioListPlay([soundArray[7*(this.treadleNumber-1) + (6-this.weftNumber)]]);

						audioListPlay([soundArray[6-this.weftNumber]], gainValues[this.treadleNumber], 0, "Loudness");
						// audioListPlay([soundArray[6-this.weftNumber+14]], 0, panValues[this.treadleNumber], "Panning");
						// audioListPlay([soundArray[6-this.weftNumber+14]]);
					}
				}
			});

			treadle.touchend(function(event){
				tapHandler (this, "treadlingOrTieup", draftSequence, cellColor, event);
			});
		}
	}
}

function computeDrawdown () {
	for (var i=0; i<draft.WEFT.Threads; i++) {
		var lineArray = [null];
		for (var j=0; j<draft.WARP.Threads; j++) {
			var interlacement = drawdown.group();
			var warp = drawdown.rect(threadWidth - threadSpacing, threadWidth).move((i*threadWidth)+threadSpacing/2, j*threadWidth).fill(warpColor);
			var weft = drawdown.rect(threadWidth, threadWidth - threadSpacing).move(i*threadWidth, (j*threadWidth)+threadSpacing/2).fill(weftColor);
			warp.addTo(interlacement);
			weft.addTo(interlacement);
			interlacement.warp = warp;
			interlacement.warpUp = false;
			lineArray.push(interlacement);
			// drawdownArray[i][j] = interlacement;
			interlacement.on('warpUp', function () {
				if (!this.warpUp) {
					this.warp.front();
					this.warpUp = true;
				}
			});
			interlacement.on('warpDown', function () {
				if (this.warpUp) {
					this.warp.back();
					this.warpUp = false;
				}
			});
		}
		drawdownArray.push(lineArray);
	}
}


// other important functions called from computeDrawDown and computeTreadlingTieup

function csvAdd (csv, thingToAdd) {
	var list = (csv+"").split(",");
	list.push(thingToAdd);
	return list.join(",");
}

function csvRemove (csv, thingToRemove) {
	var list = (csv+"").split(",");

	var newList = [];
	for (var i=0; i<list.length; i++) {
		if (list[i] != thingToRemove && parseInt(list[i]) != thingToRemove) {
			newList.push(list[i]);
		}
	}
	return newList.join(",");
}

function tieupToMatrix () {
	var mat = [];
	var padding = [];
	for (var shaft=1; shaft<=draft.WEAVING.Shafts; shaft++) {
		padding.push(null);
	}
	mat.push(padding);
	for (i in draft.TIEUP) {
		var treadle = [null];
		var thisTiedTreadle = draft.TIEUP[i].split(",");
		for (var shaft=1; shaft<=draft.WEAVING.Shafts; shaft++) {
			if (thisTiedTreadle.includes(shaft) || thisTiedTreadle.includes(shaft+"")) treadle.push(1);
			else treadle.push(0);
		}	
		mat.push(treadle);
	}
	// console.log(JSON.stringify(mat, null, 2));
	// console.log(mat);
	return mat;
}

function updateDraft () {
	var tieupMatrix = tieupToMatrix();
	for (var i=1; i<=parseInt(draft.WARP.Threads); i++) {
		renderWarpDrawdown(i, tieupMatrix);
	}
}
function renderWarpDrawdown (i, tieupMatrix) {
	for (var j = 1; j<=parseInt(draft.WEFT.Threads); j++) {
		var warpUp = false;
		var heddle = draft.THREADING[i];
		var pick = (draft.TREADLING[j]+"").split(',');
		for (var t = 0; t<pick.length; t++) {
			// "When the string is empty, split() returns an array containing one empty string, 
			// rather than an empty array. If the string and separator are both empty strings, 
			// an empty array is returned." 
			// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split
			if (pick[t] != "") {
				if (tieupMatrix[parseInt(pick[t])][parseInt(heddle)] == 1) {
					warpUp = true;
				}
			}
		}
		if (warpUp) {
			drawdownArray[i][j].fire("warpUp");
		}
		else {
			drawdownArray[i][j].fire("warpDown");
		}
	}
}

