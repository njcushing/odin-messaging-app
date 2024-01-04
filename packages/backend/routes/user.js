import express from "express";
const router = express.Router();

import * as controller from "../controllers/userController.js";

router.get("/self/:username", controller.userSelf);
router.get("/friend/:username", controller.friendGet);
router.post("/friends/:username", controller.friendsPost);
router.get("/friends", controller.friendsGet);
router.get("/:username", controller.userGet);
router.post("/", controller.userPost);

export default router;
