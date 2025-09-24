"use client";

import { useEffect, useRef, useState } from "react"; // ✅ Add useRef
import api from "@/lib/api";
import socket from "@/socket";
import DynamicHeader from "../../components/Header/DynamicHeader";
import ChatBox from "../../components/ChatBox";

type ReceivePayload = {
  convoId?: string;
  message?: { message?: string; text?: string; senderId?: string };
  text?: string;
  senderId?: string;
};


export default function ClientMessagingPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [convoId, setConvoId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    const loadClientData = async () => {
      try {
        const userRes = await api.get("/auth/me");
        const userId = userRes.data.user._id;
        setCurrentUserId(userId);

        const convoRes = await api.get(
          `/conversations/convo/${userId}`
        );
        setConvoId(convoRes.data._id);

        socket.emit("register", userId);
        socket.emit("joinConversation", convoRes.data._id);
        scrollToBottom("auto"); // ✅ Scroll on initial load
      } catch (err) {
        console.error("Failed to load client messaging page:", err);
      }
    };

    loadClientData();
  }, []);

  useEffect(() => {
    const onReceive = (payload: ReceivePayload) => {
      if (payload?.convoId !== convoId) return;
      scrollToBottom();
    };

    socket.on("receiveMessage", onReceive);
    return () => {
      socket.off("receiveMessage", onReceive);
    };
  }, [convoId]);



  const handleSend = async () => {
    if (!newMsg.trim() || !convoId || !currentUserId) return;

    const payload = { message: newMsg };

    try {
      await api.post(
        `/conversations/convo/${convoId}/message`,
        payload
      );

      socket.emit("sendMessage", {
        convoId,
        message: {
          ...payload,
          senderId: currentUserId,
        },
      });

      setNewMsg("");
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!currentUserId || !convoId) {
    return <div className="p-4">Loading chat...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-white text-gray-900">
      <DynamicHeader />

      {/* Header */}
      <div className="p-4 border-b bg-white">
        <h1 className="text-xl font-bold text-gray-800">Support Chat</h1>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Scrollable message area */}
        <div className="flex-1 overflow-y-auto">
          <ChatBox
            currentUserId={currentUserId}
            clientId={currentUserId}
            className="h-full"
          />
          <div ref={messagesEndRef} /> {/* ✅ Scroll target */}
        </div>

        {/* Fixed input at the bottom */}
        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSend}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
