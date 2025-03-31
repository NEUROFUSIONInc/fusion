var jsPsychSurveyLikert = (function (jspsych) {
  'use strict';

  var _package = {
    name: "@jspsych/plugin-survey-likert",
    version: "2.0.0",
    description: "a jspsych plugin for measuring items on a likert scale",
    type: "module",
    main: "dist/index.cjs",
    exports: {
      import: "./dist/index.js",
      require: "./dist/index.cjs"
    },
    typings: "dist/index.d.ts",
    unpkg: "dist/index.browser.min.js",
    files: [
      "src",
      "dist"
    ],
    source: "src/index.ts",
    scripts: {
      test: "jest",
      "test:watch": "npm test -- --watch",
      tsc: "tsc",
      build: "rollup --config",
      "build:watch": "npm run build -- --watch"
    },
    repository: {
      type: "git",
      url: "git+https://github.com/jspsych/jsPsych.git",
      directory: "packages/plugin-survey-likert"
    },
    author: "Josh de Leeuw",
    license: "MIT",
    bugs: {
      url: "https://github.com/jspsych/jsPsych/issues"
    },
    homepage: "https://www.jspsych.org/latest/plugins/survey-likert",
    peerDependencies: {
      jspsych: ">=7.1.0"
    },
    devDependencies: {
      "@jspsych/config": "^3.0.0",
      "@jspsych/test-utils": "^1.2.0"
    }
  };

  const info = {
    name: "survey-likert",
    version: _package.version,
    parameters: {
      questions: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        nested: {
          prompt: {
            type: jspsych.ParameterType.HTML_STRING,
            default: void 0
          },
          labels: {
            type: jspsych.ParameterType.STRING,
            array: true,
            default: void 0
          },
          required: {
            type: jspsych.ParameterType.BOOL,
            default: false
          },
          name: {
            type: jspsych.ParameterType.STRING,
            default: ""
          }
        }
      },
      randomize_question_order: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      preamble: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      scale_width: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Continue"
      },
      autocomplete: {
        type: jspsych.ParameterType.BOOL,
        default: false
      }
    },
    data: {
      response: {
        type: jspsych.ParameterType.COMPLEX,
        nested: {
          identifier: {
            type: jspsych.ParameterType.STRING
          },
          response: {
            type: jspsych.ParameterType.STRING | jspsych.ParameterType.INT | jspsych.ParameterType.FLOAT | jspsych.ParameterType.BOOL | jspsych.ParameterType.OBJECT
          }
        }
      },
      rt: {
        type: jspsych.ParameterType.INT
      },
      question_order: {
        type: jspsych.ParameterType.INT,
        array: true
      }
    }
  };
  class SurveyLikertPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static info = info;
    trial(display_element, trial) {
      if (trial.scale_width !== null) {
        var w = trial.scale_width + "px";
      } else {
        var w = "100%";
      }
      var html = "";
      html += '<style id="jspsych-survey-likert-css">';
      html += ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 40px; margin-bottom:10px; }.jspsych-survey-likert-opts { list-style:none; width:" + w + "; margin:auto; padding:0 0 35px; display:block; font-size: 14px; line-height:1.1em; }.jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }.jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }.jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }.jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }.jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }";
      html += "</style>";
      if (trial.preamble !== null) {
        html += '<div id="jspsych-survey-likert-preamble" class="jspsych-survey-likert-preamble">' + trial.preamble + "</div>";
      }
      if (trial.autocomplete) {
        html += '<form id="jspsych-survey-likert-form">';
      } else {
        html += '<form id="jspsych-survey-likert-form" autocomplete="off">';
      }
      var question_order = [];
      for (var i = 0; i < trial.questions.length; i++) {
        question_order.push(i);
      }
      if (trial.randomize_question_order) {
        question_order = this.jsPsych.randomization.shuffle(question_order);
      }
      for (var i = 0; i < trial.questions.length; i++) {
        var question = trial.questions[question_order[i]];
        html += '<label class="jspsych-survey-likert-statement">' + question.prompt + "</label>";
        var width = 100 / question.labels.length;
        var options_string = '<ul class="jspsych-survey-likert-opts" data-name="' + question.name + '" data-radio-group="Q' + question_order[i] + '">';
        for (var j = 0; j < question.labels.length; j++) {
          options_string += '<li style="width:' + width + '%"><label class="jspsych-survey-likert-opt-label"><input type="radio" name="Q' + question_order[i] + '" value="' + j + '"';
          if (question.required) {
            options_string += " required";
          }
          options_string += ">" + question.labels[j] + "</label></li>";
        }
        options_string += "</ul>";
        html += options_string;
      }
      html += '<input type="submit" id="jspsych-survey-likert-next" class="jspsych-survey-likert jspsych-btn" value="' + trial.button_label + '"></input>';
      html += "</form>";
      display_element.innerHTML = html;
      display_element.querySelector("#jspsych-survey-likert-form").addEventListener("submit", (e) => {
        e.preventDefault();
        var endTime = performance.now();
        var response_time = Math.round(endTime - startTime);
        var question_data = {};
        var matches = display_element.querySelectorAll(
          "#jspsych-survey-likert-form .jspsych-survey-likert-opts"
        );
        for (var index = 0; index < matches.length; index++) {
          var id = matches[index].dataset["radioGroup"];
          var el = display_element.querySelector(
            'input[name="' + id + '"]:checked'
          );
          if (el === null) {
            var response = "";
          } else {
            var response = parseInt(el.value);
          }
          var obje = {};
          if (matches[index].attributes["data-name"].value !== "") {
            var name = matches[index].attributes["data-name"].value;
          } else {
            var name = id;
          }
          obje[name] = response;
          Object.assign(question_data, obje);
        }
        var trial_data = {
          rt: response_time,
          response: question_data,
          question_order
        };
        this.jsPsych.finishTrial(trial_data);
      });
      var startTime = performance.now();
    }
    simulate(trial, simulation_mode, simulation_options, load_callback) {
      if (simulation_mode == "data-only") {
        load_callback();
        this.simulate_data_only(trial, simulation_options);
      }
      if (simulation_mode == "visual") {
        this.simulate_visual(trial, simulation_options, load_callback);
      }
    }
    create_simulation_data(trial, simulation_options) {
      const question_data = {};
      let rt = 1e3;
      for (const q of trial.questions) {
        const name = q.name ? q.name : `Q${trial.questions.indexOf(q)}`;
        question_data[name] = this.jsPsych.randomization.randomInt(0, q.labels.length - 1);
        rt += this.jsPsych.randomization.sampleExGaussian(1500, 400, 1 / 200, true);
      }
      const default_data = {
        response: question_data,
        rt,
        question_order: trial.randomize_question_order ? this.jsPsych.randomization.shuffle([...Array(trial.questions.length).keys()]) : [...Array(trial.questions.length).keys()]
      };
      const data = this.jsPsych.pluginAPI.mergeSimulationData(default_data, simulation_options);
      this.jsPsych.pluginAPI.ensureSimulationDataConsistency(trial, data);
      return data;
    }
    simulate_data_only(trial, simulation_options) {
      const data = this.create_simulation_data(trial, simulation_options);
      this.jsPsych.finishTrial(data);
    }
    simulate_visual(trial, simulation_options, load_callback) {
      const data = this.create_simulation_data(trial, simulation_options);
      const display_element = this.jsPsych.getDisplayElement();
      this.trial(display_element, trial);
      load_callback();
      const answers = Object.entries(data.response);
      for (let i = 0; i < answers.length; i++) {
        this.jsPsych.pluginAPI.clickTarget(
          display_element.querySelector(
            `input[type="radio"][name="${answers[i][0]}"][value="${answers[i][1]}"]`
          ),
          (data.rt - 1e3) / answers.length * (i + 1)
        );
      }
      this.jsPsych.pluginAPI.clickTarget(
        display_element.querySelector("#jspsych-survey-likert-next"),
        data.rt
      );
    }
  }

  return SurveyLikertPlugin;

})(jsPsychModule);
