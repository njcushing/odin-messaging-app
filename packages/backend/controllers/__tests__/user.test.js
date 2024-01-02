import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import user from "../../routes/user.js";

import User from "../../models/user.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", user);

const credentials = {
    username: "username",
    email: "name@company.com",
    password: "password1*",
    confirmPassword: "password1*",
};

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
    return "Header token";
});
vi.mock("../../utils/generateToken", async () => ({
    default: () => generateToken(),
}));

let users;
beforeAll(async () => {
    [users] = await initialiseMongoServer();
});

afterEach(async () => {
    await User.findOneAndDelete({ username: credentials.username });
});

afterAll(() => mongoose.connection.close());

describe("Route testing...", () => {
    describe("/user GET route...", () => {
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            await request(app).get(`/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/Person1`).expect(200);
        });
        test(`Should respond with the user's information`, async () => {
            await request(app)
                .get(`/Person1`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("user")) {
                        throw new Error(
                            `Server has not responded with user information`
                        );
                    }
                });
        });
    });

    describe("/user POST route...", () => {
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
            await request(app)
                .get(`/friends`)
                .expect((req) => console.log(req.user))
                .expect(400);
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
