
import { UserRole } from "@/contexts/AppContext";
import { useApp, User } from "@/contexts/AppContext";

const API_BASE_URL = "http://localhost:9090/api";

export const login = async (email: string, password: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login");
  }

  return response.json();
};

export const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<User> => {
  const { setToken, user, setUser } = useApp();
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, role }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to sign up");
  }
  const result = await response.json();

  setToken(result.token);
  setUser({
    id: result.userId,
    name: name,
    email: result.email,
    phone: phone,
    role: result.role,
  });

  return user;
};
