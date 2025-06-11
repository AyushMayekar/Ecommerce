// src/utils/authUtils.js
export const ensureAuthenticated = async () => {
    try {
        const res = await fetch("http://127.0.0.1:8000/check_auth", {
            method: "GET",
            credentials: "include",
        });

        if (res.status === 200) {
            return true; // Access token is valid
        }

        if (res.status === 401) {
            const refreshRes = await fetch("http://127.0.0.1:8000/refresh", {
                method: "POST",
                credentials: "include",
            });

            return refreshRes.status === 200;
        }

        return false;
    } catch (err) {
        console.error("Auth check failed", err);
        return false;
    }
};
