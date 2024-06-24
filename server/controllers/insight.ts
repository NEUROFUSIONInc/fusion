import OpenAI from "openai";
import dayjs from "dayjs";
import { Prompt, PromptResponse } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getPromptSummary(req: any, res: any) {
  // prompt
  // responses
  const prompt: Prompt = req.body.prompt;
  const responses: PromptResponse[] = req.body.responses;
  // TODO: create an interface and parse
  let prompt_responses =
    "date, month, day, timeofday, value, additionalNotes\n";
  if (responses.length > 0) {
    await Promise.all(
      responses.map((response) => {
        const dateObj = dayjs(response.responseTimestamp);
        prompt_responses += `- ${dateObj.format(
          "DD/MM/YYYY , MMMM, DD, HH:MM"
        )}, ${response.value}, ${response.additionalMeta?.note}\n`;
      })
    );
  }

  const timePeriod = "week";
  try {
    const chatCompletions = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that for an Fusion that helps people manage & improve their wellbeing.
            We look at wellbeing holistically across the following categories - Mental Health, Productivity, Relationships, Health and Fitness, Spiritual Practice, Self Care, Finance, Personal Interest, Other.
            Please provide a concise summary of trends and insights for the '${prompt.additionalMeta?.category}' category in the past ${timePeriod} to the user.
            Include any notable changes in responses and suggest actionable steps for the user. Be curious, not judgemental.
            
            YOU MUST ADHERE TO THE FOLLOWING WHEN RESPONDING:
            - YOU ARE RESPONDING TO THE USER. YOU MUST USE "YOU" AND "YOUR" IN YOUR RESPONSE. NEVER "THE USER" OR "THEY".\n
            - Your answers are very concise and straight to the point. Maximum 500 characters.\n
            - Ensure that the analysis is data-driven and based on the most recent data.\n
            - Your response will directly be sent to the user so change your language accordingly. \n
            - YOUR ANSWERS ARE BASED ON DATA AND DATE. DO NOT SAY "YOUR HEART RATE IS 55" WHEN IT WAS YESTERDAY DATA FOR EXAMPLE.
            `,
        },
        {
          role: "user",
          content: `These are responses my responses to the prompt '${prompt.promptText}'.\n\n
          
          ${prompt_responses}
          `,
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      summary: chatCompletions.choices[0].message.content,
      recommendation: "",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
}

export async function getPromptSummaryV2(req: any, res: any) {
  // prompt
  // responses
  const prompts: Prompt[] = req.body.prompts;
  const responses: PromptResponse[] = req.body.responses;
  let timePeriod = req.body.timePeriod ?? "week";

  const uuidToPromptText: { [key: string]: string } = {};
  prompts.forEach((prompt) => {
    uuidToPromptText[prompt.uuid] = prompt.promptText;
  });

  // TODO: create an interface and parse
  let prompt_responses =
    "promptText, date, month, day, timeofday, value, additionalNotes\n";
  if (responses.length > 0) {
    await Promise.all(
      responses.map((response) => {
        const dateObj = dayjs(response.responseTimestamp);
        prompt_responses += `${
          uuidToPromptText[response.promptUuid]
        }, ${dateObj.format("DD/MM/YYYY , MMMM, DD, HH:MM")}, ${
          response.value
        }, ${response.additionalMeta?.note ?? ""}\n`;
      })
    );
  }

  try {
    const chatCompletions = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that for an Fusion that helps people manage & improve their wellbeing.
            We look at wellbeing holistically across the following categories - Mental Health, Productivity, Relationships, Health and Fitness, Spiritual Practice, Self Care, Finance, Personal Interest, Other.
            Please provide a concise summary of trends and insights for the '${prompts[0].additionalMeta?.category}' category in the past ${timePeriod} to the user.
            Include any notable changes in responses and suggest actionable steps for the user. Be curious, not judgemental.
            
            YOU MUST ADHERE TO THE FOLLOWING WHEN RESPONDING:
            - YOU ARE RESPONDING TO THE USER. YOU MUST USE "YOU" AND "YOUR" IN YOUR RESPONSE. NEVER "THE USER" OR "THEY".\n
            - Your answers are very concise and straight to the point. Maximum 500 characters.\n
            - Ensure that the analysis is data-driven and based on the most recent data.\n
            - Your response will directly be sent to the user so change your language accordingly. \n
            - YOUR ANSWERS ARE BASED ON DATA AND DATE. DO NOT SAY "YOUR HEART RATE IS 55" WHEN IT WAS YESTERDAY DATA FOR EXAMPLE.
            `,
        },
        {
          role: "user",
          content: `Today is ${dayjs().format(
            "DD MMMM YYYY"
          )}. Here are my prompt responses to the following prompts below. \n
          Follow the rules and generate a response within the guidelines.\n
          If I have not provided any responses in the time period say that and then give generic advise around the category.\n\n
          Review the following prompts and responses and provide a summary of trends and insights for the '${
            prompts[0].additionalMeta?.category
          }' category in the past ${timePeriod} to the user. \n
          Validate the response is under 500 characters and is data-driven and based on the most recent data.\n
          
          ${prompt_responses}
          `,
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      summary: chatCompletions.choices[0].message.content,
      recommendation: "",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
}

export async function getPromptSuggestions(req: any, res: any) {
  /**
   * Takes a string and suggests prompts for user to add to their device
   */
  // prompt
  // responses
  console.log(req.body.text);
  const searchTerm: string = req.body.searchTerm;

  const examples = `
  `;

  console.log("searchTerm", searchTerm);

  try {
    const searchCompletions = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that for an Fusion that helps people manage & improve their wellbeing. \
          We look at wellbeing holistically across the following categories - Mental Health, Productivity, Relationships, Health and Fitness, Spiritual Practice, Self-Care, Finance, Personal Interest, Other. \
          Your task is to understand a persons response the question "what's been top of mind for you lately" . \
          Suggest 3 prompts to ask the user daily based on the response, following the guidelines provided. \
          The startTime should be relative to the question asked, and the prompts should be asked once to 3 times in a week.`,
        },
        {
          role: "user",
          content: `Generate prompts for this response to "what's been top of mind for you lately?". User's response '${searchTerm}' \n`,
        },
      ],
      functions: [
        {
          name: "generate_prompt",
          description:
            "Generates prompts to ask a user based on what's top of mind for them. One of them should be yesno \
            It must be based on deep understanding of top of mind response provided. Prompts must be based on the day. \
            The promptText MUST be less that 10 words, and question like. Suggested prompts can touch on vary angles related to 'whats top of mind'  \
            One should be action oriented on something the user can do to improve their wellbeing based on the prompt.\
            One should be such that it measures an outcome by them responding to it.\
            Prompt should make sense to be answered once to 3 times in a week.",
          parameters: {
            type: "object",
            properties: {
              prompts: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    promptText: {
                      type: "string",
                      description: `Understand the provided response to 'top of mind' and suggest \
                      prompts to ask the user daily based on the response.\"`,
                    },
                    responseType: {
                      type: "string",
                      description:
                        "Understand the prompt and decide what kind of response type is required, \
              it must be one of 'text', 'number', 'yesno'",
                      enum: ["text", "number", "yesno"],
                    },
                    category: {
                      type: "string",
                      description:
                        "Understand the prompt and select it's category. It must be one of either Mental Health, Productivity, Relationships, Health and Fitness, Spiritual Practice, Self-Care, Finance, Personal Interest",
                    },
                  },
                  required: ["promptText", "responseType", "category"],
                },
              },
            },
          },
        },
      ],
    });

    console.log("searchTerm: ", searchTerm);
    console.log(searchCompletions.choices[0].message.function_call?.arguments);

    return res.status(200).json({
      status: "success",
      suggestions:
        searchCompletions.choices[0].message.function_call?.arguments,
    });
  } catch (err) {}
}
