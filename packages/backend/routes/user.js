import express from "express";
const router = express.Router();

import * as controller from "../controllers/userController.js";

router.get("/self/:username", controller.userSelf);
router.get("/self", controller.getSelf);
router.get("/friends/can-be-added/:username", controller.friendCanBeAdded);
router.get("/friends/:username", controller.friendGet);
router.post("/friends", controller.friendsPost);
router.get("/friends", controller.friendsGet);
router.put(
    "/friend-requests/:username/accept",
    controller.friendRequestsAccept
);
router.put(
    "/friend-requests/:username/decline",
    controller.friendRequestsDecline
);
router.get("/friend-requests", controller.friendRequestsGet);
router.get("/chats", controller.chatsGet);
router.get("/:username", controller.userGet);
router.post("/", controller.userPost);

export default router;
