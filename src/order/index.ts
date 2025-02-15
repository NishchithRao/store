import { publicProcedure, router } from "../trpc";

import { isAuthorized } from "../user/utils";
import { prisma } from "src/prisma";
import { z } from "zod";

export const orderRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .input(
      z.object({
        cartId: z.string().uuid(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const order = await prisma.order.create({
        data: {
          userId: ctx.userID,
          cartId: input.cartId,
        },
      });
      return order;
    }),
  list: publicProcedure.use(isAuthorized).query(async ({ ctx }) => {
    return await prisma.order.findMany({
      where: { userId: ctx.userID },
      take: 10,
    });
  }),
  markComplete: publicProcedure
    .use(isAuthorized)
    .input(z.object({ orderId: z.string().uuid(), transactionId: z.string() }))
    .mutation(async ({ input }) => {
      await prisma.order.update({
        where: { id: input.orderId },
        data: { status: "COMPLETED", transactionId: input.transactionId },
      });
    }),
});
