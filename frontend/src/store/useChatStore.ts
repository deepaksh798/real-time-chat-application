import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set: any, get: any) => ({
  messages: [],
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

  subscribeToNewMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket: any = useAuthStore.getState().socket;

    // todo: optimize this one later
    socket.on("newMessage", (newMessage: any) => {
      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromNewMessages: () => {
    const socket: any = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  // todo: optimize later
  setSelectedUser: (user: any) => {
    set({ selectedUser: user });
  },
}));
