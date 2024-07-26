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
                  Got any questions about the product or contributing to our research? We're here to help!
                </p>
                <div className="w-full max-w-lg mt-3">
                  <div className="flex flex-wrap -m-2">
                    <div className="w-full p-2">
                      <label htmlFor="name" className="block text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Enter your name"
                        className="form-input mt-1 block w-full p-2.5 border-2"
                      />
                    </div>
                    <div className="w-full p-2">
                      <label htmlFor="email" className="block text-gray-700">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="youremail@example.com"
                        className="form-input mt-1 block w-full p-2.5 border-2"
                      />
                    </div>
                    <div className="w-full p-2">
                      <label htmlFor="message" className="block text-gray-700">
                        Message
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        cols={40}
                        value={contactMessage}
                        onChange={(e) => setContacMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="form-textarea mt-1 p-2.5 block w-full border-2"
                      ></textarea>
                    </div>
                    <div className="submit-btn p-2 w-full">
                      <ButtonLink
                        type="submit"
                        onClick={handleSubmit}
                        intent="outlined"
                        className="btn w-full p-5"
                        href={""}
                      >
                        Submit
                      </ButtonLink>
                    </div>
                  </div>
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
