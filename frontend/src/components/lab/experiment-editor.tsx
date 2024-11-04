import * as Dialog from "@radix-ui/react-dialog";
import { Eye, Play, Save, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button/button";
import { Editor } from "@monaco-editor/react";

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
  const defaultCode = `
<!DOCTYPE html>
<html>
  <head>
    <!-- YOUR CODE GOES HERE -->
  </head>
  <body>
    <!-- YOUR CODE GOES HERE -->
  </body>
</html>
    `;

  const [fileContent, setFileContent] = useState<string>(experimentCode || defaultCode);

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 h-[80vh] w-[80vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Experiment Editor
          </Dialog.Title>

          <Editor
            height="60vh"
            defaultLanguage="html"
            defaultValue={fileContent}
            onChange={(value) => {
              setFileContent(value ?? "");
            }}
          />

          <div className="flex justify-end mt-4 gap-4">
            <Button leftIcon={<Play />} intent="outlined">
              Preview
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
