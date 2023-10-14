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

  const timePeriod = "week";
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
  const prompt: Prompt = req.body.prompt;
  const responses: PromptResponse[] = req.body.responses;
}
