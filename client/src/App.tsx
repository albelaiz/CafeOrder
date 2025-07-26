import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import Landing from "@/pages/landing";
import Customer from "@/pages/customer";
import Staff from "@/pages/staff";
import Admin from "@/pages/admin";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [currentView, setCurrentView] = useState("customer");

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cafe-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cafe-brown mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  // Determine default view based on user role
  const getDefaultView = () => {
    if (user?.role === "admin") return "admin";
    if (user?.role === "staff") return "staff";
    return "customer";
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "customer":
        return <Customer />;
      case "staff":
        if (user?.role === "staff" || user?.role === "admin") {
          return <Staff />;
        }
        return <Customer />;
      case "admin":
        if (user?.role === "admin") {
          return <Admin />;
        }
        return <Customer />;
      default:
        return <Customer />;
    }
  };

  return (
    <div className="min-h-screen bg-cafe-bg">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      {renderCurrentView()}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
