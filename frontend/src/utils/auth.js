const AUTH_COOKIE = "muttley_auth";
const AUTH_MAX_AGE = 60 * 60 * 8;

export const setAuthCookie = (value) => {
    document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${AUTH_MAX_AGE}; SameSite=Lax`;
};

export const clearAuthCookie = () => {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
};

export const getAuthCookie = () => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${AUTH_COOKIE}=`))
        ?.split("=")[1];
};

export const isAuthenticated = () => Boolean(getAuthCookie());
