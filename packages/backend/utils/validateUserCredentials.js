import bcrypt from "bcryptjs";

import User from "../models/user.js";

const validateUserCredentials = async (username, password) => {
    const user = await User.findOne({ username: username });
    if (!user) return [false, null, { message: "Incorrect username." }];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return [false, null, { message: "Incorrect password." }];

    // Ensure password returned is not the hashed version
    user.password = password;

    return [true, user, null];
};

export default validateUserCredentials;
