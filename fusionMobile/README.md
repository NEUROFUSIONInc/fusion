# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.

Data is currently stored using AsyncStorage.

## Deployment

- Generate ios build : expo build --platform ios
- Submit build - eas submit --platform ios

## Next steps

- Don't reset notifications every time app loads unless changed.
- Display summary for selected results
- Apple health data connection
- UI - swipe for more (edit/delete/view responses)
  - Allow to pause notification prompts
- Connect fusion account & periodically upload logs to remote storage
- Use "Expletus Sans" font.

bugs:

- (done) don't open app after notification is clicked
- (done) Ensure that prompts & notification stay in sync across mobile views
- (done) fix bug for yes/no not prompting up buttons

- don't allow to have duplicate prompts
