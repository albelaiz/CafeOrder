import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoginData, User } from "@shared/schema";

export function useAuth() {
  const { toast } = useToast();
  
  const { data: user, isLoading, error } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check server for fresh data
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Login failed");
      }
      return await res.json();
    },
    onSuccess: (user) => {
      queryClient.setQueryData(["/api/auth/user"], user);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.firstName || user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed", 
        description: error.message === "Invalid credentials" 
          ? "Incorrect username or password. Please try again."
          : error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/logout");
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      return res.json();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      // Clear localStorage
      localStorage.clear();
      // Set user to null
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      // Even if logout fails on server, clear client state
      queryClient.clear();
      localStorage.clear();
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Session Expired", 
        description: "Please log in again",
        variant: "destructive",
      });
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user && !error,
    loginMutation,
    logoutMutation,
    error,
  };
}
