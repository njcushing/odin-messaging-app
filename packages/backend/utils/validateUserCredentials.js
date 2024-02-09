import bcrypt from "bcryptjs";

import User from "../models/user.js";

const validateUserCredentials = async (username, password) => {
    const user = await User.findOne(
        { username: username },
        { _id: 1, username: 1, password: 1 }
    ).exec();
    if (!user) return [false, null, "Incorrect username."];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return [false, null, "Incorrect password."];

    // Ensure password returned is not the hashed version
    user.password = password;

    return [true, user, null];
};

export default validateUserCredentials;
