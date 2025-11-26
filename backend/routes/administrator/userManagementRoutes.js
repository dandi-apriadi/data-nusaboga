import express from "express";
import { verifyUser } from "../../middleware/AuthUser.js";
import {
    changePassword,
} from "../../controllers/shared/userManagementController.js";

const router = express.Router();

// Profile routes
// Mounted at the top-level API router (e.g. `/api`), so avoid repeating `/api` here.
router.patch('/user/change-password', verifyUser, changePassword);

export default router;