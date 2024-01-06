const findUser = async (username, abortController) => {
    const data = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/user/${username}`,
        {
            signal: abortController ? abortController.signal : null,
            method: "GET",
            mode: "cors",
        }
    )
        .then(async (response) => {
            const responseJSON = await response.json();
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
                status: 500,
                message: "Finding user failed",
                user: null,
            };
        });
    return data;
};

export default findUser;
