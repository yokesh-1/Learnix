import dotenv from 'dotenv';
import { GoogleGenAI, Type } from "@google/genai";
import { findRelevantChunks } from './textChunker.js';
import * as geminiService from './geminiService.js';

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const AGENT_MODEL = "gemini-3.5-flash-lite";

/**
 * Tool declarations the agent is allowed to call.
 * These mirror the single-shot features but let the model decide
 * which to use (and in what order) to satisfy the user's request.
 */
const toolDeclarations = [
  {
    name: "search_document",
    description:
      "Search the document for passages relevant to a query. Use this to ground answers in the actual document content before replying.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        query: {
          type: Type.STRING,
          description: "What to search for inside the document."
        }
      },
      required: ["query"]
    }
  },
  {
    name: "summarize_document",
    description:
      "Produce a concise summary of the whole document. Use when the user asks for an overview or summary.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  },
  {
    name: "generate_flashcards",
    description:
      "Generate study flashcards (question/answer pairs) from the document. Use when the user asks to create or make flashcards.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        count: {
          type: Type.NUMBER,
          description: "How many flashcards to generate (1-20). Default 5."
        }
      },
    }
  }
];

/**
 * Run the Study Assistant Agent.
 *
 * @param {object} params
 * @param {string} params.question - The user's free-form request.
 * @param {object} params.document - A Mongoose document with extractedText + chunks.
 * @param {number} [params.maxSteps=5] - Safety cap on tool-calling loop iterations.
 * @returns {Promise<{answer: string, steps: Array<{tool: string, args: object}>, flashcards: Array}>}
 */
export const runStudyAgent = async ({ question, document, maxSteps = 5 }) => {
  // Local implementations of each tool. They run against THIS document.
  const toolImplementations = {
    search_document: ({ query }) => {
      const chunks = findRelevantChunks(document.chunks, query || question, 3);
      if (!chunks.length) {
        return { result: "No relevant passages found in the document." };
      }
      return {
        result: chunks.map((c, i) => `[Passage ${i + 1}]\n${c.content}`).join('\n\n')
      };
    },
    summarize_document: async () => {
      const summary = await geminiService.generateSummary(document.extractedText);
      return { result: summary };
    },
    generate_flashcards: async ({ count = 5 }) => {
      const n = Math.min(Math.max(parseInt(count) || 5, 1), 20);
      const cards = await geminiService.generateFlashcards(document.extractedText, n);
      return { result: cards, isFlashcards: true };
    }
  };

  const systemInstruction = `You are a helpful Study Assistant Agent for a learning app.
You help the user study a specific document. You have tools to search the document, summarize it, and generate flashcards.
Decide which tools to call to fully satisfy the user's request. You may call multiple tools.
Always ground your final answer in the document. When you have enough information, give a clear, friendly final answer.`;

  // Conversation history for the function-calling loop
  const contents = [
    { role: "user", parts: [{ text: question }] }
  ];

  const steps = [];
  let collectedFlashcards = [];

  for (let step = 0; step < maxSteps; step++) {
    const response = await ai.models.generateContent({
      model: AGENT_MODEL,
      contents,
      config: {
        systemInstruction,
        tools: [{ functionDeclarations: toolDeclarations }]
      }
    });

    const candidate = response.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    // Collect any function calls the model requested
    const functionCalls = parts.filter((p) => p.functionCall).map((p) => p.functionCall);

    if (functionCalls.length === 0) {
      // No more tools requested -> this is the final answer
      return {
        answer: response.text || "I wasn't able to produce an answer.",
        steps,
        flashcards: collectedFlashcards
      };
    }

    // Record the model's turn (with its function calls) in history
    contents.push({ role: "model", parts });

    // Execute each requested tool and feed the results back
    const functionResponseParts = [];
    for (const call of functionCalls) {
      const name = call.name;
      const args = call.args || {};
      steps.push({ tool: name, args });

      let output;
      try {
        const impl = toolImplementations[name];
        if (!impl) {
          output = { result: `Unknown tool: ${name}` };
        } else {
          output = await impl(args);
        }
      } catch (err) {
        output = { result: `Tool "${name}" failed: ${err.message}` };
      }

      if (output.isFlashcards && Array.isArray(output.result)) {
        collectedFlashcards = output.result;
      }

      functionResponseParts.push({
        functionResponse: {
          name,
          response: {
            result: output.isFlashcards
              ? `Generated ${output.result.length} flashcards (returned to the app).`
              : output.result
          }
        }
      });
    }

    contents.push({ role: "user", parts: functionResponseParts });
  }

  // Safety fallback if we hit the step cap
  const finalResponse = await ai.models.generateContent({
    model: AGENT_MODEL,
    contents: [
      ...contents,
      { role: "user", parts: [{ text: "Please give your best final answer now based on the tool results above." }] }
    ],
    config: { systemInstruction }
  });

  return {
    answer: finalResponse.text || "I gathered information but ran out of steps before finishing.",
    steps,
    flashcards: collectedFlashcards
  };
};
