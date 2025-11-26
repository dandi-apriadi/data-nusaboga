import { Router } from 'express';
import { verifyUser, adminOnly } from '../middleware/AuthUser.js';
import { 
  listEscalations, 
  replyToEscalation, 
  resolveEscalation, 
  listFaqs, 
  createFaq, 
  updateFaq, 
  deleteFaq,
  listQuickReplies,
  createQuickReply,
  updateQuickReply,
  deleteQuickReply
} from '../controllers/chatbotAdminController.js';

const router = Router();

// Escalations
router.get('/escalations', verifyUser, adminOnly, listEscalations);
router.post('/escalations/:id/reply', verifyUser, adminOnly, replyToEscalation);
router.patch('/escalations/:id/resolve', verifyUser, adminOnly, resolveEscalation);

// FAQs via knowledge base
router.get('/faqs', verifyUser, adminOnly, listFaqs);
router.post('/faqs', verifyUser, adminOnly, createFaq);
router.put('/faqs/:id', verifyUser, adminOnly, updateFaq);
router.delete('/faqs/:id', verifyUser, adminOnly, deleteFaq);

// Quick Replies
router.get('/quick-replies', verifyUser, adminOnly, listQuickReplies);
router.post('/quick-replies', verifyUser, adminOnly, createQuickReply);
router.put('/quick-replies/:id', verifyUser, adminOnly, updateQuickReply);
router.delete('/quick-replies/:id', verifyUser, adminOnly, deleteQuickReply);

export default router;
