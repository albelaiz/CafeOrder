import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Coffee, Clock, MapPin, Home } from "lucide-react";

export default function ThankYouNew() {
  const [, setLocation] = useLocation();
  const [orderNumber] = useState(() => 
    `CF${Math.random().toString(36).substr(2, 6).toUpperCase()}`
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="text-center p-8 space-y-6">
          {/* Success Icon */}
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          {/* Main Message */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Order Placed Successfully!
            </h1>
            <p className="text-gray-600">
              Your order has been received and is being prepared.
            </p>
          </div>

          {/* Order Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <Coffee className="w-5 h-5" />
              <span className="font-semibold">Order #{orderNumber}</span>
            </div>
            
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>15-20 mins</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>Your table</span>
              </div>
            </div>
          </div>

          {/* Status Updates */}
          <div className="text-left space-y-3">
            <h3 className="font-semibold text-gray-900 text-center">Order Status</h3>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700">Order received</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Preparing your order</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-500">Ready for pickup</span>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800 text-center">
              💡 Stay at your table and we'll bring your order to you when it's ready!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={() => setLocation('/')}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            
            <p className="text-xs text-gray-500">
              Thank you for choosing Café Direct!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}