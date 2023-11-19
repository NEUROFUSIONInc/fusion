# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.
Data is currently stored using AsyncStorage (SQLite)

## Prompt Structure

```json
{
  uuid
  promptText
  responseType - "number", "yesno", "text", "customOptions"
  additionalMeta - {category, isNotificationActive, customOptionsText}
  notificationConfig_days - json.stringify of "{"monday": true, "tuesday": false ....., "sunday": true}"
  notificationConfig_startTime
  notificationConfig_endTime
  notificationConfig_countPerDay
}
```

customOptionText will look like - 'optionA;optionB;optionC'

After a prompt is created, a notification is generated.

Response to prompts are saved in format

```json
{
  triggerTimestamp
  responseTimestamp
  value
  promptUuid
  additionalMeta {
    note: string
  }
}
```

when responseType == customOption,
value can contain "valA;valB"

They can eventually exported in fusion Event schema [doc](../README.md)

Mapping Fusion event schema to prompt_response

- startTimestamp: `triggerTimestamp` when the prompt was sent
- endTimestamp: `responseTimestamp` when the prompt was responded to

## Deployment

- Generate ios build : eas build --platform ios
  - to build android locally `eas build --local --platform=android`
- Submit build - eas submit --platform ios

Before submission, we need to run `npx expo prebuild`

## Prompts

### Authoring

- (done) Allow to chose the time range for notifications on certain days & times
- Show some default prompts that users can add/enable
- Pause notification prompts
- UI - swipe for more (edit/delete/view responses)
- When the person chooses 1 as number of times, only show one time to select.

### Responding

- (done) Save response at the time of entry & also when it was generated.
- (done) Allow user to tap to respond to prompts (create prompt component)

### Results

- (done) include filter for "day/week/month" view
  - clearly identify periods of missing data
- Send notification to view weekly updates.
- Compare values for one week vs. last period
- Textual summary with contributing factors. - chatbox below to ask questions & reason over displayed data
  - e.g under the prompt for energetic... I could ask "how does this related with my work?"
- Allow user to compare result with another prompt

## Usage

- Log when notifications are triggered and responded to. Just counts no identifying info.
  - Random guid per device instance which can be regenerated (or pubkey)

We will be using [Azure Application Insights] for event tracking.

- PageViews (for screen loads)

  - name: <name_of_component> e.g
    (done) Home, (prompt_count: number)
    (done) Author Prompt, (intent : create, edit)
    (done) Prompt Responses, (promptId, responseCount)
    (done) Account

- Custom Events (for user actions)

  - (done) app_started
  - (done) prompt_saved
    - identifier (randomly generated, different from what's in the local db)
    - action_type: "create" / "update"
    - notification_config
  - (done) prompt_deleted

    - identifier (randomly generated, different from what's in the local db)

  - (done) prompt_response (changed in Fusion_ios_1.0.01_14 from `prompt_notification_response`)

    - identifier
    - triggerTimestamp
    - responseTimestamp

  - (todo) prompt_notification

TODO: handle when user is offline :p

## Stability

- (done) switch storage to sqlite

  - (done) create tables

    - prompts
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

  - (done) edit prompts

- (done) logic to save prompt responses & read

(notes on notifications)

- remove other ones when a new one is presented (we should only have one in the tray at a time)

- Have only one notification for a prompt in the tray.

# Notes from integrating with bluetooth

- Following this doc: https://docs.neurosity.co/docs/api/bluetooth-react-native

# Gotchas

When installing "isomorphic-webcrypto", set "--ignore-optional"

- if things aren't making sense, run expo run:ios --no-build-cache

---

todo

- enable local permissions for "research program"
- display Quests when

- Measuring prompt response rate

- Add some templates for people

P- Share prompts flow
should eventually allow users select what prompts & who they want to share the results to in Fusion :)

# Setting environment variables

Expo handles environment variables a little different than regular web app. We set them in the app.config.ts file.
and then use constants. See appInsights.js for an example. More docs - https://docs.expo.dev/build-reference/variables/
