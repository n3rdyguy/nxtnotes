import bcryptjs from "bcryptjs";
import prisma from "~/lib/prisma";
import { generateTokens, rateLimit, setCookieToken } from "~/server/utils/security";
import { validateBody } from "~/server/utils/validation";
import { registerSchema } from "~/shared/schemas/auth.schema";

export default defineEventHandler(async (event) => {
  try {
    rateLimit(event);

    // Validate request body with Zod
    const { email, password } = await validateBody(event, registerSchema);

    // Hash password
    const pwdSalt = await bcryptjs.genSalt(10);
    const pwdHash = await bcryptjs.hash(password, pwdSalt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: pwdHash,
        salt: pwdSalt,
      },
    });

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
    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "User with this email already exists",
      });
    }
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
