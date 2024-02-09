import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/user.js";
import Chat from "../models/chat.js";
import Image from "../models/image.js";

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
        chats,
        profileImageId
    ) => {
        const user = new User({
            _id: _id,
            username: username,
            email: email,
            password: password,
            friends: friends,
            friendRequests: friendRequests,
            chats: chats,
            "preferences.profileImage": profileImageId,
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

    const newImage = async (index, _id, name, alt) => {
        const image = new Image({
            _id: _id,
            name: name,
            alt: alt,
            img: new Uint8Array(),
        });
        await image.save();
        images[index] = image;
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

    const imageIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
    ];

    const mockChatId = new mongoose.Types.ObjectId();
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
                [userIds[2]],
                [chatIds[4], chatIds[0], chatIds[5]],
                imageIds[0]
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
                [userIds[3]],
                [chatIds[0], chatIds[1], chatIds[5]],
                imageIds[1]
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
                [userIds[4]],
                [chatIds[1], chatIds[2], chatIds[5]],
                imageIds[2]
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
                [userIds[0]],
                [chatIds[3]],
                imageIds[3]
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
                [userIds[1]],
                [mockChatId, chatIds[4]],
                imageIds[4]
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
                { user: userIds[1], role: "admin" },
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
            newChat(5, chatIds[5], "group", [
                { user: userIds[0] },
                { user: userIds[1] },
                { user: userIds[2] },
            ]),
        ]);
    };

    const createImages = async () => {
        await Promise.all([
            newImage(0, chatIds[0], "Image 1 Name", "Image 1 Text"),
            newImage(1, chatIds[1], "Image 2 Name", "Image 2 Text"),
            newImage(2, chatIds[2], "Image 3 Name", "Image 3 Text"),
            newImage(3, chatIds[3], "Image 4 Name", "Image 4 Text"),
            newImage(4, chatIds[4], "Image 5 Name", "Image 5 Text"),
        ]);
    };

    // Populate database
    const users = [];
    const chats = [];
    const images = [];
    await createUsers();
    await createChats();
    await createImages();

    return [users, chats, images];
};

export default initialiseMongoServer;
