import jwt from "jsonwebtoken";

// eslint-disable-next-line unused-imports/no-unused-vars
export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      verifyJwtToken: (token: any, secret: any) => {
        return jwt.verify(token, secret);
      },
    },
  };
});
