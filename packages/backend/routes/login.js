import express from "express";
const router = express.Router();

import * as controller from "../controllers/loginController.js";

router.post("/", controller.loginPost);

export default router;
