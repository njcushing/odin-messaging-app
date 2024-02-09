import express from "express";
const router = express.Router();

import * as controller from "../controllers/userController.js";

router.post("/", controller.userPost);
router.get("/friends", controller.friendsGet);

export default router;
