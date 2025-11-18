import jwt from "jsonwebtoken";

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" },
  );

  return { accessToken, refreshToken };
};

export const setCookieToken = (event, name, value) => {
  setCookie(event, name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: name === "refreshToken" ? 60 * 60 * 24 * 7 : 60 * 15, // 7 days or 15 mins
  });
};

const rateLimitMap = new Map();

export const rateLimit = (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) || "unknown";
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const max = 100; // limit each IP to 100 requests per windowMs

  if (!rateLimitMap.has(ip)) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
  }
  else {
    const data = rateLimitMap.get(ip);
    if (now - data.startTime > windowMs) {
      data.count = 1;
      data.startTime = now;
    }
    else {
      data.count++;
      if (data.count > max) {
        throw createError({
          statusCode: 429,
          statusMessage: "Too Many Requests",
        });
      }
    }
  }
};
