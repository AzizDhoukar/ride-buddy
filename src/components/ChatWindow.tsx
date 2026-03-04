import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Image, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
  id: string;
  text: string;
  sender: "user" | "other";
  timestamp: string;
}

interface ChatWindowProps {
  recipientName: string;
  recipientInitials: string;
  onClose?: () => void;
  isEmbedded?: boolean;
  className?: string;
}

const mockMessages: Message[] = [
  { id: "1", text: "Hi! I'm on my way to the pickup point.", sender: "other", timestamp: "2:30 PM" },
  { id: "2", text: "Great, I'm waiting near the entrance.", sender: "user", timestamp: "2:31 PM" },
  { id: "3", text: "I can see you. I'm in a white Toyota Camry.", sender: "other", timestamp: "2:32 PM" },
];

export default function ChatWindow({
  recipientName,
  recipientInitials,
  onClose,
  isEmbedded = false,
  className = "",
}: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Simulate reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Got it, thanks! 👍",
          sender: "other",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className={`flex flex-col bg-card ${isEmbedded ? "rounded-t-3xl shadow-2xl" : "h-full"} ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {recipientInitials}
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold">{recipientName}</p>
          <p className="text-xs text-primary">Online</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
            <X size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: isEmbedded ? "300px" : undefined }}>
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-secondary text-secondary-foreground rounded-bl-sm"
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <p className={`mt-1 text-[10px] ${msg.sender === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {msg.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-border px-3 py-3">
        <div className="flex items-center gap-2">
          <button className="rounded-full p-2 transition-colors hover:bg-secondary">
            <Image size={18} className="text-muted-foreground" />
          </button>
          <div className="flex flex-1 items-center rounded-full bg-secondary px-4 py-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button className="ml-2">
              <Smile size={18} className="text-muted-foreground" />
            </button>
          </div>
          <Button size="icon" className="h-10 w-10 rounded-full" onClick={sendMessage} disabled={!input.trim()}>
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}
