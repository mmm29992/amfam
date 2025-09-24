"use client";
import socket from "@/socket";
import api from "@/lib/api";
import { useEffect, useRef, useState } from "react";

type Message = {
  senderId: string;
  message: string;
  isSystem: boolean;
  seenBy?: string[];
  timestamp: string;
  convoId?: string; // ✅ optional: helps us filter/append safely
};

type ReceivePayload = {
  convoId?: string;
  message?: { message?: string; text?: string; senderId?: string };
  text?: string;
  senderId?: string;
};


type TypingStatusPayload = {
  userId: string;
  isTyping: boolean;
};

type Conversation = {
  _id: string;
  clientId: string;
  assignedEmployeeId?: string;
  messages: Message[];
};

type ChatBoxProps = {
  currentUserId: string;
  clientId: string;
  className?: string;
  onConvoLoaded?: (convo: Conversation) => void;
};

export default function ChatBox({
  currentUserId,
  clientId,
  className = "",
  onConvoLoaded = () => {},
}: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  console.log("Loaded convo:", convo);

  useEffect(() => {
    const fetchConvo = async () => {
      try {
        const res = await api.get(`/conversations/convo/${clientId}`);
        setConvo(res.data);
        setMessages(res.data.messages || []);
        socket.emit("register", currentUserId);
        socket.emit("joinConversation", res.data._id);
        onConvoLoaded(res.data);
        scrollToBottom("auto");
      } catch (err) {
        console.error("Failed to fetch convo:", err);
      }
    };

    if (clientId) fetchConvo();
    // deps: include everything we read inside
  }, [clientId, currentUserId, onConvoLoaded]);


  useEffect(() => {
    scrollToBottom(); // ✅ smooth scroll on new messages
  }, [messages]);

  useEffect(() => {
    if (!convo?._id) return;

    const onReceive = (payload: ReceivePayload) => {
      const incomingConvoId = payload?.convoId;
      if (incomingConvoId && incomingConvoId !== convo._id) return;

      const text =
        payload?.text ??
        payload?.message?.message ??
        payload?.message?.text ??
        "";

      const senderId = payload?.senderId ?? payload?.message?.senderId ?? "";

      if (!text) return;

      setMessages((prev) => [
        ...prev,
        {
          senderId,
          message: text,
          isSystem: false,
          timestamp: new Date().toISOString(),
          convoId: incomingConvoId ?? convo._id,
        },
      ]);
    };

    const onTyping = ({ userId, isTyping }: TypingStatusPayload) => {
      if (userId !== currentUserId) setIsTyping(isTyping);
    };

    socket.on("receiveMessage", onReceive);
    socket.on("typingStatus", onTyping);

    return () => {
      socket.off("receiveMessage", onReceive);
      socket.off("typingStatus", onTyping);
    };
  }, [convo?._id, currentUserId]);


  return (
    <div className={`flex flex-col flex-1 ${className}`}>
      <div className="px-4 py-4 space-y-4 overflow-y-auto">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`${
              msg.senderId === currentUserId ? "text-right" : "text-left"
            }`}
          >
            {msg.isSystem ? (
              <div className="text-center text-gray-500 italic">
                {msg.message}
              </div>
            ) : (
              <span className="inline-block bg-blue-100 text-blue-900 px-3 py-2 rounded-lg">
                {msg.message}
              </span>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="text-sm italic text-gray-400">Typing...</div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
