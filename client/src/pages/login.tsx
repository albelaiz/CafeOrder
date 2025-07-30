import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Coffee } from "lucide-react";
import type { LoginData } from "@shared/schema";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, isLoading, loginMutation } = useAuth();
  const [credentials, setCredentials] = useState<LoginData>({
    username: "",
    password: "",
  });

  // Use useEffect for redirect to avoid setState during render
  useEffect(() => {
    if (!isLoading && user) {
      // Small delay to ensure any logout cleanup is complete
      setTimeout(() => {
        if (user.role === "admin") {
          setLocation("/admin");
        } else {
          setLocation("/staff");
        }
      }, 100);
    }
  }, [isLoading, user, setLocation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username && credentials.password) {
      loginMutation.mutate(credentials);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="h-12 w-12 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Café Direct</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">Staff & Admin Login</p>
        </div>

        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center text-gray-600 dark:text-gray-300">
              Access the staff dashboard or admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  className="h-11 transition-all duration-200 focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-11 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                disabled={loginMutation.isPending || !credentials.username || !credentials.password}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-orange-50 dark:bg-gray-700/50 rounded-lg text-sm border border-orange-100 dark:border-gray-600">
              <p className="font-medium mb-3 text-orange-800 dark:text-orange-200">Demo Credentials:</p>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Admin:</span>
                  <span className="font-mono text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">admin / admin123</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Staff:</span>
                  <span className="font-mono text-xs bg-white dark:bg-gray-600 px-2 py-1 rounded">staff / staff123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}