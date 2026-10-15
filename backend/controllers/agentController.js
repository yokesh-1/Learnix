import Document from '../models/Document.js';
import { runStudyAgent } from '../utils/studyAgent.js';

// @desc    Ask the Study Assistant Agent a free-form question about a document.
//          The agent decides which tools to use (search / summarize / flashcards).
// @route   POST /api/agent/ask
// @access  Private
export const askAgent = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question || !question.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please provide documentId and question',
        statusCode: 400
      });
    }

    const document = await Document.findOne({
      _id: documentId,
      userId: req.user._id,
      status: 'ready'
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found or not ready',
        statusCode: 404
      });
    }

    const { answer, steps, flashcards } = await runStudyAgent({
      question: question.trim(),
      document
    });

    res.status(200).json({
      success: true,
      data: {
        documentId: document._id,
        question: question.trim(),
        answer,
        steps,        // the tools the agent used, in order (great for showing "thinking")
        flashcards    // populated only if the agent generated flashcards
      },
      message: 'Agent response generated successfully'
    });
  } catch (error) {
    next(error);
  }
};
