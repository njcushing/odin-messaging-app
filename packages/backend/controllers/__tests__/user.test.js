import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import user from "../../routes/user.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", user);

const validateUserCredentials = vi.fn(() => [
    true,
    {
        username: "Person1",
        password: "person1*",
    },
    "",
]);
vi.mock("../../utils/validateUserCredentials", async () => ({
    default: () => validateUserCredentials(),
}));

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
    return "token";
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
    describe("/user/friends GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friends`).expect(400);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friends`).expect(404);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/friends`).expect(200);
        });
        test(`Should respond with an array of friends`, async () => {
            await request(app)
                .get(`/friends`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("friends")) {
                        throw new Error(
                            `Server has not responded with friends array`
                        );
                    }
                    if (!Array.isArray(data.friends)) {
                        throw new Error(
                            `Server has not responded with friends array`
                        );
                    }
                });
        });
        test(`Should respond with a new token`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friends`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });
});
