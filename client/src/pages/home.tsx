import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Coffee, 
  Smartphone, 
  Clock, 
  Users, 
  Star, 
  MapPin, 
  BarChart, 
  Package, 
  QrCode,
  Zap,
  Shield,
  Heart,
  Phone,
  Mail,
  MapPinIcon
} from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-b from-stone-50 to-amber-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-amber-900 via-amber-800 to-stone-900">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
                <Coffee className="relative w-20 h-20 text-amber-200 hover:scale-110 transition-transform duration-300 cursor-pointer" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              <span className="bg-gradient-to-r from-amber-200 to-amber-100 bg-clip-text text-transparent">
                Café Direct
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-amber-100 mb-4 max-w-3xl mx-auto leading-relaxed">
              Order directly from your table
            </p>
            <p className="text-lg text-amber-200/80 mb-12 max-w-2xl mx-auto">
              No waiting, no signup required. Just scan and order.
            </p>

            {/* Quick Order Input */}
            <div className="max-w-md mx-auto mb-8">
              <div className="relative">
                <div className="flex rounded-2xl overflow-hidden shadow-2xl bg-white/10 backdrop-blur-sm border border-amber-300/20">
                  <Input
                    type="number"
                    placeholder="Enter table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="flex-1 bg-white/90 border-0 text-gray-900 placeholder:text-gray-500 text-lg py-4 px-6 rounded-l-2xl focus:ring-2 focus:ring-amber-400"
                  />
                  <Button
                    onClick={handleOrderNow}
                    disabled={!tableNumber}
                    className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-r-2xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    Start Order
                  </Button>
                </div>
              </div>
              <p className="text-amber-200/70 text-sm mt-3">
                Find your table number on the table tent
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <BarChart className="w-8 h-8 text-amber-300 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {statsLoading ? '...' : (stats?.totalRevenue || 0).toFixed(2)} DH
                  </div>
                  <div className="text-amber-200/80 text-sm">Total Sales</div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-md border-amber-300/20 hover:bg-white/15 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <Package className="w-8 h-8 text-amber-300 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white mb-1">
                    {ordersLoading ? '...' : totalItemsSold}
                  </div>
                  <div className="text-amber-200/80 text-sm">Items Served</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Table Access */}
      <section className="py-20 bg-gradient-to-b from-white to-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">
              Quick Table Access
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Don't have a QR code? Select your table number below to start ordering
            </p>
          </div>
          
          {tablesLoading ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4 animate-pulse">
                <Coffee className="w-8 h-8 text-amber-600" />
              </div>
              <p className="text-stone-500 text-lg">Loading available tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-stone-100 rounded-full mb-6">
                <MapPin className="w-10 h-10 text-stone-400" />
              </div>
              <h3 className="text-2xl font-semibold text-stone-700 mb-3">No tables available</h3>
              <p className="text-stone-500 mb-6">Tables will appear here once they're set up</p>
              <p className="text-sm text-stone-400">Please ask our staff for assistance</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-w-6xl mx-auto">
              {tables.slice().sort((a, b) => a.number - b.number).map((table) => (
                <Card
                  key={table.id}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-xl bg-gradient-to-br from-white to-amber-50 border-2 border-amber-100 hover:border-amber-300"
                  onClick={() => window.location.href = `/order?t=${table.number}`}
                >
                  <CardContent className="p-6 text-center">
                    <div className="relative">
                      <div className="absolute inset-0 bg-amber-200 rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 transform scale-150"></div>
                      <MapPin className="relative w-8 h-8 text-amber-600 mx-auto mb-3 group-hover:text-amber-700 transition-colors duration-200" />
                    </div>
                    <div className="text-2xl font-bold text-stone-800 group-hover:text-amber-800 transition-colors duration-200">
                      {table.number}
                    </div>
                    <div className="text-sm text-stone-500 mt-1">
                      {table.capacity} seats
                    </div>
                    <div className={`text-xs mt-2 px-2 py-1 rounded-full ${
                      table.status === 'available' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {table.status}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <p className="text-stone-500 text-lg">
              Can't find your table? Our friendly staff is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-br from-stone-100 to-amber-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Get your order in just three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 items-center">
            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <QrCode className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                Scan QR Code
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Use your phone to scan the QR code on your table
              </p>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>

            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Coffee className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                Choose Items
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Browse our menu and add your favorites to the cart
              </p>
            </div>

            <div className="hidden md:flex justify-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent"></div>
            </div>

            <div className="relative text-center group">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-stone-800 mb-3">
                Enjoy!
              </h3>
              <p className="text-stone-600 leading-relaxed">
                Sit back and relax while we prepare your fresh order
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-stone-800 mb-6">
              Why Choose Café Direct?
            </h2>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Experience the future of dining with our innovative ordering system
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-stone-50 to-amber-50 overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-4">
                    No App Required
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-lg">
                    Simply scan the QR code with your phone's camera. No downloads, no accounts, no hassle.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-stone-50 to-amber-50 overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-4">
                    Fast & Reliable
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-lg">
                    Lightning-fast ordering with real-time updates. Know exactly when your order is ready.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-stone-50 to-amber-50 overflow-hidden">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-stone-800 mb-4">
                    Fully Customizable
                  </h3>
                  <p className="text-stone-600 leading-relaxed text-lg">
                    Tailored to your restaurant's needs with flexible menu management and branding options.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Staff Access */}
      <section className="py-16 bg-gradient-to-r from-stone-800 to-stone-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">Staff & Admin Portal</h3>
          <p className="text-stone-300 text-lg mb-8 max-w-2xl mx-auto">
            Manage your restaurant operations with our powerful admin dashboard
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = "/staff"}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              <Users className="w-5 h-5 mr-3" />
              Staff Dashboard
            </Button>
            <Button
              onClick={() => window.location.href = "/admin"}
              className="bg-gradient-to-r from-stone-600 to-stone-700 hover:from-stone-700 hover:to-stone-800 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-lg"
            >
              <Coffee className="w-5 h-5 mr-3" />
              Admin Portal
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Coffee className="w-8 h-8 text-amber-400 mr-3" />
                <h4 className="text-2xl font-bold">Café Direct</h4>
              </div>
              <p className="text-stone-400 leading-relaxed">
                Revolutionizing the dining experience with seamless QR code ordering technology.
              </p>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-4 text-amber-400">Contact Info</h5>
              <div className="space-y-3">
                <div className="flex items-center text-stone-400">
                  <Phone className="w-4 h-4 mr-3" />
                  <span>+212 123 456 789</span>
                </div>
                <div className="flex items-center text-stone-400">
                  <Mail className="w-4 h-4 mr-3" />
                  <span>hello@cafedirect.com</span>
                </div>
                <div className="flex items-center text-stone-400">
                  <MapPinIcon className="w-4 h-4 mr-3" />
                  <span>Casablanca, Morocco</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-4 text-amber-400">Quick Links</h5>
              <div className="space-y-2">
                <a href="/staff" className="block text-stone-400 hover:text-amber-400 transition-colors duration-200">
                  Staff Portal
                </a>
                <a href="/admin" className="block text-stone-400 hover:text-amber-400 transition-colors duration-200">
                  Admin Dashboard
                </a>
                <a href="#" className="block text-stone-400 hover:text-amber-400 transition-colors duration-200">
                  Support
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-stone-800 mt-8 pt-8 text-center">
            <p className="text-stone-400">
              © 2024 Café Direct. All rights reserved. Built with ❤️ for restaurants.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}