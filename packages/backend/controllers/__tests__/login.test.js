import request from "supertest";
import express from "express";
const app = express();
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import login from "../../routes/login.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", login);

const credentials = {
    username: "Person1",
    password: "person1*",
};

const validateUsername = vi.fn(() => ({
    status: true,
    message: "Valid Username.",
}));
const validatePassword = vi.fn(() => ({
    status: true,
    message: "Valid Password.",
}));
vi.mock("../../../utils/validateCreateAccountFields", async () => {
    const actual = await vi.importActual(
        "../../../utils/validateCreateAccountFields"
    );
    return {
        ...actual,
        validateUsername: () => validateUsername(),
        validatePassword: () => validatePassword(),
    };
});

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

let users;
beforeAll(async () => {
    [users] = await initialiseMongoServer();
});

afterAll(() => mongoose.connection.close());

describe("Route testing...", () => {
    describe("/log-in POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the provided credentials
         cannot be validated`, async () => {
            validateUserCredentials.mockReturnValueOnce([false, null, ""]);
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 500 if JSONWebToken creation fails`, async () => {
            vi.spyOn(jwt, "sign").mockImplementationOnce(
                (user, secretKey, options, cb) =>
                    cb(new Error("token creation failed"), "")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 302 if log-in is successful`, async () => {
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200);
        });
        test(`Should respond with token if log-in is successful`, async () => {
            vi.spyOn(jwt, "sign").mockImplementationOnce(
                (user, secretKey, options, cb) => cb(null, "token")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });
});
