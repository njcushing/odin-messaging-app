import express from "express";
const router = express.Router();

import login from "./login.js";
import user from "./user.js";
import chat from "./chat.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, login, user, chat };
