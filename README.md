# Fusion by NEUROFUSION Research Inc.

We build tools to accelerate the adoption of neurotechnology and behavior research in every day life. We've built:

- Fusion Copilot [iOS](https://apps.apple.com/ca/app/usefusion/id6445860500?platform=iphone), [Android](https://play.google.com/store/apps/details?id=com.neurofusion.fusion&pli=1) that helps you manage different areas of your life using personalized prompts and AI coaching.
- [NeuroFusion Explorer](https://usefusion.app/playground) for conducting and participating in distributed neurotechnology & behavior research. After every recording you get instant analysis of recorded data without need to be an expert in signal processing.

## Roadmap

- [x] Record EEG while performing various activities using [Neurosity Crown](https://neurosity.co) and [Muse](https://choosemuse.com)
      Supported activities:

  - [x] Open Ended Brain Recording
  - [x] Resting state (Eyes Closed/Eyes Open)
  - [x] Stroop Task
  - [x] Auditory Oddball
  - [x] Flappy Bird game (Detecting intent & frustration)

- [ ] Analysis of collect data

  - [ ] Chart of steady state frequency power across recordings
  - [ ] If applicable event related potential analysis
  - [ ] Periodic vs. aperiodic frequecny evaluation using [fooof package](https://fooof-tools.github.io/fooof/)

- [ ] Connect your screentime events & productivity metrics using [ActivityWatch](https://activitywatch.net)
- [ ] Connect screentime events & productivity metrics from [Magicflow](https://magicflow.com)

- [ ] Deploy quests to people devices - a quest is a protocol person is to follow for data collection.
  - [ ] It can involve prompts, recording, brain activity
- [ ] Query your data with natural language
- [ ] Design and upload custom EEG experiment protocols to participants' devices

## Tech Stack

- [Frontend](https://github.com/NEUROFUSIONInc/fusion/tree/master/frontend): React, Next.js
- [Backend server](https://github.com/NEUROFUSIONInc/fusion/tree/master/backend): Node & Express, MySQL
- [Mobile](https://github.com/NEUROFUSIONInc/fusion/tree/master/mobile): React Native & SQLite
- [Analytics API](https://github.com/NEUROFUSIONInc/fusion/tree/master/analysis_api): Python, Flask.
- [Desktop](https://github.com/NEUROFUSIONInc/fusion/tree/master/desktop): Electron

## How to contribute

See the [issues](https://github.com/NEUROFUSIONInc/fusion/issues) for features we're actively developing.

- [Join the Fusion Community](https://discord.gg/3wCNJ6X4RF)

- If you see any parts of the code you think needs updating, please
- Consider creating a pull requests [create a pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request)
- Create an issue if there's something you think we should include

- Things you can do to contribute
  - Ask questions! Tell us why you're interested in technology like Fusion
  - [Join an open data recording/curation effort](https://discord.gg/zeEspvz8jw)
  - Data Science & Machine Learning
    - Have our first EEG model hosted as an api - EEGFormer / DreamDiffusion ..
  - Contributing to Fusion's design. [See Figma](https://www.figma.com/file/jGgUXb08g5wudV6ey9bG89/%F0%9F%9B%B8-Fusion?type=design&node-id=0%3A1&mode=design&t=J5iWqbK6FfqInnl7-1)

## Links

- [NeuroFusion website](https://usefusion.app)
- [NeuroFusion Blog](https://usefusion.app/blog)
- [Why is Fusion open source & how do we fund it?](https://github.com/NEUROFUSIONInc/fusion/discussions/167)
- [Fund NeuroFusion's development](https://buy.stripe.com/fZeaG6aKPgdga2IbII)

## I want to talk to someone on the team for help or discuss collaboration together?

If you need help, you can ask questions on our [Discord](https://discord.gg/DXyHcqvw3C), or send an email to [contact@usefusion.app](mailto:contact@usefusion.app).

For any contribution that is not related to code of the Fusion library (including the documentation) should not be asked on GitHub, but rather on the Discord channel.
