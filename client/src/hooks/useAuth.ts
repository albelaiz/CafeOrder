import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoginData, User } from "@shared/schema";

export function useAuth() {
  const { toast } = useToast();
  
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    retry: false,
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
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
      toast({
        title: "Logged Out",
        description: "You have been logged out successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    loginMutation,
    logoutMutation,
  };
}
