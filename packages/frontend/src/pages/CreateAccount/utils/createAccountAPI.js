import saveTokenFromResponseJSON from "@/utils/saveTokenFromResponseJSON.js";

const createAccountAPI = async (credentials) => {
    const data = await fetch(`${import.meta.env.VITE_SERVER_DOMAIN}/user`, {
        method: "POST",
        mode: "cors",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    })
        .then(async (response) => {
            const responseJSON = await response.json();
            saveTokenFromResponseJSON(responseJSON);

            return {
                status: responseJSON.status,
                message: responseJSON.message,
            };
        })
        .catch((error) => {
            return {
                status: 500,
                message: "Account creation attempt failed",
            };
        });
    return data;
};

export default createAccountAPI;
