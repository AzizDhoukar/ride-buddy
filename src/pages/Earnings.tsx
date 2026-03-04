import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, DollarSign, Clock, Car, ChevronRight, Download, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

type TimePeriod = "today" | "week" | "month";

const earningsData = {
  today: { total: 127.5, rides: 8, hours: 5.2, tips: 22.0 },
  week: { total: 842.0, rides: 52, hours: 34.5, tips: 148.0 },
  month: { total: 3280.0, rides: 198, hours: 142.0, tips: 580.0 },
};

const recentRides = [
  { id: "1", pickup: "123 Main St", destination: "Central Mall", earning: 18.5, time: "2:30 PM", distance: "4.2 km" },
  { id: "2", pickup: "Airport T1", destination: "Hotel Grand", earning: 35.0, time: "12:15 PM", distance: "12.8 km" },
  { id: "3", pickup: "Office Park", destination: "Riverside", earning: 12.0, time: "10:00 AM", distance: "3.1 km" },
  { id: "4", pickup: "University", destination: "Downtown", earning: 22.0, time: "8:45 AM", distance: "6.5 km" },
  { id: "5", pickup: "Hospital", destination: "Suburb", earning: 28.5, time: "Yesterday", distance: "9.2 km" },
];

const payoutHistory = [
  { id: "1", date: "Mar 1, 2026", amount: 842.0, status: "completed" },
  { id: "2", date: "Feb 22, 2026", amount: 756.5, status: "completed" },
  { id: "3", date: "Feb 15, 2026", amount: 920.0, status: "completed" },
];

export default function Earnings() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<TimePeriod>("today");
  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings");
  const data = earningsData[period];

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Earnings</h1>
        </div>

        {/* Earnings summary card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-primary p-6 text-primary-foreground"
        >
          {/* Period selector */}
          <div className="mb-4 flex rounded-xl bg-primary-foreground/10 p-1">
            {(["today", "week", "month"] as TimePeriod[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold capitalize transition-colors ${
                  period === p ? "bg-primary-foreground/20" : "hover:bg-primary-foreground/5"
                }`}
              >
                {p === "today" ? "Today" : p === "week" ? "This Week" : "This Month"}
              </button>
            ))}
          </div>

          <div className="mb-1 text-sm opacity-80">Total Earnings</div>
          <div className="mb-4 text-4xl font-bold">${data.total.toFixed(2)}</div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
              <Car size={16} className="mx-auto mb-1" />
              <p className="text-lg font-bold">{data.rides}</p>
              <p className="text-[10px] opacity-70">Rides</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
              <Clock size={16} className="mx-auto mb-1" />
              <p className="text-lg font-bold">{data.hours}h</p>
              <p className="text-[10px] opacity-70">Online</p>
            </div>
            <div className="rounded-xl bg-primary-foreground/10 p-3 text-center">
              <TrendingUp size={16} className="mx-auto mb-1" />
              <p className="text-lg font-bold">${data.tips}</p>
              <p className="text-[10px] opacity-70">Tips</p>
            </div>
          </div>
        </motion.div>

        {/* Tab switcher */}
        <div className="mb-4 flex rounded-xl bg-secondary p-1">
          <button
            onClick={() => setActiveTab("earnings")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              activeTab === "earnings" ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            Ride Earnings
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`flex-1 rounded-lg py-2 text-sm font-semibold transition-colors ${
              activeTab === "payouts" ? "bg-card shadow-sm" : "text-muted-foreground"
            }`}
          >
            Payout History
          </button>
        </div>

        {activeTab === "earnings" ? (
          <div className="space-y-2">
            {recentRides.map((ride, i) => (
              <motion.div
                key={ride.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign size={18} className="text-primary" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-sm font-semibold">{ride.pickup} → {ride.destination}</p>
                  <p className="text-xs text-muted-foreground">{ride.time} · {ride.distance}</p>
                </div>
                <p className="text-sm font-bold text-primary">+${ride.earning.toFixed(2)}</p>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Payout settings */}
            <button className="flex w-full items-center justify-between rounded-xl border border-border bg-card p-4 transition-colors hover:bg-secondary">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Download size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Payout Settings</p>
                  <p className="text-xs text-muted-foreground">Bank Account •••• 5678</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>

            <div className="my-3 flex items-center gap-2">
              <Calendar size={14} className="text-muted-foreground" />
              <p className="text-sm font-medium text-muted-foreground">Recent Payouts</p>
            </div>

            {payoutHistory.map((payout, i) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-4"
              >
                <div>
                  <p className="text-sm font-semibold">${payout.amount.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{payout.date}</p>
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold capitalize text-primary">
                  {payout.status}
                </span>
              </motion.div>
            ))}

            <Button variant="outline" className="mt-2 w-full gap-2">
              <Download size={16} />
              Download Statement
            </Button>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
