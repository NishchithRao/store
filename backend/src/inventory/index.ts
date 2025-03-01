import { isAuthorized, isStoreEditor } from "../user/utils";
import { publicProcedure, router } from "../trpc";

import { PrismaClientValidationError } from "@prisma/client/runtime/library";
import { TRPCError } from "@trpc/server";
import { prisma } from "../prisma";
import { z } from "zod";

export const inventoryRouter = router({
  create: publicProcedure
    .use(isAuthorized)
    .use(isStoreEditor)
    .input(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number(),
        storyId: z.string().uuid(),
      })
    )
    .mutation(async ({ input }) => {
      const inventory = await prisma.inventory.upsert({
        where: {
          storeId: input.storyId,
        },
        update: {
          storeId: input.storyId,
        },
        create: {
          storeId: input.storyId,
        },
      });

      const inventoryItem = await prisma.inventoryItem.upsert({
        where: {
          productId: input.productId,
        },
        update: {
          quantity: input.quantity,
        },
        create: {
          productId: input.productId,
          quantity: input.quantity,
          inventoryId: inventory.id,
        },
      });
      return inventoryItem;
    }),
  deleteItem: publicProcedure
    .use(isAuthorized)
    .use(isStoreEditor)
    .input(z.object({ productId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      await prisma.inventoryItem.delete({
        where: { productId: input.productId },
      });
    }),
  delete: publicProcedure
    .use(isAuthorized)
    .use(isStoreEditor)
    .input(z.object({ storeId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      try {
        await prisma.inventory.delete({ where: { storeId: input.storeId } });
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
    .use(isStoreEditor)
    .input(z.object({ storeId: z.string() }))
    .query(async ({ input }) => {
      return await prisma.inventory.findMany({
        where: { storeId: input.storeId },
        take: 10,
      });
    }),
});
