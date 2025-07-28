import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Coffee, QrCode, Smartphone, Clock, Users, Star, MapPin } from "lucide-react";

export default function Home() {
  const [tableNumber, setTableNumber] = useState("");

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
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cafe-brown to-cafe-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Coffee className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Welcome to Café Direct</h1>
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

      {/* QR Code Demo Section */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Table QR Codes
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Each table has a unique QR code. Scan to start ordering from that table.
        </p>
        
        <div className="grid md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((table) => (
            <Card key={table} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center mb-4">
                  <MapPin className="w-4 h-4 text-cafe-brown mr-1" />
                  <span className="font-semibold text-cafe-brown">Table {table}</span>
                </div>
                <img
                  src={generateQRCode(table)}
                  alt={`QR Code for Table ${table}`}
                  className="mx-auto mb-4 rounded-lg"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/order?t=${table}`}
                  className="w-full"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Order from Table {table}
                </Button>
              </CardContent>
            </Card>
          ))}
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