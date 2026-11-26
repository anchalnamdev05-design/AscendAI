import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ascendai_user") || "null");
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("ascendai_token")));

  const saveSession = useCallback((data) => {
    localStorage.setItem("ascendai_token", data.token);
    localStorage.setItem("ascendai_user", JSON.stringify(data.user));
    setUser(data.user);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!localStorage.getItem("ascendai_token")) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get("/auth/profile");
      setUser(data.user);
      localStorage.setItem("ascendai_user", JSON.stringify(data.user));
    } catch {
      localStorage.removeItem("ascendai_token");
      localStorage.removeItem("ascendai_user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);
  useEffect(() => {
    const clear = () => {
      setUser(null);
      setLoading(false);
    };
    window.addEventListener("ascendai:unauthorized", clear);
    return () => window.removeEventListener("ascendai:unauthorized", clear);
  }, []);

  const register = async (payload) => {
    const { data } = await api.post("/auth/register", payload);
    saveSession(data);
    return data;
  };
  const login = async (payload) => {
    const { data } = await api.post("/auth/login", payload);
    saveSession(data);
    return data;
  };
  const logout = () => {
    localStorage.removeItem("ascendai_token");
    localStorage.removeItem("ascendai_user");
    setUser(null);
  };
  const updateUser = (next) => {
    setUser(next);
    localStorage.setItem("ascendai_user", JSON.stringify(next));
  };

  const value = useMemo(
    () => ({ user, loading, register, login, logout, updateUser, refreshProfile }),
    [user, loading, refreshProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
