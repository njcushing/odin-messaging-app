import express from "express";
const router = express.Router();

import * as controller from "../controllers/chatController.js";

router.get("/:chatId", controller.chatGet);
router.post("/:chatId/add-friends", controller.addFriendsPost);
router.post("/:chatId/message", controller.messagePost);
router.post("/", controller.chatPost);

export default router;
