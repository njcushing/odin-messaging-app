import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import chatRouter from "../../routes/chat.js";

import User from "../../models/user.js";
import Chat from "../../models/chat.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", chatRouter);

const mockProtectedRouteJWT = (_id, username, password) => {
    protectedRouteJWT.mockImplementationOnce((req, res, next) => {
        req.user = {
            _id: _id,
            username: username,
            password: password,
        };
        return next();
    });
};

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

    describe("/chat POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/`)
                .send({ participants: "" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/`)
                .send({ participants: [] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/`)
                .send({ participants: [null] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .post(`/`)
                .send({
                    participants: [users[1]._id],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 400 if at least one of the other
         participants' _ids does not correspond to a valid user in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({
                    participants: [users[1]._id, new mongoose.Types.ObjectId()],
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if at least one of the other
         participants' _ids is not in the currently logged-in user's friends
         list`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[2]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 500 if the new chat failed to save
         after creation`, async () => {
            vi.spyOn(Chat.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail update")
            );
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user cannot be found in the database when attempting to update its
         fields`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            // generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
    });
});
