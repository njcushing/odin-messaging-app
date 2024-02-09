/* global describe, test, expect */

import * as sendMessage from "../sendMessage.js";

// For 'Not implemented: navigation' error
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };

afterEach(() => {
    fetch.mockClear();
    assignMock.mockClear();
});

vi.mock("@/utils/saveTokenFromResponseJSON.js", async () => ({
    default: () => {},
}));

const redirectUserToLogin = vi.fn(() => {});
vi.mock("@/utils/redirectUserToLogin.js", async () => ({
    default: () => redirectUserToLogin(),
}));

describe("When calling the 'text' method...", () => {
    test(`The user should be redirected to the /log-in page if the status code
        in the response is 401`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({ status: 401, message: "", data: null }),
            })
        );
        redirectUserToLogin.mockClear();
        await sendMessage.text(
            "",
            { messageText: "Test", replyingTo: "" },
            null
        );
        expect(redirectUserToLogin).toHaveBeenCalled();
    });
    test(`The error code and message should be returned if fetch rejects`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => {
                    const error = new Error("Failed request");
                    error.status = 500;
                    return Promise.reject({
                        status: error.status,
                        message: error.message,
                        data: null,
                    });
                },
            })
        );
        const value = await sendMessage.text(
            "",
            { messageText: "Test", replyingTo: "" },
            new AbortController()
        );
        expect(value).toStrictEqual({
            status: 500,
            message: "Failed request",
            newMessage: null,
        });
    });
    test(`The response status code and message should be returned on successful
        request`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => {
                    return Promise.resolve({
                        status: 200,
                        message: "Successful request",
                        data: {
                            message: 0,
                        },
                    });
                },
            })
        );
        const value = await sendMessage.text(
            "",
            { messageText: "Test", replyingTo: "" },
            new AbortController()
        );
        expect(value).toStrictEqual({
            status: 200,
            message: "Successful request",
            newMessage: 0,
        });
    });
});
describe("When calling the 'image' method...", () => {
    test(`The user should be redirected to the /log-in page if the status code
        in the response is 401`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () =>
                    Promise.resolve({ status: 401, message: "", data: null }),
            })
        );
        redirectUserToLogin.mockClear();
        await sendMessage.image(
            "",
            { messageImage: new Uint8Array(), replyingTo: "" },
            null
        );
        expect(redirectUserToLogin).toHaveBeenCalled();
    });
    test(`The error code and message should be returned if fetch rejects`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => {
                    const error = new Error("Failed request");
                    error.status = 500;
                    return Promise.reject({
                        status: error.status,
                        message: error.message,
                        data: null,
                    });
                },
            })
        );
        const value = await sendMessage.image(
            "",
            { messageImage: new Uint8Array(), replyingTo: "" },
            new AbortController()
        );
        expect(value).toStrictEqual({
            status: 500,
            message: "Failed request",
            newMessage: null,
        });
    });
    test(`The response status code and message should be returned on successful
        request`, async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                json: () => {
                    return Promise.resolve({
                        status: 200,
                        message: "Successful request",
                        data: {
                            message: 0,
                        },
                    });
                },
            })
        );
        const value = await sendMessage.image(
            "",
            { messageImage: new Uint8Array(), replyingTo: "" },
            new AbortController()
        );
        expect(value).toStrictEqual({
            status: 200,
            message: "Successful request",
            newMessage: 0,
        });
    });
});