const acceptFriendRequest = async (username) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friend-requests/${username}/accept`,
        {
            method: "PUT",
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
                friendRequests: responseJSON.data.friendRequests,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Accepting friend request failed",
                friendRequests: [],
            };
        });
    return data;
};

export default acceptFriendRequest;
