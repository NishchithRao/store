import { isAuthorized, isProductEditor } from "../user/utils";
import { publicProcedure, router } from "../trpc";

import { prisma } from "../prisma";
import { z } from "zod";

export const productRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .input(
      z.object({
        title: z.string(),
        price: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const product = await prisma.product.create({ data: input });
      return product;
    }),
  list: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .query(async () => await prisma.product.findMany({ take: 15 })),
});
