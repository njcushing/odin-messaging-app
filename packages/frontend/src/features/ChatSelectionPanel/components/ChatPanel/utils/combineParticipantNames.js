const combineParticipantNames = (names, maxNames) => {
    if (!Array.isArray(names)) return "";
    if (names.length === 0) return "";
    let combined = "";
    for (let i = 0; i < Math.min(maxNames, names.length); i++) {
        if (typeof names[i] !== "string") continue;
        if (combined === "") {
            combined = names[i];
            continue;
        }
        if (i === names.length - 1) {
            combined = combined + ` & ${names[i]}`;
            break;
        }
        combined = combined + `, ${names[i]}`;
        if (i === maxNames - 1) {
            const remainingNamesCount = names.length - 1 - i;
            combined =
                combined +
                ` & ${remainingNamesCount}
                other${remainingNamesCount === 1 ? "" : "s"}`;
            break;
        }
    }
    if (combined === "") return "Chat";
    return combined;
};

export default combineParticipantNames;
