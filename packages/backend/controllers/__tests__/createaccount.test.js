import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import createaccount from "../../routes/createaccount.js";

import User from "../../models/user.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", createaccount);

const credentials = {
    username: "username",
    email: "name@company.com",
    password: "password1*",
    confirmPassword: "password1*",
};

const validateUsername = vi.fn(() => ({
    status: true,
    message: "Valid Username.",
}));
const validateEmail = vi.fn(() => ({
    status: true,
    message: "Valid Email.",
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
        validateEmail: () => validateEmail(),
        validatePassword: () => validatePassword(),
    };
});

let users;
beforeAll(async () => {
    [users] = await initialiseMongoServer();
});

afterEach(async () => {
    await User.findOneAndDelete({ username: credentials.username });
});

afterAll(() => mongoose.connection.close());

describe("Route testing...", () => {
    describe("/create-account POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if provided 'password' and 
         'confirmPassword' fields in the body object in the request object do
         not match`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    confirmPassword: "password2*",
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 500 if the password cannot be
         hashed correctly by bcrypt`, async () => {
            vi.spyOn(bcrypt, "hash").mockImplementationOnce((pass, salt, cb) =>
                cb(new Error("hash failed"), "")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 500 if the .save() mongoose model
         method rejects`, async () => {
            vi.spyOn(User.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail update")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 409 if the value provided in the
         'username' field already exists within a User in the database`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    username: users[0].username,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(409);
        });
        test(`Should respond with status code 409 if the value provided in the
         'email' field already exists within a User in the database`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    email: users[0].email,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(409);
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
        test(`Should respond with status code 201 if account creation is
         successful`, async () => {
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201);
        });
        test(`Should respond with token if account creation successful`, async () => {
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
