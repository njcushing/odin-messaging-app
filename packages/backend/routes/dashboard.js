import express from "express";
const router = express.Router();

import * as controller from "../controllers/dashboardController.js";

router.get("/", controller.dashboardGet);

export default router;
