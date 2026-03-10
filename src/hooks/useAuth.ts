
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, UserRole } from "@/contexts/AppContext";
import { login as apiLogin, signup as apiSignup, logout as apiLogout } from "@/services/api";

const TOKEN_COOKIE_NAME = "authToken";

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setUser, setToken, token } = useApp();
  const navigate = useNavigate();

  // Helper to set the auth token in a cookie
  const setAuthCookie = (token: string) => {
    document.cookie = `${TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
  };

  // Helper to remove the auth token cookie
  const removeAuthCookie = () => {
    document.cookie = `${TOKEN_COOKIE_NAME}=; path=/; max-age=0`;
  };

  // Helper to get the auth token from a cookie
  const getAuthCookie = () => {
    const name = `${TOKEN_COOKIE_NAME}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };

  useEffect(() => {
    const storedToken = getAuthCookie();
    if (storedToken && !token) {
      setToken(storedToken);
      // Optionally, you might want to call checkAuth here to validate the token and fetch user data
      // For now, we'll just set the token in context.
    }
  }, [token, setToken]);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { user, token } = await apiLogin(email, password);
      console.log('user', user);
      console.log('token', token);

      setToken(token);
      setUser(user);
      setAuthCookie(token); // Set the cookie
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
      setAuthCookie(token); // Set the cookie
      return user;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await apiLogout(token); // Pass the token to the API logout function
    }
    setToken(null);
    setUser(null);
    removeAuthCookie(); // Remove the cookie
    navigate("/auth");
  };

  return {
    isLoading,
    error,
    handleLogin,
    handleSignup,
    handleLogout,
  };
};
