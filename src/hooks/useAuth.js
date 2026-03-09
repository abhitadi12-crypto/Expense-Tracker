import { useState, useEffect } from "react";
import { apiService } from "../services/api";

/**
 * Custom hook to manage user authentication
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("user");
      if (savedUser && savedUser !== "undefined") {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to parse saved user:", err);
      localStorage.removeItem("user");
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const data = await apiService.login(email, password);
      if (data && data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login Error:", err);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const updateProfile = async (userData) => {
    try {
      const data = await apiService.updateUser(user.id, userData);
      if (data.user) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        return true;
      }
      return false;
    } catch (err) {
      console.error("Update Profile Error:", err);
      return false;
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    updateProfile
  };
}
