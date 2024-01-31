import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

const getChatsList = async ([first, last], abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/chats/?first=${first}&last=${last}`,
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

            let chats = null;
            if (
                responseJSON.data !== null &&
                typeof responseJSON.data === "object" &&
                "chats" in responseJSON.data
            ) {
                chats = responseJSON.data.chats;
            }

            return {
                status: responseJSON.status,
                message: responseJSON.message,
                chats: responseJSON.data.chats,
            };
        })
        .catch((error) => {
            return {
                status: error.status,
                message: error.message,
                chats: [],
            };
        });
    return data;
};

export default getChatsList;
