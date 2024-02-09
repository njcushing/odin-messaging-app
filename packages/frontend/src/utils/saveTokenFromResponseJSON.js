const saveTokenFromResponseJSON = async (responseJSON) => {
    if (
        responseJSON.data !== null &&
        typeof responseJSON.data === "object" &&
        "token" in responseJSON.data
    ) {
        localStorage.setItem(
            "odin-messaging-app-auth-token",
            responseJSON.data.token
        );
    }
};

export default saveTokenFromResponseJSON;
