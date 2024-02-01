/* global describe, test, expect */

import combineParticipantNames from "../combineParticipantNames.js";

test(`If the first argument is not an array, an empty string should be returned`, async () => {
    const combined = combineParticipantNames();
    expect(combined).toBe("");
});
test(`If the first argument is an empty array, an empty string should be
     returned`, async () => {
    const combined = combineParticipantNames([]);
    expect(combined).toBe("");
});
test(`If the number of names provided as the first argument does not exceed the
     maximum number of names to combine provided as the second argument, the
     names should be returned in the string, separated by commas, except for the
     last name which should be preceded by an '&' symbol`, async () => {
    expect(combineParticipantNames(["John"], 3)).toBe("John");
    expect(combineParticipantNames(["John", "Sarah"], 3)).toBe("John & Sarah");
    expect(combineParticipantNames(["John", "Sarah", "Elizabeth"], 3)).toBe(
        "John, Sarah & Elizabeth"
    );
});
test(`If the number of names provided as the first argument exceeds the maximum
     number of names to combine provided as the second argument, the names
     should be returned in the string, separated by commas, with '& X others'
     at the end, where 'X' is equal to the number of remaining valid names (with
     the plurality formatted correctly)`, async () => {
    expect(combineParticipantNames(["John", "Sarah", "Elizabeth"], 2)).toBe(
        "John, Sarah & 1 other"
    );
    expect(combineParticipantNames(["John", "Sarah", "Elizabeth"], 1)).toBe(
        "John & 2 others"
    );
});
test(`If the maximum number of names is 0 and there is at least one name to
     be combined, the return value should be 'X participants', where 'X' is
     equal to the number of participants (with the plurality formatted
     correctly)`, async () => {
    expect(combineParticipantNames(["John"], 0)).toBe("1 participant");
    expect(combineParticipantNames(["John", "Sarah", "Elizabeth"], 0)).toBe(
        "3 participants"
    );
});
test(`Any non-string values provided in the first argument array should be
     ignored`, async () => {
    expect(combineParticipantNames(["John", 0, "Sarah"], 3)).toBe(
        "John & Sarah"
    );
});
