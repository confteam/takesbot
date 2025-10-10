/*model Channel {
  id               Int    @id @default(autoincrement())
  code             String @unique
  channelChatId        String?
  adminChatId      String?
  discussionChatId String?

  bots   Bot[]
  users  UserChannel[]
  takes  Take[]
}*/

export type Channel = {
  id: number;
  code: string;
  channelChatId: string;
  adminChatId: string;
  discussionChatId: string;
}
