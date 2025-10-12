import { MessageContext } from "puregram";
import { takesApi } from "../../services/api/takes";
import { CreateTakeDto } from "../../types/api/takes";
import { logger } from "../logger";
import { texts } from "../../texts";

export function prepareText(ctx: MessageContext, anonimity: boolean): {
  baseText: string,
  author: string,
  finalText: string,
} {
  const baseText = ctx.text ?? ctx.caption ?? "";
  const author = texts.take.author(ctx.from?.username || "");

  return {
    finalText: anonimity ? baseText : `${baseText}\n\n${author}`,
    baseText,
    author
  }
}

export async function createTake(take: CreateTakeDto) {
  try {
    await takesApi.create(take);
    logger.info({ take }, "Created take");
  } catch (err) {
    logger.error(`Failed to create take: ${err}`);
    throw err;
  }
}
