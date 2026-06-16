import { createContext, useContext, useState } from "react";
import { apiRequest } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  function persist(nextToken, nextUser) {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem("token", nextToken);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }

  async function signup(name, email, password) {
    const data = await apiRequest("/api/auth/signup", { method: "POST", body: { name, email, password } });
    persist(data.token, data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await apiRequest("/api/auth/login", { method: "POST", body: { email, password } });
    persist(data.token, data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  function setHasCompletedOnboarding(value) {
    const nextUser = { ...user, hasCompletedOnboarding: value };
    setUser(nextUser);
    localStorage.setItem("user", JSON.stringify(nextUser));
  }

  return (
    <AuthContext.Provider value={{ token, user, signup, login, logout, setHasCompletedOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
