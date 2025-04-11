import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<User | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  
  // Get current user on initial load
  const {
    data: userData,
    error,
    isLoading,
    refetch
  } = useQuery({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user");
        if (response.status === 401) {
          return null;
        }
        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }
        return await response.json();
      } catch (error) {
        console.error("Error fetching user data:", error);
        return null;
      }
    },
  });
  
  // Update user state when userData changes
  useEffect(() => {
    if (userData) {
      setUser(userData);
    }
  }, [userData]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/login", credentials);
      if (!response.ok) {
        throw new Error("Login failed. Please check your credentials.");
      }
      return await response.json();
    },
    onSuccess: (loggedInUser: User) => {
      setUser(loggedInUser);
      queryClient.setQueryData(["/api/user"], loggedInUser);
      toast({
        title: "Login successful",
        description: `Welcome back, ${loggedInUser.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (registrationData: Partial<User>) => {
      const response = await apiRequest("POST", "/api/register", registrationData);
      if (!response.ok) {
        throw new Error("Registration failed. Username may already be taken.");
      }
      return await response.json();
    },
    onSuccess: (newUser: User) => {
      setUser(newUser);
      queryClient.setQueryData(["/api/user"], newUser);
      toast({
        title: "Registration successful",
        description: `Welcome, ${newUser.username}! Your account has been created.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout");
      if (!response.ok) {
        throw new Error("Logout failed");
      }
    },
    onSuccess: () => {
      setUser(null);
      queryClient.setQueryData(["/api/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Wrapper functions for mutations
  const login = async (username: string, password: string) => {
    try {
      return await loginMutation.mutateAsync({ username, password });
    } catch (error) {
      return null;
    }
  };

  const register = async (userData: Partial<User>) => {
    try {
      return await registerMutation.mutateAsync(userData);
    } catch (error) {
      return null;
    }
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error: error as Error,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}