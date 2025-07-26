import { Button } from "@/components/ui/button";
import { Coffee, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user } = useAuth();

  const getAvailableViews = () => {
    if (!user) return [];
    
    const views = [{ id: "customer", label: "Customer", icon: Coffee }];
    
    if (user.role === "staff" || user.role === "admin") {
      views.push({ id: "staff", label: "Staff", icon: Users });
    }
    
    if (user.role === "admin") {
      views.push({ id: "admin", label: "Admin", icon: Settings });
    }
    
    return views;
  };

  const availableViews = getAvailableViews();

  return (
    <nav className="bg-cafe-brown text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Coffee className="w-8 h-8" />
            <h1 className="text-xl font-bold">Café Direct</h1>
          </div>
          <div className="flex items-center space-x-4">
            {availableViews.map((view) => {
              const Icon = view.icon;
              const isActive = currentView === view.id;
              
              return (
                <Button
                  key={view.id}
                  variant="ghost"
                  className={`px-4 py-2 rounded-md transition-colors ${
                    isActive
                      ? "bg-cafe-light text-white"
                      : "text-white hover:bg-cafe-light"
                  }`}
                  onClick={() => onViewChange(view.id)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {view.label}
                </Button>
              );
            })}
            <Button
              variant="ghost"
              className="text-white hover:bg-cafe-light"
              onClick={() => window.location.href = "/api/logout"}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
