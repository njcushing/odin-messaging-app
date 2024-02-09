import mongoose from "mongoose";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
    },
    admin: {
        type: Boolean,
        required: true,
        default: false,
    },
    account_creation_date: { type: Date, default: Date.now },
    /*
    profile_image,
    preferences,
    */
});

export default mongoose.model("User", UserSchema);
