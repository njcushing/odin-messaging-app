import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const getFriend = async (username, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/friend/${username}`,
        {
            signal: abortController ? abortController.signal : null,
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
            saveTokenFromResponseJSON(responseJSON);

            if (responseJSON.status === 401) {
                window.location.href = "/log-in";
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
