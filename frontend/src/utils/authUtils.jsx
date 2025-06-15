// src/utils/authUtils.js
export const ensureAuthenticated = async () => {
    try {
        // Step 1: Initial auth check
        const res = await fetch("https://eaglehub.onrender.com/check_auth", {
            method: "GET",
            credentials: "include",
        });

        if (res.status === 200) {
            return true; // Access token is valid
        }

        if (res.status === 401) {
            // Step 2: Try to refresh token
            const refreshRes = await fetch("https://eaglehub.onrender.com/refresh", {
                method: "POST",
                credentials: "include",
            });

            if (refreshRes.status === 200) {
                // Step 2.1: Recheck if access token is now valid
                const retryRes = await fetch("https://eaglehub.onrender.com/check_auth", {
                    method: "GET",
                    credentials: "include",
                });

                return retryRes.status === 200;
            }

            // Step 3: Refresh failed
            return false;
        }

        // Step 4: Some other unexpected status
        return false;
    } catch (err) {
        console.error("Auth check failed", err);
        return false;
    }
};
