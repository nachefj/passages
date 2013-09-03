var LOCALSTORE_PASSAGES_VERSES = "PASSAGES_APP_VERSES";
var LOCALSTORE_PASSAGES_NEXT_VERSE_ID = "PASSAGES_APP_NEXT_VERSE_ID";
var BIBLE_ORG_BASE_API_URL = "http://labs.bible.org/api/";

function VersesController($scope) {
  $scope.verses = getSavedVerses();
  $("#verseInput").focus();
  var selectedVerseRow;

  $scope.addVerse = function() {
    if ($scope.verseInput) {
      $scope.verses.push({id: getNextVerseId(), text: $scope.verseInput});
      saveVerses($scope.verses);
      $scope.verseInput = "";
      $("#verseInput").val("");
    }
    $("#verseInput").focus();
  }
  
  $scope.clearAllVerses = function() {
    resetNextVerseId();
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
  }
  
  $scope.selectVerseRow = function(id, index) {
    if (selectedVerseRow) {
      selectedVerseRow.removeClass("warning");
      selectedVerseRow.find("#moveButtonUp").hide();
      selectedVerseRow.find("#moveButtonDown").hide();
      selectedVerseRow.find("#orderNumber").show();
    }
    
    var verseRow = $("#verseRow"+id);
    
    verseRow.addClass("warning");
    verseRow.find("#orderNumber").hide();
    
    if (index != 0) {
      verseRow.find("#moveButtonUp").show();
    }
    
    if (index != $scope.verses.length-1) {
      verseRow.find("#moveButtonDown").show();
    }
    
    selectedVerseRow = verseRow;
  }
  
  $scope.moveVerseUp = function(index) {
    swapVerses(index, index-1);
  }
  
  $scope.moveVerseDown = function(index) {
    swapVerses(index, index+1);
  }
  
  swapVerses = function(fromIndex, toIndex) {
    var backupVerse = $scope.verses[toIndex];
    $scope.verses[toIndex] = $scope.verses[fromIndex];
    $scope.verses[fromIndex] = backupVerse;
    saveVerses($scope.verses);
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

function resetNextVerseId () {
  localStorage.setItem(LOCALSTORE_PASSAGES_NEXT_VERSE_ID, 0);
}

function getNextVerseId() {
  var nextId = localStorage.getItem(LOCALSTORE_PASSAGES_NEXT_VERSE_ID);
  
  if (!nextId) {
    nextId = 0;
  }
  
  localStorage.setItem(LOCALSTORE_PASSAGES_NEXT_VERSE_ID, ++nextId);
  return nextId;
}

function saveVerses(verses) {
  localStorage.setItem(LOCALSTORE_PASSAGES_VERSES, JSON.stringify(verses));
}
  
function getSavedVerses() {
  var parsedVerses = JSON.parse(localStorage.getItem(LOCALSTORE_PASSAGES_VERSES));
    
  if (parsedVerses) { 
    return parsedVerses;
  } 
    
  return new Array();
}