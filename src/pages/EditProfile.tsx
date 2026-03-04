import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, MapPin, Plus, Trash2, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useApp } from "@/contexts/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";

interface SavedLocation {
  id: string;
  label: string;
  address: string;
}

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, setUser } = useApp();

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([
    { id: "1", label: "Home", address: "123 Main Street, Apt 4B" },
    { id: "2", label: "Work", address: "456 Business Ave, Floor 12" },
  ]);
  const [newLabel, setNewLabel] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (user) {
      setUser({ ...user, name, email, phone });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const addLocation = () => {
    if (!newLabel || !newAddress) return;
    setSavedLocations((prev) => [
      ...prev,
      { id: Date.now().toString(), label: newLabel, address: newAddress },
    ]);
    setNewLabel("");
    setNewAddress("");
    setShowAddLocation(false);
  };

  const removeLocation = (id: string) => {
    setSavedLocations((prev) => prev.filter((l) => l.id !== id));
  };

  return (
    <div className="flex min-h-screen flex-col bg-background pb-20">
      <div className="safe-top px-6 pt-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="rounded-full p-1.5 transition-colors hover:bg-secondary">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-2xl font-bold">Edit Profile</h1>
          </div>
          <Button size="sm" onClick={handleSave} className="gap-1.5">
            <Save size={14} />
            {saved ? "Saved!" : "Save"}
          </Button>
        </div>

        {/* Avatar */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {name.split(" ").map((n) => n[0]).join("").slice(0, 2) || "U"}
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg">
              <Camera size={14} />
            </button>
          </div>
        </div>

        {/* Personal info */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Personal Information</h3>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Full Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 234 567 8900" />
            </div>
          </div>
        </div>

        {/* Vehicle info for drivers */}
        {user?.role === "driver" && (
          <div className="mb-8">
            <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Vehicle Information</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Make</label>
                  <Input defaultValue={user?.vehicle?.make || ""} placeholder="Toyota" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Model</label>
                  <Input defaultValue={user?.vehicle?.model || ""} placeholder="Camry" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Color</label>
                  <Input defaultValue={user?.vehicle?.color || ""} placeholder="White" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">License Plate</label>
                  <Input defaultValue={user?.vehicle?.plate || ""} placeholder="ABC 123" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted-foreground">Driver's License Number</label>
                <Input placeholder="DL-XXXX-XXXX" />
              </div>
            </div>
          </div>
        )}

        {/* Saved locations */}
        <div className="mb-8">
          <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Saved Locations</h3>
          <div className="space-y-2">
            {savedLocations.map((loc) => (
              <motion.div
                key={loc.id}
                layout
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <MapPin size={16} className="text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold">{loc.label}</p>
                  <p className="text-xs text-muted-foreground">{loc.address}</p>
                </div>
                <button onClick={() => removeLocation(loc.id)} className="rounded-full p-1.5 hover:bg-destructive/10">
                  <Trash2 size={14} className="text-destructive" />
                </button>
              </motion.div>
            ))}

            {showAddLocation ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 rounded-xl border border-border bg-card p-3"
              >
                <Input placeholder="Label (e.g., Gym)" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} />
                <Input placeholder="Address" value={newAddress} onChange={(e) => setNewAddress(e.target.value)} />
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => setShowAddLocation(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" className="flex-1" onClick={addLocation}>
                    Add
                  </Button>
                </div>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowAddLocation(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border p-3 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Plus size={16} />
                Add Location
              </button>
            )}
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
