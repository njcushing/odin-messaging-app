import express from "express";
const router = express.Router();

import * as controller from "../controllers/chatController.js";

router.get("/:chatId", controller.chatGet);
router.post("/:chatId/add-friends", controller.addFriendsPost);
router.put("/:chatId/image", controller.imagePut);
router.post("/:chatId/message/text", controller.messageTextPost);
router.post("/:chatId/message/image", controller.messageImagePost);
router.post("/", controller.chatPost);

export default router;
