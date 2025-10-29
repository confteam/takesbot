import { MessageContext } from "puregram";

class AdminSettingsHandler {
  async settings(ctx: MessageContext)
}

export const adminSettingsHandler = new AdminSettingsHandler();
