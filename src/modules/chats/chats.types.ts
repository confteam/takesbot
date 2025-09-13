import { BotType } from "../../common/types/enums/botType";

export interface ChannelChats {
  adminChatId?: string;
  channelId?: string;
  disussionId?: string;
}

export interface UpdateChannelDto extends ChannelChats {
  id: number;
  code?: string;
}

export interface CreateChannelDto extends ChannelChats {
  botTgId: string;
  botType: BotType;
  code?: string;
}
