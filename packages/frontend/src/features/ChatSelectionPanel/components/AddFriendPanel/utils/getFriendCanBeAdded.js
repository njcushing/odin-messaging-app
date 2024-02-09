const getFriendCanBeAdded = async (username, abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friend/can-be-added/${username}`,
        {
            signal: abortController.signal,
            method: "GET",
            mode: "cors",
            headers: {
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }
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
            let friend = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "friend" in responseJSON.data
            ) {
                friend = responseJSON.data.friend;
            }
            let message = responseJSON.message;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "messageInformal" in responseJSON.data
            ) {
                message = responseJSON.data.messageInformal;
            }
            return {
                status: responseJSON.status,
                message: message,
                friend: friend,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Finding if friend can be added failed",
                friend: null,
            };
        });
    return data;
};

export default getFriendCanBeAdded;
