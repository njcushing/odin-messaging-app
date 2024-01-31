/* global describe, test, expect */

import findUser from "../findUser.js";

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
    const value = await findUser("", null);
    expect(value).toStrictEqual({
        status: 500,
        message: "Failed request",
        user: null,
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
                        user: "",
                    },
                });
            },
        })
    );
    const value = await findUser("", new AbortController());
    expect(value).toStrictEqual({
        status: 200,
        message: "Successful request",
        user: "",
    });
});
