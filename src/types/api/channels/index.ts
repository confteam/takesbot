interface ChannelChats {
  adminChatId: number;
  channelChatId: number;
  discussionsChatId: number;
}

export interface UpdateChannelDto extends ChannelChats {
  decorations: string;
}

export interface CreateChannelDto extends ChannelChats {
  code: string;
}

export interface GetAllUserChannelsResponse {
  id: number;
  channelChatId: number;
}
