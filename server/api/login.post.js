// /api/login
import bcryptjs from "bcryptjs";
import { createError, defineEventHandler, readBody } from "h3";
import jwt from "jsonwebtoken";
import Validator from "validatorjs";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
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
    // User is authenticated, generate JWT token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    setCookie(event, "jwtToken", token);

    // TODO: remove token from response body
    return { data: { token } };
  }
  catch (error) {
    // catch all errors here
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message,
    });
  }
});
