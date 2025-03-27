import { useState } from "react";

import Image from "next/image";

import { fusionOfferingFeatures } from "./data";

import { CustomLink, ButtonLink } from "~/components/ui";
import { api } from "~/config";
import { appInsights } from "~/utils/appInsights";

export const OfferingSection = ({ isResearch = false }) => {
  const [submitted, setSubmitted] = useState(false);

  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContacMessage] = useState("");

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    // Submit logic here, e.g., send form data to server
    if (contactName && contactEmail && contactMessage) {
      appInsights.trackEvent({
        name: "contact-form-submitted",
        properties: {
          name: contactName,
          email: contactEmail,
          message: contactMessage,
        },
      });

      setSubmitted(true);
    } else {
      alert("Please fill in all fields to submit the form.");
    }
  };

  return (
    <section title="offering-and-disclaimers-section" className="w-full p-4">
      {isResearch ? (
        <div className="relative mb-5 mt-5 flex h-auto w-full max-w-4xl items-stretch justify-around rounded-2xl bg-indigo-300/20 bg-offering-pattern md:mx-auto">
          <Image
            src="/images/fusion-app-home-2.svg"
            width={320}
            height={504}
            alt="Fusion App Screenshot"
            className=" hidden overflow-hidden  md:block"
          />
          <div className="flex flex-col bg-white items-start space-y-8 p-12 mx-10 my-16 lg:w-2/4 w-3/4 rounded-lg  md:text-left justify-between">
            {submitted ? (
              <div className="" role="alert">
                <h2 className="text-2xl font-semibold text-gray-900">Your message has been successfully sent!</h2>
                <p className="pt-2">We will get back to you as soon as possible.</p>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-semibold text-gray-900">Let's work together!</h2>
                <p className="font-normal text-md text-gray-500">
                  By combining mobile wearables, cognitive assessments, and self-reports, we aim to accelerate the
                  development of mental health biomarkers for researchers, health institutions and individuals alike.
                </p>
                <p className="font-normal text-md text-gray-500 mt-4">
                  Have a question worth exploring? Let's search for the answers together!
                </p>
                <div className="w-full max-w-lg mt-6 space-y-4">
                  <div className="w-full">
                    <ButtonLink
                      intent="outlined"
                      className="btn w-full p-5"
                      onClick={(e) => {
                        e.preventDefault();
                        setContactName("");
                        setContactEmail("");
                        setContacMessage("");
                        const researcherForm = document.getElementById("researcherForm");
                        const participantForm = document.getElementById("participantForm");
                        if (researcherForm) researcherForm.style.display = "block";
                        if (participantForm) participantForm.style.display = "none";
                      }}
                      href={""}
                    >
                      Researchers? Join our Fellowship
                    </ButtonLink>
                  </div>
                  <div className="w-full">
                    <ButtonLink
                      intent="outlined"
                      className="btn w-full p-5"
                      onClick={(e) => {
                        e.preventDefault();
                        setContactName("");
                        setContactEmail("");
                        setContacMessage("");
                        const participantForm = document.getElementById("participantForm");
                        const researcherForm = document.getElementById("researcherForm");
                        if (participantForm) participantForm.style.display = "block";
                        if (researcherForm) researcherForm.style.display = "none";
                      }}
                      href={""}
                    >
                      Participants? Join our Study Registry
                    </ButtonLink>
                  </div>
                </div>

                <div id="researcherForm" className="w-full mt-6" style={{ display: "none" }}>
                  <iframe
                    src="https://docs.google.com/forms/d/e/1FAIpQLScKGtxEHwwuBYUW7eXVE_LEz3Mm93yMKGfogbOWfAqSiLKCRw/viewform?embedded=true"
                    width="100%"
                    height="500"
                  >
                    Loading…
                  </iframe>
                </div>

                <div id="participantForm" className="w-full mt-6" style={{ display: "none" }}>
                  <iframe src="https://forms.gle/8pUUGJVwo32och5h8?embedded=true" width="100%" height="500">
                    Loading…
                  </iframe>
                </div>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="relative mb-5 mt-5 flex h-auto w-full max-w-4xl items-stretch justify-around rounded-2xl bg-indigo-300/20 bg-offering-pattern md:mx-auto">
          <Image
            src="/images/fusion-app-home-2.svg"
            width={320}
            height={504}
            alt="Fusion App Screenshot"
            className="mt-24 hidden overflow-hidden object-contain md:block"
          />
          <div className="flex flex-col items-start space-y-8 p-8 text-center md:text-left justify-between">
            <h2 className="text-3xl font-semibold text-gray-900 md:text-4xl">
              <span className="text-primary-gradient">Fusion</span> offers you
            </h2>
            <div className="flex flex-col space-y-8">
              {fusionOfferingFeatures.map((feature) => (
                <dl className="flex max-w-xs flex-col items-center md:flex-row md:items-start" key={feature.title}>
                  <div className="mb-4 rounded-md bg-indigo-200 p-3 md:mb-0">
                    <feature.icon className="h-6 w-6 stroke-secondary-600" aria-hidden="true" />
                  </div>
                  <div className="ml-4 text-base md:text-lg">
                    <dt className="font-semibold">{feature.title}</dt>
                    <dd className="mt-2 max-w-xl leading-7 text-gray-600 dark:text-gray-400">{feature.description}</dd>
                  </div>
                </dl>
              ))}
            </div>
            <div className="flex w-full flex-col items-center justify-center gap-x-6 gap-y-2 pt-6 md:flex-row md:pt-0">
              <CustomLink store="apple" className="w-full md:w-auto" />
              <CustomLink store="google" className="w-full md:w-auto" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
