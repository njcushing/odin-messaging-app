/* global describe, test, expect */

import "@testing-library/jest-dom";
import * as themes from "./index.js";

describe("When calling the 'optionNames' method...", () => {
    test(`An array of strings containing the names for each option should be
        returned`, async () => {
        const names = themes.optionNames();
        expect(Array.isArray(names)).toBeTruthy();
    });
});
describe("When calling the 'setTheme' method...", () => {
    test(`The 'theme' attribute on the :root element should have its value set
       to the value of the argument provided`, async () => {
        let root = document.querySelector(":root");
        themes.setTheme("dark");
        expect(root.getAttribute("theme")).toBe("dark");
        themes.setTheme("light");
        expect(root.getAttribute("theme")).toBe("light");
        themes.setTheme("default");
        expect(root.getAttribute("theme")).toBe("default");
    });
    test(`But only if that value is in the names returned by the 'optionNames'
       method`, async () => {
        let root = document.querySelector(":root");
        themes.setTheme("dark");
        expect(root.getAttribute("theme")).toBe("dark");
        themes.setTheme("light");
        expect(root.getAttribute("theme")).toBe("light");
        themes.setTheme("thisIsNotARealTheme");
        expect(root.getAttribute("theme")).toBe("light");
    });
});
