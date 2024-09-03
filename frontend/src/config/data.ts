import { IExperiment } from "~/@types";

export const categories = [
  {
    name: "Mental Health",
    color: "#FFC0CB",
    icon: "🧠",
  },
  {
    name: "Productivity",
    color: "#FFD700",
    icon: "👩‍💻",
  },
  {
    name: "Relationships",
    color: "#00FFFF",
    icon: "👫",
  },
  {
    name: "Health and Fitness",
    color: "#00FF00",
    icon: "🏃",
  },
  {
    name: "Spiritual Practice",
    color: "#FFA500",
    icon: "🧘",
  },
  {
    name: "Self-Care",
    color: "#",
    icon: "🧖",
  },
  {
    name: "Finance",
    color: "#FF0000",
    icon: "💸",
  },
  {
    name: "Personal Interest",
    color: "#800080",
    icon: "🤩",
  },
  {
    name: "Other",
    color: "#000000",
    icon: "📁",
  },
];

export const responseTypes = [
  { label: "Yes/No", value: "yesno" },
  { label: "Text", value: "text" },
  { label: "Number", value: "number" },
  { label: "Custom Options", value: "customOptions" },
];

export const promptFrequencyData = [
  {
    label: "Once",
    value: "1",
  },
  {
    label: "Every 30 minutes",
    value: "30",
  },
  {
    label: "Every hour",
    value: "60",
  },
  {
    label: "Every two hours",
    value: "120",
  },
  {
    label: "Every three hours",
    value: "180",
  },
  {
    label: "Every four hours",
    value: "240",
  },
];

export const promptSelectionDays = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};

export const experiments: IExperiment[] = [
  {
    id: 1,
    name: "Resting State - Eyes Closed/Eyes Open",
    description:
      "The 'Eyes Closed/Eyes Open' task is a common neurofeedback protocol used to measure brain activity during periods of rest and activity. During the task, the participant is instructed to close their eyes for a period of time, followed by opening their eyes for a period of time. This cycle is repeated several times, and the brain activity is measured using EEG sensors. The task is often used to measure changes in brain activity associated with attention, relaxation, and other cognitive processes.",
    url: "/experiments/eyes_open_eyes_closed.html",
    tags: ["resting_state"],
  },
  {
    id: 10,
    name: "Visual Oddball - P300, Event Related Potential",
    description:
      "You’ll see a series of images containing circles of different colors. Your task is to count the number of blue and green circles that appear. Occasionally, an image will display a different or unexpected pattern. After the experiment, we will analyze your brain activity to look for changes in the P300 wave, a brain response that occurs about 300 milliseconds after noticing something unexpected.",
    url: "/experiments/visual_oddball.html",
    tags: ["visual_oddball"],
  },
  {
    id: 3,
    name: "Open Ended Brain Recording",
    description:
      "Record your brain activity while performing a task of your choice. Afterwards, you can observe changes in your brain power over time and compare it to other activities.",
    url: "",
    tags: ["open_ended"],
  },
  {
    id: 2,
    name: "Auditory Oddball - P300, Event Related Potential",
    description:
      "We want to understand how our brains react when something unexpected happens. They're particularly interested in a brain wave called the 'P300 wave'. This wave is like a signal your brain sends when it recognizes a change in the pattern of sounds. It usually occurs around 300 milliseconds after your brain registers the oddball sound. Start the experiment to see how your brain responds!",
    url: "/experiments/auditory_oddball.html",
    tags: ["auditory_oddball"],
  },
  {
    id: 4,
    name: "Neuro Game - Training Intent / Measuring emotional valence",
    description:
      "The user plays flappy bird while brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to - Training Intent (Spacebar press) and Measuring emotional valence",
    url: "/experiments/flappy_bird.html",
  },
  {
    id: 5,
    name: "Stroop Task - Cognitive Test",
    description:
      "The Stroop task is a classic test of cognitive control and attentional flexibility. It is often used in clinical and experimental settings to measure selective attention and cognitive control. The task involves naming the color of a word, while ignoring the semantic meaning of the word. For example, the word 'red' might be written in blue ink. The task is often used to measure changes in brain activity associated with attention, relaxation, and other cognitive processes.",
    url: "/experiments/stroop_task.html",
  },
  // {
  //   id: 6,
  //   name: "Verbal Fluency - Cognitive Test",
  //   description:
  //     "This is a test of your verbal fluency. You eill be given a category and you have to name as many words as you can that fit that category. This test is often used to measure changes in brain processing associated with language and congitive processes.",
  //   url: "/experiments/verbal_fluency.html",
  // },
  // {
  //   id: 6,
  //   name: "Neuro Art - Generating Images from EEG",
  //   description:
  //     "Generate images from your brain waves. View some images and then see if you can think of the same image. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with images.",
  //   url: "/experiments/eeg_image.html",
  // },
  // {
  //   id: 7,
  //   name: "N-Back Task - Memory Test",
  //   description:
  //     "See if you remember the sequence or word patterns. You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
  //   url: "/experiments/memory_test.html",
  // },
  // {
  //   id: 6,
  //   name: "Neuro Game - Thought to text",
  //   description:
  //     "You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
  //   url: "/experiments/thought_to_text.html",
  // },
  // {
  //   id: 7,
  //   name: "N-Back Task - Cognitive Test",
  //   description:
  //     "See if you remember the sequence or word patterns. You play a game where you type the words displayed to you on the screen. While you do that, your brain activity (eeg) data is recorded. Data from this experiment can be used for models in relation to correlating brain activity with typing words.",
  //   url: "/experiments/thought_to_text.html",
  // },
];
