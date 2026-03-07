
import { UserRole } from "@/contexts/AppContext";
import { useApp } from "@/contexts/AppContext";

const API_BASE_URL = "http://localhost:9090/api";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  rating: number;
  totalRides: number;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface SignupResponse {
  token: string,
  userId: string,
  email: string,
  role: string
}

export const login = async (email: string, password: string): Promise<LoginResponse> => {
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

export const signup = async (name: string, email: string, phone: string, password: string, role: UserRole): Promise<SignupResponse> => {
  const { setToken, setUser } = useApp();
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
    name: result.name,
    email: result.email,
    phone: phone,
    role: result.role,
  });

  return result;
};
