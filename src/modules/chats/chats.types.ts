import { Channel } from "../../common/types/channel";
import { BotType } from "../../common/types/enums/botType";

export interface ChannelChats {
  adminChatId?: string;
  channelId?: string;
  discussionId?: string;
}

export interface UpdateChannelDto extends ChannelChats {
  id: number;
}

export interface CreateChannelDto extends ChannelChats {
  botTgId: string;
  botType: BotType;
  code?: string;
}

export interface CreateChannelResponse {
  channel: Channel;
}
