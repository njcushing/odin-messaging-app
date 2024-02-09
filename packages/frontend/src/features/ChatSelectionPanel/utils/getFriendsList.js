const getFriendsList = async () => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/friends`,
        {
            method: "GET",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
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
                friends: responseJSON.data.friends,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Requesting friends list failed",
                data: [],
            };
        });
    return data;
};

export default getFriendsList;
