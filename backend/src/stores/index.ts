import { isAuthorized, isProductEditor } from "../user/utils";
import { publicProcedure, router } from "../trpc";

import { prisma } from "../prisma";
import { z } from "zod";

export const storeRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .input(
      z.object({
        title: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const store = await prisma.store.create({ data: input });
      return store;
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
      const store = await prisma.store.delete({ where: { id: input.id } });
      return store;
    }),
  list: publicProcedure
    .use(isAuthorized)
    .use(isProductEditor)
    .query(async () => {
      return await prisma.store.findMany();
    }),
});
