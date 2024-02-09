import express from "express";
const router = express.Router();

import createaccount from "./createaccount.js";
import dashboard from "./dashboard.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, createaccount, dashboard };
