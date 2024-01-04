import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

import User from "../models/user.js";

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

    async function newUser(
        index,
        _id,
        username,
        email,
        password,
        friends,
        friendRequests
    ) {
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
    }

    const userIds = [
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
        new mongoose.Types.ObjectId(),
    ];

    async function createUsers() {
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
    }

    // Populate database
    const users = [];
    await createUsers();

    return [users];
};

export default initialiseMongoServer;
