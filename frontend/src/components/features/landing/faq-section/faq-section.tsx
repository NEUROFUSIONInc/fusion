import * as Accordion from "@radix-ui/react-accordion";
import { Plus } from "lucide-react";

import { faqsExplorersResearchers, frequentlyAskedQuestions } from "./data";
import { useSearchParams } from "next/navigation";

export const FaqSection = ({ isResearch = false }) => {
  return (
    <section
      title="Frequently Asked Questions"
      className="my-8 flex max-w-7xl flex-col items-center px-8 sm:px-16 md:mx-auto md:my-16 md:flex-row md:items-start md:justify-between"
      aria-labelledby="frequently asked questions"
    >
      <h2 className="mb-4 max-w-xs text-center text-3xl font-semibold leading-normal md:text-left md:text-4xl lg:text-5xl">
        You might be wondering...
      </h2>
      <Accordion.Root type="single" collapsible className="w-full lg:w-auto">
        {isResearch
          ? faqsExplorersResearchers.map((item) => (
              <Accordion.Item key={item.id} value={`step-${item.id}`} className="lg:w-[600px]">
                <Accordion.Trigger className="my-3 flex w-full items-center justify-between rounded-sm bg-gray-100 p-4 transition-all [&[data-state=open]>svg]:rotate-45">
                  <p className="text-left font-normal text-gray-600">{item.question}</p>

                  <Plus className="h-4 w-4 transition-transform duration-200" />
                </Accordion.Trigger>
                <Accordion.Content className="my-2 rounded-sm bg-indigo-50 p-6">
                  <p className="text-left">{item.answer}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))
          : frequentlyAskedQuestions.map((item) => (
              <Accordion.Item key={item.id} value={`step-${item.id}`} className="lg:w-[600px]">
                <Accordion.Trigger className="my-3 flex w-full items-center justify-between rounded-sm bg-gray-100 p-4 transition-all [&[data-state=open]>svg]:rotate-45">
                  <p className="text-left font-normal text-gray-600">{item.question}</p>

                  <Plus className="h-4 w-4 transition-transform duration-200" />
                </Accordion.Trigger>
                <Accordion.Content className="my-2 rounded-sm bg-indigo-50 p-6">
                  <p className="text-left">{item.answer}</p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
      </Accordion.Root>
    </section>
  );
};
