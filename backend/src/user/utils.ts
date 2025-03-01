import { Prisma, ROLE } from "@prisma/client";
import { sign, verify } from "jsonwebtoken";

import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";

type LoginOpts = Omit<Prisma.UserCreateInput, "name">;

const createAccessToken = (userId: string, role: ROLE) => {
  return sign({ userId, role }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: "1h",
  });
};

const createRefreshToken = (userId: string) => {
  return sign({ userId }, process.env.REFRESH_TOKEN_SECRET as string, {
    expiresIn: 15 * 24 * 60 * 60,
  });
};

const verifyToken = (token: string, secret: string) => {
  return verify(token, secret);
};

const regenerateAccessToken = async (refreshToken: string) => {
  const parsedRefreshToken = verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string
  );
  if (typeof parsedRefreshToken === "object" && parsedRefreshToken.userId) {
    const user = await prisma.user.findUnique({
      where: {
        id: parsedRefreshToken.userId,
      },
    });
    return createAccessToken(parsedRefreshToken.userId, user?.role || "USER");
  }
  return null;
};

const signIn = async (
  opts: LoginOpts
): Promise<
  | { code: TRPCError["code"]; message: TRPCError["message"] }
  | { accessToken: string; refreshToken: string }
> => {
  const user = await prisma.user.findUnique({
    where: {
      email: opts.email,
    },
  });

  if (!user) {
    return { code: "NOT_FOUND", message: "user not found" };
  }
  const isPasswordValid = await bcrypt.compare(opts.password, user.password);
  if (!isPasswordValid) {
    return {
      code: "BAD_REQUEST",
      message: JSON.stringify([
        { validation: "password", message: "password not valid" },
      ]),
    };
  }
  const accessToken = createAccessToken(user.id, user.role);
  const refreshToken = createRefreshToken(user.id);
  return { accessToken, refreshToken };
};

const isAuthorized: Parameters<typeof publicProcedure.use>[0] = (opts) => {
  if (opts.ctx.userID) {
    return opts.next();
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthorized" });
};

const isStoreEditor: Parameters<typeof publicProcedure.use>[0] = (opts) => {
  const STORE_EDITORS = ["ADMIN", "STORE_ADMIN"];
  if (STORE_EDITORS.includes(opts.ctx.role)) {
    opts;
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthorized role" });
};

const isProductEditor: Parameters<typeof publicProcedure.use>[0] = (opts) => {
  const PRODUCT_EDITORS = ["ADMIN"];
  if (PRODUCT_EDITORS.includes(opts.ctx.role)) {
    console.log(opts.path, 900);
    return opts.next();
  }
  throw new TRPCError({ code: "UNAUTHORIZED", message: "unauthorized role" });
};

export {
  signIn,
  regenerateAccessToken,
  verifyToken,
  isAuthorized,
  isStoreEditor,
  isProductEditor,
};
