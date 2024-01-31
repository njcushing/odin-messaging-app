import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

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

            if (responseJSON.status === 401) redirectUserToLogin();

            let friend = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "friend" in responseJSON.data
            ) {
                friend = responseJSON.data.friend;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                friend: friend,
            };
        })
        .catch((error) => {
            return {
                status: error.status,
                message: error.message,
                friend: null,
            };
        });
    return data;
};

export default getFriend;
