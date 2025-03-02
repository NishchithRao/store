import { getRedisItem, saveItemToRedis } from "../redis";
import { isAuthorized, regenerateAccessToken, signIn } from "./utils";
import { publicProcedure, router } from "../trpc";

import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma";
import { z } from "zod";

export const userRouter = router({
  signIn: publicProcedure
    .meta({ title: "Sign In" })
    .use(async (opts) => {
      return opts.next();
    })
    .input(
      z.object({
        email: z.string().email("Invalid email"),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const data = await signIn(input);
      if ("code" in data) {
        throw new TRPCError({ code: data.code, message: data.message });
      }
      ctx.setCookie?.("access-token", data.accessToken);
      ctx.setCookie?.("refresh-token", data.refreshToken);
      return data;
    }),
  profile: publicProcedure.use(isAuthorized).query(async ({ ctx }) => {
    const savedItem = await getRedisItem(["user", ctx.userID].join(":"));
    if (savedItem) return savedItem;
    const user = await prisma.user.findUnique({
      where: {
        id: ctx.userID,
      },
    });
    if (user) await saveItemToRedis(["user", ctx.userID].join(":"), user);
    return user;
  }),
  refreshToken: publicProcedure
    .input(z.object({ refreshToken: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = await regenerateAccessToken(input.refreshToken);
      if (data) {
        ctx.setCookie?.("access-token", data);
        return data;
      }
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "refresh token not found",
      });
    }),
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6, "Password must be at least 6 characters"),
        name: z.string().min(3, "Name must be at least 3 characters"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const encryptedPassword = await bcrypt.hash(input.password, 10);
      const existingUser = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (existingUser) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "email already exists",
        });
      }
      await prisma.user.create({
        data: {
          email: input.email,
          password: encryptedPassword,
          name: input.name,
        },
      });
      const data = await signIn(input);
      if ("code" in data) {
        throw new TRPCError({ code: data.code, message: data.message });
      }
      ctx.setCookie?.("access-token", data.accessToken);
      ctx.setCookie?.("refresh-token", data.refreshToken);
      return data;
    }),
  delete: publicProcedure
    .input(z.object({ email: z.string() }))
    .mutation(async ({ input }) => {
      const user = await prisma.user.findUnique({
        where: {
          email: input.email,
        },
      });
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "user not found",
        });
      }
      await prisma.user.delete({
        where: {
          email: input.email,
        },
      });
      return user;
    }),
  list: publicProcedure.use(isAuthorized).query(async () => {
    const savedItem = await getRedisItem("users");
    if (savedItem) return savedItem;
    const users = await prisma.user.findMany();
    await saveItemToRedis("users", users);
    return users;
  }),
  updateRole: publicProcedure
    .use(isAuthorized)
    .input(z.object({ role: z.enum(["ADMIN", "STORE_ADMIN", "USER"]) }))
    .mutation(async ({ input, ctx }) => {
      const user = prisma.user.update({
        where: {
          id: ctx.userID,
        },
        data: {
          role: input.role,
        },
      });
      return user;
    }),
});
