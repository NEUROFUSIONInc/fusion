The `src/components/prompts/create-prompt-sheet/add-prompt-sheet.tsx` file defines a React component named `AddPromptSheet`. This component is responsible for presenting options to the user within a bottom sheet for adding new prompts. Users can either select from example prompts or create a new prompt.

### Overview of `AddPromptSheet`:

- Imports various modules such as `RNBottomSheet`, `Portal`, `useNavigation`, `useCallback`, `useRef`, `View`, `BottomSheet`, and other custom components.
- Defines an interface `AddPromptSheetProps` that describes the expected props for the `AddPromptSheet` component, including a `bottomSheetRef` and an optional `selectedCategory`.
- Implements the `AddPromptSheet` as a functional component, utilizing the `bottomSheetRef` reference to manage the bottom sheet state and enabling the user to interact with the prompt options.
- Includes two key functions: `handleBottomSheetClose` to close the bottom sheet and `handleCreatePromptSheetOpen` to open the creation sheet for a new prompt.
- Implements `handleQuickAddPrompt` to navigate to a quick add prompt screen with the selected category (if available).
- Utilizes the `Portal` component to render the bottom sheet above other components in the app.
- Contains the `BottomSheet` component and configures it with desired `snapPoints`.
- Places two `PromptOption` components within the bottom sheet to provide options to the user.
- Provides a `Button` to allow the user to close the bottom sheet.
- Includes another component `CreatePromptSheet` that is referenced for creating new prompts.

### Usage:

This component is likely to be used in an app where users can add new prompts. The `AddPromptSheet` component provides a user-friendly interface with options to create new prompts or quickly add from predefined examples within a modal bottom sheet. The ref-forwarding and navigation utilities enable smooth transitions and interactions between different parts of the app. The `Portal` component ensures that the modal is rendered correctly above other app content.