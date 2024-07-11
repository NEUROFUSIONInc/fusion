import { useContext, useState } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, Input } from "~/components/ui";
import { categories, responseTypes } from "~/config/data";
import { AddPromptModalContext } from "~/hooks/modalContext";
import { Prompt } from "~/@types";

interface AddPromptModalProps {
  onSave: () => void;
  onClose: () => void;
  onContinue: () => void;
}

const AddPromptModal: React.FC<AddPromptModalProps> = ({ onSave, onClose, onContinue }) => {
  const { selectedCategory, setSelectedCategory } = useContext(AddPromptModalContext);
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  const [promptText, setPromptText] = useState("");
  const [responseType, setResponseType] = useState("");

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Configure Prompt</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {/* Choose Prompt Category */}
          <div className="list-disc mt-2">
            <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={handleChange}
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a category
              </option>
              {categories.map((item, index) => (
                <option key={index} value={item.name}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* Prompt Details Component - Text, Response Type, */}
          <div className="mt-4">
            <Input
              label="Prompt Text"
              type="text"
              size="md"
              fullWidth
              placeholder="eg : are you feeling energetic"
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
            />
          </div>

          <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
            Response Type:
            <select
              value={responseType}
              onChange={() => {}}
              id="activity"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a response type
              </option>
              {responseTypes.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
            {/* TODO: Add Custom Options Component */}
            {responseType === "customOptions" && (
              <div>
                <Input label="Custom Options" type="text" size="md" fullWidth placeholder="eg : 1,2,3,4,5" />
              </div>
            )}
          </label>

          {/* Add Times Component */}
        </DialogDescription>
        <div className="mt-4 flex justify-end gap-4">
          <Button disabled={false} onClick={onSave}>
            Add Prompt
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddPromptModal;
