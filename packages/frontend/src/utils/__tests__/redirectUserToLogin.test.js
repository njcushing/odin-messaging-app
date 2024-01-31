/* global describe, test, expect */

import redirectUserToLogin from "../redirectUserToLogin.js";

// For 'Not implemented: navigation' error
let assignMock = vi.fn();
delete window.location;
window.location = { assign: assignMock };

afterEach(() => {
    assignMock.mockClear();
});

test(`The user should be redirected to the /log-in route`, async () => {
    expect(window.location.href !== "/log-in");
    redirectUserToLogin("", null);
    expect(window.location.href === "/log-in");
});
