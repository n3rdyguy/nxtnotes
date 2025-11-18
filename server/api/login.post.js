// /api/login
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import prisma from "~/lib/prisma";
import { generateTokens, rateLimit, setCookieToken } from "~/server/utils/security";

export default defineEventHandler(async (event) => {
  try {
    rateLimit(event);

    const body = await readBody(event);

    const data = {
      email: body.email,
      password: body.password,
    };
    const rules = {
      email: "required|email",
      password: "required",
    };
    const validation = new Validator(data, rules);
    if (validation.fails()) { // must be called first, to start validation
      if (validation.errors.has("email")) {
        throw createError({
          statusCode: 400,
          message: String(validation.errors.first("email")),
        });
      }
      if (validation.errors.has("password")) {
        throw createError({
          statusCode: 400,
          message: String(validation.errors.first("password")),
        });
      }
    }

    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });
    const isValid = await bcryptjs.compare(body.password, user ? user.password : "");
    if (!isValid || !user) {
      // Throw error to the catch block
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
  catch (error) {
    // catch all errors here
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});

