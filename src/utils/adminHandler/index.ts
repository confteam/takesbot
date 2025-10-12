export function removeTakeAuthor(take: string): string {
  return take.replace(/\Тейк от:.*$/, "");
}
