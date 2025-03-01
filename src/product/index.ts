import { getRedisItem, saveItemToRedis } from "../redis";
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
        images: z.array(z.string()),
      })
    )
    .mutation(async ({ input }) => {
      const product = await prisma.product.create({ data: input });
      return product;
    }),
  delete: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const product = await prisma.product.delete({ where: { id: input.id } });
      return product;
    }),
  list: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .query(async () => {
      const savedItem = await getRedisItem("products");
      if (savedItem) return savedItem;
      const items = await prisma.product.findMany({ take: 15 });
      await saveItemToRedis("products", items);
      return items;
    }),
});
