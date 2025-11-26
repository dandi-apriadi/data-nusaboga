import { Router } from 'express';
import {
  createOrGetSession,
  getSession,
  postMessage,
  listMessages,
  closeSession,
  listQuickReplies,
  upsertContext,
} from '../controllers/chatbotController.js';

const router = Router();

// Public endpoints: session and messages (guest allowed via session_token)
router.post('/sessions', createOrGetSession);
router.get('/sessions/:id', getSession);
router.get('/sessions/:id/messages', listMessages);
router.post('/sessions/:id/messages', postMessage);
router.patch('/sessions/:id/close', closeSession);

router.get('/quick-replies', listQuickReplies);
router.put('/sessions/:id/context', upsertContext);

export default router;
