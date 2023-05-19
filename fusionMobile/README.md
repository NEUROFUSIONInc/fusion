# Fusion Mobile

Expo react native application for fusion.

Initial feature is customized self prompting & seeing results from connected data.

Data is currently stored using AsyncStorage (SQLite)

## Prompt Structure

```json
{
  uuid
  promptText
  responseType - "number", "yesno", "text"
  notificationConfig_days - json.stringify of "{"monday": true, "tuesday": false ....., "sunday": true}"
  notificationConfig_startTime
  notificationConfig_endTime
  notificationConfig_countPerDay
}
```

After a prompt is created, a notification is generated.

Response to prompts are saved in format

```json
{
  triggerTimestamp
  endTimestamp
  value
  promptUuid
}
```

They can eventually exported in fusion Event schema [doc](../README.md)

Mapping Fusion event schema to prompt_response

- startTimestamp: `triggerTimestamp` when the prompt was sent
- endTimestamp: `responseTimestamp` when the prompt was responded to

## Deployment

- Generate ios build : eas build --platform ios
  - to build android locally `eas build --local --platform=android`
- Submit build - eas submit --platform ios

Before submission, we need to run `npx expo prebuild

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

### Migration to SQLite

(I want to make sure people don't have to lose old prompt data)

- (done) prompts

  - read from async storage
  - parse with some default config into db prompt..
    - daily, 8am - 10pm

- (done) prompt_responses

  - read from async storage
  - check the db for prompt with "Fusion: ${promptText}"
  - get the promptUuid and store prompt response

- (done) delete ('prompts' & 'events') from async storage
  - using "migrated" value in AsyncStorage

## Planned Releases

Mid-april release

- Use "Expletus Sans" font.
- Apple health data connection & chat integration
- Connect fusion account & periodically upload logs to remote storage

bugs:

(done) Change press & hold text for android
(done) Clear notification tray for other similar prompts when one is answered

## Remaining items for Apr. 9

(done) edit prompts

- (done) start date & end date need to be parsed
  - get the current day, apply the hours & minutes as day.js objects

allow to respond after tapping to notifications

- Input Validation

  - don't set startTime for after endTime
  - don't allow to have prompts with duplicated `promptText`

- Add a modal

  - letting user know what changes have occured.
    - default, 3 times between 8-6pm.

- Quick add prompt

(notes on notifications)

- remove other ones when a new one is presented (we should only have one in the tray at a time)

- come back to resync feature

- add summary in the response page

# Android Feedback

-

# IOS Feedback

- move request notification when prompt is being created for the first time

- when a person selects one time, change the selector to just one time

* include screenshots...

## Change log

- Usage - `prompt_notification_response` is now `prompt_response`

# Notes from integrating with bluetooth

- Following this doc: https://docs.neurosity.co/docs/api/bluetooth-react-native
