var COOKIE_NAME = "VERSES";
var BIBLE_ORG_BASE_API_URL = "http://labs.bible.org/api/";

function VersesController($scope) {
  $scope.verses = getSavedVerses();
  $scope.verseNextId = $scope.verses.length;
  $("#verseInput").focus();
  $("#presentationContainer").hide();

  $scope.addVerse = function() {
    if ($scope.verseInput) {
      $scope.verseNextId++;
      $scope.verses.push({id: $scope.verseNextId, text: $scope.verseInput});
      saveVerses($scope.verses);
      $scope.verseInput = "";
      $("#verseInput").val("");
    }
    $("#verseInput").focus();
  }
  
  $scope.clearAllVerses = function() {
    $scope.verseNextId = 0;
    $scope.verses = new Array();
    saveVerses($scope.verses);
    $("#verseInput").val("");
    $("#verseInput").focus();
  }
  
  $scope.deleteVerse = function(id) {
    $.each($scope.verses, function(i){
      if($scope.verses[i].id === id) {
        $scope.verses.splice(i,1);
        return false;
      }
    });
    saveVerses($scope.verses);
    $("#verseInput").val("");
    $("#verseInput").focus();
  }
  
  $scope.createPresentation = function() {
    new Presentation($scope.verses);
  }
}

function Presentation(verses) {
  var currentSlideIndex = -1;
  $("#slidePassage").html("");
  $("#versesContainer").hide();
  $("#presentationContainer").show();
  $("#previousVerseButton").click(fetchPreviousVerse);
  $("#nextVerseButton").click(fetchNextVerse);
  $("#finishPresentationButton").click(onFinishPresentationClick);
  
  fetchNextVerse();
  
  function fetchVerse() {
    var verse = verses[currentSlideIndex];
    togglePreviousNextButtons();
    
    $.ajax(BIBLE_ORG_BASE_API_URL, {
      type: "get",
      dataType: "jsonp",
      data: "type=json&passage="+verse.text,
      success: onFetchVersesSuccess,
      complete: function() {$("#slideVerse").html(verse.text)},
      error: function(jqXHR, status, error) {alert(status+": "+error);}
    });
  }
  
  function fetchNextVerse() {
    if (currentSlideIndex == verses.length-1) {
      return;
    }
    
    currentSlideIndex++;
    fetchVerse();
  }
  
  function fetchPreviousVerse() {
    if (currentSlideIndex == 0) {
      return;
    }
    
    currentSlideIndex--;
    fetchVerse();
  }
  
  function togglePreviousNextButtons() {
    if (currentSlideIndex == 0) {
      $("#previousVerseButton").hide();
    } else {
      $("#previousVerseButtonText").text(verses[currentSlideIndex-1].text);
      $("#previousVerseButton").show();
    }
    
    if (currentSlideIndex == verses.length-1) {
      $("#nextVerseButton").hide();
      $("#finishPresentationButton").show();
    } else {
      $("#finishPresentationButton").hide();
      $("#nextVerseButtonText").text(verses[currentSlideIndex+1].text);
      $("#nextVerseButton").show();
    }
  }

  function onFetchVersesSuccess(data) {
    //build passage because each verse is returned as a JSON object
    var passage = "";
    $.each(data, function(index, value){
      passage = passage + " " + "<b>" + value.verse + "</b>" + " " + value.text;
    });
    
    $("#slidePassage").html(passage);
  }
  
  function onFinishPresentationClick() {
    location.reload();
  }
}

function saveVerses(verses) {
  localStorage.setItem(COOKIE_NAME, JSON.stringify(verses));
}
  
function getSavedVerses() {
  var parsedVerses = JSON.parse(localStorage.getItem(COOKIE_NAME));
    
  if (parsedVerses) { 
    return parsedVerses;
  } 
    
  return new Array();
}