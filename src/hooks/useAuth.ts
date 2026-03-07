
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { login as apiLogin, signup as apiSignup } from "@/services/api";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken } = useApp(); // Added setToken
  const navigate = useNavigate();

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await apiLogin(email, password);
      console.log('user', user);

      setUser(user);
      navigate("/home");
    } catch (err) {
      console.log('err', err);
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (name: string, email: string, phone: string, password: string, role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await apiSignup(name, email, phone, password, role); // Destructure user and token
      setToken(token); // Set the token
      setUser(user); // Set the user
      return user;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    handleLogin,
    handleSignup,
  };
};
