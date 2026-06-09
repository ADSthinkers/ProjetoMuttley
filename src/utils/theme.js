const THEME_COOKIE = "muttley_theme";
const THEME_MAX_AGE = 60 * 60 * 24 * 365;
const VALID_THEMES = ["system", "light", "dark"];

export const getThemeCookie = () => {
    const theme = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${THEME_COOKIE}=`))
        ?.split("=")[1];

    return theme ? decodeURIComponent(theme) : undefined;
};

export const setThemeCookie = (theme) => {
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=${THEME_MAX_AGE}; SameSite=Lax`;
};

export const applyTheme = (theme) => {
    if (theme === "light" || theme === "dark") {
        document.documentElement.dataset.theme = theme;
        return;
    }

    delete document.documentElement.dataset.theme;
};

export const getStoredTheme = () => {
    const cookieTheme = getThemeCookie();
    if (VALID_THEMES.includes(cookieTheme)) return cookieTheme;

    localStorage.removeItem("theme");

    return "system";
};

export const getResolvedTheme = (theme = getStoredTheme()) => {
    if (theme === "light" || theme === "dark") return theme;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const getInitialTheme = getStoredTheme;

export const saveTheme = (theme) => {
    const nextTheme = VALID_THEMES.includes(theme) ? theme : "system";
    applyTheme(nextTheme);
    setThemeCookie(nextTheme);
    localStorage.removeItem("theme");
    window.dispatchEvent(new CustomEvent("muttley-theme-change", { detail: nextTheme }));
};

export const initializeTheme = () => {
    const theme = getStoredTheme();
    applyTheme(theme);
    return theme;
};
