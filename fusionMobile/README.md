# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.

Data is currently stored using AsyncStorage.

## Prompt Structure

```json
{
  uuid
  promptText
  responseType
  notificationFrequency {
    value
    unit
  }
  notificationId (new)
}
```

Response to prompts are saved in fusion Event schema [doc](../README.md)

## Deployment

- Generate ios build : expo build --platform ios
- Submit build - eas submit --platform ios

## Next steps

- (done) Don't reset notifications every time app loads unless changed.
  (done) NOTE: notifications we already scheduled for people previously - code has a workaround to clear & reset

- (done) Display summary for selected results
  - not the best but a good start
- Show some default prompts that users can add/enable

  - Allow to pause notification prompts
  - Be 100% certain about notifications coming up when triggered.
  - UI - swipe for more (edit/delete/view responses)
  - fix ope's bug - (tap to respond also)

- Connect fusion account & periodically upload logs to remote storage
- Apple health data connection
- Use "Expletus Sans" font.

bugs:

- (done) don't open app after notification is clicked
- (done) Ensure that prompts & notification stay in sync across mobile views
- (done) fix bug for yes/no not prompting up buttons

- don't allow to have duplicate prompts

(native gesture handler)
