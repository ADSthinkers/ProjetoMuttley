const THEME_COOKIE = "muttley_theme";
const THEME_MAX_AGE = 60 * 60 * 24 * 365;

export const getThemeCookie = () => {
    return document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${THEME_COOKIE}=`))
        ?.split("=")[1];
};

export const setThemeCookie = (theme) => {
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_MAX_AGE}; SameSite=Lax`;
};

export const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;
};

export const getInitialTheme = () => {
    const cookieTheme = getThemeCookie();
    if (cookieTheme === "light" || cookieTheme === "dark") return cookieTheme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const initializeTheme = () => {
    const theme = getInitialTheme();
    applyTheme(theme);
    return theme;
};
