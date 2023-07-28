// the colours are also the words ....

function mapElapsedToUnix(data){
    let startStamp = -1;
    data.trials.forEach(element => {
        if(startStamp===-1){
            if("unixTimestamp" in element) startStamp = element.unixTimestamp - element.time_elapsed;
        }else{
            element.unixTimestamp = startStamp + element.time_elapsed;
        }
    });
    return data

}

const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '+',
    trial_duration: 500,
    response_ends_trial: false
};

// blank (ITI stands for "inter trial interval")
const iti = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: '',
  trial_duration: 250,
  response_ends_trial: false
}
const init = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '',
    trial_duration: 0,
    response_ends_trial: false,
    on_finish: (data) =>{
        data.unixTimestamp = Date.now();
    }
}

function countDownGen(seconds){
    document.getElementById("countDown").getElementsByTagName("p")[0].innerHTML = seconds + "s"
    if(seconds===0){
        document.getElementById("countDown").getElementsByTagName("p")[0].style.visibility = false;
        return
    }   
    setTimeout(countDownGen,1000,seconds-1)

}

class experimentGenerator{
    constructor(jsPsych,trialGenerator,instructions = null,feedBack = false, timeLimit=0,trialCountLimit=20){
        this.jsPsych = jsPsych;
        this.trials = []
        if(instructions!=null) this.trials.push(instructions);
        console.log(this.trials)
        this.trials.push(init)

        let _fixation = fixation

        if(timeLimit!==0){
            init.on_finish = function(data){
                data.unixTimestamp = Date.now();
                setTimeout(jsPsych.endExperiment,timeLimit*1000)
                countDownGen(timeLimit);
            }
            

        }

        if(feedBack){ 
            _fixation.trial_duration = 750;
            _fixation.stimulus = function () {
                return jsPsych.data.get().last(1).trials[0].correct ? "Correct" : "Incorrect"
            };
        
        }

        for(let i = 0; i < trialCountLimit; ++i){
            this.trials.push(...trialGenerator.next().value)
            if(!feedBack) this.trials.push(iti)
            this.trials.push(_fixation)
        }
    }

    run(){
        jsPsych.run(this.trials)
    }

}



const jsPsych = initJsPsych({on_finish: function() {
    window.parent.postMessage(mapElapsedToUnix(jsPsych.data.get()), '*');
    console.log(mapElapsedToUnix(jsPsych.data.get()));
  },display_element:"jspsych-container"});

const colours = ['red', 'green', 'blue', 'yellow'];

// returns a JavaScript object with { text: ...., colour: .... }
// using a random colour (text is the same as colour)
function congruent() {
    // pick a colour ....
    // (when we're only picking one, with/without replacement doesn't matter)
    const colourList = jsPsych.randomization.sampleWithReplacement(colours,1);
    // this returns a list with one item, so we select the first (only) item
    return { text: colourList[0], colour: colourList[0], condition: 'congruent' };
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



var keymap = {'r':0,'g':1,'b':2,'y':3}
let keymapInv = Object.entries(keymap).reduce((obj, [key, value]) => {
    obj[value] = key;
    return obj;
  }, {});
  
// keymap.map((x,y) => {y:x})
document.addEventListener('keypress', function(event) { // Allows dual inputs
    if(document.getElementsByClassName("keyboardToBtn").length===0) return
    if (event.key in keymap) {
        console.log(document.getElementById('jspsych-html-button-response-btngroup').getElementsByClassName('jspsych-btn')[keymap[event.key]].innerHTML)
        document.getElementById('jspsych-html-button-response-btngroup').getElementsByClassName('jspsych-btn')[keymap[event.key]].click();
    }
});


// repeat this code n_trials times
function* stroopGen() {
    while(true){
        let values;
        // Math.random returns a random number between 0 and 1. Use this to decide
        // whether the current trial is congruent or incongruent.
        if (Math.random() < 0.5) {
            values = congruent();
        } else {
            values = incongruent();
        }
        const trial = {
            type: jsPsychHtmlButtonResponse,
            stimulus: 
                
                '<p class="keyboardToBtn" style="color: '+values.colour+'">'+values.text+'</p>',
            // 'choices' restricts the available responses for the participant
            choices: ['r','g','b','y'],
            data: values,
            on_finish: (data) =>{
                console.log(data)
                data.response = keymapInv[data.response]
                data.correct = data.colour[0] == data.response
            }
        };
        yield [trial]
    }
}
function randomIntFromInterval(min, max) { // min and max included 
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function* mathGen() {
    while(true){
        // Math.random returns a random number between 0 and 1. Use this to decide
        // whether the current trial is congruent or incongruent.
        const values = {"num1":randomIntFromInterval(10,100),"num2":randomIntFromInterval(10,100)};
        values.answer = values.num1 + values.num2;
        const trial = {
            type: jsPsychSurveyText,
            questions: [
                {prompt: values.num1+" + "+values.num2+" =", required: true, name:"response"}
            ],
            data:values,
            // 'choices' restricts the available responses for the participant
            on_finish: (data)=>{
                console.log(data)
                if("response" in data)
                    data.correct = data.response.response == data.answer
            }
        };
        yield [trial]
    }
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

let stroopTest = new experimentGenerator(jsPsych,stroopGen(),instructions = instructions,feedBack = true, timeLimit=30,trialCountLimit=20)
stroopTest.run()
// js
// jsPsych.data.displayData('csv')
