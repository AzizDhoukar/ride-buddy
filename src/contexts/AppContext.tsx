import { createContext, useContext, useState, ReactNode } from "react";

export type UserRole = "CUSTOMER" | "DRIVER";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isOnline?: boolean;
  vehicle?: {
    make: string;
    model: string;
    color: string;
    plate: string;
  };
  rating?: number;
  totalRides?: number;
}

export type RideStatus = "idle" | "searching" | "accepted" | "arriving" | "in-progress" | "completed";

interface Ride {
  id: string;
  pickup: string;
  destination: string;
  status: RideStatus;
  driver?: Partial<User>;
  customer?: Partial<User>;
  estimatedTime?: number;
  distance?: string;
  rating?: number;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  token: string | null;
  setToken: (token: string | null) => void;
  isAuthenticated: boolean;
  currentRide: Ride | null;
  setCurrentRide: (ride: Ride | null) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  isDriverOnline: boolean;
  setIsDriverOnline: (online: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [currentRide, setCurrentRide] = useState<Ride | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isDriverOnline, setIsDriverOnline] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark");
  };

  // Initialize dark mode
  if (isDarkMode && !document.documentElement.classList.contains("dark")) {
    document.documentElement.classList.add("dark");
  }

  const [token, setTokenState] = useState<string | null>(
    localStorage.getItem("token")
  );

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem("token", newToken);
    } else {
      localStorage.removeItem("token");
    }

    setTokenState(newToken);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        token,
        setToken,
        isAuthenticated: !!user,
        currentRide,
        setCurrentRide,
        isDarkMode,
        toggleDarkMode,
        isDriverOnline,
        setIsDriverOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
}
