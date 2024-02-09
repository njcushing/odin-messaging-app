/* global describe, test, expect */

import logInAPI from "../logInAPI.js";

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
    const value = await logInAPI(["", ""], null);
    expect(value).toStrictEqual({
        status: 500,
        message: "Failed request",
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
                    data: null,
                });
            },
        })
    );
    const value = await logInAPI(["", ""], new AbortController());
    expect(value).toStrictEqual({
        status: 200,
        message: "Successful request",
    });
});
