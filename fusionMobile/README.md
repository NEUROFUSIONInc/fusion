# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.

Data is currently stored using AsyncStorage.

TODO:

- don't open app after notification is clicked
- Ensure that prompts & notification stay in sync across mobile views
- (done) fix bug for yes/no not prompting up buttons

Next steps

- Display summary for selected results
- Connect fusion account & periodically upload logs to remote storage
- Apple health data connection
- UI - swipe for more (edit/delete/view responses)

Deployment

- Generate ios build : expo build --platform ios

- Submit build - eas submit --platform ios
