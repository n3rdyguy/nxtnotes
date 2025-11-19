import { auth } from "~~/lib/auth";
import { rateLimit } from "~~/server/utils/security";
import { validateBody } from "~~/server/utils/validation";
import { loginSchema } from "~~/shared/schemas/auth.schema";

export default defineEventHandler(async (event) => {
  try {
    rateLimit(event);

    // Validate request body with Zod
    const { email, password } = await validateBody(event, loginSchema);

    // Use BetterAuth to sign in
    const response = await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      asResponse: true,
      headers: getRequestHeaders(event) as unknown as HeadersInit,
    });

    // Forward Set-Cookie headers
    if (response.headers.getSetCookie) {
      const cookies = response.headers.getSetCookie();
      for (const cookie of cookies) {
        appendResponseHeader(event, "set-cookie", cookie);
      }
    }
    else {
      const cookie = response.headers.get("set-cookie");
      if (cookie) {
        appendResponseHeader(event, "set-cookie", cookie);
      }
    }

    if (!response.ok) {
      const error = await response.json();
      throw createError({
        statusCode: response.status,
        message: error.message || "Invalid credentials",
      });
    }

    return { data: "success" };
  }
  catch (error: any) {
    // Re-throw if already an H3Error (from validation or rate limiting)
    if (error.statusCode) {
      throw error;
    }
    // Catch all other errors
    throw createError({
      statusCode: 500,
      message: error.message || "Internal server error",
    });
  }
});
