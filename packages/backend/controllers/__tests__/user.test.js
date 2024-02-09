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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/", userRouter);

const credentials = {
    username: "username",
    email: "name@company.com",
    password: "password1*",
    confirmPassword: "password1*",
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
beforeAll(async () => {
    [users] = await initialiseMongoServer();
});

afterEach(async () => {
    await User.findOneAndDelete({ username: credentials.username });
});

afterAll(() => mongoose.connection.close());

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

    describe("/user/self/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/self/Person1`).expect(400);
        });
        test(`Should respond with status code 404 if the currently-logged in
         user is not found in the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/self/Person1`).expect(404);
        });
        test(`Should respond with status code 404 if the user from the request
         parameters is not found in the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).post(`/self/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 400 if the currently logged-in
         user and the user from the request parameters are not identical`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/self/Person2`).expect(400);
        });
        test(`Should respond with status code 200 if the currently logged-in
         user and the user from the request parameters are identical`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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

    describe("/user/friend/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/Person2`).expect(400);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/Person2`).expect(404);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).post(`/friend/personDoesNotExist`).expect(404);
        });
        test(`Should respond with status code 400 if the '_id' values of
         the friend being requested and the user currently logged-in are
         identical`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/Person1`).expect(400);
        });
        test(`Should respond with a status of 400 if the user and friend
         are both found in the database, but they are not friends`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/Person3`).expect(400);
        });
        test(`Should respond with a status of 200 on successful request`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/Person2`).expect(200);
        });
        test(`Should respond with the friend's information`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friend/Person2`)
                .expect((res) => {
                    const data = res.body.data;
                    if (!("friend" in data)) {
                        throw new Error(`Server has not responded with friend`);
                    }
                });
        });
        test(`Should respond with a new token`, async () => {
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app)
                .get(`/friend/Person2`)
                .expect((res) => {
                    const data = res.body.data;
                    if (data.token !== "Bearer token") {
                        throw new Error(`Server has not responded with token`);
                    }
                });
        });
    });

    describe("/user/friend/can-be-added/:username GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app)
                .get(`/friend/can-be-added/personDoesNotExist`)
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app)
                .get(`/friend/can-be-added/personDoesNotExist`)
                .expect(404);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friend/can-be-added/Person2`).expect(404);
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
            await request(app).get(`/friend/can-be-added/Person2`).expect(400);
        });
        test(`Should respond with status code 400 if the '_id' of the
         currently logged-in user exists within the potential friend's
         'friendRequests' array`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            generateToken.mockReturnValueOnce("Bearer token");
            vi.spyOn(User, "findByIdAndUpdate").mockReturnValueOnce(null);
            await request(app).get(`/friend/can-be-added/Person4`).expect(400);
        });
        test(`Should respond with status code 200 if the '_id' of the
         potential friend being checked does not exist within the currently
         logged-in user's friends list or the currently logged-in user does not
         exist within the potential friend's 'friendRequests' array`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            generateToken.mockReturnValueOnce("Bearer token");
            await request(app).get(`/friend/can-be-added/Person3`).expect(200);
        });
    });

    describe("/user/friends GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friends`).expect(400);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friends`).expect(404);
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

    describe("/user/friendRequests GET route...", () => {
        test(`Should respond with status code 400 if the user '_id' value
         extracted from the token in the 'authorization' header is not a valid
         MongoDB ObjectId`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friendRequests`).expect(400);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app).get(`/friendRequests`).expect(404);
        });
        test(`Should respond with status code 200 if the user is found in
         the database`, async () => {
            await request(app).get(`/friendRequests`).expect(200);
        });
        test(`Should respond with an array of friends`, async () => {
            await request(app)
                .get(`/friendRequests`)
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
                .get(`/friendRequests`)
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: null,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app)
                .post(`/friends`)
                .send({ username: "personDoesNotExist" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(400);
        });
        test(`Should respond with status code 404 if the friend is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app)
                .post(`/friends`)
                .send({ username: "personDoesNotExist" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 404 if the user is not found in
         the database`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: new mongoose.Types.ObjectId(),
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
            await request(app)
                .post(`/friends`)
                .send({ username: "Person2" })
                .set("Content-Type", "application/json")
                .set("Accept", "application/json")
                .expect(404);
        });
        test(`Should respond with status code 400 if the '_id' of the user
         being added already exists within the currently logged-in user's
         friends list`, async () => {
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
            protectedRouteJWT.mockImplementationOnce((req, res, next) => {
                req.user = {
                    _id: users[0]._id,
                    username: "Person1",
                    password: "person1*",
                };
                return next();
            });
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
});
