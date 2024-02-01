const combineParticipantNames = (names, maxNames = 3) => {
    if (!Array.isArray(names)) return "";
    if (names.length === 0) return "";
    let combined = "";
    let namesFiltered = names.filter((name) => {
        return typeof name === "string" && name.length > 0;
    });
    if (maxNames === 0 && namesFiltered.length > 0) {
        return `${namesFiltered.length} participant${
            namesFiltered.length === 1 ? "" : "s"
        }`;
    }
    for (let i = 0; i < Math.min(maxNames, namesFiltered.length); i++) {
        if (i === namesFiltered.length - 1) {
            combined =
                combined + `${combined !== "" ? " & " : ""}${namesFiltered[i]}`;
            continue;
        }
        combined =
            combined + `${combined !== "" ? ", " : ""}${namesFiltered[i]}`;
        if (i === maxNames - 1) {
            const nameCountRemaining = namesFiltered.length - 1 - i;
            if (nameCountRemaining > 0) {
                combined =
                    combined +
                    ` & ${nameCountRemaining} other${
                        nameCountRemaining === 1 ? "" : "s"
                    }`;
            }
            continue;
        }
    }
    return combined;
};

export default combineParticipantNames;
