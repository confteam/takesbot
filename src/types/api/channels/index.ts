import { BotType } from "../../enums";

interface ChannelChats {
  adminChatId: number;
  channelChatId: number;
  discussionChatId: number;
}

export interface UpdateChannelDto extends ChannelChats {
  decorations: string;
}

export interface CreateChannelDto extends ChannelChats {
  botTgId: number;
  botType: BotType;
  code: string;
}
