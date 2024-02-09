import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";
import redirectUserToLogin from "@/utils/redirectUserToLogin.js";

const getFriendsList = async ([first, last], abortController) => {
    const data = await fetch(
        `${
            import.meta.env.VITE_SERVER_DOMAIN
        }/user/friends?first=${first}&last=${last}`,
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
                status: error.status ? error.status : 500,
                message: error.message,
                friends: [],
            };
        });
    return data;
};

export default getFriendsList;
