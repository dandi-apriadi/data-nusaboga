import express from "express";
import { login, logOut, Me, register } from "../../controllers/shared/authController.js";

const router = express.Router();

router.get('/me', Me);
router.post('/login', login);
router.post('/register', register);
router.delete('/logout', logOut);

export default router;