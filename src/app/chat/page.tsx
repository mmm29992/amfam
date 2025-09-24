"use client";

import ChatBox from "../components/ChatBox";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import DynamicHeader from "../components/Header/DynamicHeader";
import socket from "@/socket";
import { Info } from "lucide-react"; // or use another icon library

type Client = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  userType: "client" | "employee" | "owner";
  createdAt?: string;
  updatedAt?: string;
};

type Conversation = {
  _id: string;
  clientId: string;
  assignedEmployeeId?: string;
  messages: {
    senderId: string;
    message: string;
    isSystem: boolean;
    seenBy?: string[];
    timestamp: string; // ✅ ADD THIS LINE
  }[];
};

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [convo, setConvo] = useState<Conversation | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [convos, setConvos] = useState<Conversation[]>([]);

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMsg(e.target.value);
    if (convo) {
      socket.emit("typing", {
        convoId: convo._id,
        userId: currentUserId,
        isTyping: true,
      });

      setTimeout(() => {
        socket.emit("typing", {
          convoId: convo._id,
          userId: currentUserId,
          isTyping: false,
        });
      }, 1500);
    }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !convo) return;

    const payload = { message: newMsg };

    await api.post(`/conversations/convo/${convo._id}/message`, payload);
    const res = await api.get("/conversations/all");
    setConvos(res.data);

    socket.emit("sendMessage", {
      convoId: convo._id,
      message: {
        ...payload,
        senderId: currentUserId, // 👈 add this so your local echo has correct alignment
      },
    });
    setNewMsg("");

    socket.emit("typing", {
      convoId: convo._id,
      userId: currentUserId,
      isTyping: false,
    });
  };

  useEffect(() => {
    const fetchUserAndClients = async () => {
      const res = await api.get("/auth/me");
      const user = res.data.user;
      setCurrentUserId(user._id);

      if (user.userType === "client") {
        const clientProfile: Client = {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          username: user.username,
          userType: user.userType,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };
        setSelectedClient(clientProfile);
      } else {
        const clientRes = await api.get("/auth/clients");
        setClients(clientRes.data);

        const convoRes = await api.get("/conversations/all");
        setConvos(convoRes.data);
      }
    };

    fetchUserAndClients();
  }, []);

  useEffect(() => {
    if (!currentUserId) return;

    const handleReceive = () => {
      api.get("/conversations/all").then((res) => setConvos(res.data));
    };

    socket.on("receiveMessage", handleReceive);

    return () => {
      socket.off("receiveMessage", handleReceive);
    };
  }, [currentUserId]);


  // Join the socket room whenever the active convo changes
  useEffect(() => {
    if (!convo?._id) return;
    socket.emit("joinConversation", convo._id);
  }, [convo?._id]);

  // ✅ Place this helper function HERE:
  const getConvoForClient = (clientId: string) => {
    return convos.find((c) => c.clientId === clientId);
  };

  const getClientScore = (client: Client) => {
    const convo = getConvoForClient(client._id);
    if (!convo) return 0;

    const hasUnread = convo.messages.some(
      (msg) =>
        msg.senderId !== currentUserId && !msg.seenBy?.includes(currentUserId!)
    );

    const assignedTo = convo.assignedEmployeeId;
    const isMine = assignedTo === currentUserId;
    const isAssigned = !!assignedTo;

    if (!isAssigned && hasUnread) return 5;
    if (isAssigned && hasUnread && isMine) return 4;
    if (isAssigned && !hasUnread && isMine) return 3;
    if (isAssigned && hasUnread && !isMine) return 2;
    return 1;
  };

  return (
    <div className="h-screen flex flex-col">
      <DynamicHeader />

      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* LEFT SIDEBAR */}
        {clients.length > 0 && (
          <div className="w-[320px] bg-white border-r flex flex-col">
            {/* Header with Inbox + Search Bar */}
            <div className="p-4 border-b flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Inbox</h2>

              <div className="relative flex-1 ml-auto">
                <span className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
                  <img
                    src="/searchicon.svg"
                    alt="Search"
                    className="w-4 h-4 text-gray-400"
                  />
                </span>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filtered client list */}
            <div className="flex-1 overflow-y-auto">
              {clients
                .filter((client) => {
                  const fullName =
                    `${client.firstName} ${client.lastName}`.toLowerCase();
                  return fullName.includes(searchQuery.toLowerCase());
                })
                .sort((a, b) => {
                  const scoreDiff = getClientScore(b) - getClientScore(a);
                  if (scoreDiff !== 0) return scoreDiff;

                  const convoA = getConvoForClient(a._id);
                  const convoB = getConvoForClient(b._id);

                  const timeA =
                    convoA?.messages?.[convoA.messages.length - 1]?.timestamp;
                  const timeB =
                    convoB?.messages?.[convoB.messages.length - 1]?.timestamp;

                  return (
                    new Date(timeB || 0).getTime() -
                    new Date(timeA || 0).getTime()
                  );
                })
                .map((client) => {
                  const convo = getConvoForClient(client._id);
                  const score = getClientScore(client);
                  const hasName =
                    client.firstName?.trim() || client.lastName?.trim();
                  const fullName = `${client.firstName || ""} ${
                    client.lastName || ""
                  }`.trim();

                  return (
                    <div
                      key={client._id}
                      onClick={async () => {
                        setSelectedClient(client);
                        const convo = getConvoForClient(client._id);
                        if (convo) {
                          try {
                            await api.patch(
                              `/conversations/convo/${convo._id}/seen`
                            );
                          } catch (err) {
                            console.error("Failed to mark as seen:", err);
                          }
                        }
                      }}
                      className={`cursor-pointer px-4 py-3 border-b hover:bg-gray-50 relative ${
                        client._id === selectedClient?._id
                          ? "bg-gray-100 font-semibold"
                          : ""
                      }`}
                    >
                      {/* === NAME/EMAIL === */}
                      <p className="font-medium text-gray-800 truncate">
                        {hasName ? fullName : client.email}
                      </p>

                      {/* === MESSAGE + TIME === */}
                      <div className="flex justify-between items-center gap-2 mt-1">
                        <p className="text-sm text-gray-500 truncate max-w-[200px] overflow-hidden">
                          {convo?.messages?.[convo.messages.length - 1]
                            ?.message || "(No messages yet)"}
                        </p>
                        <p className="text-xs text-gray-400 whitespace-nowrap">
                          {convo?.messages?.[convo.messages.length - 1]
                            ?.timestamp
                            ? new Date(
                                convo.messages[
                                  convo.messages.length - 1
                                ].timestamp
                              ).toLocaleTimeString([], {
                                hour: "numeric",
                                minute: "2-digit",
                              })
                            : ""}
                        </p>
                      </div>

                      {/* === NOTIFICATION DOTS with updated tooltips === */}
                      {score >= 5 && (
                        <span
                          title="Unassigned chat with unread message(s) on the employee side"
                          className="absolute top-4 right-4 w-2.5 h-2.5 bg-red-500 rounded-full"
                        />
                      )}
                      {score === 4 && (
                        <span
                          title="Assigned to you — unread message(s) you haven’t seen"
                          className="absolute top-4 right-4 w-2.5 h-2.5 bg-yellow-400 rounded-full"
                        />
                      )}
                      {score === 2 && (
                        <span
                          title="Assigned to another employee — unread message(s) on the employee side"
                          className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full"
                        />
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {currentUserId && selectedClient ? (
          <div className="flex flex-col flex-1 min-h-0 bg-gray-50 border-l">
            {/* Messaging Center Title */}
            <div className="p-4 border-b bg-white">
              <h1 className="text-xl font-bold text-gray-800">
                Messaging Center
              </h1>
            </div>

            {/* Conversation header (who you're talking to) */}
            <div className="p-4 border-b bg-white flex relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                {(() => {
                  const convo = getConvoForClient(selectedClient._id);
                  if (!convo) return null;

                  const isAssignedToMe =
                    convo.assignedEmployeeId === currentUserId;
                  const isUnassigned = !convo.assignedEmployeeId;

                  return (
                    <>
                      {isUnassigned && (
                        <button
                          onClick={async () => {
                            await api.patch(
                              `/conversations/convo/${convo._id}/assign`
                            );
                            const res = await api.get("/conversations/all");
                            setConvos(res.data);
                            const updatedConvo = await api.get(
                              `/conversations/convo/${convo._id}`
                            );
                            setConvo(updatedConvo.data);
                          }}
                          className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                          Claim Chat
                        </button>
                      )}
                      {isAssignedToMe && (
                        <button
                          onClick={async () => {
                            await api.patch(
                              `/conversations/convo/${convo._id}/unassign`
                            );
                            const res = await api.get("/conversations/all");
                            setConvos(res.data);
                            const updatedConvo = await api.get(
                              `/conversations/convo/${convo._id}`
                            );
                            setConvo(updatedConvo.data);
                          }}
                          className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                        >
                          Unassign
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="mx-auto flex items-center gap-2 text-sm text-gray-600">
                <p>
                  Talking to:{" "}
                  <span className="font-semibold">
                    {selectedClient.firstName || selectedClient.lastName
                      ? `${selectedClient.firstName || ""} ${
                          selectedClient.lastName || ""
                        }`.trim()
                      : selectedClient.email}
                  </span>
                </p>
                <button
                  onClick={() => setShowInfoModal(true)}
                  className="text-gray-500 hover:text-blue-600"
                  aria-label="Client Info"
                >
                  <Info size={18} />
                </button>
              </div>
            </div>

            {/* Scrollable chat box */}
            <div className="flex-1 overflow-y-auto">
              <ChatBox
                currentUserId={currentUserId}
                clientId={selectedClient._id}
                className="h-full"
                onConvoLoaded={(c: Conversation) => setConvo(c)}
              />
            </div>

            {/* Fixed input bar */}
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  value={newMsg}
                  onChange={handleTyping}
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
        ) : (
          <div className="flex items-center justify-center flex-1 text-gray-500">
            Select a client to begin chatting.
          </div>
        )}
      </div>
      {showInfoModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-transparent z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-900">
              Client Info
            </h2>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>First Name:</strong> {selectedClient?.firstName}
              </p>
              <p>
                <strong>Last Name:</strong> {selectedClient?.lastName}
              </p>
              <p>
                <strong>Username:</strong> {selectedClient?.username}
              </p>
              <p>
                <strong>Email:</strong> {selectedClient?.email}
              </p>
              <p>
                <strong>User Type:</strong> {selectedClient?.userType}
              </p>
              <p>
                <strong>Created At:</strong>{" "}
                {selectedClient?.createdAt
                  ? new Date(selectedClient.createdAt).toLocaleString()
                  : "—"}
              </p>
              <p>
                <strong>Last Updated:</strong>{" "}
                {selectedClient?.updatedAt
                  ? new Date(selectedClient.updatedAt).toLocaleString()
                  : "—"}
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
