import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { OrderCard } from "@/components/OrderCard";
import { TableMap } from "@/components/TableMap";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Users, TrendingUp, Star } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function Staff() {
  const [orderFilter, setOrderFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  useWebSocket((message) => {
    if (message.type === "ORDER_CREATED") {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "New Order!",
        description: `Order #${message.data.orderNumber} received`,
      });
    } else if (message.type === "ORDER_STATUS_UPDATED") {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    }
  });

  const filteredOrders = orderFilter === "all" 
    ? orders.filter(order => order.status !== "completed")
    : orders.filter(order => order.status === orderFilter);

  const handleUpdateOrderStatus = (orderId: string, status: string) => {
    updateOrderStatusMutation.mutate({ orderId, status });
  };

  return (
    <div className="min-h-screen bg-cafe-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Staff Dashboard Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Staff Dashboard</h2>
                <p className="text-gray-600">Manage orders and café operations</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-cafe-brown">
                    {stats?.pendingOrders || 0}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats?.completedToday || 0}
                  </div>
                  <div className="text-sm text-gray-600">Completed Today</div>
                </div>
                <Button className="bg-cafe-brown hover:bg-cafe-light">
                  <Bell className="w-4 h-4 mr-2" />
                  Notifications
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Orders Queue */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Active Orders</h3>
                  <div className="flex space-x-2">
                    <Button
                      variant={orderFilter === "all" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrderFilter("all")}
                      className={orderFilter === "all" ? "bg-cafe-brown hover:bg-cafe-light" : ""}
                    >
                      All
                    </Button>
                    <Button
                      variant={orderFilter === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrderFilter("pending")}
                      className={orderFilter === "pending" ? "bg-cafe-brown hover:bg-cafe-light" : ""}
                    >
                      Pending
                    </Button>
                    <Button
                      variant={orderFilter === "preparing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setOrderFilter("preparing")}
                      className={orderFilter === "preparing" ? "bg-cafe-brown hover:bg-cafe-light" : ""}
                    >
                      Preparing
                    </Button>
                  </div>
                </div>

                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                        <div className="h-6 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-4"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onUpdateStatus={handleUpdateOrderStatus}
                      />
                    ))}
                    {filteredOrders.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No {orderFilter === "all" ? "active" : orderFilter} orders</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Café Map & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <TableMap />

            {/* Quick Stats */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Today's Performance</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Orders</span>
                    <span className="font-bold text-cafe-brown">
                      {stats?.totalOrders || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Revenue</span>
                    <span className="font-bold text-cafe-brown">
                      ${(stats?.revenue || 0).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg. Order Time</span>
                    <span className="font-bold text-cafe-brown">14 mins</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Customer Rating</span>
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-cafe-brown">4.8</span>
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
