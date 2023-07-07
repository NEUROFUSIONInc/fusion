// the colours are also the words ....

function mapElapsedToUnix(data){
    startStamp = -1;
    data.trials.forEach(element => {
        if(startStamp==-1){
            if("unixTimestamp" in element) startStamp = element.unixTimestamp - element.time_elapsed;
        }else{
            element.unixTimestamp = startStamp + element.time_elapsed;
        }
    });
    return data

}


var jsPsych = initJsPsych({on_finish: function() {
    window.parent.postMessage(mapElapsedToUnix(jsPsych.data.get()), '*');
    console.log(mapElapsedToUnix(jsPsych.data.get()));
  }});

var colours = ['red', 'green', 'blue', 'yellow'];

var n_trials = 5;

// returns a JavaScript object with { text: ...., colour: .... }
// using a random colour (text is the same as colour)
function congruent() {
    // pick a colour ....
    // (when we're only picking one, with/without replacement doesn't matter)
    var colour_list = jsPsych.randomization.sampleWithReplacement(colours,1);
    // this returns a list with one item, so we select the first (only) item
    return { text: colour_list[0], colour: colour_list[0], condition: 'congruent' };
}

// returns a JavaScript object with { text: ...., colour: .... }
// using a random colour (text is different to colour)
function incongruent() {
    // pick two colours without replacement (i.e. they will be different)
    var colour_list = jsPsych.randomization.sampleWithoutReplacement(colours,2);
    // this returns a list with two item, we select these out
    return { text: colour_list[0], colour: colour_list[1], condition: 'incongruent' };
}

// these are in HTML, so <br> means "line break"
var instructions = {
    type: jsPsychInstructions,
    pages: [
      "Welcome to the experiment.",
      "In this experiment you will be presented with the words blue, red, yellow and green.",
      "As soon as you see a new word, press its first letter.<br>For example, press the B key for blue.",
      "Try to answer as quickly as you can!",
    ],
    show_clickable_nav: true
}

var fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '+',
    trial_duration: 500,
    response_ends_trial: false
};

// blank (ITI stands for "inter trial interval")
var iti = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  trial_duration: 250,
  response_ends_trial: false
}

var keymap = {'r':0,'g':1,'b':2,'y':3}
// keymap.map((x,y) => {y:x})
document.addEventListener('keypress', function(event) { // Allows dual inputs
    if(document.getElementsByClassName("keyboardToBtn").length==0) return
    if (event.key in keymap) {
        console.log(document.getElementById('jspsych-html-button-response-btngroup').getElementsByClassName('jspsych-btn')[keymap[event.key]].innerHTML)
        document.getElementById('jspsych-html-button-response-btngroup').getElementsByClassName('jspsych-btn')[keymap[event.key]].click();
    }
});

var init = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    trial_duration: 0,
    response_ends_trial: false,
    on_finish: function(data){
        data.unixTimestamp = Date.now();
    }
  }


var trials = [instructions,init];//instructions
// repeat this code n_trials times
for (var i=0; i<n_trials; i++) {
    var values;
    // Math.random returns a random number between 0 and 1. Use this to decide
    // whether the current trial is congruent or incongruent.
    if (Math.random() < 0.5) {
        values = congruent();
    } else {
        values = incongruent();
    }
    var trial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: 
            
             '<p class="keyboardToBtn" style="color: '+values.colour+'">'+values.text+'</p>',
        // 'choices' restricts the available responses for the participant
        choices: ['r','g','b','y'],
        data: values,
        on_finish: function(data){
            console.log(data)
            // data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response);
        }
    };
    trials.push(iti);
    trials.push(fixation);
    trials.push(trial);
}


// window.addEventListener('message', (event) => {
//     // IMPORTANT: Check the origin of the data! 
//     // You should probably not use '*', but restrict it to certain domains:
//     if (event.origin.startsWith('https://localhost')) { 
//       // The data sent from the iframe
//       let data = event.data;
  
//       // Do something with the data
//       console.log(data);
//     }
//   });

jsPsych.run(trials)
// js
// jsPsych.data.displayData('csv')
