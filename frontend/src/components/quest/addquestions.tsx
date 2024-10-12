import { useState } from "react";
import { OnboardingQuestion } from "~/@types";
import { Input } from "../ui/input/input";
import { Button } from "../ui/button/button";
import { Dialog, DialogTitle, DialogHeader, DialogContent, DialogDescription } from "../ui";
import { responseTypes } from "~/config/data";

interface AddOnboardingQuestionModalProps {
  question: OnboardingQuestion;
  setQuestion: (question: OnboardingQuestion) => void;
  onSave: (question: OnboardingQuestion) => void;
  onClose: () => void;
}

export const AddOnboardingQuestionModal: React.FC<AddOnboardingQuestionModalProps> = ({
  question,
  setQuestion,
  onSave,
  onClose,
}) => {
  const [questionText, setQuestionText] = useState(question.question);
  const [questionType, setQuestionType] = useState(question.type);
  const [required, setRequired] = useState(question.required);

  const handleSave = () => {
    const updatedQuestion: OnboardingQuestion = {
      ...question,
      question: questionText,
      type: questionType,
      required: required,
    };
    setQuestion(updatedQuestion);
    onSave(updatedQuestion);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Onboarding Question</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex flex-col gap-2">
          <Input
            label="Question"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            required
            className="w-full"
          />

          <Input
            label="Response required?"
            type="checkbox"
            id="requiredCheckbox"
            checked={required}
            onChange={(e) => setRequired(e.target.checked)}
            required={true}
          />
          <div className="flex flex-col gap-2">
            <div className="flex flex-col">
              <label htmlFor="questionTypeSelect">Response Type</label>
              <select
                id="questionTypeSelect"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as OnboardingQuestion["type"])}
                aria-label="Question Type"
                className="block rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
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
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <Button disabled={false} onClick={handleSave}>
              Save Question
            </Button>
          </div>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};
