import React, { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import type { SafeUser, LoginInput } from "@shared/schema";

interface AuthContextType {
  user: SafeUser | null;
  isLoading: boolean;
  login: (credentials: LoginInput) => Promise<SafeUser>;
  logout: () => Promise<void>;
  selectedMachineId: number | null;
  setSelectedMachineId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [selectedMachineId, setSelectedMachineIdState] = useState<number | null>(() => {
    const saved = localStorage.getItem("oee_selected_machine");
    return saved ? parseInt(saved, 10) : 1; // default to machine 1
  });

  const setSelectedMachineId = (id: number | null) => {
    setSelectedMachineIdState(id);
    if (id !== null) {
      localStorage.setItem("oee_selected_machine", id.toString());
    } else {
      localStorage.removeItem("oee_selected_machine");
    }
  };

  const { data: user = null, isLoading } = useQuery<SafeUser | null>({
    queryKey: ["/api/auth/me"],
    retry: false,
    staleTime: 60000,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginInput) => {
      return apiRequest<SafeUser>("POST", "/api/auth/login", credentials);
    },
    onSuccess: (newUser) => {
      queryClient.setQueryData(["/api/auth/me"], newUser);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/me"], null);
      queryClient.clear();
    },
  });

  const login = async (credentials: LoginInput) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        selectedMachineId,
        setSelectedMachineId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser utilizado dentro de um AuthProvider");
  }
  return context;
}
