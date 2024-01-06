import express from "express";
const router = express.Router();

import * as controller from "../controllers/chatController.js";

router.get("/:userId", controller.chatGet);
router.post("/:userId", controller.chatPost);

export default router;
