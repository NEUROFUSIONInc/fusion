import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { getLocalFile } from "~/services/storage.service";

// A simple code editor page that displays content from a file
const CodeEditorPage: NextPage = () => {
  const router = useRouter();
  const { filename } = router.query;
  const [content, setContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fileType, setFileType] = useState<string>("json");

  useEffect(() => {
    const loadFile = async () => {
      if (!filename || typeof filename !== "string") {
        setError("No filename provided");
        setIsLoading(false);
        return;
      }

      try {
        const file = await getLocalFile(filename);
        if (file && file.file) {
          const text = await file.file.text();
          setContent(text);

          // Determine file type for syntax highlighting
          if (filename.endsWith(".json")) {
            setFileType("json");
          } else if (filename.endsWith(".csv")) {
            setFileType("csv");
          } else {
            setFileType("text");
          }
        } else {
          setError("File not found");
        }
      } catch (err) {
        setError("Error loading file: " + (err instanceof Error ? err.message : String(err)));
      } finally {
        setIsLoading(false);
      }
    };

    if (filename) {
      loadFile();
    }
  }, [filename]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      {fileType === "json" && (
        <pre className="h-full w-full p-4 overflow-auto bg-gray-50 text-sm font-mono">{formatJson(content)}</pre>
      )}

      {fileType === "csv" && (
        <div className="h-full w-full p-4 overflow-auto bg-gray-50">
          <table className="min-w-full divide-y divide-gray-200">
            <tbody>
              {content.split("\n").map((line, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  {line.split(",").map((cell, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fileType === "text" && (
        <pre className="h-full w-full p-4 overflow-auto bg-gray-50 text-sm font-mono">{content}</pre>
      )}
    </div>
  );
};

// Helper function to format JSON with indentation
function formatJson(jsonString: string): string {
  try {
    const obj = JSON.parse(jsonString);
    return JSON.stringify(obj, null, 2);
  } catch (e) {
    return jsonString; // Return as is if not valid JSON
  }
}

export default CodeEditorPage;
