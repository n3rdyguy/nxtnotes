export default defineNuxtPlugin(async () => {
  // Fetch CSRF token on app initialization
  if (process.client) {
    try {
      await $fetch("/api/csrf");
    }
    catch (error) {
      console.error("Failed to fetch CSRF token:", error);
    }
  }

  // Extend global $fetch to automatically include CSRF tokens
  const originalFetch = globalThis.$fetch;

  globalThis.$fetch = $fetch.create({
    async onRequest({ options }) {
      // Add CSRF token to headers for state-changing requests
      const method = options.method?.toUpperCase();
      if (["POST", "PUT", "DELETE", "PATCH"].includes(method || "")) {
        const csrfToken = useCookie("csrf_token").value;
        if (csrfToken) {
          options.headers = ({
            ...(options.headers as unknown as Record<string, string>),
            "X-CSRF-Token": csrfToken,
          } as unknown) as typeof options.headers;
        }
      }
    },
    async onResponseError({ response, request }) {
      // Handle 401 errors by attempting token refresh
      if (response.status === 401) {
        try {
          // Try to refresh the token
          await originalFetch("/api/refresh", { method: "POST" });

          // Retry the original request
          // @ts-ignore - Type compatibility issue with options
          return await originalFetch(request);
        }
        catch (refreshError) {
          // Refresh failed, redirect to login
          if (process.client) {
            navigateTo("/login");
          }
        }
      }
    },
  });
});
