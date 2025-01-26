import { Editor } from "@monaco-editor/react";
import * as Dialog from "@radix-ui/react-dialog";
import { EyeOff, Plus, Save, X } from "lucide-react";
import { useState } from "react";
import { OnboardingQuestion, QuestAssignment, QuestAssignmentInput } from "~/@types";
import { Button } from "../ui/button/button";

interface IAssignmentEditorProps {
  assignmentConfig: QuestAssignment;
  isOpen: boolean;
  onClose: (config: QuestAssignment) => void;
  savedOnboardingQuestions: OnboardingQuestion[];
}

const AssignmentEditor: React.FC<IAssignmentEditorProps> = ({
  assignmentConfig,
  isOpen,
  onClose,
  savedOnboardingQuestions,
}) => {
  const [fileContent, setFileContent] = useState<string>(assignmentConfig.script.code ?? "");

  const [assignmentInputs, setAssignmentInputs] = useState<QuestAssignmentInput[]>(
    assignmentConfig.script.inputs ?? []
  );

  const handleInputChange = (index: number, field: keyof QuestAssignmentInput, value: string) => {
    const newInputs = [...assignmentInputs];

    // Don't allow duplicate source IDs or placeholders
    if (field === "sourceId" || field === "placeholder") {
      const isDuplicate = newInputs.some((input, i) => i !== index && input[field] === value && value !== "");
      if (isDuplicate) {
        return; // Silently fail if duplicate
      }
    }

    newInputs[index] = {
      ...newInputs[index],
      [field]: value,
      ...(field === "sourceId" ? { sourceType: "onboardingQuestion" } : {}),
    };
    setAssignmentInputs(newInputs);
  };

  const handleRemoveInput = (index: number) => {
    const newInputs = assignmentInputs.filter((_, i) => i !== index);
    setAssignmentInputs(newInputs);
  };

  const handleAddInput = () => {
    // Check if any existing inputs are incomplete
    const hasIncompleteInput = assignmentInputs.some((input) => !input.sourceId || !input.placeholder);

    if (hasIncompleteInput) {
      return; // Don't add new input if there are incomplete entries
    }

    setAssignmentInputs([
      ...assignmentInputs,
      {
        sourceId: "",
        sourceType: "onboardingQuestion",
        placeholder: "",
      },
    ]);
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 h-[80vh] w-[80vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Assignment Editor
          </Dialog.Title>

          <div className="overflow-y-auto h-[calc(80vh-12rem)]">
            <div>
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Assignment Inputs</h3>
                <p className="text-sm text-slate-500 mb-2">
                  Add inputs to the script that will be used to decide the users quest assignment.
                  <br></br>
                  After the script is executed, the user will be assigned a quest based on the output of the script and
                  notified in the app.
                </p>
                <div className="space-y-2">
                  {assignmentInputs.map((input, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <select
                        className="flex-1 p-2 rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                        value={input.sourceId}
                        onChange={(e) => handleInputChange(index, "sourceId", e.target.value)}
                        aria-label="Select onboarding question"
                      >
                        <option value="">Select a question</option>
                        {savedOnboardingQuestions.map((q) => (
                          <option key={q.guid} value={q.guid}>
                            {q.question}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Variable name"
                        className="flex-1 p-2 rounded border border-slate-200 dark:border-slate-700 dark:bg-slate-800"
                        value={input.placeholder}
                        onChange={(e) => handleInputChange(index, "placeholder", e.target.value)}
                      />
                      <Button intent="danger" onClick={() => handleRemoveInput(index)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button intent="outlined" className="mt-2" onClick={handleAddInput} leftIcon={<Plus />}>
                  Add Script Input
                </Button>

                {assignmentInputs.length > 0 && (
                  <p className="text-sm text-slate-500 mt-2">
                    You can use these variables in your script:
                    <ul className="list-disc list-inside mt-1">
                      {assignmentInputs.map((input) => (
                        <li key={input.placeholder}>
                          <code>{input.placeholder}</code>
                        </li>
                      ))}
                    </ul>
                  </p>
                )}
              </div>
            </div>

            <Editor
              height="60vh"
              defaultLanguage="python"
              defaultValue={fileContent}
              onChange={(value) => {
                console.log("updating file content: ", value);
                setFileContent(value ?? "");
              }}
            />
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <Button
              leftIcon={<Save />}
              onClick={() => {
                // Don't save if code is empty
                if (!fileContent?.trim()) {
                  alert("Please enter some code before saving");
                  return;
                }

                const config: QuestAssignment = {
                  ...assignmentConfig,
                  script: {
                    code: fileContent,
                    inputs: assignmentInputs,
                    language: "python",
                  },
                };

                // Close the modal
                onClose(config);
              }}
            >
              Save Assignment
            </Button>
          </div>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full  opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
            onClick={() => {
              if (confirm("Are you sure you want to close the editor? Any unsaved changes will be lost.")) {
                onClose(assignmentConfig);
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

export default AssignmentEditor;
