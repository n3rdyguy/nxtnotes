export default defineEventHandler((event) => {
  const method = event.node.req.method;
  const path = event.node.req.url;

  // Exclude authentication endpoints from CSRF protection
  const excludedPaths = ["/api/login", "/api/user", "/api/refresh", "/api/csrf"];
  const isExcluded = excludedPaths.some(excluded => path?.startsWith(excluded));

  if (["POST", "PUT", "DELETE", "PATCH"].includes(method) && !isExcluded) {
    const csrfCookie = getCookie(event, "csrf_token");
    const csrfHeader = getHeader(event, "X-CSRF-Token");

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      throw createError({
        statusCode: 403,
        statusMessage: "Invalid CSRF Token",
      });
    }
  }
});
