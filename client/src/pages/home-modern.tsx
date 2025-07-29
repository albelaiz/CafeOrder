import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Coffee, Clock, Smartphone, ChefHat, 
  Zap, Shield, Star, ArrowRight, MapPin 
} from "lucide-react";

export default function HomeModern() {
  const [tableNumber, setTableNumber] = useState("");

  const handleOrderNow = () => {
    if (tableNumber) {
      window.location.href = `/order?t=${tableNumber}`;
    }
  };

  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Order in under 60 seconds with our streamlined interface"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "No Registration",
      description: "Start ordering immediately - no signup or personal info required"
    },
    {
      icon: <ChefHat className="w-6 h-6" />,
      title: "Real-time Updates",
      description: "Track your order status from kitchen to table"
    }
  ];

  const quickTables = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center text-white">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-8">
              <Coffee className="w-8 h-8" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Café Direct
              <span className="block text-2xl md:text-3xl font-normal text-blue-100 mt-2">
                Order. Relax. Enjoy.
              </span>
            </h1>
            
            <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
              Skip the wait. Scan your table's QR code or enter your table number to start ordering instantly.
            </p>
            
            {/* Quick Order Form */}
            <div className="max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-lg font-semibold mb-4">Quick Order</h3>
              <div className="flex gap-3">
                <Input
                  type="number"
                  placeholder="Table number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="bg-white/20 border-white/30 text-white placeholder-white/70 backdrop-blur-sm"
                />
                <Button
                  onClick={handleOrderNow}
                  disabled={!tableNumber}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold px-6 whitespace-nowrap"
                >
                  Order Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-sm text-blue-100 mt-3">
                Find your table number on the table tent
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why customers love us
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Experience the future of café ordering with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-modern group cursor-default">
                <CardContent className="p-8 text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl mb-6 group-hover:scale-110 transition-transform duration-200">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Three simple steps
            </h2>
            <p className="text-xl text-gray-600">
              Get your order started in less than a minute
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Scan or Enter",
                description: "Use your phone to scan the QR code at your table, or enter your table number",
                icon: <Smartphone className="w-8 h-8" />
              },
              {
                step: "2", 
                title: "Browse & Add",
                description: "Explore our curated menu and add your favorites to the cart",
                icon: <Coffee className="w-8 h-8" />
              },
              {
                step: "3",
                title: "Relax & Enjoy",
                description: "Sit back while we prepare your order and deliver it fresh to your table",
                icon: <Clock className="w-8 h-8" />
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-blue-200 to-purple-200 transform translate-x-4"></div>
                )}
                <Card className="card-modern relative z-10">
                  <CardContent className="p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full mb-6 text-xl font-bold">
                      {item.step}
                    </div>
                    <div className="mb-4 text-blue-600">
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {item.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Table Access */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Quick table access
            </h2>
            <p className="text-xl text-gray-600">
              Don't have a QR code? Select your table number below
            </p>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 max-w-4xl mx-auto">
            {quickTables.map((tableNum) => (
              <Button
                key={tableNum}
                onClick={() => window.location.href = `/order?t=${tableNum}`}
                variant="outline"
                className="h-16 text-lg font-semibold hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all duration-200 group"
              >
                <div className="flex flex-col items-center">
                  <MapPin className="w-4 h-4 mb-1 group-hover:text-blue-600" />
                  <span>{tableNum}</span>
                </div>
              </Button>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-500">
              Can't find your table? Ask our friendly staff for assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Staff Access */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-2xl font-bold mb-6">Staff & Admin Portal</h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => window.location.href = "/staff"}
              variant="secondary"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8"
            >
              Staff Dashboard
            </Button>
            <Button
              onClick={() => window.location.href = "/admin"}
              variant="secondary" 
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold px-8"
            >
              Admin Portal
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}