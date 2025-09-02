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
        scrollToBottom("auto"); // ✅ instant on load
      } catch (err) {
        console.error("Failed to fetch convo:", err);
      }
    };

    fetchConvo();
  }, [clientId]);

  useEffect(() => {
    scrollToBottom(); // ✅ smooth scroll on new messages
  }, [messages]);

  useEffect(() => {
    socket.on("receiveMessage", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

socket.on("typingStatus", ({ userId, isTyping }: TypingStatusPayload) => {
  if (userId !== currentUserId) setIsTyping(isTyping);
});

    return () => {
      socket.off("receiveMessage");
      socket.off("typingStatus");
    };
  }, [currentUserId]);

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
