# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.

Data is currently stored using AsyncStorage (SQLite)

## Prompt Structure

```json
{
  uuid
  promptText
  responseType
  notificationConfig_days
  notificationConfig_startTime
  notificationConfig_endTime
  notificationConfig_countPerDay
  isScheduled
}
```

After a prompt is created, a notification is generated.

Notification identifier will be the UUID from above.

Response to prompts are saved in fusion Event schema [doc](../README.md)

In the context of prompts

- startTimestamp : when the prompt was sent
- endTimestamp: when the prompt was responded to

## Deployment

- Generate ios build : expo build --platform ios
- Submit build - eas submit --platform ios

## Prompts

### Authoring

- Allow to chose the time range for notifications on certain days & times
- Show some default prompts that users can add/enable
- Pause notification prompts
  - fully
  - certain times
- UI - swipe for more (edit/delete/view responses)

### Responding

- Save response at the time of entry & also when it was generated.
- Allow user to tap to respond to prompts (create prompt component)

### Results

- include filter for "day/week/month" view
- Send notification to view weekly updates.
- Compare values for one week vs. last period
- Textual summary with contributing factors. - chatbox below to ask questions & reason over displayed data
  - e.g under the prompt for energetic... I could ask "how does this related with my work?"
- Allow user to compare result with another prompt

## Usage

- Log when notifications are triggered and responded to. Just counts no identifying info.
  - Random guid per device instance which can be regenerated (or pubkey)

## Stability

- switch storage to sqlite

  - (done) create tables

    - prompts,
    - prompt_responses
    - prompt_notifications

  - (done) logic to save prompts & read from tables

  - (done) delete logic for prompts, prompt_notifications

  - (done) logic to trigger notifications based on prompt config
    first, we use a function to select the times to trigger

    - if Mon-Sun are set, then use DailyTriggerInput https://docs.expo.dev/versions/latest/sdk/notifications/#dailytriggerinput
      - with multiple notification instances scheduled for time periods.
    - otherwise, use WeeklyTriggerInput https://docs.expo.dev/versions/latest/sdk/notifications/#weeklytriggerinput
      - with multiple notification instances scheduled for time periods.
      - repeated across selected days.

  - edit prompts -- start date & end data need to be parsed

  - logic to save prompt responses & read

  - migrate data for existing

    - prompts

      - read from async storage
      - parse with some default config into db prompt..

    - prompt_responses
      - read from async storage
      -

- don't allow to have prompts with duplicated `promptText`

## Planned Releases

Mid-april release

- Use "Expletus Sans" font.
- Apple health data connection
- Connect fusion account & periodically upload logs to remote storage

bugs:

(done) Change press & hold text for android

- check instances when scheduleFusionNotification is called

  - there's a hook in the PromptContext...

- add "isScheduled" tag to notifications
