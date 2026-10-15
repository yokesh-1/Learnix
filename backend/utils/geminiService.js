import dotenv from 'dotenv';
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.error('FATAL ERROR: GEMINI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @returns {Promise<Array<{question: string, answer: string, difficulty: string}>>}
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
Format each flashcard as:
Q: [Clear, specific question]
A: [Concise, accurate answer]
D: [Difficulty level: easy, medium, or hard]

Separate each flashcard with "---"

Text:
${text.substring(0, 15000)}`;

try{
    const response = await ai.models.generateContent({
  model: "gemini-3.5-flash-lite",
  contents: prompt,
});

const generatedText = response.text;

// Parse the response
const flashcards = [];
const cards = generatedText.split('---').filter(c => c.trim());

for (const card of cards) {
  const lines = card.trim().split('\n');
  let question = '', answer = '', difficulty = 'medium';

  for (const line of lines) {
    if (line.startsWith('Q:')) {
      question = line.substring(2).trim();
    } else if (line.startsWith('A:')) {
      answer = line.substring(2).trim();
    } else if (line.startsWith('D:')) {
      const diff = line.substring(2).trim().toLowerCase();
      if (['easy', 'medium', 'hard'].includes(diff)) {
        difficulty = diff;
      }
    }
  }

  if(question && answer){
    flashcards.push({ question, answer, difficulty });
  }
}

return flashcards.slice(0, count);
}catch(error){
  console.error('Gemini API Error:', error);
  throw new Error('Failed to generate flashcards');
}
};

/**
 * Generate quiz questions
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>}
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
  Format each question as:
  Q: [Question]
  O1: [Option 1]
  O2: [Option 2]
  O3: [Option 3]
  O4: [Option 4]
  C: [Correct option - exactly as written above]
  E: [Brief explanation]
  D: [Difficulty: easy, medium, or hard]

  Separate questions with "---"
}
Text:
${text.substring(0, 15000)}`;

try {
  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash-lite",
    contents: prompt,
  });

  const generatedText = response.text;

  const questions = [];
  const questionBlocks = generatedText.split('---').filter(q => q.trim());

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    let question = '', options = [], correctAnswer = '', explanation = '', difficulty = 'medium';

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('Q:')) {
        question = trimmed.substring(2).trim();
      } else if (trimmed.match(/^O\d/)) {
        options.push(trimmed.substring(3).trim());
      } else if (trimmed.startsWith('C:')) {
        correctAnswer = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('E:')) {
        explanation = trimmed.substring(2).trim();
      } else if (trimmed.startsWith('D:')) {
        const diff = trimmed.substring(2).trim().toLowerCase();
        if (['easy', 'medium', 'hard'].includes(diff)) {
          difficulty = diff;
        }
      }
    }
    if (question && options.length === 4 && correctAnswer) {
    questions.push({ question, options, correctAnswer, explanation, difficulty });
    }
  }
    return questions.slice(0, numQuestions);
    } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate quiz');
    }
  };

  /**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>}
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas, and important points.
   Keep the summary clear and structured.

  Text:
  ${text.substring(0, 20000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
  const generatedText = response.text;
  return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate summary');
  }
  };

  /**
 * Chat with document context
 * @param {string} question - User question
 * @param {Array<object>} chunks - Relevant document chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

  const prompt = `Based on the following context from a document, Analyse the context and answer the user's question.
If the answer is not in the context, say so.

Context:
${context}

Question: ${question}

Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to process chat request');
  }
};

/**
 * Explain a specific concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
  Provide a clear, educational explanation that's easy to understand.
  Include examples if relevant.

  Context:
  ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });
    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to explain concept');
  }
};




/**
 * Generate a day-by-day study plan.
 * Works from either a document's text or a free-text topic.
 * @param {object} params
 * @param {string} [params.text] - Document text (optional)
 * @param {string} [params.topic] - Topic to study (optional, used when no document)
 * @param {number} params.days - Number of days for the plan
 * @param {string} [params.dailyMinutes] - Time available per day (e.g. "60")
 * @param {string} [params.goal] - Optional learning goal/exam focus
 * @returns {Promise<{title: string, overview: string, days: Array<{day: number, title: string, focus: string, tasks: string[], estimatedMinutes: number}>}>}
 */
export const generateStudyPlan = async ({ text = '', topic = '', days = 7, dailyMinutes = '60', goal = '' }) => {
  const source = text
    ? `Base the plan on the following study material:\n${text.substring(0, 15000)}`
    : `Base the plan on the topic: "${topic}".`;

  const prompt = `You are an expert study coach. Create a realistic, motivating ${days}-day study plan.
${source}

Constraints:
- The learner has about ${dailyMinutes} minutes available per day.
${goal ? `- Learning goal: ${goal}` : ''}
- Progress logically from fundamentals to advanced topics, ending with review/practice.

Respond ONLY with valid JSON (no markdown fences, no extra text) in exactly this shape:
{
  "title": "string - a short title for the plan",
  "overview": "string - 1-2 sentence overview",
  "days": [
    {
      "day": 1,
      "title": "string - short title for the day",
      "focus": "string - the main focus/topic of the day",
      "tasks": ["string task 1", "string task 2"],
      "estimatedMinutes": 60
    }
  ]
}
The "days" array must contain exactly ${days} items.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
    });

    let generatedText = (response.text || '').trim();

    // Strip markdown code fences if the model added them
    generatedText = generatedText
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();

    // Extract the JSON object defensively
    const firstBrace = generatedText.indexOf('{');
    const lastBrace = generatedText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      generatedText = generatedText.substring(firstBrace, lastBrace + 1);
    }

    const plan = JSON.parse(generatedText);

    // Basic normalization
    if (!Array.isArray(plan.days)) {
      plan.days = [];
    }
    plan.days = plan.days.map((d, i) => ({
      day: d.day || i + 1,
      title: d.title || `Day ${i + 1}`,
      focus: d.focus || '',
      tasks: Array.isArray(d.tasks) ? d.tasks : [],
      estimatedMinutes: Number(d.estimatedMinutes) || Number(dailyMinutes) || 60
    }));

    return plan;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate study plan');
  }
};
