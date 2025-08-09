import { Button } from "@/components/ui/button";
import { Coffee, Users, Settings, LogOut, Home, ShoppingCart } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";

export function Navigation() {
  const { user, logoutMutation } = useAuth();
  const [location, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate();
    setLocation("/login");
  };

  if (!user) return null;

  const navigationItems = [
    { id: "staff", label: "Staff Dashboard", icon: Users, path: "/staff", roles: ["staff", "admin"] },
    { id: "admin", label: "Admin Panel", icon: Settings, path: "/admin", roles: ["admin"] },
  ];

  const availableItems = navigationItems.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <nav className="nav-restaurant">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Coffee className="w-8 h-8 text-yellow-400 glow-effect" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Café Direct</h1>
              <p className="text-xs text-yellow-400">Staff Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <a href="/" className="nav-link">
              <Home className="w-4 h-4 mr-2" />
              Customer View
            </a>
            
            {availableItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <button
                  key={item.id}
                  className={`nav-link ${
                    isActive
                      ? "text-yellow-400"
                      : ""
                  }`}
                  onClick={() => setLocation(item.path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </button>
              );
            })}
            
            <div className="w-px h-6 bg-yellow-400/20 mx-2" />
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-yellow-400 capitalize">{user.role}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-red-500/20 hover:text-red-100 transition-all duration-200"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
