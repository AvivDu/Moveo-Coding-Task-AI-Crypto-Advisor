import { useCallback } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { apiRequest } from "./client.js";

export function useApi() {
  const { token } = useAuth();

  return useCallback((path, options = {}) => apiRequest(path, { ...options, token }), [token]);
}
