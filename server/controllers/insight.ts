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
    "date, month, day, timeofday, value, additionalNotes \n";
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
          content: `These are responses my responses to the prompt '${prompt.promptText} in '.\n\n
          
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Fusion Copilot, an AI assistant focused on holistic wellbeing improvement across Mental Health, Productivity, Relationships, Health/Fitness, Spiritual Practice, Self Care, Finance, and Personal Interest.

            Analyze the data for '${prompts[0].additionalMeta?.category}' category and provide:
            1. Key trends and patterns in the data
            2. Notable changes or insights
            3. 1-2 specific, actionable recommendations
            
            Guidelines:
            - Use direct "you/your" language, never "the user/they"
            - Keep responses under 250 characters
            - Base insights only on provided data with dates
            - Be empathetic and non-judgmental
            - If insufficient data, acknowledge and provide relevant category advice
            - Focus on recent data for most relevant insights
            - Avoid assumptions or generalizations not supported by data
            `,
        },
        {
          role: "user",
          content: `Today is ${dayjs().format(
            "DD MMMM YYYY"
          )}. Here is a set of prompt responses to analyze:\n\n${prompt_responses}\n\n
          Important notes:
          - If no responses exist for the specified ${timePeriod} time period, acknowledge this and provide relevant category-specific guidance
          - Focus analysis on the most recent data points
          - Ensure insights are data-driven and objective
          - Keep the total response under 250 characters
          - Make recommendations specific and actionable
          - Use direct "you/your" language
          
          Please analyze the responses for the '${
            prompts[0].additionalMeta?.category
          }' category and provide:
          1. Key trends and patterns
          2. Notable changes or insights 
          3. 1-2 specific, actionable recommendations
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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant Fusion that is able to summarize a persons response to the question "what's been top of mind for you lately" and then suggest helpful prompts to ask the user daily based on the response. \
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

export async function handleChatConversation(req: any, res: any) {
  const message: string = req.body.message;
  const healthData: {
    raw: any[];
    summary: {
      dateRange: {
        start: string;
        end: string;
      };
      sleep: {
        available: boolean;
        averageDuration?: number;
        daysTracked?: number;
      };
      steps: {
        available: boolean;
        averageSteps?: number;
        daysTracked?: number;
      };
      heartRate: {
        available: boolean;
        averageHeartRate?: number;
        daysTracked?: number;
      };
      trends: {
        sufficient: boolean;
        sleep?: {
          available: boolean;
          firstPeriodAverage?: number;
          secondPeriodAverage?: number;
          percentChange?: number;
          direction?: string;
        };
        steps?: {
          available: boolean;
          firstPeriodAverage?: number;
          secondPeriodAverage?: number;
          percentChange?: number;
          direction?: string;
        };
        heartRate?: {
          available: boolean;
          firstPeriodAverage?: number;
          secondPeriodAverage?: number;
          percentChange?: number;
          direction?: string;
        };
        period?: {
          firstHalf: {
            start: string;
            end: string;
          };
          secondHalf: {
            start: string;
            end: string;
          };
        };
      };
    };
  } = req.body.healthData;

  const messages: { content: string; role: "user" | "assistant" }[] =
    req.body.messages || [];

  try {
    // Prepare conversation history
    const conversationHistory = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate health data context dynamically
    let healthContext = "";
    if (healthData && healthData.summary) {
      healthContext = `Health data is available for the period ${healthData.summary.dateRange.start} to ${healthData.summary.dateRange.end}.\n\n`;

      if (healthData.summary.sleep.available) {
        healthContext += `Sleep tracking available: Yes\n`;
        healthContext += `Average sleep duration: ${healthData.summary.sleep.averageDuration?.toFixed(
          2
        )} hours\n`;
        healthContext += `Days with sleep data: ${healthData.summary.sleep.daysTracked}\n\n`;
      } else {
        healthContext += `Sleep tracking available: No\n\n`;
      }

      if (healthData.summary.steps.available) {
        healthContext += `Step tracking available: Yes\n`;
        healthContext += `Average daily steps: ${Math.round(
          healthData.summary.steps.averageSteps || 0
        )}\n`;
        healthContext += `Days with step data: ${healthData.summary.steps.daysTracked}\n\n`;
      } else {
        healthContext += `Step tracking available: No\n\n`;
      }

      if (healthData.summary.heartRate.available) {
        healthContext += `Heart rate tracking available: Yes\n`;
        healthContext += `Average heart rate: ${Math.round(
          healthData.summary.heartRate.averageHeartRate || 0
        )} bpm\n`;
        healthContext += `Days with heart rate data: ${healthData.summary.heartRate.daysTracked}\n\n`;
      } else {
        healthContext += `Heart rate tracking available: No\n\n`;
      }

      // Add trend information if available
      if (healthData.summary.trends.sufficient) {
        const { trends } = healthData.summary;

        healthContext += `TREND ANALYSIS (comparing ${trends.period?.firstHalf.start} to ${trends.period?.firstHalf.end} vs ${trends.period?.secondHalf.start} to ${trends.period?.secondHalf.end}):\n\n`;

        if (trends.sleep?.available) {
          healthContext += `Sleep trend: ${
            trends.sleep.direction
          } of ${Math.abs(trends.sleep.percentChange || 0).toFixed(1)}%\n`;
          healthContext += `(${trends.sleep.firstPeriodAverage?.toFixed(
            1
          )} hours vs ${trends.sleep.secondPeriodAverage?.toFixed(
            1
          )} hours)\n\n`;
        }

        if (trends.steps?.available) {
          healthContext += `Step count trend: ${
            trends.steps.direction
          } of ${Math.abs(trends.steps.percentChange || 0).toFixed(1)}%\n`;
          healthContext += `(${Math.round(
            trends.steps.firstPeriodAverage || 0
          )} steps vs ${Math.round(
            trends.steps.secondPeriodAverage || 0
          )} steps)\n\n`;
        }

        if (trends.heartRate?.available) {
          healthContext += `Heart rate trend: ${
            trends.heartRate.direction
          } of ${Math.abs(trends.heartRate.percentChange || 0).toFixed(1)}%\n`;
          healthContext += `(${Math.round(
            trends.heartRate.firstPeriodAverage || 0
          )} bpm vs ${Math.round(
            trends.heartRate.secondPeriodAverage || 0
          )} bpm)\n\n`;
        }
      }
    } else {
      healthContext = "No health data available for analysis.";
    }

    // Include the full raw data for deeper analysis
    const healthDataJson = healthData ? JSON.stringify(healthData.raw) : "[]";

    const chatCompletions = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are Fusion Copilot, an AI assistant focused on holistic wellbeing. 
          You are having a conversation with a user about their health and wellbeing.
          
          Here is a summary of the user's health data:
          
          ${healthContext}
          
          Additionally, I'm providing you with the full raw health data in JSON format for detailed analysis when needed:
          ${healthDataJson}
          
          Guidelines:
          - Use the health summary for basic insights, but analyze the raw JSON data for deeper questions
          - Use direct "you/your" language, never "the user/they"
          - Be empathetic and non-judgmental
          - If you don't know something, acknowledge that and provide general advice
          - Focus on evidence-based recommendations
          - Provide actionable suggestions when appropriate
          - Avoid alarmist language about health metrics but do provide insights and be truthful
          - Maintain a warm, supportive tone
          - Look at wellbeing holistically across the following categories - Mental Health, Productivity, Relationships, Health and Fitness, Spiritual Practice, Self Care, Finance, Personal Interest
          - Only analyze the health data when specifically asked about health insights or when directly relevant to the conversation
          - If there is no health data or the data is sparse, acknowledge this fact
          - When providing health insights, consider patterns, trends, and connections between different metrics
          - Above all, always responses concise (under 200 words) - unless the user asks for a planning / lists
          `,
        },
        ...conversationHistory,
        {
          role: "user",
          content: message,
        },
      ],
    });

    return res.status(200).json({
      status: "success",
      response: chatCompletions.choices[0].message.content,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong. Please try again later.",
    });
  }
}
