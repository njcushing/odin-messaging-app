export const options = () => {
    return [
        { name: "default", colour: "#d5ebec" },
        { name: "red", colour: "#e42929" },
        { name: "orange", colour: "#e47d29" },
        { name: "green", colour: "#25a106" },
        { name: "blue", colour: "#063ca1" },
        { name: "purple", colour: "#580886" },
        { name: "light", colour: "#fff" },
        { name: "dark", colour: "#242424" },
    ];
};

export const optionNames = () => {
    return options().map((option) => option.name);
};

export const setTheme = (theme) => {
    const root = document.querySelector(":root");
    if (root === null) return;
    if (optionNames().includes(theme)) root.setAttribute("theme", theme);
};
