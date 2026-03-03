import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, Phone, Car, Users, ArrowRight, MapPin } from "lucide-react";
import { useApp, UserRole } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type AuthStep = "welcome" | "login" | "signup" | "role";

export default function Auth() {
  const [step, setStep] = useState<AuthStep>("welcome");
  const [role, setRole] = useState<UserRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const { setUser } = useApp();
  const navigate = useNavigate();

  const handleAuth = () => {
    if (step === "login" || step === "signup") {
      if (step === "signup") {
        setStep("role");
        return;
      }
      // Mock login
      setUser({
        id: "1",
        name: name || "User",
        email,
        phone: "",
        role: "customer",
        rating: 4.8,
        totalRides: 42,
      });
      navigate("/home");
    }
  };

  const selectRole = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setUser({
      id: "1",
      name,
      email,
      phone: "",
      role: selectedRole,
      rating: 5.0,
      totalRides: 0,
    });
    navigate("/home");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AnimatePresence mode="wait">
        {step === "welcome" && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-1 flex-col items-center justify-center px-8"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/30"
            >
              <MapPin size={36} className="text-primary-foreground" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mb-2 text-3xl font-bold tracking-tight"
            >
              RideFlow
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-12 text-center text-muted-foreground"
            >
              Your ride, your way. Connect with drivers instantly.
            </motion.p>
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex w-full max-w-xs flex-col gap-3"
            >
              <Button
                size="lg"
                className="w-full text-base font-semibold"
                onClick={() => setStep("signup")}
              >
                Get Started
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                variant="ghost"
                size="lg"
                className="w-full text-base"
                onClick={() => setStep("login")}
              >
                I already have an account
              </Button>
            </motion.div>
          </motion.div>
        )}

        {(step === "login" || step === "signup") && (
          <motion.div
            key="auth-form"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-1 flex-col px-8 pt-16"
          >
            <button
              onClick={() => setStep("welcome")}
              className="mb-8 self-start text-sm text-muted-foreground"
            >
              ← Back
            </button>
            <h2 className="mb-2 text-2xl font-bold">
              {step === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="mb-8 text-muted-foreground">
              {step === "login"
                ? "Sign in to continue your journey"
                : "Join RideFlow in seconds"}
            </p>
            <div className="flex flex-col gap-4">
              {step === "signup" && (
                <div className="relative">
                  <Users
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              )}
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
              {step === "signup" && (
                <div className="relative">
                  <Phone
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input placeholder="Phone number" className="pl-10" />
                </div>
              )}
              <Button
                size="lg"
                className="mt-2 w-full text-base font-semibold"
                onClick={handleAuth}
              >
                {step === "login" ? "Sign In" : "Continue"}
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </div>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              {step === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                className="font-medium text-primary"
                onClick={() => setStep(step === "login" ? "signup" : "login")}
              >
                {step === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </motion.div>
        )}

        {step === "role" && (
          <motion.div
            key="role"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-1 flex-col items-center px-8 pt-20"
          >
            <h2 className="mb-2 text-2xl font-bold">How will you use RideFlow?</h2>
            <p className="mb-10 text-muted-foreground">You can change this later</p>
            <div className="flex w-full max-w-sm flex-col gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectRole("customer")}
                className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10">
                  <Users size={28} className="text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">I need a ride</h3>
                  <p className="text-sm text-muted-foreground">
                    Request rides and get picked up
                  </p>
                </div>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => selectRole("driver")}
                className="flex items-center gap-4 rounded-xl border-2 border-border bg-card p-5 text-left transition-colors hover:border-primary"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <Car size={28} className="text-accent" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">I'm a driver</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept rides and earn money
                  </p>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
