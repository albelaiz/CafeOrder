import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, Smartphone, Clock, Users, Star, MapPin, BarChart, Package } from "lucide-react";

interface Table {
  id: number;
  number: number;
  status: string;
  capacity: number;
  qrCode: string;
  createdAt: string;
  updatedAt: string;
}

interface Stats {
  totalRevenue: number;
  totalOrders: number;
}

interface Order {
  id: string;
  items: Array<{ quantity: number }>;
}

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Fetch tables from API with real-time updates
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch('/api/public/tables');
        const data = await res.json();
        setTables(data);
        setTablesLoading(false);
      } catch (error) {
        console.error('Error fetching tables:', error);
        setTablesLoading(false);
      }
    };

    fetchTables();
    const interval = setInterval(fetchTables, 3000);
    return () => clearInterval(interval);
  }, []);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/analytics/stats');
        const data = await res.json();
        setStats(data);
        setStatsLoading(false);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Fetch completed orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/public/orders/completed');
        const data = await res.json();
        setCompletedOrders(data);
        setOrdersLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Calculate total items sold
  const totalItemsSold = completedOrders.reduce((sum, order) => {
    if (!order.items) return sum;
    return sum + order.items.reduce((itemSum: any, item: any) => itemSum + (item.quantity || 0), 0);
  }, 0);

  const handleOrderNow = () => {
    if (tableNumber) {
      window.location.href = `/order?t=${tableNumber}`;
    }
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

      {/* Quick Table Access */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Quick Table Access
            </h2>
            <p className="text-xl text-gray-600">
              Don't have a QR code? Select your table number below
            </p>
          </div>
          
          {tablesLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cafe-accent"></div>
              <p className="text-gray-500 mt-2">Loading tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No tables available yet</p>
              <p className="text-sm text-gray-400">Please check back later or ask our staff for assistance</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
              {tables.slice().sort((a, b) => a.number - b.number).map((table) => (
                <Button
                  key={table.id}
                  onClick={() => window.location.href = `/order?t=${table.number}`}
                  variant="outline"
                  className="h-16 text-lg font-semibold hover:bg-cafe-light hover:border-cafe-accent hover:text-cafe-brown transition-all duration-200 group"
                >
                  <div className="flex flex-col items-center">
                    <MapPin className="w-4 h-4 mb-1 group-hover:text-cafe-brown" />
                    <span>{table.number}</span>
                  </div>
                </Button>
              ))}
            </div>
          )}
          
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Can't find your table? Ask our friendly staff for assistance.
            </p>
          </div>
        </div>
      </section>

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