import { MGmessage, MGmessages } from "../../types/MGmessages";

class MediaGroupsStore {
  private mediaGroups: MGmessages = {
    messages: [],
  }

  set = (mediaGroups: MGmessage[]) => {
    this.mediaGroups.messages = [...mediaGroups];
  }

  find = (id: string): MGmessage | undefined => {
    return this.mediaGroups.messages.find(m => m.id === id);
  }

  pushToMessages = (message: MGmessage) => {
    this.mediaGroups.messages.push(message);
  }
}

export const mediaGroupsStore = new MediaGroupsStore();
