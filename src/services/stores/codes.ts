class CodeStore {
  private items: string[] = [];

  add(value: string): void {
    this.items.push(value);
  }

  remove(value: string): void {
    this.items = this.items.filter(item => item !== value);
  }

  find(value: string): boolean {
    return this.items.includes(value);
  }

  getAll(): string[] {
    return [...this.items];
  }
}

export const codeStore = new CodeStore();
