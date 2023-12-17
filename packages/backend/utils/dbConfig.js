import mongoose from "mongoose";

const dbConfig = () => {
    mongoose.set("strictQuery", false);

    const mongoDB = process.env.MONGO_URI || null;

    async function main() {
        await mongoose.connect(mongoDB);
    }

    main().catch((err) => console.log(err));
};

export default dbConfig;
