import jwt from "jsonwebtoken";

const generateToken = async (username, password) => {
    return await new Promise((resolve, reject) => {
        jwt.sign(
            {
                username: username,
                password: password,
            },
            process.env.AUTH_SECRET_KEY,
            { expiresIn: "7d" },
            (err, token) => {
                resolve(err ? null : `Bearer ${token}`);
            }
        );
    });
};

export default generateToken;
