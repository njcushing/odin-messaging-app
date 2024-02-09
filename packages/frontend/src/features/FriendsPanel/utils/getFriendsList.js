import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const getFriendsList = async (abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/friends`,
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

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
            }

            let friends = [];
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "friends" in responseJSON.data
            ) {
                friends = responseJSON.data.friends;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                friends: friends,
            };
        })
        .catch(async (error) => {
            return {
                status: 500,
                message: "Requesting friends list failed",
                friends: [],
            };
        });
    return data;
};

export default getFriendsList;