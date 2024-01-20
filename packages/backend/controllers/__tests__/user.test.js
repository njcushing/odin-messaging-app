import request from "supertest";
import express from "express";
const app = express();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { vi } from "vitest";
import userRouter from "../../routes/user.js";

import User from "../../models/user.js";

import mongoose from "mongoose";
import initialiseMongoServer from "../../utils/dbConfigTesting.js";

import * as validateUserFields from "../../../../utils/validateUserFields.js";

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", userRouter);

const credentials = {
    username: "username",
    email: "name@company.com",
    password: "password1*",
    confirmPassword: "password1*",
};

const mockProtectedRouteJWT = (_id, username, password) => {
    protectedRouteJWT.mockImplementationOnce((req, res, next) => {
        req.user = {
            _id: _id,
            username: username,
            password: password,
        };
        return next();
    });
};

const validateUserCredentials = vi.fn(() => [
    true,
    {
        username: "Person1",
        password: "person1*",
    },
    "",
]);
vi.mock("../../utils/validateUserCredentials", async () => ({
    default: () => validateUserCredentials(),
}));

const protectedRouteJWT = vi.fn((req, res, next) => {
    req.user = {
        _id: users[0]._id,
        username: "Person1",
        password: "person1*",
    };
    return next();
});
vi.mock("../../utils/protectedRouteJWT", async () => ({
    default: (req, res, next) => protectedRouteJWT(req, res, next),
}));

const generateToken = vi.fn(() => {
    return "Header token";
});
vi.mock("../../utils/generateToken", async () => ({
    default: () => generateToken(),
}));

let users;
const initDatabase = async () => {
    [users] = await initialiseMongoServer();
};
const disconnect = async () => {
    mongoose.connection.close();
};

beforeAll(async () => await initDatabase());
afterAll(async () => await disconnect());

describe("Route testing...", () => {
    describe("/user/:username GET route...", () => {
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            await request(app).get(`/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/Person1`).expect(200);
        });
        test(`Should respond with the user's information`, async () => {
            await request(app)
                .get(`/Person1`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("user")) {
                        throw new Error(
                            `Server has not responded with user information`
                        );
                    }
                });
        });
    });

    describe("/user POST route...", () => {
        afterEach(async () => {
            await User.findOneAndDelete({ username: credentials.username });
        });

        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if provided 'password' and 
         'confirmPassword' fields in the body object in the request object do
         not match`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    confirmPassword: "password2*",
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 500 if the password cannot be
         hashed correctly by bcrypt`, async () => {
            vi.spyOn(bcrypt, "hash").mockImplementationOnce((pass, salt, cb) =>
                cb(new Error("hash failed"), "")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 500 if the .save() mongoose model
         method rejects`, async () => {
            vi.spyOn(User.prototype, "save").mockImplementationOnce(() =>
                Promise.reject("fail update")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 409 if the value provided in the
         'username' field already exists within a User in the database`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    username: users[0].username,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(409);
        });
        test(`Should respond with status code 409 if the value provided in the
         'email' field already exists within a User in the database`, async () => {
            await request(app)
                .post(`/`)
                .send({
                    ...credentials,
                    email: users[0].email,
                })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(409);
        });
        test(`Should respond with status code 500 if JSONWebToken creation fails`, async () => {
            vi.spyOn(jwt, "sign").mockImplementationOnce(
                (user, secretKey, options, cb) =>
                    cb(new Error("token creation failed"), "")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(500);
        });
        test(`Should respond with status code 201 if account creation is
         successful`, async () => {
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201);
        });
        test(`Should respond with token if account creation successful`, async () => {
            vi.spyOn(jwt, "sign").mockImplementationOnce(
                (user, secretKey, options, cb) => cb(null, "token")
            );
            await request(app)
                .post(`/`)
                .send({ ...credentials })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/self GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/self`).expect(400);
        });
        test(`Should respond with status code 401 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/self`).expect(401);
        });
        test(`Should respond with status code 200 on successful request with the
         user's information and a new token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/self`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("user")) {
                        throw new Error(
                            `Server has not responded with user's information`
                        );
                    }
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/self/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/self/Person1`).expect(400);
        });
        test(`Should respond with status code 401 if the currently-logged in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/self/Person1`).expect(401);
        });
        test(`Should respond with status code 404 if the user from the request
         parameters is not found in the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).post(`/self/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 400 if the currently logged-in
         user and the user from the request parameters are not identical`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).get(`/self/Person2`).expect(400);
        });
        test(`Should respond with status code 200 if the currently logged-in
         user and the user from the request parameters are identical`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).get(`/self/Person1`).expect(200);
        });
        test(`Should respond with a new token`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/self/Person1`)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/friends/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/friends/Person2`).expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).get(`/friends/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/friends/Person2`).expect(401);
        });
        test(`Should respond with a status of 400 if the user and friend
         are both found in the database, but they are not friends`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).get(`/friends/Person3`).expect(400);
        });
        test(`Should respond with a status of 200 on successful request`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app).get(`/friends/Person2`).expect(200);
        });
        test(`Should respond with the friend's information`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friends/Person2`)
                .expect((res) => {
                    const data = res.body.data;
                    if (!("friend" in data)) {
                        throw new Error(`Server has not responded with friend`);
                    }
                });
        });
        test(`Should respond with a new token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friends/Person2`)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/friends/can-be-added/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .get(`/friends/can-be-added/personDoesNotExist`)
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .get(`/friends/can-be-added/personDoesNotExist`)
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/friends/can-be-added/Person2`).expect(401);
        });
        test(`Should respond with status code 400 if the '_id' of the
         potential friend being checked already exists within the currently
         logged-in user's friends list`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app).get(`/friends/can-be-added/Person2`).expect(400);
        });
        test(`Should respond with status code 400 if the '_id' of the
         currently logged-in user exists within the potential friend's
         'friendRequests' array`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app).get(`/friends/can-be-added/Person4`).expect(400);
        });
        test(`Should respond with status code 200 if the '_id' of the
         potential friend being checked does not exist within the currently
         logged-in user's friends list or the currently logged-in user does not
         exist within the potential friend's 'friendRequests' array`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app).get(`/friends/can-be-added/Person3`).expect(200);
        });
    });

    describe("/user/friends GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/friends`).expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/friends`).expect(401);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/friends`).expect(200);
        });
        test(`Should respond with an array of friends`, async () => {
            await request(app)
                .get(`/friends`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("friends")) {
                        throw new Error(
                            `Server has not responded with friends array`
                        );
                    }
                    if (!Array.isArray(data.friends)) {
                        throw new Error(
                            `Server has not responded with friends array`
                        );
                    }
                });
        });
        test(`Should respond with a new token`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friends`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/friend-requests GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/friend-requests`).expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/friend-requests`).expect(401);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/friend-requests`).expect(200);
        });
        test(`Should respond with an array of friends`, async () => {
            await request(app)
                .get(`/friend-requests`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("friendRequests")) {
                        throw new Error(
                            `Server has not responded with friendRequests array`
                        );
                    }
                    if (!Array.isArray(data.friendRequests)) {
                        throw new Error(
                            `Server has not responded with friendRequests array`
                        );
                    }
                });
        });
        test(`Should respond with a new token`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friend-requests`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/friends POST route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            await request(app)
                .post(`/friends`)
                .send()
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .post(`/friends`)
                .send({ username: "personDoesNotExist" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            await request(app)
                .post(`/friends`)
                .send({ username: "personDoesNotExist" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .post(`/friends`)
                .send({ username: "Person2" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 400 if the '_id' of the user
         being added already exists within the currently logged-in user's
         friends list`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .post(`/friends`)
                .send({ username: "Person2" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the '_id' of the user being
         added already exists within the currently logged-in user's
         'friendRequests' array but the friend is not found in the database when
         attempting to update its fields`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .post(`/friends`)
                .send({ username: "Person3" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 401 if the '_id' of the user being
         added already exists within the currently logged-in user's
         'friendRequests' array but the currently logged-in user is not found in
         the database when attempting to update its fields`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate")
                .mockReturnValueOnce(users[2])
                .mockReturnValueOnce(null);
            await request(app)
                .post(`/friends`)
                .send({ username: "Person3" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 201 the '_id' of the user being
         added already exists within the currently logged-in user's
         'friendRequests' array and both the friend and currently logged-in
         user's fields are successfully updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate")
                .mockReturnValueOnce(users[2])
                .mockReturnValueOnce(users[0]);
            await request(app)
                .post(`/friends`)
                .send({ username: "Person3" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201);
        });
        test(`Should respond with status code 404 if the '_id' of the user being
         added does not exist within the currently logged-in user's
         'friendRequests' array but the friend is not found in the database when
         attempting to update its fields`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .post(`/friends`)
                .send({ username: "Person4" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 201 if the '_id' of the user being
         added does not exist within the currently logged-in user's
         'friendRequests' array and the friend's fields are successfully
         updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(users[3]);
            await request(app)
                .post(`/friends`)
                .send({ username: "Person4" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(201);
        });
    });

    describe("/user/friend-requests/:username/accept PUT route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person5", "person5*");
            await request(app)
                .put(`/friend-requests/Person1/accept`)
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[4]._id, "Person5", "person5*");
            await request(app)
                .put(`/friend-requests/personDoesNotExist/accept`)
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person5",
                "person5*"
            );
            await request(app)
                .put(`/friend-requests/Person1/accept`)
                .expect(401);
        });
        test(`Should respond with status code 404 if the '_id' of the user being
         added does not exist within the currently logged-in user's
         'friendRequests' array`, async () => {
            mockProtectedRouteJWT(users[4]._id, "Person5", "person5*");
            await request(app)
                .put(`/friend-requests/Person1/accept`)
                .expect(404);
        });
        test(`Should respond with status code 404 if the '_id' of the user being
         added exists within the currently logged-in user's 'friendRequests' array
         array but the friend is not found in the database when attempting to
         update its fields`, async () => {
            mockProtectedRouteJWT(users[4]._id, "Person5", "person5*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .put(`/friend-requests/Person2/accept`)
                .expect(404);
        });
        test(`Should respond with status code 401 if the '_id' of the user being
         added exists within the currently logged-in user's 'friendRequests'
         array but the currently logged-in user is not found in the database
         when attempting to update its fields`, async () => {
            mockProtectedRouteJWT(users[4]._id, "Person5", "person5*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate")
                .mockReturnValueOnce(users[1])
                .mockReturnValueOnce(null);
            await request(app)
                .put(`/friend-requests/Person2/accept`)
                .expect(401);
        });
        test(`Should respond with status code 200 on successful request`, async () => {
            mockProtectedRouteJWT(users[4]._id, "Person5", "person5*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate")
                .mockReturnValueOnce(users[1])
                .mockReturnValueOnce(users[4]);
            await request(app)
                .put(`/friend-requests/Person2/accept`)
                .expect(200);
        });
    });

    describe("/user/friend-requests/:username/decline PUT route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person4", "person4*");
            await request(app)
                .put(`/friend-requests/Person3/decline`)
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            mockProtectedRouteJWT(users[3]._id, "Person4", "person4*");
            await request(app)
                .put(`/friend-requests/personDoesNotExist/decline`)
                .expect(404);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person4",
                "person4*"
            );
            await request(app)
                .put(`/friend-requests/Person3/decline`)
                .expect(401);
        });
        test(`Should respond with status code 404 if the '_id' of the user being
         declined does not exist within the currently logged-in user's
         'friendRequests' array`, async () => {
            mockProtectedRouteJWT(users[3]._id, "Person4", "person4*");
            await request(app)
                .put(`/friend-requests/Person3/decline`)
                .expect(404);
        });
        test(`Should respond with status code 401 if the '_id' of the user being
         declined exists within the currently logged-in user's 'friendRequests'
         array but the currently logged-in user is not found in the database
         when attempting to update its fields`, async () => {
            mockProtectedRouteJWT(users[3]._id, "Person4", "person4*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app)
                .put(`/friend-requests/Person1/decline`)
                .expect(401);
        });
        test(`Should respond with status code 200 on successful request`, async () => {
            mockProtectedRouteJWT(users[3]._id, "Person4", "person4*");
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(users[3]);
            await request(app)
                .put(`/friend-requests/Person1/decline`)
                .expect(200);
        });
    });

    describe("/user/chats GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app).get(`/chats`).expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app).get(`/chats`).expect(401);
        });
        test(`Should respond with status code 200 if the chats are found in
         the database, with an array of chats and a new token`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/chats`)
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("chats")) {
                        throw new Error(
                            `Server has not responded with chats array`
                        );
                    }
                    if (!Array.isArray(data.chats)) {
                        throw new Error(
                            `Server has not responded with chats array`
                        );
                    }
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/preferences/displayName PUT route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            vi.spyOn(validateUserFields, "displayName").mockReturnValueOnce({
                status: false,
                message: "",
            });
            await request(app)
                .put(`/preferences/displayName`)
                .send({ displayName: "Name" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .put(`/preferences/displayName`)
                .send({ displayName: "Name" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database and therefore cannot have its fields
         updated`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .put(`/preferences/displayName`)
                .send({ displayName: "Name" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 200 if the user's display name is
         successfully updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .put(`/preferences/displayName`)
                .send({ displayName: "Name" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/preferences/tagLine PUT route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            vi.spyOn(validateUserFields, "tagLine").mockReturnValueOnce({
                status: false,
                message: "",
            });
            await request(app)
                .put(`/preferences/tagLine`)
                .send({ tagLine: "Tag line" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .put(`/preferences/tagLine`)
                .send({ tagLine: "Tag line" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database and therefore cannot have its fields
         updated`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .put(`/preferences/tagLine`)
                .send({ tagLine: "Tag line" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 200 if the user's tag line is
         successfully updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .put(`/preferences/tagLine`)
                .send({ tagLine: "Tag line" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/preferences/setStatus PUT route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            vi.spyOn(validateUserFields, "status").mockReturnValueOnce({
                status: false,
                message: "",
            });
            await request(app)
                .put(`/preferences/setStatus`)
                .send({ setStatus: "online" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .put(`/preferences/setStatus`)
                .send({ setStatus: "online" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database and therefore cannot have its fields
         updated`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .put(`/preferences/setStatus`)
                .send({ setStatus: "online" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 200 if the user's setStatus is
         successfully updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .put(`/preferences/setStatus`)
                .send({ setStatus: "online" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/preferences/theme PUT route...", () => {
        test(`Should respond with status code 400 if the body object in the
         request object does not contain the necessary information`, async () => {
            vi.spyOn(validateUserFields, "theme").mockReturnValueOnce({
                status: false,
                message: "",
            });
            await request(app)
                .put(`/preferences/theme`)
                .send({ theme: "default" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            mockProtectedRouteJWT(null, "Person1", "person1*");
            await request(app)
                .put(`/preferences/theme`)
                .send({ theme: "default" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 401 if the currently logged-in
         user is not found in the database and therefore cannot have its fields
         updated`, async () => {
            mockProtectedRouteJWT(
                new mongoose.Types.ObjectId(),
                "Person1",
                "person1*"
            );
            await request(app)
                .put(`/preferences/theme`)
                .send({ theme: "default" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(401);
        });
        test(`Should respond with status code 200 if the user's theme is
         successfully updated`, async () => {
            mockProtectedRouteJWT(users[0]._id, "Person1", "person1*");
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .put(`/preferences/theme`)
                .send({ theme: "default" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(200)
                .expect((res) => {
                    const data = res.body.data;
                    if (!data.hasOwnProperty("token")) {
                        throw new Error(`Server has not responded with token`);
                    }
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });
});
