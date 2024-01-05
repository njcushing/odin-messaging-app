import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import chatRouter from "../../routes/chat.js";

import Chat from "../../models/chat.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", chatRouter);

const protectedRouteJWT = vi.fn((req, res, next) => {
    req.user = {
        _id: users[0]._id,
        username: "Person1",
        password: "person1*",
    };
    return next();
});
vi.mock("../../utils/protectedRouteJWT", async () => ({
    default: (req, res, next) => protectedRouteJWT(req, res, next),
}));

const generateToken = vi.fn(() => {
    return "Header token";
});
vi.mock("../../utils/generateToken", async () => ({
    default: () => generateToken(),
}));

let users;
beforeAll(async () => {
    [users] = await initialiseMongoServer();
});

afterAll(() => mongoose.connection.close());

describe("Route testing...", () => {
    describe("/chat/:chatId GET route...", () => {
        test(`Should respond with status code 200 on successful request`, async () => {
            await request(app).get(`/thisChatExists`).expect(200);
        });
    });
});
