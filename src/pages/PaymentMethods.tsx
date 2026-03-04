import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Banknote, Plus, Check, Trash2, ArrowLeft, Wallet, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";

interface PaymentMethod {
  id: string;
  type: "cash" | "card" | "bank";
  label: string;
  detail: string;
  icon: typeof CreditCard;
  isDefault: boolean;
}

const initialMethods: PaymentMethod[] = [
  { id: "1", type: "cash", label: "Cash", detail: "Pay driver directly", icon: Banknote, isDefault: true },
  { id: "2", type: "card", label: "Visa •••• 4242", detail: "Expires 12/26", icon: CreditCard, isDefault: false },
];

export default function PaymentMethods() {
  const navigate = useNavigate();
  const [methods, setMethods] = useState<PaymentMethod[]>(initialMethods);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addType, setAddType] = useState<"card" | "bank" | null>(null);

  const setDefault = (id: string) => {
    setMethods((prev) =>
      prev.map((m) => ({ ...m, isDefault: m.id === id }))
    );
  };

  const removeMethod = (id: string) => {
    setMethods((prev) => prev.filter((m) => m.id !== id && m.type !== "cash"));
  };

  const addMethod = (type: "card" | "bank") => {
    const newMethod: PaymentMethod = {
      id: Date.now().toString(),
      type,
      label: type === "card" ? "Mastercard •••• 8888" : "Bank Account •••• 5678",
      detail: type === "card" ? "Expires 03/28" : "Savings Account",
      icon: type === "card" ? CreditCard : Building2,
      isDefault: false,
    };
    setMethods((prev) => [...prev, newMethod]);
    setShowAddForm(false);
    setAddType(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        <div className="mb-6 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold">Payment Methods</h1>
        </div>

        {/* Notice */}
        <div className="mb-6 rounded-xl border border-accent/30 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <Wallet size={20} className="mt-0.5 text-accent" />
            <div>
              <p className="text-sm font-medium">Offline Payment</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Payment is handled directly between driver and customer. These saved methods are for your records only.
              </p>
            </div>
          </div>
        </div>

        {/* Methods list */}
        <div className="space-y-3">
          <AnimatePresence>
            {methods.map((method) => (
              <motion.div
                key={method.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -100 }}
                className={`flex items-center gap-3 rounded-xl border p-4 transition-colors ${
                  method.isDefault ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  method.isDefault ? "bg-primary/10" : "bg-secondary"
                }`}>
                  <method.icon size={20} className={method.isDefault ? "text-primary" : "text-muted-foreground"} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.detail}</p>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault ? (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-semibold text-primary">
                      Default
                    </span>
                  ) : (
                    <>
                      <button
                        onClick={() => setDefault(method.id)}
                        className="rounded-full p-1.5 transition-colors hover:bg-secondary"
                        title="Set as default"
                      >
                        <Check size={16} className="text-muted-foreground" />
                      </button>
                      {method.type !== "cash" && (
                        <button
                          onClick={() => removeMethod(method.id)}
                          className="rounded-full p-1.5 transition-colors hover:bg-destructive/10"
                          title="Remove"
                        >
                          <Trash2 size={16} className="text-destructive" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Add method */}
        <AnimatePresence mode="wait">
          {!showAddForm ? (
            <motion.div key="add-btn" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Button
                variant="outline"
                className="mt-4 w-full gap-2"
                onClick={() => setShowAddForm(true)}
              >
                <Plus size={18} />
                Add Payment Method
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="add-form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-4 rounded-xl border border-border bg-card p-4"
            >
              {!addType ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">Choose type</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setAddType("card")}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <CreditCard size={24} className="text-primary" />
                      <span className="text-sm font-medium">Card</span>
                    </button>
                    <button
                      onClick={() => setAddType("bank")}
                      className="flex flex-1 flex-col items-center gap-2 rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-primary/5"
                    >
                      <Building2 size={24} className="text-primary" />
                      <span className="text-sm font-medium">Bank</span>
                    </button>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold">
                    {addType === "card" ? "Add Card" : "Add Bank Account"}
                  </p>
                  {addType === "card" ? (
                    <>
                      <Input placeholder="Card number" />
                      <div className="flex gap-3">
                        <Input placeholder="MM/YY" className="flex-1" />
                        <Input placeholder="CVV" className="flex-1" />
                      </div>
                      <Input placeholder="Cardholder name" />
                    </>
                  ) : (
                    <>
                      <Input placeholder="Account holder name" />
                      <Input placeholder="Account number" />
                      <Input placeholder="Routing number" />
                    </>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => { setAddType(null); setShowAddForm(false); }}>
                      Cancel
                    </Button>
                    <Button className="flex-1" onClick={() => addMethod(addType)}>
                      Add
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <BottomNav />
    </div>
  );
}
