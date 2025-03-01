import { publicProcedure, router } from "../trpc";

import { isAuthorized } from "../user/utils";
import { prisma } from "../prisma";
import { z } from "zod";

export const ratingRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .input(
      z.object({
        productId: z.string().uuid(),
        rating: z.number(),
        comment: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const rating = await prisma.rating.create({
        data: { ...input, userId: ctx.userID },
      });
      return rating;
    }),
  getRatingsForProduct: publicProcedure
    .use(isAuthorized)
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ input }) => {
      return await prisma.rating.findMany({
        where: { productId: input.productId },
        take: 10,
      });
    }),
  getAverageRatingForProduct: publicProcedure
    .use(isAuthorized)
    .input(z.object({ productId: z.string().uuid() }))
    .query(async ({ input }) => {
      const ratings = await prisma.rating.findMany({
        where: { productId: input.productId },
        take: 10,
      });
      const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
      return sum / ratings.length;
    }),
});
