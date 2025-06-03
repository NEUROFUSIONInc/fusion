import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Editor } from "@monaco-editor/react";
import { Button } from "~/components/ui";
import { EyeOff, Eye, Save, X } from "lucide-react";

interface NotebookEditorProps {
  isOpen: boolean;
  onClose: () => void;
  scriptCode?: string;
  setScriptCode: (content: string) => void;
}

export const NotebookEditor = ({ isOpen, onClose, scriptCode = "", setScriptCode }: NotebookEditorProps) => {
  const [fileContent, setFileContent] = useState<string>(scriptCode);
  const [previewOpen, setPreviewOpen] = useState<boolean>(true);
  const [output, setOutput] = useState<string>("");
  const [pyodide, setPyodide] = useState<any>();
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window === "undefined" || !isOpen) return;

    const loadPyodideFromCDN = async () => {
      if ((window as any).loadPyodide) return (window as any).loadPyodide;

      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "/pyodide/pyodide.js";
        script.onload = () => resolve();
        script.onerror = () => reject("Failed to load Pyodide script.");
        document.body.appendChild(script);
      });

      return (window as any).loadPyodide;
    };

    (async () => {
      try {
        setIsLoading(true);
        const loadPyodide = await loadPyodideFromCDN();
        const pyodideInstance = await loadPyodide({
          indexURL: "/pyodide/",
          stdout: (text: string) => {
            setOutput((prev) => prev + text + "\n");
          },
          stderr: (text: string) => {
            setOutput((prev) => prev + "Error: " + text + "\n");
          },
        });
        setPyodide(pyodideInstance);
      } catch (error) {
        console.error("Failed to load Pyodide:", error);
        setOutput("Failed to initialize Python environment");
      } finally {
        setIsLoading(false);
      }
    })();

    return () => {
      setPyodide(null);
      setOutput("");
    };
  }, [isOpen]);

  const runCode = async () => {
    if (!pyodide) return;

    setIsRunning(true);
    setOutput("");

    try {
      const result = await pyodide.runPythonAsync(fileContent);
      if (result !== undefined) {
        setOutput((prev) => prev + result.toString() + "\n");
      }
    } catch (error: any) {
      setOutput((prev) => prev + "Error: " + error.message + "\n");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-slate-900/50" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-30 h-[80vh] w-[80vw] translate-x-[-50%] translate-y-[-50%] overflow-auto rounded-[6px] bg-white p-8 focus:outline-none dark:bg-slate-800">
          <Dialog.Title className="mb-1 w-10/12 font-body text-lg md:w-full md:text-2xl">
            Notebook Editor {isLoading && "(Loading Python Environment...)"}
          </Dialog.Title>

          <div className={`grid ${previewOpen ? "grid-cols-2" : "grid-cols-1"} gap-4`}>
            <Editor
              height="60vh"
              defaultLanguage="python"
              defaultValue={fileContent}
              onChange={(value) => setFileContent(value ?? "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
              }}
            />

            {previewOpen && (
              <div className="h-[60vh] border border-slate-200 rounded p-4 overflow-auto font-mono whitespace-pre">
                {output}
              </div>
            )}
          </div>

          <div className="flex justify-end mt-4 gap-4">
            <Button
              leftIcon={previewOpen ? <EyeOff /> : <Eye />}
              intent="outlined"
              onClick={() => setPreviewOpen(!previewOpen)}
            >
              {previewOpen ? "Hide Output" : "Show Output"}
            </Button>
            <Button intent="outlined" onClick={runCode} disabled={isRunning || isLoading || !pyodide}>
              {isLoading ? "Loading Python..." : isRunning ? "Running..." : "Run Code"}
            </Button>
            <Button
              leftIcon={<Save />}
              onClick={() => {
                setScriptCode(fileContent);
                onClose();
              }}
            >
              Save Notebook
            </Button>
          </div>

          <Dialog.Close
            className="absolute right-8 top-10 rounded-full opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900 dark:data-[state=open]:bg-slate-800"
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
