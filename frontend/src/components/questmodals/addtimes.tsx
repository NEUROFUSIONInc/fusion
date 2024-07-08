import { Button, Dialog, DialogContent, DialogDescription, DialogTitle, Input } from "~/components/ui";
import  {AddPromptTimesContext}  from '~/hooks/modalContext';
import { useContext } from "react";

interface AddPromptTimesProps {
    onPrevious: () => void;
    onClose: () => void;
    onContinue: () => void;
  }
const AddPromptTimes: React.FC<AddPromptTimesProps> = ({ onPrevious, onClose, onContinue }) => {
    
   const {frequency, setFrequency} = useContext(AddPromptTimesContext);
   const {selectedDays, setSelectedDays} = useContext(AddPromptTimesContext);
   const {betweenTime, setBetweenTime} = useContext(AddPromptTimesContext);
   const {andTime, setAndTime} = useContext(AddPromptTimesContext);

    const handleDayChange = (day: string) => {
      setSelectedDays((prev: string[]) =>
        prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
      );
    };
    

    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle>Set time and frequency</DialogTitle>
          <DialogDescription>
            <div className="mt-2">
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
                How often should we prompt you?
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  id="frequency"
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                >
                  <option value="" disabled>
                    Select an option
                  </option>
                  <option>Once</option>
                  <option>Every 30 minutes</option>
                  <option>Every hour</option>
                  <option>Every two hours</option>
                </select>
              </label>

              <label htmlFor="time" className="block text-sm font-medium text-gray-900 dark:text-white mt-4">
                When do you want to be prompted?
              </label>
              <div className="mt-2">
                <label>Between</label>
                <input
                  placeholder="HH:MM"
                  type="time"
                  id="time"
                  value={betweenTime}
                  onChange={(e) => setBetweenTime(e.target.value)}
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <div className="mt-2">
                <label>And</label>
                <input
                  placeholder="5:00 pM"
                  type="time"
                  id="time"
                  value={andTime}
                  onChange={(e) => setAndTime(e.target.value)}
                  className="block w-full mt-2 rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
                />
              </div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mt-6">
                Which days do you want to be prompted?
                <div className="flex flex-wrap mt-4 gap-2">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                    <div key={day} className="flex items-center">
                      <input
                        type="checkbox"
                        id={day}
                        value={day}
                        checked={selectedDays.includes(day)}
                        onChange={() => handleDayChange(day)}
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <label htmlFor={day} className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                        {day}
                      </label>
                    </div>
                  ))}
                </div>
              </label>
            </div>
          </DialogDescription>
          <div className="mt-4 flex justify-end space-x-2">
            <Button onClick={onPrevious}>Previous</Button>
            <Button disabled={!frequency || !betweenTime || !andTime || !selectedDays} onClick={onContinue}>Add Propmt</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  export default AddPromptTimes;