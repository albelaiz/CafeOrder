import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Coffee, 
  QrCode,
  Heart,
  Phone,
  Mail,
  MapPinIcon,
  MapPin,
  TrendingUp,
  TrendingDown,
  DollarSign
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

interface RevenueStats {
  totalRevenue: number;
  currentMonthRevenue: number;
  previousMonthRevenue: number;
  percentageChange: number;
}

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [revenueLoading, setRevenueLoading] = useState(true);

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

  // Fetch revenue stats with real-time updates
  useEffect(() => {
    const fetchRevenueStats = async () => {
      try {
        const res = await fetch('/api/public/revenue');
        const data = await res.json();
        setRevenueStats(data);
        setRevenueLoading(false);
      } catch (error) {
        console.error('Error fetching revenue stats:', error);
        setRevenueLoading(false);
      }
    };

    fetchRevenueStats();
    const interval = setInterval(fetchRevenueStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const handleOrderNow = () => {
    if (tableNumber) {
      window.location.href = `/order?t=${tableNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-yellow-400 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                <Coffee className="relative w-20 h-20 text-yellow-400 hover:scale-110 transition-transform duration-500 cursor-pointer glow-effect" />
              </div>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight">
              Order directly from 
              <span className="block text-gradient">
                your table
              </span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto font-medium">
              No signup. No waiting. Just scan and order.
            </p>
            <p className="text-lg text-gray-400 mb-16 max-w-3xl mx-auto">
              Experience premium dining with seamless QR code ordering
            </p>

            {/* Quick Order Input */}
            <div className="max-w-lg mx-auto mb-16">
              <div className="relative">
                <div className="flex rounded-2xl overflow-hidden shadow-2xl glass-effect border-2 border-yellow-400/20">
                  <Input
                    type="number"
                    placeholder="Enter your table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="flex-1 bg-gray-900 border-0 text-white placeholder:text-gray-400 text-lg py-6 px-6 rounded-l-2xl focus:ring-2 focus:ring-yellow-400 font-medium"
                  />
                  <Button
                    onClick={handleOrderNow}
                    disabled={!tableNumber}
                    className="btn-restaurant text-lg py-6 px-8 rounded-r-2xl"
                  >
                    Start Order
                  </Button>
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Find your table number on the table card
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Table Access */}
      <section className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Quick Table Access
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Don't have a QR code? Select your table number below to start ordering instantly
            </p>
          </div>
          
          {tablesLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-400/20 rounded-full mb-6 glow-effect">
                <Coffee className="w-10 h-10 text-yellow-400" />
              </div>
              <p className="text-gray-300 text-xl">Loading available tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-800 rounded-full mb-8">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-3xl font-semibold text-white mb-4">No tables available</h3>
              <p className="text-gray-300 mb-8 text-lg">Tables will appear here once they're configured</p>
              <p className="text-sm text-gray-400">Please contact our staff for assistance</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 max-w-6xl mx-auto">
              {tables.slice().sort((a, b) => a.number - b.number).map((table) => (
                <Card
                  key={table.id}
                  className="card-restaurant hover-lift cursor-pointer"
                  onClick={() => window.location.href = `/order?t=${table.number}`}
                >
                  <CardContent className="p-6 text-center relative">
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-yellow-400/20 rounded-full mb-4 border border-yellow-400/30">
                        <MapPin className="w-6 h-6 text-yellow-400" />
                      </div>
                      <div className="text-3xl font-bold text-white mb-4">
                        {table.number}
                      </div>
                      <div className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium border ${
                        table.status === 'available' 
                          ? 'bg-yellow-400/20 text-yellow-400 border-yellow-400/30' 
                          : 'bg-orange-400/20 text-orange-400 border-orange-400/30'
                      }`}>
                        {table.status}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-16">
            <p className="text-gray-400 text-lg">
              Can't find your table? Our friendly staff is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              How It Works
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get your order in three simple steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-2xl hover:shadow-gold-lg transition-all duration-500 transform group-hover:scale-110">
                  <QrCode className="w-12 h-12 text-black" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Scan QR Code
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Simply scan the QR code on your table with your phone's camera. No app downloads required.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-2xl hover:shadow-gold-lg transition-all duration-500 transform group-hover:scale-110">
                  <Coffee className="w-12 h-12 text-black" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Browse & Order
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Explore our menu, customize your items, and add them to your cart. Everything is clearly organized.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl shadow-2xl hover:shadow-gold-lg transition-all duration-500 transform group-hover:scale-110">
                  <Heart className="w-12 h-12 text-black" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Sit Back & Enjoy
              </h3>
              <p className="text-gray-300 leading-relaxed text-lg">
                Relax while we prepare your fresh order. You'll receive updates on your order status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Total Revenue section removed as requested */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 border-t border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <Coffee className="w-8 h-8 text-yellow-400 mr-3 glow-effect" />
                <h4 className="text-2xl font-bold">Café Direct</h4>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-6">
                Revolutionizing restaurant dining with seamless QR code ordering technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer border border-gray-700 hover:border-yellow-400">
                  <span className="text-sm font-bold">FB</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer border border-gray-700 hover:border-yellow-400">
                  <span className="text-sm font-bold">TW</span>
                </div>
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-yellow-400 hover:text-black transition-all duration-300 cursor-pointer border border-gray-700 hover:border-yellow-400">
                  <span className="text-sm font-bold">IN</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6 text-yellow-400">Contact Information</h5>
              <div className="space-y-4">
                <div className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Phone className="w-5 h-5 mr-4" />
                  <span>+212 123 456 789</span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Mail className="w-5 h-5 mr-4" />
                  <span>hello@cafedirect.com</span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <MapPinIcon className="w-5 h-5 mr-4" />
                  <span>Casablanca, Morocco</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-slate-400 text-lg">
              © 2024 Café Direct. All rights reserved. Built for the future of dining.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}