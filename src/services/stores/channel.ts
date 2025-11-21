import { Channel } from "../../types/channel";
import { logger } from "../../utils/logger";

class ChannelStore {
  private channel: Channel = {
    id: 0,
    code: "",
    channelChatId: 0,
    adminChatId: 0,
    discussionsChatId: 0,
    decorations: "",
  };

  set = (channel: Channel) => {
    this.channel = channel;
  }

  update = (partial: Partial<Channel>) => {
    Object.assign(this.channel, partial);
  }

  get = (): Channel => {
    logger.info(this.channel)
    return this.channel;
  }
}

export const channelStore = new ChannelStore();
