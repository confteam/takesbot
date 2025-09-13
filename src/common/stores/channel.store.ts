import { Channel } from "../types/channel";

class ChannelStore {
  private channel: Channel = {
    id: 0,
    code: "",
    channelId: "",
    adminChatId: "",
    discussionId: ""
  };

  set = (channel: Channel) => {
    this.channel = channel;
  }

  update = (partial: Partial<Channel>) => {
    Object.assign(this.channel, partial);
  }

  get = (): Channel => {
    return this.channel;
  }
}

export const channelStore = new ChannelStore();
