import { Telegram } from "puregram";
import { authUser } from "./authUser";
import { banMiddleware } from "./ban";

export function initMiddlewares(telegram: Telegram) {
  telegram.updates.use((ctx, next) => authUser(ctx, next));
  telegram.updates.use((ctx, next) => banMiddleware(ctx, next));
}
