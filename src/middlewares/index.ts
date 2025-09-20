import { Telegram } from "puregram";
import { authUser } from "./authUser";

export function initMiddlewares(telegram: Telegram) {
  telegram.updates.use((ctx, next) => authUser(ctx, next));
}
