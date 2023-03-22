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
}
```

Notification identifier will be the UUID from above.

Response to prompts are saved in fusion Event schema [doc](../README.md)

## Deployment

- Generate ios build : expo build --platform ios
- Submit build - eas submit --platform ios

## Next steps

- (done) Don't reset notifications every time app loads unless changed.
  (done) NOTE: notifications we already scheduled for people previously - code has a workaround to clear & reset

- (done) Display summary for selected results- (done) don't open app after notification is clicked
- (done) Ensure that prompts & notification stay in sync across mobile views
- (done) fix bug for yes/no not prompting up buttons
- include filter for "day/week/month" view

Prompts
Authoring

- Show some default prompts that users can add/enable
- Allow to set "time" for notifications
  - "skip"?
- Pause notification prompts
  - fully
  - certain times
- UI - swipe for more (edit/delete/view responses)

Responding

- Allow user to tap to respond to prompts

Results

- Send notification to view weekly updates.

Usage

- Log when notifications are triggered and responded to. Just counts no identifying info.

- Use "Expletus Sans" font.
- Apple health data connection
- Connect fusion account & periodically upload logs to remote storage

- don't allow to have duplicate prompts

change a question prompt, I save together with the notification id

- make sure this works for data that was saved before it was included.
