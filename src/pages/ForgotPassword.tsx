import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = () => {
    if (!email) return;
    setSent(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background px-8 pt-16">
      <button onClick={() => navigate(-1)} className="mb-8 self-start text-sm text-muted-foreground">
        <ArrowLeft size={18} className="inline mr-1" /> Back
      </button>

      {!sent ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h2 className="mb-2 text-2xl font-bold">Reset Password</h2>
          <p className="mb-8 text-muted-foreground">
            Enter your email and we'll send you a link to reset your password.
          </p>
          <div className="relative mb-4">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button size="lg" className="w-full text-base font-semibold" onClick={handleSubmit} disabled={!email}>
            Send Reset Link
          </Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center pt-12 text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check size={32} className="text-primary" />
          </div>
          <h2 className="mb-2 text-2xl font-bold">Check your email</h2>
          <p className="mb-8 text-muted-foreground">
            We've sent a password reset link to <span className="font-medium text-foreground">{email}</span>
          </p>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back to Sign In
          </Button>
        </motion.div>
      )}
    </div>
  );
}
