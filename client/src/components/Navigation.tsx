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
    <nav className="bg-gradient-to-r from-orange-600 to-orange-700 dark:from-gray-800 dark:to-gray-900 text-white shadow-lg sticky top-0 z-50 border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Coffee className="w-8 h-8 text-orange-100" />
            <div>
              <h1 className="text-xl font-bold">Café Direct</h1>
              <p className="text-xs text-orange-100/80">Staff Portal</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 transition-all duration-200"
              onClick={() => setLocation("/")}
            >
              <Home className="w-4 h-4 mr-2" />
              Customer View
            </Button>
            
            {availableItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  className={`transition-all duration-200 ${
                    isActive
                      ? "bg-white/20 text-white shadow-md"
                      : "text-white hover:bg-white/10"
                  }`}
                  onClick={() => setLocation(item.path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-orange-100/80 capitalize">{user.role}</p>
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
