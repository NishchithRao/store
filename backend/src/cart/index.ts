import { publicProcedure, router } from "../trpc";

import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { isAuthorized } from "../user/utils";
import { prisma } from "../prisma";
import { z } from "zod";

export const cartRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .input(
      z.object({
        quantity: z.number(),
        inventoryItemProductId: z.string().uuid(),
        cartId: z.string().uuid(),
        cartItemID: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const cart = await prisma.cart.upsert({
        where: {
          userId: ctx.userID,
          id: input.cartId,
        },
        update: {
          userId: ctx.userID,
        },
        create: {
          userId: ctx.userID,
        },
      });

      const cartItem = await prisma.cartItem.upsert({
        where: {
          cartId: cart.id,
          id: input.cartItemID,
        },
        update: {
          quantity: input.quantity,
          inventoryItemProductId: input.inventoryItemProductId,
        },
        create: {
          quantity: input.quantity,
          inventoryItemProductId: input.inventoryItemProductId,
          cartId: cart.id,
        },
      });
      return cartItem;
    }),
  deleteItem: publicProcedure
    .use(isAuthorized)
    .input(z.object({ cartItemID: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await prisma.cartItem.delete({
        where: { id: input.cartItemID },
      });
    }),
  delete: publicProcedure
    .use(isAuthorized)
    .input(z.object({ cartId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.cart.delete({ where: { id: input.cartId } });
      } catch (error) {
        if (error instanceof PrismaClientValidationError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid store ID",
          });
        }
      }
    }),
  list: publicProcedure
    .use(isAuthorized)
    .input(z.object({ cartId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.cart.findMany({
        where: { id: input.cartId },
        take: 10,
      });
    }),
});
