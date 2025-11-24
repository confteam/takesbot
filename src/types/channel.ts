export type Channel = {
  id: number;
  code: string;
  channelChatId: number;
  adminChatId: number;
  discussionsChatId: number;
  decorations: string;
}

export type ChannelWithoutCode = {
  id: number;
  channelChatId: number;
  adminChatId: number;
  discussionsChatId: number;
  decorations: string;
}

export type ChannelWithoutId = {
  code: string;
  channelChatId: number;
  adminChatId: number;
  discussionsChatId: number;
  decorations: string;
}
