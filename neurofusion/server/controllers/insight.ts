import OpenAI from "openai";
import dayjs from "dayjs";
import { Prompt, PromptResponse } from "../types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getPromptSummary(req: any, res: any) {
  // prompt
  // responses
  console.log(req.body.prompt);
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
  // If additional data is needed for a more comprehensive analysis, kindly suggest relevant prompts to gather that information.

  console.log(chatCompletions.choices[0]);

  return res.status(200).json({
    status: "success",
    summary: chatCompletions.choices[0].message.content,
    recommendation: "",
  });
}
