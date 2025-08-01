import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Coffee, 
  Smartphone, 
  QrCode,
  Zap,
  Shield,
  Heart,
  Phone,
  Mail,
  MapPinIcon,
  MapPin,
  CheckCircle
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

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesLoading, setTablesLoading] = useState(true);

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

  const handleOrderNow = () => {
    if (tableNumber) {
      window.location.href = `/order?t=${tableNumber}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-stone-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-stone-900">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-2xl opacity-20 animate-pulse"></div>
                <Coffee className="relative w-16 h-16 text-emerald-300 hover:scale-110 transition-transform duration-500 cursor-pointer" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
              Order directly from 
              <span className="block bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                your table
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
              No signup. No waiting. Just scan and order.
            </p>
            <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
              Transform your restaurant experience with seamless QR code ordering
            </p>

            {/* Quick Order Input */}
            <div className="max-w-lg mx-auto mb-12">
              <div className="relative">
                <div className="flex rounded-2xl overflow-hidden shadow-2xl bg-white/5 backdrop-blur-lg border border-white/10">
                  <Input
                    type="number"
                    placeholder="Enter your table number"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="flex-1 bg-white/95 border-0 text-slate-900 placeholder:text-slate-500 text-lg py-6 px-6 rounded-l-2xl focus:ring-2 focus:ring-emerald-400 font-medium"
                  />
                  <Button
                    onClick={handleOrderNow}
                    disabled={!tableNumber}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold px-8 py-6 rounded-r-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl text-lg"
                  >
                    Start Order
                  </Button>
                </div>
              </div>
              <p className="text-slate-400 text-sm mt-4">
                Find your table number on the table card
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Table Access */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Quick Table Access
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Don't have a QR code? Select your table number below to start ordering instantly
            </p>
          </div>
          
          {tablesLoading ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 animate-pulse">
                <Coffee className="w-10 h-10 text-emerald-600" />
              </div>
              <p className="text-slate-500 text-xl">Loading available tables...</p>
            </div>
          ) : tables.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-100 rounded-full mb-8">
                <MapPin className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-3xl font-semibold text-slate-800 mb-4">No tables available</h3>
              <p className="text-slate-600 mb-8 text-lg">Tables will appear here once they're configured</p>
              <p className="text-sm text-slate-400">Please contact our staff for assistance</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 max-w-6xl mx-auto">
              {tables.slice().sort((a, b) => a.number - b.number).map((table) => (
                <Card
                  key={table.id}
                  className="group cursor-pointer transform hover:scale-105 transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 hover:border-emerald-300 rounded-2xl overflow-hidden"
                  onClick={() => window.location.href = `/order?t=${table.number}`}
                >
                  <CardContent className="p-6 text-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full mb-4 group-hover:from-emerald-200 group-hover:to-teal-200 transition-colors duration-300">
                        <MapPin className="w-6 h-6 text-emerald-600 group-hover:text-emerald-700 transition-colors duration-200" />
                      </div>
                      <div className="text-3xl font-bold text-slate-800 group-hover:text-emerald-800 transition-colors duration-200 mb-2">
                        {table.number}
                      </div>
                      <div className="text-sm text-slate-500 mb-3">
                        {table.capacity} seats
                      </div>
                      <div className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-medium ${
                        table.status === 'available' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-amber-100 text-amber-700'
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
            <p className="text-slate-500 text-lg">
              Can't find your table? Our friendly staff is here to help.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              How It Works
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Get your order in three simple steps
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-12 items-start">
            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110">
                  <QrCode className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Scan QR Code
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Simply scan the QR code on your table with your phone's camera. No app downloads required.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110">
                  <Coffee className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Browse & Order
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Explore our menu, customize your items, and add them to your cart. Everything is clearly organized.
              </p>
            </div>

            <div className="text-center group">
              <div className="relative mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110">
                  <Heart className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-4">
                Sit Back & Enjoy
              </h3>
              <p className="text-slate-600 leading-relaxed text-lg">
                Relax while we prepare your fresh order. You'll receive updates on your order status.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Experience the future of restaurant ordering with our innovative solution
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-slate-50 to-white overflow-hidden rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Smartphone className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    No App Required
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Works with any smartphone camera. No downloads, no storage space needed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-slate-50 to-white overflow-hidden rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Simple & Fast
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Intuitive interface that customers love. Place orders in under 2 minutes.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-slate-50 to-white overflow-hidden rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Lightning Fast
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Real-time order processing with instant notifications and updates.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-slate-50 to-white overflow-hidden rounded-2xl">
              <CardContent className="p-8 text-center relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-4">
                    Fully Customizable
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Adapt to your restaurant's brand with flexible menu and design options.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            <div>
              <div className="flex items-center mb-6">
                <Coffee className="w-8 h-8 text-emerald-400 mr-3" />
                <h4 className="text-2xl font-bold">Café Direct</h4>
              </div>
              <p className="text-slate-400 leading-relaxed text-lg mb-6">
                Revolutionizing restaurant dining with seamless QR code ordering technology.
              </p>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm font-bold">FB</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm font-bold">TW</span>
                </div>
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center hover:bg-emerald-600 transition-colors duration-200 cursor-pointer">
                  <span className="text-sm font-bold">IN</span>
                </div>
              </div>
            </div>
            
            <div>
              <h5 className="text-lg font-semibold mb-6 text-emerald-400">Contact Information</h5>
              <div className="space-y-4">
                <div className="flex items-center text-slate-400 hover:text-white transition-colors duration-200">
                  <Phone className="w-5 h-5 mr-4" />
                  <span>+212 123 456 789</span>
                </div>
                <div className="flex items-center text-slate-400 hover:text-white transition-colors duration-200">
                  <Mail className="w-5 h-5 mr-4" />
                  <span>hello@cafedirect.com</span>
                </div>
                <div className="flex items-center text-slate-400 hover:text-white transition-colors duration-200">
                  <MapPinIcon className="w-5 h-5 mr-4" />
                  <span>Casablanca, Morocco</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links removed as requested */}
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