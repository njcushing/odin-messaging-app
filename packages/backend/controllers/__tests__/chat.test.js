import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import chatRouter from "../../routes/chat.js";

import User from "../../models/user.js";
import Chat from "../../models/chat.js";
import Message from "../../models/message.js";

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

let users, chats;
beforeAll(async () => {
    [users, chats] = await initialiseMongoServer();
});

afterAll(() => mongoose.connection.close());

describe("Route testing...", () => {
    describe("/chat/:chatId GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .get(`/${chats[0]._id}?firstMessage=0&lastMessage=1`)
                .expect(400);
        });
        test(`Should respond with status code 400 if the chatId from the request
         parameters is not a valid MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .get(`/${null}?firstMessage=0&lastMessage=1`)
                .expect(400);
        });
        test(`Should respond with status code 404 if the chat is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .get(
                    `/${new mongoose.Types.ObjectId()}?firstMessage=0&lastMessage=1`
                )
                .expect(404);
        });
        test(`Should respond with status code 404 if the currently-logged in
         user is not found in the database or the chat is not found in the
         user's 'chats' array`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .get(`/${chats[0]._id}?firstMessage=0&lastMessage=1`)
                .expect(404);
        });
        test(`Should respond with status code 200 on successful request, with a
         valid token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/${chats[0]._id}?firstMessage=0&lastMessage=1`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
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
        test(`Should respond with status code 401 if the currently-logged in
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
                .expect(401);
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
        test(`Should respond with status code 401 if, when there is only one
         participant, the currently logged-in user cannot be found in the
         database when trying to update its fields`, async () => {
            vi.spyOn(User, "updateOne").mockReturnValueOnce({
                acknowledged: false,
            });
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 404 if, when there is only one
         participant, the other participant cannot be found in the database when
         trying to update its fields`, async () => {
            vi.spyOn(User, "updateOne")
                .mockReturnValueOnce({ acknowledged: true })
                .mockReturnValueOnce({ acknowledged: false });
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 409 if, when there is only one
         participant, a chat already exists for both users`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(409);
        });
        test(`Should respond with status code 201 and a valid token if, when
         there is only one participant, a chat does not yet exist for both users
         and a new one is created`, async () => {
            vi.spyOn(Chat, "findOne").mockReturnValueOnce(null);
            generateToken.mockReturnValueOnce("Bearer token");
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
        test(`Should respond with status code 500 if, when trying to create a
         chat for more than two users, the operation fails`, async () => {
            vi.spyOn(Chat.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail update")
            );
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/`)
                .send({ participants: [users[4]._id, users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 404 if, when trying to create a
         chat for more than two users, at least one of the participants is not
         found in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .post(`/`)
                .send({ participants: [users[4]._id, users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 201 on successful request when
         trying to create a chat for more than two users, with a valid token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate")
                .mockReturnValueOnce(users[0]._id)
                .mockReturnValueOnce(users[4]._id)
                .mockReturnValueOnce(users[1]._id);
            await request(app)
                .post(`/`)
                .send({ participants: [users[4]._id, users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/chat/:chatId/message/text POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({ text: "" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({ text: null })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({ text: "Message", replyingTo: "a" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 400 if the specified chat is not a
         valid MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/chatDoesNotExist/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the specified chat is not
         found in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${new mongoose.Types.ObjectId()}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not present in the 'participants' array of the chat`, async () => {
            mockProtectedRouteJWT(users[2]._id, "Person3", "person3*");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is muted in the chat`, async () => {
            mockProtectedRouteJWT(users[1]._id, "Person2", "person2*");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 500 if, when trying to create a
         message, the operation fails`, async () => {
            vi.spyOn(Message.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail save")
            );
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 404 if, when trying to save the
         new message in the chat's 'messages' array, the chat cannot be found
         in the database`, async () => {
            vi.spyOn(Chat, "findByIdAndUpdate").mockReturnValueOnce(null);
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 201 on successful request, with
         the _id of the new message and a valid token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .post(`/${chats[0]._id}/message/text`)
                .send({
                    text: "Message",
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/chat/:chatId/message/image POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({ image: "" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({ image: null })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({ image: [], replyingTo: "a" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 400 if the specified chat is not a
         valid MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/chatDoesNotExist/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the specified chat is not
         found in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${new mongoose.Types.ObjectId()}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not present in the 'participants' array of the chat`, async () => {
            mockProtectedRouteJWT(users[2]._id, "Person3", "person3*");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is muted in the chat`, async () => {
            mockProtectedRouteJWT(users[1]._id, "Person2", "person2*");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 500 if, when trying to create a
         message, the operation fails`, async () => {
            vi.spyOn(Message.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail save")
            );
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 404 if, when trying to save the
         new message in the chat's 'messages' array, the chat cannot be found
         in the database`, async () => {
            vi.spyOn(Chat, "findByIdAndUpdate").mockReturnValueOnce(null);
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 201 on successful request, with
         the _id of the new message and a valid token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .post(`/${chats[0]._id}/message/image`)
                .send({
                    image: [],
                    replyingTo: users[1]._id,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/chat/:chatId/add-friends POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: "" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: [] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
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
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 400 if the specified chat is not a
         valid MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/chatDoesNotExist/add-friends`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the specified chat is not
         found in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${new mongoose.Types.ObjectId()}/add-friends`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 400 if at least one of the other
         participants' _ids does not correspond to a valid user in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
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
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: [users[2]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 400 if there is not a single user
         being added to the chat who is not already in it`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[0]._id}/add-friends`)
                .send({ participants: [users[1]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 403 if the currently logged-in
         user is not a participant in the specified chat`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[1]._id}/add-friends`)
                .send({ participants: [users[4]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 403 if the currently logged-in
         user does not have permission to add users to the chat ('group'-type
         chats only)`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[5]._id}/add-friends`)
                .send({ participants: [users[4]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(403);
        });
        test(`Should respond with status code 500 if, when trying to
         duplicate an 'individual'-type chat, the save operation fails`, async () => {
            vi.spyOn(Chat.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail update")
            );
            mockProtectedRouteJWT(users[1]._id, "Person1", "person1*");
            await request(app)
                .post(`/${chats[1]._id}/add-friends`)
                .send({ participants: [users[0]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 201 on successful request, with
         a valid token`, async () => {
            mockProtectedRouteJWT(users[1]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .post(`/${chats[1]._id}/add-friends`)
                .send({ participants: [users[0]._id] })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });
});
