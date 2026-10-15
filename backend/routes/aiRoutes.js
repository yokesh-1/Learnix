import express from 'express';
import {
  generateFlashcards,
  generateQuiz,
  generateSummary,
  chat,
  explainConcept,
  getChatHistory,
  generateStudyPlan
} from '../controllers/aiController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

console.log('AI routes file loaded');

router.post('/generate-study-plan', (req, res, next) => {
  console.log('Generate study plan route matched');
  next();
});

router.use(protect);

router.post('/generate-flashcards', generateFlashcards);
router.post('/generate-quiz', generateQuiz);
router.post('/generate-summary', generateSummary);
router.post('/chat', chat);
router.post('/explain-concept', explainConcept);
router.post('/generate-study-plan', generateStudyPlan);
router.get('/chat-history/:documentId', getChatHistory);

export default router;
