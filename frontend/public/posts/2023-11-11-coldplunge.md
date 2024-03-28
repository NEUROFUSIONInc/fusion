---
title: Investigating the Impact of Cold Plunges on Brain Activity
description: Are there changes in attention & stress response after cold water immersion?
publishedDate: 2023/11/11
coverImage: /images/blog/coldplunge/doing_experiment.png
tags:
  - Neurotech
  - Research Studies
slug: cold-plunge-impact
authors:
  - name: "Ore Ogundipe"
---

During [ZuConnect](https://zuzalu.city/), we were curious about the impact of cold plunges on peoples brain activity & overall wellbeing. Are there changes in attention & stress response?

![Picture of Water Temperature](/images/blog/coldplunge/water_temperature.png)

**Average water temperature 5-10 degrees celsius**

## Recording

For the experiment, each person wore:

- An 8 channel EEG headset ([Neurosity Crown](https://neurosity.co)) and performed recordings using the [Fusion Explorer](https://usefusion.app/playground)

![Picture of Participant in Water](/images/blog/coldplunge/participant_in_water.png)

### Flow

Total time: 25mins

- Resting state (eyes closed & eyes open in alternating 15 seconds) (5mins)
- Stroop task (matching the color of a word & the text) (5mins)
- Water Immersion (3mins)
- Get dry (2mins)
- Stroop task (5mins)
- Resting state (5mins)

![Picture of Participant in Doing Cognitive Task](/images/blog/coldplunge/doing_experiment.png)

## What did we observe?

**Individual Variability:** There is significant individual variability in brain activity responses to the cold plunge experiment. This suggests that each person's brain reacts differently to the same stimuli, possibly due to personal differences in stress response, cognitive processing, and overall brain function.

Key observations:

- **Delta Band (Deep Relaxation or Stress):** Changes in the delta band could indicate varying levels of deep relaxation or stress. During the cold plunge ('plunge_open_ended'), some participants show an increase in delta power, which might suggest a relaxation response or a dissociative state in response to extreme cold. Others may show a decrease, indicating a stress response.
  ![Relative Delta Power Across Sessions & Partipants](/images/blog/coldplunge/relative_delta_across.png)
- **Theta Band (Emotional Response):** The theta band, often associated with emotional experiences, shows varied responses during the experiment. Increases in theta power, particularly during the plunge, could reflect an emotional or meditative response. It's also worth noting how participants' theta activity changes during the cognitive tasks ('pre_plunge_stroop' and 'post_plunge_stroop'), as this might reflect emotional reactions to cognitive stress.

  - Theta is often linked to drowsiness, creativity, and emotional experiences. Fluctuations might reflect emotional responses or relaxed states.

  ![Relative Theta Power Across Sessions & Partipants](/images/blog/coldplunge/relative_theta_across.png)

- **Alpha Band (Relaxation and Alertness):** The alpha band is typically linked to states of relaxation and calmness. Higher, more relaxation. Lower, more alertness. Fluctuations in this band, especially in the post-plunge phases, could be indicative of changes in relaxation or alertness levels as the participants recover from the stress of the plunge.

  ![Relative Alpha Power Across Sessions & Partipants](/images/blog/coldplunge/relative_alpha_across.png)

- **Beta Band (Active Thinking and Focus):** The beta band is related to active thinking and focus. Variations here during the 'stroop' tasks suggest differences in cognitive processing and stress response. An increase in beta power might indicate heightened alertness and cognitive engagement, while a decrease could suggest fatigue or decreased focus.

  ![Relative Beta Power Across Sessions & Partipants](/images/blog/coldplunge/relative_beta_across.png)

- **Gamma Band (Cognitive Functioning):** Lastly, the gamma band is associated with higher cognitive processing tasks. Changes in this band could reflect how different individuals' cognitive functions are affected by the stress and recovery phases of the experiment.

  ![Relative Gamma Power Across Sessions & Partipants](/images/blog/coldplunge/relative_gamma_across.png)

**Contextual Adaptation:** The progression from a resting state, through a cognitive task, into the stressor (cold plunge), and back through cognitive tasks and resting state, shows how the brain adapts to changing contexts. The variations in brain activity across these stages reflect the dynamic nature of brain responses to both cognitive and physical stressors.

In summary, these visualizations provide valuable insights into the dynamic and individualized nature of brain responses to stress and relaxation stimuli, as seen in the context of a cold plunge experiment. The data underscores the complexity of brain functioning and the unique ways in which different individuals process the same experiences.

## Future Considerations

**Longitudinal Recordings:** Monitoring changes for an individual over multiple days with an understanding of context (e.g sleep, heart rate) will also help explaining variances across multiple people.

**Larger sample size:** This study only observed 10 people. We need a much larger population of ~100 people or more for stronger statistical significance.

<aside>
🧠 Have more questions / curious about self experimentation?

- [Join our community discord!](https://discord.gg/PCjdaJuySU)
- [Reach out contact@usefusion.app](mailto:contact@usefusion.app)
- [Download the Fusion app to monitor and understanding changes in behavior over time the impact of lifestyle choices!](https://usefusion.app)
</aside>

## Acknowledgements

Thank you to all our participants for their patience and enthusiasm exploring the unknown together. Our goal at Neurofusion is to accelerate the adoption of neurotechnology as a tool for proving the credence of interventions in everyday life and this experiment got us one step closer to doing so.

### Notes on Analysis

- After each recording, we get a zip dataset that is saved locally.
- We used our processing script to filter our epochs that did not have good signal 90% of the time. The length of each epoch is 5 seconds.
- After getting the frequency power averages for each trail per participant, we created a single dataset that contained the frequency power summary across trials.
- For comparison across subjects, we chose relative power because absolute power values can be skewed based on size of head & differences in individual fit of EEG headset.

[Our work is open source on Github](https://github.com/NEUROFUSIONInc/fusion)

Thanks,

Ore from NEUROFUSION Research Inc.
