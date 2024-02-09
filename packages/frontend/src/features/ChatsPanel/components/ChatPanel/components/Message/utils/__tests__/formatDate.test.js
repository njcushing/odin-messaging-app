/* global describe, test, expect */

import formatDate from "../formatDate.js";

test(`If the argument is 'null', return "Unknown"`, async () => {
    expect(formatDate(null)).toBe("Unknown");
});
test(`If the argument is not a valid date, return "Unknown"`, async () => {
    expect(formatDate(0)).toBe("Unknown");
    expect(formatDate({})).toBe("Unknown");
    expect(formatDate([])).toBe("Unknown");
    expect(formatDate("")).toBe("Unknown");
});
test(`If the argument is a valid date, return the return value of the 'DateTime'
     method in luxon`, async () => {
    expect(formatDate("2000-01-01T01:02:03")).toBe("01/01/2000, 01:02:03");
});
