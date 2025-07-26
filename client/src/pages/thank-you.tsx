import { useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coffee, Clock, MapPin } from "lucide-react";

export default function ThankYou() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Auto-redirect to home after 10 seconds
    const timer = setTimeout(() => {
      setLocation('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [setLocation]);

  return (
    <div className="min-h-screen bg-cafe-bg flex items-center justify-center">
      <div className="max-w-md mx-auto px-4">
        <Card className="text-center">
          <CardContent className="pt-8 pb-8">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Thank You!</h1>
              <p className="text-gray-600">Your order has been placed successfully</p>
            </div>
            
            <div className="bg-cafe-bg rounded-lg p-4 mb-6">
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  <span>12-15 mins</span>
                </div>
                <div className="flex items-center">
                  <Coffee className="w-4 h-4 mr-1" />
                  <span>Fresh & Hot</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Order Status:</span>
                <span className="text-cafe-brown font-medium">Being Prepared</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Pickup Location:</span>
                <span className="text-cafe-brown font-medium">Counter</span>
              </div>
            </div>

            <div className="border-t pt-4 mb-6">
              <p className="text-sm text-gray-600 mb-2">
                We'll notify you when your order is ready for pickup.
              </p>
              <p className="text-xs text-gray-500">
                Thank you for choosing Café Direct!
              </p>
            </div>

            <div className="space-y-3">
              <Button 
                className="w-full bg-cafe-accent hover:bg-orange-600"
                onClick={() => setLocation('/')}
              >
                Return to Home
              </Button>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.location.href = `${window.location.origin}/order?t=${new URLSearchParams(window.location.search).get('t') || '1'}`}
              >
                Place Another Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}