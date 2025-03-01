import { disconnectRedis, initRedis } from "./redis";
import { publicProcedure, router } from "./trpc";

import { cartRouter } from "./cart";
import { collectionRouter } from "./collection";
import { context } from "./context";
import cors from "cors";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { inventoryRouter } from "./inventory";
import { orderRouter } from "./order";
import { productRouter } from "./product";
import { storeRouter } from "./stores";
import { userRouter } from "./user";

const appRouter = router({
  healthCheck: publicProcedure.query(() => "ok"),
  user: userRouter,
  product: productRouter,
  inventory: inventoryRouter,
  store: storeRouter,
  cart: cartRouter,
  order: orderRouter,
  collection: collectionRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
  createContext: context,
  middleware: cors({ origin: process.env.FRONTEND_URL, credentials: true }),
  responseMeta: ({ ctx, type, errors }) => {
    // checking that no procedures errored
    const allOk = errors.length === 0;
    // checking we're doing a query request
    const isQuery = type === "query";
    if (ctx && allOk && isQuery) {
      // cache request for 1 day + revalidate once every second
      const ONE_DAY_IN_SECONDS = 15000;
      return {
        headers: {
          "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
        },
      };
    }
    return {};
  },
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
  initRedis();
});

server.on("close", () => {
  disconnectRedis();
});
