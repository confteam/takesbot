import { BotType } from "../../enums";

interface ChannelChats {
  adminChatId: string;
  channelChatId: string;
  discussionChatId: string;
}

export interface UpdateChannelDto extends ChannelChats { }

export interface CreateChannelDto extends ChannelChats {
  botTgId: string;
  botType: BotType;
  code: string;
}
