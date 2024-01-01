import express from "express";
const router = express.Router();

import createaccount from "./createaccount.js";
import login from "./login.js";
import user from "./user.js";
import dashboard from "./dashboard.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, createaccount, login, user, dashboard };
