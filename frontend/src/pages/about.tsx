import { Mail } from "lucide-react";
import { Button } from "../components/ui/button/button";
import { Meta } from "~/components/layouts/meta";
import { MainLayout } from "~/components/layouts/main-layout/main-layout";

export default function About() {
  return (
    <MainLayout>
      <Meta
        meta={{
          title: "About | NeuroFusion",
        }}
      />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">About NEUROFUSION Research, Inc.</h1>

        <section className="mb-12">
          <p className="mb-4">
            NeuroFusion is developing open-source tools for collecting health, behavior, and brain activity data in
            community settings. Our aim is to create predictive models for cognitive and mental health decline.
          </p>
          <p className="mb-4">
            We began with a mobile app that helps users manage changes in productivity, physical and mental health using
            personalized prompts. Our web interface allows users to record brain activity data while playing
            games/cognitive experiments. This data is then analyzed to reveal variations in brain activity.
          </p>
          <p className="mb-4">
            We have since introduced Quests, enabling distributed data collection around areas of interest and shared
            results. We believe that this is a critical piece of infrastructure required to accelerate progress in
            neurotech & decentralized science.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Principles</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <strong>Privacy:</strong> Local first & user's are anonymous by default. People & not platforms should own
              their data.
            </li>
            <li>
              <strong>Ease of use:</strong> Bringing research into people's daily lives means we have to lower the
              barrier to entry. You do not need to have a 'science' background to use our tools.
            </li>
            <li>
              <strong>Interoperability:</strong> Anyone can export their data for analysis and even use our schemas for
              building their own apps.
            </li>
            <li>
              <strong>Working with our doors open:</strong> We welcome anyone interested to use our open source code or
              reach out to us for collaboration!
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">How far along are we?</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Launched mobile app on Android and iOS for behavior tracking, integrated with Apple Health and Google Fit.
              Provides personalized summaries from data and actionable suggestions to navigate daily activities.
            </li>
            <li>
              Web platform with mobile EEG device integrations for anyone to run cognitive tasks and longitudinal
              studies.
            </li>
            <li>
              We're releasing open datasets for people to build on: resting state EEG, cold plunges & brain activity,
              task-based data correlated with brain activity (e.g., screen time combined with EEG to understand neural
              correlates of context switching).
            </li>
            <li>
              Validation & Feedback at pop-up cities: investigating the effects of coldplunges at ZuConnect,
              understanding cognitive workload during chess at Edge Esmeralda
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Roadmap</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Use NeuroFusion's tools for group studies with communities around areas of interest - validating
              interventions, investigating neural dynamics during task processing!
            </li>
            <li>Allowing anyone do brain recordings on their mobile phone with automatic analysis afterwards</li>
            <li>
              Support for interactive closed loop experiments – being able to make decisions based on changes in
              people's brain waves. e.g playing music based on your brainwaves to elicit certain brain states.
            </li>
            <li>
              Developing a foundational model from brain activity (eeg) that can predict brain states and decode intent
              for a person using few examples. Started work on this
            </li>
            <li>
              More data integrations & modalities to improve model predictions : passive productivity data - screen
              time, calendar, music Github
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Build with us!</h2>
          <p className="mb-4">
            Join our discord with 70+ other people interested in brain and behavior research! Here's how to get
            involved:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Give feedback on your experience using Fusion</li>
            <li>Join our network of research participants, link.</li>
            <li>Come write code with us!</li>
          </ul>
        </section>

        <div className="mt-8">
          <p className="mb-4">Thanks for reading!</p>
          <Button leftIcon={<Mail />} onClick={() => (window.location.href = "mailto:ore@usefusion.app")}>
            Contact Us
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
