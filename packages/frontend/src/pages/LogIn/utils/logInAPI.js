const logInAPI = async (credentials) => {
    const data = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/log-in`, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })
        .then(async (response) => {
            const responseJSON = await response.json();
            if (
                responseJSON.data !== null &&
                typeof responseJSON === "object" &&
                "token" in responseJSON.data
            ) {
                localStorage.setItem(
                    "odin-messaging-app-auth-token",
                    responseJSON.data.token
                );
            }
            return {
                status: responseJSON.status,
                message: responseJSON.message,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Log-in attempt failed",
            };
        });
    return data;
};

export default logInAPI;
