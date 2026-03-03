import { MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const mockChats = [
  {
    id: "1",
    name: "Ahmed K.",
    lastMessage: "I'm at the pickup point",
    time: "2:32 PM",
    unread: 1,
  },
  {
    id: "2",
    name: "Maria L.",
    lastMessage: "Thank you for the ride!",
    time: "Yesterday",
    unread: 0,
  },
];

export default function Messages() {
  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        <h1 className="mb-6 text-2xl font-bold">Messages</h1>
        {mockChats.length > 0 ? (
          <div className="space-y-2">
            {mockChats.map((chat) => (
              <button
                key={chat.id}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-secondary"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted font-semibold">
                  {chat.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold">{chat.name}</p>
                    <span className="text-xs text-muted-foreground">{chat.time}</span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {chat.lastMessage}
                  </p>
                </div>
                {chat.unread > 0 && (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                    {chat.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center py-20 text-center">
            <MessageCircle size={48} className="mb-4 text-muted-foreground/30" />
            <p className="text-muted-foreground">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground/70">
              Chat will appear here during active rides
            </p>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
