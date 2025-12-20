import React, { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";

const TYPING_DELAY = 800;

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState<any>(null);

  const fileInputRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);
  const isTypingRef = useRef(false);

  const socket = useAuthStore((state: any) => state.socket);
  const { sendMessages, selectedUser }: any = useChatStore();

  // ---------------- TYPING HANDLER (DEBOUNCED) ----------------
  const handleTyping = (value: string) => {
    if (!socket || !selectedUser) return;

    // Emit typing only once
    if (!isTypingRef.current && value.trim()) {
      socket.emit("typing", {
        receiverId: selectedUser._id,
      });
      isTypingRef.current = true;
    }

    // Reset debounce timer
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after delay
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        receiverId: selectedUser._id,
      });
      isTypingRef.current = false;
    }, TYPING_DELAY);
  };

  // ---------------- IMAGE ----------------
  const handleImageChange = (e: any) => {
    const file = e.target.files[0];

    if (!file?.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = async (e: any) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    await sendMessages({
      text: text.trim(),
      image: imagePreview,
    });

    // Stop typing immediately on send
    socket?.emit("stopTyping", {
      receiverId: selectedUser._id,
    });
    isTypingRef.current = false;

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              handleTyping(e.target.value);
            }}
          />

          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
              ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>

        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
