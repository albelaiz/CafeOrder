import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Clock, Users, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cafe-bg to-orange-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-cafe-brown to-cafe-light text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Coffee className="w-16 h-16" />
          </div>
          <h1 className="text-5xl font-bold mb-4">Welcome to Café Direct</h1>
          <p className="text-xl opacity-90 mb-8">
            Order directly from your table - No waiting required!
          </p>
          <p className="text-lg opacity-80 mb-8">
            Experience the future of café dining with our seamless ordering system
          </p>
          <Button
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-white text-cafe-brown hover:bg-gray-100 font-semibold px-8 py-4 text-lg"
          >
            Get Started
          </Button>
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
              <Users className="w-12 h-12 text-cafe-accent mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Better Service
              </h3>
              <p className="text-gray-600">
                Our staff can focus on preparing your perfect order while you relax and enjoy the ambiance.
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

      {/* Call to Action */}
      <div className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Experience Café Direct?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who have discovered a better way to dine.
          </p>
          <Button
            onClick={() => window.location.href = "/api/login"}
            size="lg"
            className="bg-cafe-accent hover:bg-orange-600 text-white font-semibold px-8 py-4 text-lg"
          >
            Sign In to Order
          </Button>
        </div>
      </div>
    </div>
  );
}
