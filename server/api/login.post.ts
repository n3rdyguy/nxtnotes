import bcryptjs from "bcryptjs";
import prisma from "~/lib/prisma";
import { generateTokens, rateLimit, setCookieToken } from "~/server/utils/security";
import { validateBody } from "~/server/utils/validation";
import { loginSchema } from "~/shared/schemas/auth.schema";

export default defineEventHandler(async (event) => {
  try {
    rateLimit(event);

    // Validate request body with Zod
    const { email, password } = await validateBody(event, loginSchema);

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Verify password
    const isValid = await bcryptjs.compare(password, user?.password ?? "");
    if (!isValid || !user) {
      throw createError({
        statusCode: 401,
        message: "Invalid credentials",
      });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Store refresh token in DB
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        user_id: user.id,
      },
    });

    // Set cookies
    setCookieToken(event, "accessToken", accessToken);
    setCookieToken(event, "refreshToken", refreshToken);

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
