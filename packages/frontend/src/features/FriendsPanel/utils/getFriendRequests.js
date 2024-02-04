import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

const getFriendRequests = async ([first, last], abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friend-requests?first=${first}&last=${last}`,
        {
            signal: abortController ? abortController.signal : null,
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
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) redirectUserToLogin();

            let friendRequests = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "friendRequests" in responseJSON.data
            ) {
                friendRequests = responseJSON.data.friendRequests;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                friendRequests: friendRequests,
            };
        })
        .catch((error) => {
            return {
                status: error.status ? error.status : 500,
                message: error.message,
                friendRequests: [],
            };
        });
    return data;
};

export default getFriendRequests;
