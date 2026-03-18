import { useNavigate } from "react-router-dom";
import { Star, ChevronRight, LogOut, Moon, Sun, Car, Shield, HelpCircle, Bell, Pencil, CreditCard, DollarSign } from "lucide-react";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

export default function Profile() {
  const { user, setUser, isDarkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };

  const menuItems = [
    { icon: Pencil, label: "Edit Profile", show: true, path: "/edit-profile" },
    { icon: CreditCard, label: "Payment Methods", show: user?.role === "CUSTOMER", path: "/payment-methods" },
    { icon: DollarSign, label: "Earnings", show: user?.role === "DRIVER", path: "/earnings" },
    { icon: Car, label: "Vehicle Info", show: user?.role === "DRIVER", path: "/edit-profile" },
    { icon: Shield, label: "Safety", show: true },
    { icon: Bell, label: "Notifications", show: true },
    { icon: HelpCircle, label: "Help & Support", show: true },
  ].filter((item) => item.show);

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        <h1 className="mb-6 text-2xl font-bold">Profile</h1>

        {/* Profile card */}
        <div className="mb-6 flex items-center gap-4 rounded-xl border border-border bg-card p-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {user?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("") || "U"}
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold">{user?.name || "User"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium capitalize text-primary">
                {user?.role}
              </span>
              {user?.rating && (
                <div className="flex items-center gap-1">
                  <Star size={12} className="fill-accent text-accent" />
                  <span className="text-xs font-medium">{user.rating}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleDarkMode}
          className="mb-4 flex w-full items-center justify-between rounded-xl border border-border bg-card p-4"
        >
          <div className="flex items-center gap-3">
            {isDarkMode ? <Moon size={20} /> : <Sun size={20} />}
            <span className="font-medium">
              {isDarkMode ? "Dark Mode" : "Light Mode"}
            </span>
          </div>
          <div
            className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
              isDarkMode ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`h-5 w-5 rounded-full bg-card shadow transition-transform ${
                isDarkMode ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </div>
        </button>

        {/* Menu items */}
        <div className="mb-6 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => item.path && navigate(item.path)}
              className="flex w-full items-center justify-between rounded-xl p-4 transition-colors hover:bg-secondary"
            >
              <div className="flex items-center gap-3">
                <item.icon size={20} className="text-muted-foreground" />
                <span className="font-medium">{item.label}</span>
              </div>
              <ChevronRight size={18} className="text-muted-foreground" />
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut size={20} />
          Sign Out
        </Button>
      </div>
      <BottomNav />
    </div>
  );
}
