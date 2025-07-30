import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import HomeModern from "@/pages/home-modern";
import OrderModern from "@/pages/order-modern";
import ThankYouNew from "@/pages/thank-you-new";
import StaffUltraModern from "@/pages/staff-ultra-modern";
import AdminUltraModern from "@/pages/admin-ultra-modern";
import Login from "@/pages/login";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes - no authentication required */}
      <Route path="/" component={HomeModern} />
      <Route path="/order" component={OrderModern} />
      <Route path="/thank-you" component={ThankYouNew} />

      {/* Login route for staff/admin */}
      <Route path="/login" component={Login} />

      {/* Protected routes - require authentication */}
      <Route path="/staff" component={AuthenticatedStaff} />
      <Route path="/admin" component={AuthenticatedAdmin} />

      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedStaff() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user is not authenticated
  if (!isAuthenticated || !user) {
    return <Redirect to="/login" replace />;
  }

  // Redirect to login if user doesn't have staff or admin role
  if (!["staff", "admin"].includes(user.role)) {
    return <Redirect to="/login" replace />;
  }

  return <StaffUltraModern />;
}

function AuthenticatedAdmin() {
  const { isAuthenticated, isLoading, user } = useAuth();

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
    return <Redirect to="/login" />;
  }

  if (user && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cafe-bg">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
      <AdminUltraModern />
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