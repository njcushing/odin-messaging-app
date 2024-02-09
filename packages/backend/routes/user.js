import express from "express";
const router = express.Router();

import * as controller from "../controllers/userController.js";

router.get("/self/:username", controller.userSelf);
router.get("/friend/can-be-added/:username", controller.friendCanBeAdded);
router.get("/friend/:username", controller.friendGet);
router.post("/friends", controller.friendsPost);
router.get("/friends", controller.friendsGet);
router.get("/:username", controller.userGet);
router.post("/", controller.userPost);

export default router;
