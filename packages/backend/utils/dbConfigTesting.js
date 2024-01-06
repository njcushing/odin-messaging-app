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
        friendRequests,
        chats
    ) => {
        const user = new User({
            _id: _id,
            username: username,
            email: email,
            password: password,
            friends: friends,
            friendRequests: friendRequests,
            chats: chats,
        });
        await user.save();
        users[index] = user;
    };

    const newChat = async (index, _id, participants) => {
        const chat = new Chat({
            _id: _id,
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
                [userIds[4], userIds[1]],
                [userIds[2]],
                [chatIds[0], chatIds[4], chatIds[5]]
            ),
            newUser(
                1,
                userIds[1],
                "Person2",
                "person2@company.com",
                "person2*",
                [userIds[0], userIds[2]],
                [userIds[3]],
                [chatIds[1], chatIds[0], chatIds[5]]
            ),
            newUser(
                2,
                userIds[2],
                "Person3",
                "person3@company.com",
                "person3*",
                [userIds[1], userIds[3]],
                [userIds[4]],
                [chatIds[2], chatIds[1], chatIds[5]]
            ),
            newUser(
                3,
                userIds[3],
                "Person4",
                "person4@company.com",
                "person4*",
                [userIds[2], userIds[4]],
                [userIds[0]],
                [chatIds[3], chatIds[2], chatIds[5]]
            ),
            newUser(
                4,
                userIds[4],
                "Person5",
                "person5@company.com",
                "person5*",
                [userIds[3], userIds[0]],
                [userIds[1]],
                [chatIds[4], chatIds[3], chatIds[5]]
            ),
        ]);
    };

    const createChats = async () => {
        await Promise.all([
            newChat(0, chatIds[0], [userIds[0], userIds[1]]),
            newChat(1, chatIds[1], [userIds[1], userIds[2]]),
            newChat(2, chatIds[2], [userIds[2], userIds[3]]),
            newChat(3, chatIds[3], [userIds[3], userIds[4]]),
            newChat(4, chatIds[4], [userIds[4], userIds[0]]),
            newChat(5, chatIds[5], [
                userIds[0],
                userIds[1],
                userIds[2],
                userIds[3],
                userIds[4],
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
