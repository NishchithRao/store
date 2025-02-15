import Cookies, { SetOption } from "cookies";

import { CreateHTTPContextOptions } from "@trpc/server/adapters/standalone";
import { verifyToken } from "./user/utils";

const cookieOptions: SetOption = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  path: "/",
};

export const context = (options: CreateHTTPContextOptions) => {
  const { req, res } = options;

  const cookies = new Cookies(req, res, cookieOptions);

  const token =
    cookies.get("access-token") || req.headers.authorization?.split(" ")[1];

  try {
    if (token) {
      const user = verifyToken(
        token,
        process.env.ACCESS_TOKEN_SECRET as string
      );
      if (typeof user === "object") {
        if (typeof user === "object" && user?.userId) {
          return {
            userID: user.userId,
            role: user.role,
            setCookie: (key: string, cookie: string) => {
              cookies.set(key, cookie);
            },
          };
        }
      }
    }
  } catch (error) {
    return {
      setCookie: (key: string, cookie: string) => {
        cookies.set(key, cookie);
      },
    };
  }

  return {
    setCookie: (key: string, cookie: string) => {
      cookies.set(key, cookie);
    },
  };
};

export type Context = Awaited<ReturnType<typeof context>>;
