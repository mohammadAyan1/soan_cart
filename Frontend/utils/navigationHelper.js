/**
 * Safe navigation helper to prevent "GO_BACK was not handled by any navigator" error
 * when opening screens directly via deep links.
 */
export const safeBack = (router, fallback = "/(root)/(tabs)") => {
    if (router && typeof router.canGoBack === "function" && router.canGoBack()) {
        router.back();
    } else if (router && typeof router.replace === "function") {
        router.replace(fallback);
    }
};
