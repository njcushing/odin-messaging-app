import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const declineFriendRequest = async (username, abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friend-requests/${username}/decline`,
        {
            signal: abortController.signal,
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
                message: "Declining friend request failed",
                friendRequests: [],
            };
        });
    return data;
};

export default declineFriendRequest;
