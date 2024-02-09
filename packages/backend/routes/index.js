import express from "express";
const router = express.Router();

import createaccount from "./createaccount.js";

router.get("/", (req, res) => {
    res.send("");
});

export { router as index, createaccount };
