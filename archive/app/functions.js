var fusionLandingPage = document.getElementById("fusionLandingPage");
fusionLandingPage.onclick = function(e){
  // show the loading text
  var fusionLoadingText = document.getElementById("fusionLoadingText");
  fusionLoadingText.style.display = "block";
  setTimeout(function(){
      // hide the landing page
    fusionLandingPage.style.display = "none";

    // display the query page
    var fusionQueryPage = document.getElementById("fusionQueryPage");
    fusionQueryPage.style.display = "flex";
  }, 1500);

};


var fusionSearchInput = document.getElementById("fusionSearchInput");
fusionSearchInput.onkeydown = function(e){
    if(e.keyCode == 13) {
        // get the items in the text input
        console.log("User question: " + fusionSearchInput.value);
        // feed it to the function that diplays results
        displaySuggestionResults(fusionSearchInput.value);
    }
}

function displaySuggestionResults(value){
    var fusionResultsPane = document.getElementById("fusionResultsPane");
    fusionResultsPane.style.display = "flex";
    var fusionResultsList = document.getElementById("fusionResultsList");
    fusionResultsList.style.display = "block";
}

var fusionResultsItem = document.getElementById("fusionResultsItem");
fusionResultsItem.onclick = function(e) {
    var fusionResultsList = document.getElementById("fusionResultsList");
    fusionResultsList.style.display = "none";

    var fusionResultsItemDetail = document.getElementById("fusionResultsItemDetail");
    fusionResultsItemDetail.style.display = "flex";
}