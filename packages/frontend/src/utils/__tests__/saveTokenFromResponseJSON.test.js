/* global describe, test, expect */

import saveTokenFromResponseJSON from "../saveTokenFromResponseJSON.js";

test(`If no 'token' is found as a property of the 'data' object property in the
     top-level of the JSON object, the 'localStorage.setItem' method should not
     be called`, async () => {
    const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {});
    saveTokenFromResponseJSON({});
    expect(setItemSpy).not.toHaveBeenCalled();
});
test(`If a 'token' is found as a property of the 'data' object property in the
     top-level of the JSON object, the 'localStorage.setItem' method should be
     called with the value of that property as the second argument`, async () => {
    const setItemSpy = vi
        .spyOn(Storage.prototype, "setItem")
        .mockImplementationOnce(() => {});
    saveTokenFromResponseJSON({ data: { token: "Fake token" } });
    expect(setItemSpy).toHaveBeenCalled();
    expect(setItemSpy).toHaveBeenCalledWith(expect.any(String), "Fake token");
});
