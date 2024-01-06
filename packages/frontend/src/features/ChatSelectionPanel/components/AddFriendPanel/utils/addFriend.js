import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const addFriend = async (username) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/friends`,
        {
            method: "POST",
            mode: "cors",
            headers: {
                "Content-Type": "application/json",
                authorization: localStorage.getItem(
                    "odin-messaging-app-auth-token"
                ),
            },
            body: JSON.stringify({ username: username }),
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
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Adding friend failed",
            };
        });
    return data;
};

export default addFriend;
