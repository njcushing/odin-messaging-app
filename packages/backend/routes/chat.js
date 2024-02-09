import express from "express";
const router = express.Router();

import * as controller from "../controllers/chatController.js";

router.get("/:chatId", controller.chatGet);
router.post("/", controller.chatPost);

export default router;
