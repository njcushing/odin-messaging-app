import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

const getSelf = async (abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/self`,
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

            let user = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "user" in responseJSON.data
            ) {
                user = responseJSON.data.user;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                user: user,
            };
        })
        .catch((error) => {
            return {
                status: error.status,
                message: error.message,
                user: null,
            };
        });
    return data;
};

export default getSelf;
