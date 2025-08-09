import { useState, useEffect } from "react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
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
      {/* Navigation */}
      <nav className="nav-restaurant sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <img 
                src="/chef-hicham-logo.jpg"
                alt="Chef Hicham Restaurant"
                className="h-16 w-auto"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <div className="flex items-center space-x-4" style={{display: 'none'}}>
                <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-xl">CH</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Chef Hicham</h1>
                  <p className="text-xs text-yellow-400">Premium Restaurant</p>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#menu" className="nav-link">Menu</a>
              <a href="#order" className="nav-link">Order</a>
              <a href="#contact" className="nav-link">Contact</a>
            </div>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-black min-h-screen flex items-center">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-12 fade-in">
              <img 
                src="/chef-hicham-logo.jpg"
                alt="Chef Hicham Restaurant"
                className="h-40 w-auto glow-effect"
                onError={(e) => {
                  // Fallback if image doesn't load
                  const target = e.currentTarget as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="w-32 h-32 bg-yellow-400 rounded-full flex items-center justify-center glow-effect" style={{display: 'none'}}>
                <span className="text-black font-bold text-4xl">CH</span>
              </div>
            </div>
            
            <h1 className="text-6xl lg:text-8xl font-bold text-white mb-8 tracking-tight leading-tight fade-in-up">
              Welcome to
              <span className="block text-gradient">LA CAMPANA</span>
            </h1>
            
            <p className="text-2xl lg:text-3xl text-gray-300 mb-6 max-w-4xl mx-auto font-medium fade-in-delay-1">
              Premium dining experience with seamless QR ordering
            </p>
            <p className="text-lg text-gray-400 mb-16 max-w-3xl mx-auto fade-in-delay-2">
              No signup. No waiting. Just scan and savor.
            </p>

            {/* Quick Order Input */}
            <div className="max-w-lg mx-auto mb-16 fade-in-delay-3">
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
      {/* Menu Preview Section */}
      <section id="menu" className="py-24 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Premium Selections
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Discover our exquisite selection of premium dishes and beverages
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-restaurant hover-lift p-8 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Premium Coffee</h3>
              <p className="text-gray-300 mb-6">Artisan-crafted espresso, cappuccinos, and specialty blends</p>
              <div className="text-yellow-400 font-semibold">From 25 DH</div>
            </div>
            
            <div className="card-restaurant hover-lift p-8 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-black font-bold text-2xl">🍽️</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Gourmet Dishes</h3>
              <p className="text-gray-300 mb-6">Fresh, locally-sourced ingredients in every carefully crafted meal</p>
              <div className="text-yellow-400 font-semibold">From 85 DH</div>
            </div>
            
            <div className="card-restaurant hover-lift p-8 text-center">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-black font-bold text-2xl">🍰</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Sweet Desserts</h3>
              <p className="text-gray-300 mb-6">Indulgent desserts and pastries made fresh daily</p>
              <div className="text-yellow-400 font-semibold">From 35 DH</div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button 
              onClick={() => setLocation('/order')}
              className="btn-restaurant text-lg px-8 py-4"
            >
              View Full Menu
            </button>
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
                <img 
                  src="/chef-hicham-logo.jpg"
                  alt="Chef Hicham Restaurant"
                  className="h-10 w-auto mr-3"
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center mr-3" style={{display: 'none'}}>
                  <span className="text-black font-bold">CH</span>
                </div>
                <h4 className="text-2xl font-bold">Chef Hicham</h4>
              </div>
              <p className="text-gray-400 leading-relaxed text-lg mb-6">
                Premium dining experience with seamless QR code ordering technology.
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
                  <span className="text-yellow-400 font-semibold">+212 123 456 789</span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <Mail className="w-5 h-5 mr-4" />
                  <span>hello@chefhicham.ma</span>
                </div>
                <div className="flex items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
                  <MapPinIcon className="w-5 h-5 mr-4" />
                  <span>Casablanca, Morocco</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6 text-yellow-400">Hours</h5>
              <div className="space-y-2 text-gray-400">
                <div className="flex justify-between">
                  <span>Monday - Thursday</span>
                  <span>8:00 AM - 10:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Friday - Saturday</span>
                  <span>8:00 AM - 11:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span>9:00 AM - 9:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-yellow-400/20 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2025 Chef Hicham Restaurant. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}