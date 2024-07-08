import { useContext } from "react";
import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import category from "~/config/category";
import  {AddPromptModalContext}  from '~/hooks/modalContext';
 
 interface AddPromptModalProps {
    onSave: () => void;
    onClose: () => void;
    onContinue: () => void;
   
  }

const AddPromptModal: React.FC<AddPromptModalProps> = ({ onSave, onClose, onContinue }) => {

const {selectedCategory, setSelectedCategory} = useContext(AddPromptModalContext);
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(event.target.value);
    };
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Select a category</DialogTitle>
          <DialogDescription>
            <div className="list-disc mt-2">
              <label htmlFor="activity" className="my-2 block text-sm font-medium text-gray-900 dark:text-white mt-4">
                Choose a category that best describes your prompt.
              </label>
              <select value={selectedCategory} onChange={handleChange}                   className="block w-full mt-4 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {category.map((item, index) => (
                  <option key={index} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end gap-4">
            <div></div>
            <Button onClick={onContinue}>Continue</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default AddPromptModal;