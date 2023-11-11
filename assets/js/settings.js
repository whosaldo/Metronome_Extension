document.getElementById('master').addEventListener('change',
function() { this.setAttribute('value',this.value);
masterVolume = (this.value/100) ; 
master1.innerHTML = Math.round(masterVolume * 100); 
} );

document.getElementById('accent').addEventListener('change',
function() { this.setAttribute('value',this.value);
accentVolume = (this.value/100) ; 
accent1.innerHTML = Math.round(accentVolume * 100); 
} );

document.getElementById('quarter').addEventListener('change',
function() { this.setAttribute('value',this.value);
quarterVolume = (this.value/100) ; 
quarter1.innerHTML = Math.round(quarterVolume * 100); 
} );

document.getElementById("RESET").addEventListener("click", resetall);

var tempo;
var masterVolume;
var quarterVolume;

function restoreOptions()
{
    chrome.storage.sync.get("settings", function (obj) {
    settings = JSON.parse(obj.settings);
    console.log(settings);
    
    tempo = settings.tempo;
    tempo1.innerHTML = tempo;

    masterVolume = settings.masterVolume;
    master.value = (masterVolume * 100);
    master1.innerHTML = Math.round(masterVolume * 100);

    accentVolume = settings.accentVolume;
    accent.value = (accentVolume*100);
    accent1.innerHTML = Math.round(accentVolume * 100);
    

    quarterVolume = settings.quarterVolume;
    quarter.value = (quarterVolume*100);
    quarter1.innerHTML = Math.round(quarterVolume * 100);

});
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
        console.log("u found an easter egg niceee :D");
    });
  }

 function resetall()
 {
    chrome.storage.sync.clear();
 }

 

document.getElementById("b_home").addEventListener("click", storeUserPrefs);
document.addEventListener('DOMContentLoaded', restoreOptions);