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

    // Populate database
    const users = [];
    await createUsers();

    async function newUser(username, email, password) {
        const user = new User({
            username: username,
            email: email,
            password: password,
        });
        await user.save();
        users[users.length] = user;
    }

    async function createUsers() {
        await Promise.all([
            newUser("Person1", "person1@company.com", "person1*"),
            newUser("Person2", "person2@company.com", "person2*"),
            newUser("Person3", "person3@company.com", "person3*"),
            newUser("Person4", "person4@company.com", "person4*"),
            newUser("Person5", "person5@company.com", "person5*"),
        ]);
    }

    return [users];
};

export default initialiseMongoServer;
