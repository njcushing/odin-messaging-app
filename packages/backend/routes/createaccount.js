import express from "express";
const router = express.Router();

import * as controller from "../controllers/createaccountController.js";

router.post("/", controller.createaccountPost);

export default router;
