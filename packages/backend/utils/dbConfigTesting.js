import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/user.js";
import Chat from "../models/chat.js";

const initialiseMongoServer = async () => {
    // Create database and connect
    const mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    mongoose.set("strictQuery", false); // Prepare for Mongoose 7
    await mongoose.connect(mongoUri);

    mongoose.connection.on("error", async (error) => {
        if (error.message.code === "ETIMEDOUT") {
            console.log(error);
            await mongoose.connect(mongoUri);
        }
        console.log(error);
    });

    mongoose.connection.once("open", () => {
        console.log(`MongoDB successfully connected to ${mongoUri}`);
    });

    const newUser = async (
        index,
        _id,
        username,
        email,
        password,
        friends,
        friendRequests
    ) => {
        const user = new User({
            _id: _id,
            username: username,
            email: email,
            password: password,
            friends: friends,
            friendRequests: friendRequests,
        });
        await user.save();
        users[index] = user;
    };

    const newChat = async (index, _id, type, participants) => {
        const chat = new Chat({
            _id: _id,
            type: type,
            participants: participants,
        });
        await chat.save();
        chats[index] = chat;
    };

    const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
    ];

    const chatIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
    ];

    const createUsers = async () => {
        await Promise.all([
            newUser(
                0,
                userIds[0],
                "Person1",
                "person1@company.com",
                "person1*",
                [
                    {
                        user: userIds[4],
                        chat: chatIds[4],
                    },
                    {
                        user: userIds[1],
                        chat: chatIds[0],
                    },
                ],
                [userIds[2]]
            ),
            newUser(
                1,
                userIds[1],
                "Person2",
                "person2@company.com",
                "person2*",
                [
                    {
                        user: userIds[0],
                        chat: chatIds[0],
                    },
                    {
                        user: userIds[2],
                        chat: chatIds[1],
                    },
                ],
                [userIds[3]]
            ),
            newUser(
                2,
                userIds[2],
                "Person3",
                "person3@company.com",
                "person3*",
                [
                    {
                        user: userIds[1],
                        chat: chatIds[1],
                    },
                    {
                        user: userIds[3],
                        chat: chatIds[2],
                    },
                ],
                [userIds[4]]
            ),
            newUser(
                3,
                userIds[3],
                "Person4",
                "person4@company.com",
                "person4*",
                [
                    {
                        user: userIds[2],
                        chat: null,
                    },
                    {
                        user: userIds[4],
                        chat: chatIds[3],
                    },
                ],
                [userIds[0]]
            ),
            newUser(
                4,
                userIds[4],
                "Person5",
                "person5@company.com",
                "person5*",
                [
                    {
                        user: userIds[3],
                        chat: new mongoose.Types.ObjectId(),
                    },
                    {
                        user: userIds[0],
                        chat: chatIds[4],
                    },
                ],
                [userIds[1]]
            ),
        ]);
    };

    const createChats = async () => {
        await Promise.all([
            newChat(0, chatIds[0], "individual", [
                { user: userIds[0] },
                { user: userIds[1], muted: true },
            ]),
            newChat(1, chatIds[1], "individual", [
                { user: userIds[1] },
                { user: userIds[2] },
            ]),
            newChat(2, chatIds[2], "individual", [
                { user: userIds[2] },
                { user: userIds[3] },
            ]),
            newChat(3, chatIds[3], "individual", [
                { user: userIds[3] },
                { user: userIds[4] },
            ]),
            newChat(4, chatIds[4], "individual", [
                { user: userIds[4] },
                { user: userIds[0] },
            ]),
        ]);
    };

    // Populate database
    const users = [];
    const chats = [];
    await createUsers();
    await createChats();

    return [users, chats];
};

export default initialiseMongoServer;
