import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const acceptFriendRequest = async (username, abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friend-requests/${username}/accept`,
        {
            signal: abortController ? abortController.signal : null,
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
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
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
