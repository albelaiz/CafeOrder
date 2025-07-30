
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, QrCode, Smartphone, Clock, Users, Star, MapPin, BarChart, Package } from "lucide-react";


  const [tableNumber, setTableNumber] = useState("");

  // Fetch analytics stats for overview (public endpoint)
  const { data: stats, isLoading: statsLoading } = useQuery<{ totalRevenue: number; totalOrders: number; }>(
    {
      queryKey: ["/api/public/analytics/stats"],
      queryFn: async () => {
        const res = await apiRequest("GET", "/api/public/analytics/stats");
        return res.json();
      },
    }
  );

  // Fetch all completed orders to calculate total items sold (public endpoint)
  const { data: completedOrders = [], isLoading: ordersLoading } = useQuery<any[]>({
    queryKey: ["/api/public/orders/completed"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/public/orders/completed");
      return res.json();
    },
  });

  // Calculate total items sold
  const totalItemsSold = completedOrders.reduce((sum, order) => {
    if (!order.items) return sum;
    return sum + order.items.reduce((itemSum: number, item: any) => itemSum + (item.quantity || 0), 0);
  }, 0);

  // Fetch tables from API
  const { data: tables = [], isLoading: tablesLoading } = useQuery<any[]>({
    queryKey: ["/api/tables"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/tables");
      return res.json();
    },
    refetchInterval: 5000, // Poll every 5 seconds for new tables
    refetchOnWindowFocus: true, // Also refetch when user focuses the tab
  });

  const handleOrderNow = () => {
    if (tableNumber) {
      window.location.href = `/order?t=${tableNumber}`;
    }
  };

  const generateQRCode = (table: number) => {
    const orderUrl = `${window.location.origin}/order?t=${table}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(orderUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-bg to-orange-50">
      {/* Overview Section */}
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <BarChart className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {statsLoading ? '...' : (stats?.totalRevenue || 0).toFixed(2)} DH
                </div>
                <div className="text-sm text-gray-600">Total Sales</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center space-x-4">
              <Package className="w-8 h-8 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {ordersLoading ? '...' : totalItemsSold}
                </div>
                <div className="text-sm text-gray-600">Total Items Sold</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cafe-brown to-cafe-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <button
              type="button"
              aria-label="Go to home page"
              onClick={() => (window.location.href = "/")}
              className="focus:outline-none"
            >
              <Coffee className="w-16 h-16 hover:scale-110 transition-transform duration-150" />
            </button>
          </div>
          <h1 className="text-5xl font-bold mb-4">Café Direct</h1>
          <p className="text-xl opacity-90 mb-8 text-black">
            Order directly from your table - No waiting, no signup required!
          </p>
          {/* Quick Order Section */}
          <div className="text-lg font-semibold mb-4 text-black">
            <h3 className="text-lg font-semibold mb-4">Start Your Order</h3>
            <div className="flex space-x-3">
              <Input
                type="number"
                placeholder="Table Number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                className="bg-white text-gray-800"
              />
              <Button
                onClick={handleOrderNow}
                className="bg-cafe-accent hover:bg-orange-600 text-white font-semibold"
                disabled={!tableNumber}
              >
                Order Now
              </Button>
            </div>
            <p className="text-sm opacity-80 mt-2">
              Find your table number on the table tent
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          Why Choose Café Direct?
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Clock className="w-12 h-12 text-cafe-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No More Waiting
              </h3>
              <p className="text-gray-600">
                Skip the queue and order directly from your table. Get real-time updates on your order status.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Smartphone className="w-12 h-12 text-cafe-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Signup Required
              </h3>
              <p className="text-gray-600">
                Simply scan the QR code on your table or enter your table number to start ordering immediately.
              </p>
            </CardContent>
          </Card>
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <Star className="w-12 h-12 text-cafe-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Premium Experience
              </h3>
              <p className="text-gray-600">
                Enjoy our carefully curated menu with detailed descriptions and real-time availability.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-cafe-brown text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Scan QR Code
              </h3>
              <p className="text-gray-600">
                Use your phone to scan the QR code on your table
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cafe-brown text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Browse & Order
              </h3>
              <p className="text-gray-600">
                Explore our menu and add items to your cart
              </p>
            </div>
            <div className="text-center">
              <div className="bg-cafe-brown text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Sit Back & Relax
              </h3>
              <p className="text-gray-600">
                We'll prepare your order and notify you when it's ready
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Staff Login Section */}
      <div className="bg-cafe-brown text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-4">Staff & Admin Access</h3>
          <div className="flex justify-center space-x-4">
            <Button
              variant="secondary"
              onClick={() => window.location.href = "/staff"}
              className="bg-white text-cafe-brown hover:bg-gray-100"
            >
              <Users className="w-4 h-4 mr-2" />
              Staff Dashboard
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.href = "/admin"}
              className="bg-white text-cafe-brown hover:bg-gray-100"
            >
              <Coffee className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}