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

    const newChat = async (index, linkId) => {
        const chat = new Chat({
            linkId: linkId,
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

    const createUsers = async () => {
        await Promise.all([
            newUser(
                0,
                userIds[0],
                "Person1",
                "person1@company.com",
                "person1*",
                [userIds[4], userIds[1]],
                [userIds[2]]
            ),
            newUser(
                1,
                userIds[1],
                "Person2",
                "person2@company.com",
                "person2*",
                [userIds[0], userIds[2]],
                [userIds[3]]
            ),
            newUser(
                2,
                userIds[2],
                "Person3",
                "person3@company.com",
                "person3*",
                [userIds[1], userIds[3]],
                [userIds[4]]
            ),
            newUser(
                3,
                userIds[3],
                "Person4",
                "person4@company.com",
                "person4*",
                [userIds[2], userIds[4]],
                [userIds[0]]
            ),
            newUser(
                4,
                userIds[4],
                "Person5",
                "person5@company.com",
                "person5*",
                [userIds[3], userIds[0]],
                [userIds[1]]
            ),
        ]);
    };

    const createChats = async () => {
        await Promise.all([
            newChat(0, `${userIds[0].toString()}${userIds[1].toString()}`),
            newChat(1, `${userIds[1].toString()}${userIds[2].toString()}`),
            newChat(2, `${userIds[2].toString()}${userIds[3].toString()}`),
            newChat(3, `${userIds[3].toString()}${userIds[4].toString()}`),
            newChat(4, `${userIds[4].toString()}${userIds[0].toString()}`),
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
