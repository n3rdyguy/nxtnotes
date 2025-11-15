// /api/user
import bcryptjs from "bcryptjs";
import { createError, defineEventHandler, readBody } from "h3";
import Validator from "validatorjs";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);

    Validator.register("strongPassword", (value) => {
      return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]+$/.test(value);
    }, "Password must include uppercase, lowercase and number");
    const data = {
      email: body.email,
      password: body.password,
    };
    const rules = {
      email: "required|email",
      password: "required|min:8|strongPassword",
    };
    const validation = new Validator(data, rules);
    if (validation.fails()) { // must be called first, to start validation
      if (validation.errors.has("email")) {
        throw createError({
          statusCode: 400,
          message: validation.errors.first("email"),
        });
      }
      if (validation.errors.has("password")) {
        throw createError({
          statusCode: 400,
          message: validation.errors.first("password"),
        });
      }
    }
    const pwdSalt = await bcryptjs.genSalt(10);
    const pwdHash = await bcryptjs.hash(body.password, pwdSalt);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: pwdHash,
        salt: pwdSalt,
      },
    });
    return { data: user };
  }
  catch (error) {
    if (error.code === "P2002") {
      throw createError({
        statusCode: 409,
        message: "User with this email already exists",
      });
    }
    throw createError({
      code: error.code || 500,
      message: error.message,
    });
  }
});
