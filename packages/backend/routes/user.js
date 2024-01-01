import express from "express";
const router = express.Router();

import * as controller from "../controllers/userController.js";

router.get("/friends", controller.friendsGet);

export default router;
