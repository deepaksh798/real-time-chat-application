import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set: any, get: any) => ({
  messages: [],
  typingUser: null,
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error: any) {
      toast.error("Store : getUsers : error : ", error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId: string) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      console.log("getMessages : ", res.data);

      set({ messages: res.data });
    } catch (error: any) {
      toast.error(
        "Store : getMessages : error : ",
        error.response.data.message
      );
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessages: async (messageData: any) => {
    const { selectedUser, messages }: any = get();

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error: any) {
      toast.error(
        "Store : sendMessages : error : ",
        error.response.data.message
      );
    }
  },

  subscribeToNewTyping: () => {
    console.log("we are in subscribeToNewTyping");
    const socket: any = useAuthStore.getState().socket;

    socket.on("userTyping", ({ senderId }: any) => {
      console.log("userTyping event received : ", senderId);
      set({ typingUser: senderId });
    });

    socket.on("userStopTyping", ({ senderId }: any) => {
      const { typingUser } = get();
      if (typingUser === senderId) {
        set({ typingUser: null });
      }
    });
  },

  unsubscribeFromTyping: () => {
    const socket: any = useAuthStore.getState().socket;
    socket.off("userTyping");
    socket.off("userStopTyping");
  },

  subscribeToNewMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket: any = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage: any) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromNewMessages: () => {
    const socket: any = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser: any) => {
    set({ selectedUser: selectedUser });
  },
}));
