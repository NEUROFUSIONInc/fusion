# src/components/button/button.stories.tsx

This TypeScript file contains the story definitions for the `Button` component used within the Storybook framework for React Native.

## Content

Storybook stories are abstractions that represent different states of a component, providing an interactive way to document, build, and demo UI components. We define a story using the `StoryObj` type, passing the `ButtonProps` interface as a template argument.

### Meta

The `meta` object holds the Storybook metadata, specifying the story's title and associating it with the Button component. It also specifies the export default for the file as the `meta` object.

```typescript
const meta: Meta<typeof Button> = {
  title: "ui/Button",
  component: Button,
};

export default meta;
```

### Story Types

Various story types are declared, representing different variations of the `Button` component. Each story is exported as a constant and follows the `Story` type pattern.

```typescript
type Story = StoryObj<ButtonProps>;
```

### Primary Story

The `Primary` story defines the `Button` component rendered with the primary style variant, fully expanded to its container's width.

```typescript
export const Primary: Story = {
  args: {
    title: "Welcome to Fusion",
    variant: "primary",
    fullWidth: true,
  },
  render: (props) => (
    <View className="flex h-full p-4 bg-dark">
      <Button {...props} />
    </View>
  ),
};
```

### Rounded Story

The `Rounded` story showcases a button styled with rounded borders.

```typescript
export const Rounded: Story = {
  // ...
};
```

### Secondary Story

The `Secondary` story illustrates another styling variant where the `Button` has secondary styling.

```typescript
export const Secondary: Story = {
  // ...
};
```

### Outline Story

The `Outline` story presents a button with an outlined style, fitting the width of its container.

```typescript
export const Outline: Story = {
  // ...
};
```

### Disabled Story

The `Disabled` story provides a view of the `Button` in a disabled state, demonstrating how the button appears unclickable.

```typescript
export const Disabled: Story = {
  // ...
};
```

### Loading Story

The `Loading` story represents the `Button` component while in a loading state, indicating an in-progress action.

```typescript
export const Loading: Story = {
  // ...
};
```

## Usage

These story definitions can be visually tested within the Storybook UI and are a helpful tool for developers and designers to fine-tune the appearance and behavior of UI components across different states and variations. 

## Considerations

- The Storybook setup allows separate stories to be written for each visual state or variant of a component.
- The use of the `args` object in each story allows easy modification of the component's props for demonstration purposes.
- The `render` function demonstrates how the component should be structured in various scenarios.