import * as Dialog from "@radix-ui/react-dialog";
import { Eye, EyeOff, Pause, Play, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button/button";
import { Editor } from "@monaco-editor/react";
import { Experiment } from "./experiment";

interface IExperimentEditorProps {
  experimentCode: string;
  setExperimentCode: (code: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

interface IExperimentFile {
  name: string;
  code: string;
  language: string;
}

export const ExperimentEditor: React.FC<IExperimentEditorProps> = ({
  experimentCode,
  setExperimentCode,
  isOpen,
  onClose,
}) => {
  const defaultCode = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Sample Cognitive Experiment</title>

    <!-- JSPsych Core -->
    <script src="https://unpkg.com/jspsych@8.0.3"></script>
    <link href="https://unpkg.com/jspsych@8.0.3/css/jspsych.css" rel="stylesheet" type="text/css" />

    <!-- Plugins -->
    <script src="https://unpkg.com/@jspsych/plugin-preload@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-button-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-keyboard-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-image-keyboard-response@1.1.3"></script>
    <script src="https://unpkg.com/@jspsych/plugin-instructions@1.1.3"></script>
    <script src="https://unpkg.com/@jspsych/plugin-survey-text@1.0.0"></script>
    <script src="https://unpkg.com/@jspsych/plugin-audio-keyboard-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-video-keyboard-response@1.1.3"></script>
    <script src="https://unpkg.com/@jspsych/plugin-video-button-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-image-button-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-html-slider-response@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-call-function@1.1.2"></script>
    <script src="https://unpkg.com/@jspsych/plugin-fullscreen@1.1.2"></script>

    <!-- Styles -->
    <style>
      body {
        margin: 0;
        padding: 0;
        background: #fff;
      }
      #jspsych-container {
        position: relative;
        overflow: none;
        width: 100%;
        height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="jspsych-container"></div>
    <script>
      const jsPsych = initJsPsych({
        on_finish: function() {
          window.parent.postMessage(jsPsych.data.get(), "*");
        },
        on_trial_start: function(trial) {
          if (!trial.data) {
            trial.data = {};
          }
          trial.data.unixTimestamp = Date.now();
        },
        display_element: "jspsych-container",
      });

      // Add your experiment code here
      const timeline = [];
      
      // Example instructions
      const instructions = {
        type: jsPsychInstructions,
        pages: [
          'Welcome to the experiment',
          'Press next to begin'
        ],
        show_clickable_nav: true
      };

      // Example trial
      const trial = {
        type: jsPsychHtmlKeyboardResponse,
        stimulus: '<p style="font-size: 48px;">+</p>',
        choices: "NO_KEYS",
        trial_duration: 1000,
        data: {
          task: 'fixation'
        }
      };

      timeline.push(instructions);
      timeline.push(trial);
      
      jsPsych.run(timeline);
    </script>
  </body>
</html>`;

  const [fileContent, setFileContent] = useState<string>(experimentCode || defaultCode);

  const [previewOpen, setPreviewOpen] = useState<boolean>(true);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 h-[80vh] w-[80vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Experiment Editor
          </Dialog.Title>

          <div className={`grid ${previewOpen ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            <Editor
              height="60vh"
              defaultLanguage="html"
              defaultValue={fileContent}
              onChange={(value) => {
                setFileContent(value ?? "");
              }}
            />

            {previewOpen && (
              <div className="h-[60vh] border border-slate-200 rounded">
                <Experiment
                  id={0}
                  name="Preview"
                  description="Preview of experiment"
                  code={fileContent}
                  showLogs={false}
                />
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <Button
              leftIcon={previewOpen ? <EyeOff /> : <Eye />}
              intent="outlined"
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              {previewOpen ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button
              leftIcon={<Save />}
              onClick={() => {
                // save the experiment
                setExperimentCode(fileContent);
                // close the modal
                onClose();
              }}
            >
              Save Experiment
            </Button>
          </div>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={() => {
              if (confirm("Are you sure you want to close the editor? Any unsaved changes will be lost.")) {
                onClose();
              }
            }}
          >
            <X />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
