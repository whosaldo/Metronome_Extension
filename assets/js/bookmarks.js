document.getElementById("b_save").addEventListener("click", storeBookmarks);

var tempo;
const bookmarksar = [];
var masterVolume ;
var accentVolume ;
var quarterVolume ;


function restoreOptions()
{
  chrome.storage.sync.get("settings", function (obj) {
    settings = JSON.parse(obj.settings);
    //console.log(settings);
    
    tempo = settings.tempo;

    masterVolume = settings.masterVolume;
    accentVolume = settings.accentVolume;
    quarterVolume = settings.quarterVolume;

});

} 

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  var tab = tabs[0];

  const apiKey = 'AIzaSyAE7CAuClgVddGjqPZ8NUPlKdokCHSW_U8';

// Extract the video ID from the YouTube URL
  const videoId = extractVideoIdFromUrl(tab.url);

// Make a request to the YouTube Data API
  fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`)
  .then(response => response.json())
  .then(data => {
    // Extract the video title from the API response
    const videoTitle = data.items[0].snippet.title;

    // Use the video title in your Chrome extension
    url1.innerHTML= videoTitle;
    tempo1.innerHTML = 'Last Tempo: ' + tempo + ' bpm';

    })
    .catch(error => {
      url1.innerHTML = 'Not an YouTube Video!';
    });

// Function to extract video ID from URL
function extractVideoIdFromUrl(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}


 setTimeout(() => { 
  
  var id;
  
    for (let i = 0; i < bookmarksar.length; i++) {
        if (bookmarksar[i][0] == url1.innerHTML)
        {
            id = i;
            found.innerHTML = 'Saved: ' + bookmarksar[i][1] + ' BPM';
            document.getElementById("set").style.display = "unset";
           
          }
        else{  }
        
        
      };
      
    document.getElementById("set").addEventListener("click", function(){
        tempo = bookmarksar[id][1];
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
      });
  }, 1000);


}
);
//console.log(bookmarksar);
function storeBookmarks() {
  var key = "bookmarks"

  if (bookmarksar.length == 0) 
  {
      console.log("d");
      bookmarksar.push([url1.innerHTML, tempo]);
      var jsonfile = {};
      jsonfile[key] = bookmarksar;
      chrome.storage.sync.set(jsonfile, function () {
      
      }) 

  } else {
    
    for (let i = 0; i < bookmarksar.length; i++) {
      
        
        if (url1.innerHTML != bookmarksar[i][0])
        {
         
          
          bookmarksar.push([url1.innerHTML, tempo]);
          var jsonfile = {};
          jsonfile[key] = bookmarksar;
          chrome.storage.sync.set(jsonfile, function () {
        
        }) 
          
        }
    
        else
        {
          bookmarksar[i][1] = tempo;
          var jsonfile = {};
          jsonfile[key] = bookmarksar;
          chrome.storage.sync.set(jsonfile, function () {
        }) 
        };
     
    }
  }

        
}

function restoreBookmarks()
{
   
    chrome.storage.sync.get("bookmarks", function (obj) {
    
    for (let key in obj.bookmarks)
    {
      if (obj.bookmarks.hasOwnProperty(key)) {
        bookmarksar.push(obj.bookmarks[key]);
      }
    }
     });
      
};  


document.addEventListener('DOMContentLoaded', restoreBookmarks);
document.addEventListener('DOMContentLoaded', restoreOptions);
