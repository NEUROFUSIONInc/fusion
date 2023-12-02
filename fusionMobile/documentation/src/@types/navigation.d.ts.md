# src/@types/navigation.d.ts

This TypeScript declaration file is used to enhance type checking for the `useNavigation` hook within the application by globally declaring navigation parameter types. The purpose of this file is to provide a way for TypeScript to recognize the navigation parameter types used throughout the application, which directly influences the navigation-related props and states.

## Contents

- The declaration file imports `RootStackParamList` from a navigation module located in `~/navigation`.
- The `RootStackParamList` is expected to be the main type that defines the available routes and their parameters in the application's navigation stack.
- The `declare global` block extends the global `ReactNavigation` namespace with an interface `RootParamList` that inherits from `RootStackParamList`. This global declaration augments the existing type definitions for navigation provided by the `react-navigation` library.

## Usage

This file is not meant to contain executable code but rather type declarations that TypeScript uses during development for static type checking. These declarations help ensure that developers use the correct route names and parameters when navigating between screens in the app.

By defining `RootParamList` globally, TypeScript can enforce proper type checking anytime the `useNavigation` hook or other navigation functions are used. It helps prevent runtime errors due to incorrect route names or parameters passed during navigation actions.

## Considerations

- It's essential to keep `RootStackParamList` updated to reflect the current set of navigable screens whenever new screens are added or existing ones are modified.
- Global namespace augmentation should be done carefully to avoid conflicts with type definitions from other libraries or parts of the application. It's meant to integrate seamlessly with the `react-navigation` type system.
- Developers should reference the official documentation for `react-navigation` when dealing with complex navigation structures to ensure proper type usage.