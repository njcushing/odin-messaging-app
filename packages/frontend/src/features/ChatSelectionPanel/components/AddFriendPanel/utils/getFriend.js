const getFriend = async (username, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/friends/${username}`,
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
            return {
                status: responseJSON.status,
                message: responseJSON.message,
                friend: responseJSON.data.friend,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Finding friend failed",
                friend: null,
            };
        });
    return data;
};

export default getFriend;
