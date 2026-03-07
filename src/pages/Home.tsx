import { useApp } from "@/contexts/AppContext";
import CustomerHome from "./CustomerHome";
import DriverHome from "./DriverHome";

export default function Home() {
  const { user } = useApp();
  
  if (user?.role === "DRIVER") return <DriverHome />;
  return <CustomerHome />;
}
