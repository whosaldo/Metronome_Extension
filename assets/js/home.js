document.getElementById("start").addEventListener("click", play);
document.getElementById("start").addEventListener("click", storeUserPrefs);
document.getElementById("b_settings").addEventListener("click", storeUserPrefs);

document.getElementById("o2").addEventListener("click", o2);
document.getElementById("i2").addEventListener("click", i2);

document.getElementById('bpmInput').addEventListener('change',
function() {
  this.setAttribute('value',this.value);
  /// console.log(document.getElementById('bpmInput').value);
  tempo = this.value;
  bpmOutput.value = bpmInput.value
}
);

var audioContext = null;
var isPlaying = false;      // Are we currently playing?
var startTime;              // The start time of the entire sequence.
var currentTwelveletNote;        // What note is currently last scheduled?
var tempo;        // tempo (in beats per minute)
var meter = 4;
var masterVolume ;
var accentVolume ;
var quarterVolume ;
var eighthVolume = 0;
var sixteenthVolume = 0;
var tripletVolume = 0;
var lookahead = 25.0;       // How frequently to call scheduling function
                            //(in milliseconds)
var scheduleAheadTime = 0.1;    // How far ahead to schedule audio (sec)
                            // This is calculated from lookahead, and overlaps
                            // with next interval (in case the timer is late)
var nextNoteTime = 0.0;     // when the next note is due.
var noteLength = 0.05;      // length of "beep" (in seconds)
var notesInQueue = [];      // the notes that have been put into the web audio,
                            // and may or may not have played yet. {note, time}
var timerWorker = null;     // The Web Worker used to fire timer messages


function maxBeats() {
  var beats = (meter * 12);
  return beats;
}

function nextTwelvelet() {
  var secondsPerBeat = 60.0 / tempo;
  nextNoteTime += 0.08333 * secondsPerBeat;    // Add beat length to last beat time
  currentTwelveletNote++;    // Advance the beat number, wrap to zero

  if (currentTwelveletNote == maxBeats()) {
    currentTwelveletNote = 0;
  }
}

function calcVolume(beatVolume) {
  return (beatVolume * masterVolume);
}

function scheduleNote(beatNumber, time) {
  // push the note on the queue, even if we're not playing.
  notesInQueue.push({ note: beatNumber, time: time });

  // create oscillator & gainNode & connect them to the context destination
  var osc = audioContext.createOscillator();
  var gainNode = audioContext.createGain();

  osc.connect(gainNode);
  gainNode.connect(audioContext.destination);

  if (beatNumber % maxBeats() === 0) {
    if (accentVolume > 0.25) {
      osc.frequency.value = 880.0;
      gainNode.gain.value = calcVolume(accentVolume);
    } else {
      osc.frequency.value = 440.0;
      gainNode.gain.value = calcVolume(quarterVolume);
    }
  } else if (beatNumber % 12 === 0) {   // quarter notes = medium pitch
    osc.frequency.value = 440.0;
    gainNode.gain.value = calcVolume(quarterVolume);
  } else if (beatNumber % 6 === 0) {
    osc.frequency.value = 440.0;
    gainNode.gain.value = calcVolume(eighthVolume);
  } else if (beatNumber % 4 === 0) {
    osc.frequency.value = 300.0;
    gainNode.gain.value = calcVolume(tripletVolume);
  } else if (beatNumber % 3 === 0 ) {                    // other 16th notes = low pitch
    osc.frequency.value = 220.0;
    gainNode.gain.value = calcVolume(sixteenthVolume);
  } else {
    gainNode.gain.value = 0;   // keep the remaining twelvelet notes inaudible
  }

  osc.start(time);
  osc.stop(time + noteLength);
}

function scheduler() {
  while (nextNoteTime < audioContext.currentTime + scheduleAheadTime ) {
    scheduleNote( currentTwelveletNote, nextNoteTime );
    nextTwelvelet();
  }
}

function play() {
  isPlaying = !isPlaying;

  if (isPlaying) {
    currentTwelveletNote = 0;
    nextNoteTime = audioContext.currentTime;
    timerWorker.postMessage("start");
    document.getElementById("start").innerHTML = "STOP";
  } else {
    timerWorker.postMessage("stop");
    document.getElementById("start").innerHTML = "START";
    
  }
}

function init(){
  audioContext = new AudioContext();
  timerWorker = new Worker("assets/js/worker.js");

  timerWorker.onmessage = function(e) {
    if (e.data == "tick") {
      scheduler();
    } else {
      console.log("message: " + e.data);
    }
  };

  timerWorker.postMessage({"interval":lookahead});
}

window.addEventListener("load", init );
///////////////////////////////////////////
const _bpm_elem = document.getElementById('TAP');
const _precision = 5;
let _bpm = 0;
let _taps = [];


function assignEvents() {
  
  _bpm_elem.onclick = function() {
    _taps.push( Date.now() );
    calcBPM();
  };
}


async function calcBPM() {
  let current_bpm = 0;
  let ticks = [];

  if (_taps.length >= 2) {
    
    for (let i = 0; i < _taps.length; i++) {
      if (i >= 1) {

        // calc bpm between last two taps
        ticks.push( Math.round( 60 / (_taps[i] / 1000 - _taps[i-1] / 1000) * 100) / 100 );
      }
    }
  }
  
  if (_taps.length >= 24) {
    _taps.shift();
  }
  
  if (ticks.length >= 2) {
    
    current_bpm = getAverage(ticks, _precision);
    _bpm = current_bpm;
    tempo = Math.round(_bpm)

    showCurrentBPM();

  }
}

function getAverage(Values, Precision) {
  let ticks = Values;
  let n = 0;
  
  for (let i = ticks.length-1; i >= 0; i--) {
    n += ticks[i];
    if (ticks.length - i >= Precision) break;
  }

  return n / _precision;
}

function storeUserPrefs() {
  var key = "settings",
      testPrefs = JSON.stringify({
          'tempo': tempo,
          'masterVolume': masterVolume,
          'accentVolume' : accentVolume,
          'quarterVolume' : quarterVolume
      });
  var jsonfile = {};
  jsonfile[key] = testPrefs;
  chrome.storage.sync.set(jsonfile, function () {
  });
  
}

function restoreOptions()
{
  chrome.storage.sync.get("settings", function (obj) {
    settings = JSON.parse(obj.settings);
    console.log(settings);
    
    tempo = settings.tempo;
    bpmOutput.innerHTML = Math.round(tempo);
    bpmInput.value = Math.round(tempo);

    masterVolume = settings.masterVolume;
    accentVolume = settings.accentVolume;
    quarterVolume = settings.quarterVolume;

});

} 

function showCurrentBPM() {

  bpmOutput.innerHTML = Math.round(_bpm);
  bpmInput.value = Math.round(_bpm);

}

// init
window.onload = assignEvents;


function o2 ()
{
  if (tempo < 300)
  {
    tempo = tempo*2;
    bpmOutput.innerHTML = Math.round(tempo);
    bpmInput.value = Math.round(tempo);
  }
  else 
  {
    
  }
}

function i2 ()
{
  if (tempo > 80)
  {
  tempo = tempo/2;
  bpmOutput.innerHTML = Math.round(tempo);
  bpmInput.value = Math.round(tempo);
  }
  else
  {

  }
}

document.addEventListener('DOMContentLoaded', restoreOptions);
document.addEventListener('DOMContentLoaded', showCurrentBPM);






