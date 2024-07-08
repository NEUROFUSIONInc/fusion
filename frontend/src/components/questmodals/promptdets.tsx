import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import { PromptModalDetsContext } from "~/hooks/modalContext";
import { useContext } from "react";

interface PromptModalDetsProps {
  onPrevious: () => void;
  onClose: () => void;
  onContinue: () => void;
}

const PromptModalDets: React.FC<PromptModalDetsProps> = ({ onPrevious, onClose, onContinue }) => {
  const { promptText, setPromptText } = useContext(PromptModalDetsContext);
  const { responseType, setResponseType } = useContext(PromptModalDetsContext);
  const handleResponse = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setResponseType(event.target.value);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Enter Prompt Details</DialogTitle>

        {/* Add content for the details of the prompt */}
        <div className="list-disc  mt-2">
          <Input
            label="Prompt Text"
            type="text"
            size="md"
            fullWidth
            placeholder="eg : are you feeling energetic"
            value={promptText}
            className="mt-4"
            onChange={(e) => setPromptText(e.target.value)}
          />

          <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
            Select response type:
            <select
              value={responseType}
              onChange={handleResponse}
              id="activity"
              className="block w-full mt-4 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
            >
              <option value="" disabled>
                Select a response type
              </option>
              <option>Yes/No</option>
              <option>Text</option>
              <option>Number</option>
              <option>Custom Option</option>
            </select>
          </label>
        </div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button onClick={onPrevious}>Previous</Button>
          <Button disabled={promptText === "" || responseType === ""} onClick={onContinue}>
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PromptModalDets;
