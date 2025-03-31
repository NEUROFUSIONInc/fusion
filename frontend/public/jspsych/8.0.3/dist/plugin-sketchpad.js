var jsPsychSketchpad = (function (jspsych) {
  'use strict';

  var _package = {
    name: "@jspsych/plugin-sketchpad",
    version: "2.0.1",
    description: "jsPsych plugin for sketching a response",
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
      directory: "packages/plugin-sketchpad"
    },
    author: "Josh de Leeuw",
    license: "MIT",
    bugs: {
      url: "https://github.com/jspsych/jsPsych/issues"
    },
    homepage: "https://www.jspsych.org/latest/plugins/sketchpad",
    peerDependencies: {
      jspsych: ">=7.1.0"
    },
    devDependencies: {
      "@jspsych/config": "^3.0.0",
      "@jspsych/test-utils": "^1.2.0"
    }
  };

  const info = {
    name: "sketchpad",
    version: _package.version,
    parameters: {
      canvas_shape: {
        type: jspsych.ParameterType.STRING,
        default: "rectangle"
      },
      canvas_width: {
        type: jspsych.ParameterType.INT,
        default: 500
      },
      canvas_height: {
        type: jspsych.ParameterType.INT,
        default: 500
      },
      canvas_diameter: {
        type: jspsych.ParameterType.INT,
        default: 500
      },
      canvas_border_width: {
        type: jspsych.ParameterType.INT,
        default: 0
      },
      canvas_border_color: {
        type: jspsych.ParameterType.STRING,
        default: "#000"
      },
      background_image: {
        type: jspsych.ParameterType.IMAGE,
        default: null
      },
      background_color: {
        type: jspsych.ParameterType.STRING,
        default: "#ffffff"
      },
      stroke_width: {
        type: jspsych.ParameterType.INT,
        default: 2
      },
      stroke_color: {
        type: jspsych.ParameterType.STRING,
        default: "#000000"
      },
      stroke_color_palette: {
        type: jspsych.ParameterType.STRING,
        array: true,
        default: []
      },
      prompt: {
        type: jspsych.ParameterType.HTML_STRING,
        default: null
      },
      prompt_location: {
        type: jspsych.ParameterType.STRING,
        default: "abovecanvas"
      },
      save_final_image: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      save_strokes: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      key_to_draw: {
        type: jspsych.ParameterType.KEY,
        default: null
      },
      show_finished_button: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      finished_button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Finished"
      },
      show_clear_button: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      clear_button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Clear"
      },
      show_undo_button: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      undo_button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Undo"
      },
      show_redo_button: {
        type: jspsych.ParameterType.BOOL,
        default: true
      },
      redo_button_label: {
        type: jspsych.ParameterType.STRING,
        default: "Redo"
      },
      choices: {
        type: jspsych.ParameterType.KEYS,
        default: "NO_KEYS"
      },
      trial_duration: {
        type: jspsych.ParameterType.INT,
        default: null
      },
      show_countdown_trial_duration: {
        type: jspsych.ParameterType.BOOL,
        default: false
      },
      countdown_timer_html: {
        type: jspsych.ParameterType.HTML_STRING,
        default: `<span id="sketchpad-timer"></span> remaining`
      }
    },
    data: {
      rt: {
        type: jspsych.ParameterType.INT
      },
      response: {
        type: jspsych.ParameterType.STRING
      },
      png: {
        type: jspsych.ParameterType.STRING
      },
      strokes: {
        type: jspsych.ParameterType.COMPLEX,
        array: true,
        parameters: {
          action: {
            type: jspsych.ParameterType.STRING
          },
          x: {
            type: jspsych.ParameterType.INT,
            optional: true
          },
          y: {
            type: jspsych.ParameterType.INT,
            optional: true
          },
          t: {
            type: jspsych.ParameterType.INT,
            optional: true
          },
          color: {
            type: jspsych.ParameterType.STRING,
            optional: true
          }
        }
      }
    }
  };
  class SketchpadPlugin {
    constructor(jsPsych) {
      this.jsPsych = jsPsych;
    }
    static info = info;
    display;
    params;
    sketchpad;
    is_drawing = false;
    ctx;
    trial_finished_handler;
    background_image;
    strokes = [];
    stroke = [];
    undo_history = [];
    current_stroke_color;
    start_time;
    mouse_position = { x: 0, y: 0 };
    draw_key_held = false;
    timer_interval;
    trial(display_element, trial, on_load) {
      this.display = display_element;
      this.params = trial;
      this.current_stroke_color = trial.stroke_color;
      this.init_display();
      this.setup_event_listeners();
      this.add_background_color();
      this.add_background_image().then(() => {
        on_load();
      });
      this.start_time = performance.now();
      this.set_trial_duration_timer();
      return new Promise((resolve, reject) => {
        this.trial_finished_handler = resolve;
      });
    }
    init_display() {
      this.add_css();
      let canvas_html;
      if (this.params.canvas_shape == "rectangle") {
        canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_width}" 
        height="${this.params.canvas_height}" 
        class="sketchpad-rectangle"></canvas>
      `;
      } else if (this.params.canvas_shape == "circle") {
        canvas_html = `
        <canvas id="sketchpad-canvas" 
        width="${this.params.canvas_diameter}" 
        height="${this.params.canvas_diameter}" 
        class="sketchpad-circle">
        </canvas>
      `;
      } else {
        throw new Error(
          '`canvas_shape` parameter in sketchpad plugin must be either "rectangle" or "circle"'
        );
      }
      let sketchpad_controls = `<div id="sketchpad-controls">`;
      sketchpad_controls += `<div id="sketchpad-color-palette">`;
      for (const color of this.params.stroke_color_palette) {
        sketchpad_controls += `<button class="sketchpad-color-select" data-color="${color}" style="background-color:${color};"></button>`;
      }
      sketchpad_controls += `</div>`;
      sketchpad_controls += `<div id="sketchpad-actions">`;
      if (this.params.show_clear_button) {
        sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-clear" disabled>${this.params.clear_button_label}</button>`;
      }
      if (this.params.show_undo_button) {
        sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-undo" disabled>${this.params.undo_button_label}</button>`;
        if (this.params.show_redo_button) {
          sketchpad_controls += `<button class="jspsych-btn" id="sketchpad-redo" disabled>${this.params.redo_button_label}</button>`;
        }
      }
      sketchpad_controls += `</div></div>`;
      canvas_html += sketchpad_controls;
      let finish_button_html = "";
      if (this.params.show_finished_button) {
        finish_button_html = `<p id="finish-btn"><button class="jspsych-btn" id="sketchpad-end">${this.params.finished_button_label}</button></p>`;
      }
      let timer_html = "";
      if (this.params.show_countdown_trial_duration && this.params.trial_duration) {
        timer_html = `<p id="countdown-timer">${this.params.countdown_timer_html}</p>`;
      }
      let display_html;
      if (this.params.prompt !== null) {
        if (this.params.prompt_location == "abovecanvas") {
          display_html = this.params.prompt + timer_html + canvas_html + finish_button_html;
        }
        if (this.params.prompt_location == "belowcanvas") {
          display_html = timer_html + canvas_html + this.params.prompt + finish_button_html;
        }
        if (this.params.prompt_location == "belowbutton") {
          display_html = timer_html + canvas_html + finish_button_html + this.params.prompt;
        }
      } else {
        display_html = timer_html + canvas_html + finish_button_html;
      }
      this.display.innerHTML = display_html;
      this.sketchpad = this.display.querySelector("#sketchpad-canvas");
      this.ctx = this.sketchpad.getContext("2d");
    }
    setup_event_listeners() {
      document.addEventListener("pointermove", (e) => {
        this.mouse_position = { x: e.clientX, y: e.clientY };
      });
      if (this.params.show_finished_button) {
        this.display.querySelector("#sketchpad-end").addEventListener("click", () => {
          this.end_trial("button");
        });
      }
      this.sketchpad.addEventListener("pointerdown", this.start_draw.bind(this));
      this.sketchpad.addEventListener("pointermove", this.move_draw.bind(this));
      this.sketchpad.addEventListener("pointerup", this.end_draw.bind(this));
      this.sketchpad.addEventListener("pointerleave", this.end_draw.bind(this));
      this.sketchpad.addEventListener("pointercancel", this.end_draw.bind(this));
      if (this.params.key_to_draw !== null) {
        document.addEventListener("keydown", (e) => {
          if (e.key == this.params.key_to_draw && !this.is_drawing && !this.draw_key_held) {
            this.draw_key_held = true;
            if (document.elementFromPoint(this.mouse_position.x, this.mouse_position.y) == this.sketchpad) {
              this.sketchpad.dispatchEvent(
                new PointerEvent("pointerdown", {
                  clientX: this.mouse_position.x,
                  clientY: this.mouse_position.y
                })
              );
            }
          }
        });
        document.addEventListener("keyup", (e) => {
          if (e.key == this.params.key_to_draw) {
            this.draw_key_held = false;
            if (document.elementFromPoint(this.mouse_position.x, this.mouse_position.y) == this.sketchpad) {
              this.sketchpad.dispatchEvent(
                new PointerEvent("pointerup", {
                  clientX: this.mouse_position.x,
                  clientY: this.mouse_position.y
                })
              );
            }
          }
        });
      }
      if (this.params.show_undo_button) {
        this.display.querySelector("#sketchpad-undo").addEventListener("click", this.undo.bind(this));
        if (this.params.show_redo_button) {
          this.display.querySelector("#sketchpad-redo").addEventListener("click", this.redo.bind(this));
        }
      }
      if (this.params.show_clear_button) {
        this.display.querySelector("#sketchpad-clear").addEventListener("click", this.clear.bind(this));
      }
      const color_btns = Array.prototype.slice.call(
        this.display.querySelectorAll(".sketchpad-color-select")
      );
      for (const btn of color_btns) {
        btn.addEventListener("click", (e) => {
          const target = e.target;
          this.current_stroke_color = target.getAttribute("data-color");
        });
      }
      this.jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: this.after_key_response,
        valid_responses: this.params.choices,
        persist: false,
        allow_held_key: false
      });
    }
    add_css() {
      document.querySelector("head").insertAdjacentHTML(
        "beforeend",
        `<style id="sketchpad-styles">
        #sketchpad-controls {
          line-height: 1; 
          width:${this.params.canvas_shape == "rectangle" ? this.params.canvas_width + this.params.canvas_border_width * 2 : this.params.canvas_diameter + this.params.canvas_border_width * 2}px; 
          display: flex; 
          justify-content: space-between; 
          flex-wrap: wrap;
          margin: auto;
        }
        #sketchpad-color-palette { 
          display: inline-block; text-align:left; flex-grow: 1;
        }
        .sketchpad-color-select { 
          cursor: pointer; height: 33px; width: 33px; border-radius: 4px; padding: 0; border: 1px solid #ccc; 
        }
        #sketchpad-actions {
          display:inline-block; text-align:right; flex-grow: 1;
        }
        #sketchpad-actions button {
          margin-left: 4px;
        }
        #sketchpad-canvas {
          touch-action: none;
          border: ${this.params.canvas_border_width}px solid ${this.params.canvas_border_color};
        }
        .sketchpad-circle {
          border-radius: ${this.params.canvas_diameter / 2}px;
        }
        #countdown-timer {
          width:${this.params.canvas_shape == "rectangle" ? this.params.canvas_width + this.params.canvas_border_width * 2 : this.params.canvas_diameter + this.params.canvas_border_width * 2}px; 
          text-align: right;
          font-size: 12px; 
          margin-bottom: 0.2em;
        }
      </style>`
      );
    }
    add_background_color() {
      this.ctx.fillStyle = this.params.background_color;
      if (this.params.canvas_shape == "rectangle") {
        this.ctx.fillRect(0, 0, this.params.canvas_width, this.params.canvas_height);
      }
      if (this.params.canvas_shape == "circle") {
        this.ctx.fillRect(0, 0, this.params.canvas_diameter, this.params.canvas_diameter);
      }
    }
    add_background_image() {
      return new Promise((resolve, reject) => {
        if (this.params.background_image !== null) {
          this.background_image = new Image();
          this.background_image.src = this.params.background_image;
          this.background_image.onload = () => {
            this.ctx.drawImage(this.background_image, 0, 0);
            resolve(true);
          };
        } else {
          resolve(false);
        }
      });
    }
    start_draw(e) {
      this.is_drawing = true;
      const x = Math.round(e.clientX - this.sketchpad.getBoundingClientRect().left);
      const y = Math.round(e.clientY - this.sketchpad.getBoundingClientRect().top);
      this.undo_history = [];
      this.set_redo_btn_state(false);
      this.ctx.beginPath();
      this.ctx.moveTo(x, y);
      this.ctx.strokeStyle = this.current_stroke_color;
      this.ctx.lineJoin = "round";
      this.ctx.lineWidth = this.params.stroke_width;
      this.stroke = [];
      this.stroke.push({
        x,
        y,
        color: this.current_stroke_color,
        action: "start",
        t: Math.round(performance.now() - this.start_time)
      });
      this.sketchpad.releasePointerCapture(e.pointerId);
    }
    move_draw(e) {
      if (this.is_drawing) {
        const x = Math.round(e.clientX - this.sketchpad.getBoundingClientRect().left);
        const y = Math.round(e.clientY - this.sketchpad.getBoundingClientRect().top);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        this.stroke.push({
          x,
          y,
          action: "move"
        });
      }
    }
    end_draw(e) {
      if (this.is_drawing) {
        this.stroke.push({
          action: "end",
          t: Math.round(performance.now() - this.start_time)
        });
        this.strokes.push(this.stroke);
        this.set_undo_btn_state(true);
        this.set_clear_btn_state(true);
      }
      this.is_drawing = false;
    }
    render_drawing() {
      this.ctx.clearRect(0, 0, this.sketchpad.width, this.sketchpad.height);
      this.add_background_color();
      if (this.background_image) {
        this.ctx.drawImage(this.background_image, 0, 0);
      }
      for (const stroke of this.strokes) {
        for (const m of stroke) {
          if (m.action == "start") {
            this.ctx.beginPath();
            this.ctx.moveTo(m.x, m.y);
            this.ctx.strokeStyle = m.color;
            this.ctx.lineJoin = "round";
            this.ctx.lineWidth = this.params.stroke_width;
          }
          if (m.action == "move") {
            this.ctx.lineTo(m.x, m.y);
            this.ctx.stroke();
          }
        }
      }
    }
    undo() {
      this.undo_history.push(this.strokes.pop());
      this.set_redo_btn_state(true);
      if (this.strokes.length == 0) {
        this.set_undo_btn_state(false);
      }
      this.render_drawing();
    }
    redo() {
      this.strokes.push(this.undo_history.pop());
      this.set_undo_btn_state(true);
      if (this.undo_history.length == 0) {
        this.set_redo_btn_state(false);
      }
      this.render_drawing();
    }
    clear() {
      this.strokes = [];
      this.undo_history = [];
      this.render_drawing();
      this.set_redo_btn_state(false);
      this.set_undo_btn_state(false);
      this.set_clear_btn_state(false);
    }
    set_undo_btn_state(enabled) {
      if (this.params.show_undo_button) {
        this.display.querySelector("#sketchpad-undo").disabled = !enabled;
      }
    }
    set_redo_btn_state(enabled) {
      if (this.params.show_undo_button && this.params.show_redo_button) {
        this.display.querySelector("#sketchpad-redo").disabled = !enabled;
      }
    }
    set_clear_btn_state(enabled) {
      if (this.params.show_clear_button) {
        this.display.querySelector("#sketchpad-clear").disabled = !enabled;
      }
    }
    set_trial_duration_timer() {
      if (this.params.trial_duration !== null) {
        this.jsPsych.pluginAPI.setTimeout(() => {
          this.end_trial();
        }, this.params.trial_duration);
        if (this.params.show_countdown_trial_duration) {
          this.timer_interval = setInterval(() => {
            const remaining = this.params.trial_duration - (performance.now() - this.start_time);
            let minutes = Math.floor(remaining / 1e3 / 60);
            let seconds = Math.ceil((remaining - minutes * 1e3 * 60) / 1e3);
            if (seconds == 60) {
              seconds = 0;
              minutes++;
            }
            const minutes_str = minutes.toString();
            const seconds_str = seconds.toString().padStart(2, "0");
            const timer_span = this.display.querySelector("#sketchpad-timer");
            if (timer_span) {
              timer_span.innerHTML = `${minutes_str}:${seconds_str}`;
            }
            if (remaining <= 0) {
              if (timer_span) {
                timer_span.innerHTML = `0:00`;
              }
              clearInterval(this.timer_interval);
            }
          }, 250);
        }
      }
    }
    after_key_response(info2) {
      this.end_trial(info2.key);
    }
    end_trial(response = null) {
      this.jsPsych.pluginAPI.cancelAllKeyboardResponses();
      clearInterval(this.timer_interval);
      const trial_data = {};
      trial_data.rt = Math.round(performance.now() - this.start_time);
      trial_data.response = response;
      if (this.params.save_final_image) {
        trial_data.png = this.sketchpad.toDataURL();
      }
      if (this.params.save_strokes) {
        trial_data.strokes = this.strokes;
      }
      document.querySelector("#sketchpad-styles").remove();
      this.jsPsych.finishTrial(trial_data);
      this.trial_finished_handler();
    }
  }

  return SketchpadPlugin;

})(jsPsychModule);
