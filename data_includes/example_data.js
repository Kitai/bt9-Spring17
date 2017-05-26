// Sequence of the experiment - refers to 'items' defined below
var shuffleSequence = seq("Instructions",
                          "Preloading",
                          rshuffle("Practice"),
                          "Start",
                          "Experimental1",
                          "Break",
                          "Experimental2",
                          "Final");

var host = "http://www.ling.upenn.edu/~amygood/files/soundfiles/";

// Defaults for types of questions found in this experiment
// NOTE: 'LQuestion' (written by Akiva and/or Jeremy) is a timed version of Question
var defaults = [
    "LQuestion", {
             as: ["F","J"],
             randomOrder: false,
             showNumbers: false,
             presentHorizontally: true,
             autoFirstChar: true,
             leftComment: "<b>F</b>: Word", 
             rightComment: "<b>J</b>: Not a word"},
    "Message", {hideProgressBar: true},
    "Separator", {
            transfer: Math.random() * (600 - 400) + 400, // need to record ISI
            normalMessage: "",
            errorMessage: ""}
];

// 'LexDecision' is a new question type extending 'LQuestion', used for web display
define_ibex_controller({
    name: "LexDecision",
    properties: {},
    jqueryWidget: {
        _init: function () {
            this.options.transfer = null;
            this.element.VBox({
                options: this.options,
                triggers: [1],
                children: [
                    "Message", {html: '<html><div style="text-align: center; margin:auto;">  <audio controls autoplay preload="auto" style="display: none;">    <source src="http://www.ling.upenn.edu/~amygood/files/soundfiles/'+ this.options.word + '" type="audio/wav" />    We are sorry but your system does not support the audio.</audio></div></html>', transfer: null },
                    //"LQuestion", {q: this.options.word}] ORIGINAL
                    "LQuestion", {q: this.options.word, hasCorrect: parseInt(this.options.correctResponse)}] //results are coded backwards! 0 should =word, 1 should =nw
                });
            }
        }
}); 

// Using 'ScriptToPopulateFromCSV.js' written by Jeremy, load in the practice data file
// Trying to include group number and accuracy in results output
var practiceItems = 
  GetItemFrom(practice, null, {
    ItemGroup: "item",
    Where: function(row){return row.group==1;},
    Elements: [ 
        function(row){return "Practice";},              // Name of the item, when group number included half the stims only??
        function(row){return "LexDecision";},           // First Controller: LexDecision
        {word: "psf", correctResponse: "primeNWStatus"}, // correctResponse was hasCorrect
        function(row){return "Separator";},             // Second Controller: Separator 
        {},
        function(row){return "LexDecision";},           // Third Controller: LexDecision
        {word: "tsf", correctResponse: "targetNWStatus"},
        function(row){return "Separator";},             // Fourth Controller: Separator
        {}]
});

// Declare a random group number for the participant
var groupNum = Math.floor(1+6*Math.random()); // randomly generate subject number
//var groupNum = 6; // set as group 2

// Using 'ScriptToPopulateFromCSV.js' written by Jeremy, load in the experimental data file
var exptItems = 
  GetItemFrom(data, null, {
    ItemGroup: "item",
    Where: function(row){return row.group==groupNum;},
    Elements: [ 
        function(row){return "Experimental"+row.block;},// Name of the item
        function(row){return "LexDecision";},           // First Controller: LexDecision
        {word: "psf", correctResponse: "primeNWStatus"},
        function(row){return "Separator";},             // Second Controller: Separator 
        {},
        function(row){return "LexDecision";},           // Third Controller: LexDecision
        {word: "tsf", correctResponse: "targetNWStatus"},
        function(row){return "Separator";},             // Fourth Controller: Separator
        {}]
}); 

// Declare the format of the experiment
var items = [
    ["Instructions", 
     "Message", {transfer: "click", html: {include: "consentform.html"}},
     "Message", {transfer: "click", html: {include: "warning.html"}},
     "Message", {transfer: "click", html: {include: "instructions.html"}},
     "Question", {q: groupNum, as: ['Group num is','GroupNum'], timeout:1}],
     ["Preloading", "PreloaderCheck", {}],
     ["Preloading", "Preloader", {files: audioFilesToPreload, host: "http://www.ling.upenn.edu/~amygood/files/soundfiles/"}],
    ["Start","Message",{html: {include: "start.html"}}],
    ["Break","Message",{html: "<html><div><p>If you want, you can now take a break.</p></div></html>"}],
    ["Final", 
     "Form", {continueMessage: "Click here to continue...", html: {include: "amt_form.html"}},
     "__SendResults__", {manualSendResults: true, sendingResultsMessage: "Please wait while your answers are being saved...", completionMessage: "Your answers have successfully been saved! You may now close this window."},
     "Message", {transfer: null, html: {include: "final.html"}}]
]

// Add in the practice and the experimental items
items = items.concat(practiceItems)
items = items.concat(exptItems)
