/*model User {
  id      Int    @id @default(autoincrement())
  tgid    String @unique
  chatId  String?
  channels UserChannel[]
}*/

export type User = {
  id: number;
  tgid: string;
  chatId: string;
}
