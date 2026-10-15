import express from 'express';
import { askAgent } from '../controllers/agentController.js';
import protect from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/ask', askAgent);

export default router;
