// /api/user
import bcryptjs from "bcryptjs";
import prisma from "~/lib/prisma";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    // const existingUser = await prisma.user.findUnique({ where: { email: body.email } });
    // // console.log("Existing user:", existingUser);
    // if (existingUser) {
    //   console.log("User already exists");
    //   return { user: existingUser };
    // }
    // console.log("Creating new user");
    // console.log(`hashing password: ${body.password}`);

    const pwdSalt = await bcryptjs.genSalt(10);
    const pwdHash = await bcryptjs.hash(body.password, pwdSalt);
    // console.log(await bcryptjs.compare(body.password, hash)); // true
    // console.log(await bcryptjs.compare("not_bacon", hash)); // false
    // console.log(`Password hashed: ${hash}`);

    const user = await prisma.user.upsert({
      where: { email: body.email },
      update: { /* optional updates */ },
      create: {
        email: body.email,
        password: pwdHash,
        salt: pwdSalt,
      },
    });
    return { data: user };
  }
  catch (error) {
    console.error("Error in /api/user POST:", error.code, error.message || error);
    return { error: "Internal server error" };
  }
});
