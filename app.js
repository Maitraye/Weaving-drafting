var threadWidth = 50; // cell width; for instructor view max value was 48 for 6 shafts and col-md-8
var threadSpacing = 10; // drawdown gridlines

// will need this for saving and loading WIFs
// var maxWefts = 64;
// var maxWarps = 64;

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

// var warpColor = RGBToHex(draft['COLOR TABLE'][draft.WARP.Color]);
// var weftColor = RGBToHex(draft['COLOR TABLE'][draft.WEFT.Color]);
var warpColor;
var weftColor;
var tieupColor = "#555";

var drawdownArray = [null];

// load sounds
var threadingSounds = [];
var treadlingSounds = [];
var tieupSounds = [];

// to implement double tap
var timeout;
var lastTap = 0;

// If you include your js files in the head of your document, make sure to wait for the DOM to be loaded:
// This is not an issue if you include your js at the bottom.
// I included svg at the bottom but still have this here to load sounds and other elements

SVG.on(document, 'DOMContentLoaded', function() {
	threading = SVG('threading'); // get an element from DOM, id = 'threading' in index.html
	tieup = SVG('tieup');					// get an element from DOM, id = 'tieup' in index.html
	drawdown = SVG('drawdown');		// get an element from DOM, id = 'drawdown' in index.html
	treadling = SVG('treadling');	// get an element from DOM, id = 'treadling' in index.html

	loadSounds("Piano", threadingSounds);
	loadSounds("Cello", treadlingSounds);
	// loadSounds("Guitar", tieupSounds);

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
    var selectedWarpInstrument = $(this).find("option:selected").text();
    threadingSounds.length = 0;
    loadSounds(selectedWarpInstrument, threadingSounds);
	});

$('#weftInstrument').change(function () {
  var selectedWeftInstrument = $(this).find("option:selected").text();
  treadlingSounds.length = 0;
  loadSounds(selectedWeftInstrument, treadlingSounds);
});

function loadSounds(instrumentName, soundArray) {
	var folderName = './sounds/';
	for (var i=0; i<8; i++) {
		audioName = folderName + instrumentName + i + '.mp3';
		// const blobUrl = window.createObjectURL(audioName);
		var sound = new Howl({
  			src: [audioName],
  			html5: true 
		});
		soundArray.push(sound);
	}
}

// ------- Draft display and manipulation ----------

// drawdownArray is a list of lists, each one containing an SVG group with a warp and a weft in it
// the group can receive a warpUp or warpDown event, which shuffles the svg order of the rects


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
	computeTreadlingTieup(tieup, draft.WEAVING.Shafts, draft.TIEUP, tieupColor, tieupSounds);

	// for treadling sequence
	treadling.size(draft.WEAVING.Treadles * threadWidth, draft.WEFT.Threads * threadWidth);
	computeTreadlingTieup(treadling, draft.WEFT.Threads, draft.TREADLING, weftColor, treadlingSounds);

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

			// For tap gestures, using hammer.js
			// create a simple hammer instance for each heddle
			// var mcHeddle = new Hammer(heddle);

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

			// heddle.click(function () {
			// 	// to make sure that only one is selected in a column of heddles
			// 	var heddles = this.siblings();
			// 	this.fill(warpColor);
			// 	for (var h=0; h<heddles.length; h++) {
			// 		if (heddles[h]!=this) {
			// 			heddles[h].fill("#fff");
			// 		}
			// 	}
			// 	// update the draft
			// 	draft.THREADING[this.warpNumber] = this.shaftNumber;
			// 	updateDraft();
			// });

			heddle.mouseover(function () {
				this.stroke({color:'#06f', width:15}); // gridline color and width when mouseover
				
				// the topmost shaft is numbered 1, so subtract the shaft number from the total shafts 
				// to play notes in the increasing order starting from bottom shafts
				threadingSounds[draft.WEAVING.Shafts - this.shaftNumber].play();
			});

			heddle.touchstart(function () {
				this.stroke({color:'#06f', width:15}); // gridline color and width when mouseover
				
				// the topmost shaft is numbered 1, so subtract the shaft number from the total shafts 
				// to play notes in the increasing order starting from bottom shafts
				threadingSounds[draft.WEAVING.Shafts - this.shaftNumber].play();
			});

			heddle.mouseout(function () {
				// this.attr('stroke', null);
				this.stroke({color:'#000', width:10}); //gridline color and width when mouseout
			});

			// heddle.touchend(function () {
			// 	// this.attr('stroke', null);
			// 	this.stroke({color:'#000', width:10}); //gridline color and width when mouseout
			// });

			heddle.touchend(function(event) {
		    var currentTime = new Date().getTime();
		    var tapLength = currentTime - lastTap;
		    clearTimeout(timeout);
		    if (tapLength < 500 && tapLength > 0) { // double-tap detected
		    	// this is same function as onclick
	        // to make sure that only one is selected in a column of heddles
					var heddles = this.siblings();
					this.fill(warpColor);
					for (var h=0; h<heddles.length; h++) {
						if (heddles[h]!=this) {
							heddles[h].fill("#fff");
						}
					}
					// update the draft
					draft.THREADING[this.warpNumber] = this.shaftNumber;
					updateDraft();

	        event.preventDefault();
		    } 
		    else { //single tap detected
	        timeout = setTimeout(function() {
	        	// this is same as mouseout function
            this.stroke({color:'#000', width:10}); //gridline color and width when mouseout

            clearTimeout(timeout);
	        }, 500);
		    }
		    lastTap = currentTime;
			});
		}
	}
}

function computeTreadlingTieup (gridType, jStopvalue, draftSequence, cellColor, soundArray) {
	// gridType = treadling or tieup
	// jStopvalue = draft.WEFT.Threads (for treadling) or draft.WEAVING.Shafts (for tieup)
	
	for (var j=0; j<jStopvalue; j++) {
		var currentRow = gridType.group();
		
		for (var i=0; i<draft.WEAVING.Treadles; i++) {
			// creating row of treadles for each weft thread; 
			// total no. of rects in each row equals to number of total treadles
			var treadle = gridType.rect(threadWidth, threadWidth).move(i*threadWidth, j*threadWidth);
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

			});

			treadle.mouseover(function () {
				this.stroke({color:'#06f', width:15}); // gridline color and width when mouseover
				// the leftmost treadle is numbered 1, so subtract 1 
				// to play notes in the increasing order from left to right
				soundArray[this.treadleNumber-1].play();
			});

			treadle.mouseout(function () {
				this.stroke({color:'#000', width:10}); // gridline color and width when mouseout
			})
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

// ------- File saving / loading ----------
// (mostly copied from earlier projects...)

// function saveSvg(data, name) {
// 	var svgBlob = new Blob([data], {type:"image/svg+xml;charset=utf-8"});
// 	var svgUrl = URL.createObjectURL(svgBlob);
// 	var downloadLink = document.createElement("a");
// 	downloadLink.href = svgUrl;
// 	downloadLink.download = name;
// 	document.body.appendChild(downloadLink);
// 	downloadLink.click();
// 	document.body.removeChild(downloadLink);
// }

// function saveWif (data, name) {
// 	console.log("downloading WIF");
// 	var wif = encodeINI(data);
// 	console.log(wif);
// 	var wifBlob = new Blob([wif], {type:"text/plain;charset=utf-8"});
// 	var wifUrl = URL.createObjectURL(wifBlob);
// 	var downloadLink = document.createElement("a");
// 	downloadLink.href = wifUrl;
// 	downloadLink.download = name;
// 	document.body.appendChild(downloadLink);
// 	downloadLink.click();
// 	// document.body.removeChild(downloadLink);
// }

// function loadWif (text) {
// 	var data = decodeINI(text);
// 	if (data.WIF) {
// 		draft = data;
// 		// console.log(JSON.stringify(data, null, 4));
// 		// console.log(data);
// 		if (parseInt(draft.WARP.Threads) > maxWarps) {
// 			draft.WARP.Threads = maxWarps;
// 		}
// 		if (parseInt(draft.WEFT.Threads) > maxWefts) {
// 			draft.WEFT.Threads = maxWefts;
// 		}

// 		threading.clear();
// 		tieup.clear();
// 		drawdown.clear();
// 		treadling.clear();
// 		computeNewDraft();
// 	}
// 	else {
// 		console.log("not a WIF?");
// 		console.log(text);		
// 	}
// }

// function processFile (file) {
// 	reader = new FileReader();
// 	reader.readAsText(file);
// 	reader.onload = function (e) {
// 		var result = e.target.result;
// 		loadWif(result);
// 	};
// }



// // drop handling from https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop
// function dropHandler(ev) {
// 	// Prevent default behavior (Prevent file from being opened)
// 	ev.preventDefault();

// 	if (ev.dataTransfer.items) {
// 		// Use DataTransferItemList interface to access the file(s)
// 		for (var i = 0; i < ev.dataTransfer.items.length; i++) {
// 			// If dropped items aren't files, reject them
// 			if (ev.dataTransfer.items[i].kind === 'file') {
// 				var file = ev.dataTransfer.items[i].getAsFile();
// 				console.log('... file[' + i + '].name = ' + file.name);
// 				processFile(ev.dataTransfer.items[i].getAsFile());
// 			}
// 		}
// 	} else {
// 		// Use DataTransfer interface to access the file(s)
// 		for (var i = 0; i < ev.dataTransfer.files.length; i++) {
// 			console.log('... file[' + i + '].name = ' + ev.dataTransfer.files[i].name);
// 			processFile(ev.dataTransfer.files[i].getAsFile());
// 		}
// 	}
// 	// Pass event to removeDragData for cleanup
// 	removeDragData(ev)
// }

// function dragOverHandler(ev) {
// 	// console.log('File(s) in drop zone'); 
// 	// Prevent default behavior (Prevent file from being opened)
// 	ev.preventDefault();
// }

// function removeDragData(ev) {
// 	// console.log('Removing drag data')
// 	if (ev.dataTransfer.items) {
// 		// Use DataTransferItemList interface to remove the drag data
// 		ev.dataTransfer.items.clear();
// 	} else {
// 		// Use DataTransfer interface to remove the drag data
// 		ev.dataTransfer.clearData();
// 	}
// }