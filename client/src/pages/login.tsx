import { useState } from "react";
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

  // Redirect if already logged in
  if (!isLoading && user) {
    if (user.role === "admin") {
      setLocation("/admin");
    } else {
      setLocation("/staff");
    }
    return null;
  }

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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Coffee className="h-12 w-12 text-orange-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Café Direct</h1>
          <p className="text-gray-600 mt-2">Staff & Admin Login</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Access the staff dashboard or admin panel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={loginMutation.isPending || !credentials.username || !credentials.password}
              >
                {loginMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
              <p className="font-medium mb-2">Demo Credentials:</p>
              <p><strong>Admin:</strong> username: admin, password: admin123</p>
              <p><strong>Staff:</strong> username: staff, password: staff123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}