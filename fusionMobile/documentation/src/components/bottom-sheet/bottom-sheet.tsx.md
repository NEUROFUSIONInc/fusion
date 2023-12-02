# src/components/bottom-sheet/bottom-sheet.tsx

This TypeScript file is part of a React Native application's components directory. It sets up and exports a custom bottom sheet component using the `@gorhom/bottom-sheet` package.

## Contents

- Imports:
  - Various components and types from the `@gorhom/bottom-sheet` package for constructing a bottom sheet UI component.
  - React hooks `forwardRef` and `useCallback`.
  - React Native's `View` component.
  - A `Button` component and its prop type from a local component file.
  - A theme color `colors` from the application's theme directory.
- `IBottomSheetProps` interface that extends `BottomSheetProps` with additional properties for the footer, primary button, and backdrop.
- `BottomSheet` component:
  - Utilizes the `forwardRef` method to expose `BottomSheetMethods` to parent components for controlling the open/close behavior.
  - The component accepts a range of props, including children, snap points for dragging behavior, and functions to render the backdrop and footer.
  - Provides callbacks for rendering custom backdrop and footer components, with the backdrop having adjustable opacity and behavior on press.
  - Returns the `BottomSheet` component from the `@gorhom/bottom-sheet` package, with spread props and ref forwarding.
  - Applies theming using the `colors` imported from the theme directory.

## Usage

The `BottomSheet` component can be used in a React Native application to present an overlay menu or information panel that slides up from the bottom of the screen. It provides functionality for snapping to different positions and customizing behavior on backdrop press.

Example usage:

```javascript
import { BottomSheet } from '~/components/bottom-sheet/bottom-sheet';

// In component render:
<BottomSheet
  snapPoints={[200, 400]} // Points for the snapping behavior
  footerButtonTitle="Action" // Title for the button in the footer
  onHandlePrimaryButtonPress={() => console.log('Button pressed')} // Handler for button press
  primaryButtonProps={{ /* Props for the primary button */ }}
  renderFooter // Whether to render footer
  {...otherProps}
>
  {/* Children components to display inside the bottom sheet */}
</BottomSheet>
```

## Considerations

- This component is a convenient way to use a bottom sheet with extended functionality, as it encapsulates common need features like backdrops and footers.
- Understanding the features and API of the `@gorhom/bottom-sheet` package is essential to work with this component effectively.
- The component is styled using a `colors` theme, ensuring that it aligns with the overall design system of the application.
- The use of `forwardRef` provides more control to parent components that might need to manage the bottom sheet's state imperatively.