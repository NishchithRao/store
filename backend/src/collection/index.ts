import { isAuthorized, isProductEditor } from "../user/utils";
import { publicProcedure, router } from "../trpc";

import { prisma } from "../prisma";
import { z } from "zod";

export const collectionRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const collection = await prisma.collection.create({ data: input });
      return collection;
    }),
  list: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .query(async () => await prisma.collection.findMany({ take: 15 })),
});
