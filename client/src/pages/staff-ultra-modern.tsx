import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Clock, CheckCircle, AlertCircle, Coffee, 
  MapPin, DollarSign, RefreshCw, ChefHat,
  Timer, Package, Zap, Eye, Filter,
  Users, Target, TrendingUp
} from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

export default function StaffUltraModern() {
  const [statusFilter, setStatusFilter] = useState("active");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { logoutMutation } = useAuth();

  const { data: orders = [], isLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 10000, // Refresh every 10 seconds for real-time updates
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const response = await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
      return response.json();
    },
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Order updated",
        description: `Order #${updatedOrder.orderNumber} is now ${updatedOrder.status}`,
      });
    },
  });

  useWebSocket((message) => {
    if (message.type === "ORDER_STATUS_UPDATED") {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }
  });

  const filteredOrders = statusFilter === "active" 
    ? orders.filter(order => !["completed"].includes(order.status))
    : statusFilter === "all"
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200", 
        icon: <Clock className="w-4 h-4" />,
        gradient: "from-yellow-400 to-orange-500"
      },
      preparing: { 
        color: "bg-blue-100 text-blue-800 border-blue-200", 
        icon: <ChefHat className="w-4 h-4" />,
        gradient: "from-blue-400 to-indigo-500"
      },
      ready: { 
        color: "bg-green-100 text-green-800 border-green-200", 
        icon: <CheckCircle className="w-4 h-4" />,
        gradient: "from-green-400 to-emerald-500"
      },
      completed: { 
        color: "bg-gray-100 text-gray-800 border-gray-200", 
        icon: <CheckCircle className="w-4 h-4" />,
        gradient: "from-gray-400 to-gray-500"
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const getNextStatusInfo = (currentStatus: string) => {
    const transitions = {
      pending: { next: "preparing", label: "Start Preparing", color: "from-blue-500 to-indigo-600" },
      preparing: { next: "ready", label: "Mark Ready", color: "from-green-500 to-emerald-600" },
      ready: { next: "completed", label: "Complete Order", color: "from-purple-500 to-pink-600" },
      completed: { next: "", label: "Completed", color: "from-gray-400 to-gray-500" }
    };
    return transitions[currentStatus as keyof typeof transitions] || transitions.pending;
  };

  const activeOrders = orders.filter(order => !["completed"].includes(order.status));
  const pendingCount = orders.filter(order => order.status === "pending").length;
  const preparingCount = orders.filter(order => order.status === "preparing").length;
  const readyCount = orders.filter(order => order.status === "ready").length;

  const StatCard = ({ icon: Icon, title, value, color, subtitle }: any) => (
    <Card className="card-modern overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Ultra Modern Header */}
      <div className="bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Café Direct</h1>
                <p className="text-sm text-gray-500">Kitchen Dashboard</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/orders"] })}
                className="flex items-center space-x-2 hover:bg-blue-50"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </Button>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active Orders</SelectItem>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="preparing">Preparing</SelectItem>
                  <SelectItem value="ready">Ready</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="destructive"
                size="lg"
                className="text-lg px-8 py-3 font-bold shadow-lg border-2 border-red-600 hover:bg-red-700 transition-colors duration-200"
                onClick={() => {
                  localStorage.clear();
                  queryClient.clear();
                  queryClient.setQueryData(["/api/auth/user"], null);
                  window.location.href = "/login";
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Real-time Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Clock}
            title="Pending Orders"
            value={pendingCount}
            color="from-yellow-500 to-orange-600"
            subtitle="Need attention"
          />
          <StatCard
            icon={ChefHat}
            title="Preparing"
            value={preparingCount}
            color="from-blue-500 to-indigo-600"
            subtitle="In kitchen"
          />
          <StatCard
            icon={Package}
            title="Ready"
            value={readyCount}
            color="from-green-500 to-emerald-600"
            subtitle="For pickup"
          />
          <StatCard
            icon={Target}
            title="Active Orders"
            value={activeOrders.length}
            color="from-purple-500 to-pink-600"
            subtitle="Total active"
          />
        </div>

        {/* Orders Grid */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
              <Coffee className="w-8 h-8 text-white" />
            </div>
            <p className="text-gray-600 text-lg">Loading orders...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <CheckCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-500">
              {statusFilter === "active" ? "No active orders right now" : `No ${statusFilter} orders`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => {
              const statusConfig = getStatusConfig(order.status);
              const nextStatus = getNextStatusInfo(order.status);

              return (
                <Card key={order.id} className="card-modern overflow-hidden group">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-r ${statusConfig.gradient} rounded-xl flex items-center justify-center text-white font-bold`}>
                          #{order.orderNumber.slice(-3)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">Order #{order.orderNumber}</CardTitle>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>Table {order.tableNumber}</span>
                            <span>•</span>
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}</span>
                          </div>
                        </div>
                      </div>

                      <Badge className={`${statusConfig.color} border font-medium px-3 py-1`}>
                        <div className="flex items-center space-x-1">
                          {statusConfig.icon}
                          <span className="capitalize">{order.status}</span>
                        </div>
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Order Items */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-900 text-sm mb-2">Items to prepare:</h4>
                      {order.orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-gray-700">
                              {item.quantity}
                            </div>
                            <div>
                              <span className="font-medium text-sm text-gray-900">{item.menuItem.name}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                {item.menuItem.category}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-sm font-semibold text-gray-600">${item.totalPrice}</span>
                        </div>
                      ))}
                    </div>

                    {/* Order Summary */}
                    <div className="border-t pt-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Timer className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Order Time:</span>
                        </div>
                        <span className="text-sm font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <DollarSign className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Total:</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900">${order.total}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    {order.status !== "completed" && (
                      <Button
                        onClick={() => updateOrderStatusMutation.mutate({
                          orderId: order.id,
                          status: nextStatus.next
                        })}
                        disabled={updateOrderStatusMutation.isPending}
                        className={`w-full bg-gradient-to-r ${nextStatus.color} hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-white font-semibold py-3`}
                      >
                        <div className="flex items-center justify-center space-x-2">
                          {order.status === "pending" && <ChefHat className="w-4 h-4" />}
                          {order.status === "preparing" && <Package className="w-4 h-4" />}
                          {order.status === "ready" && <CheckCircle className="w-4 h-4" />}
                          <span>{nextStatus.label}</span>
                        </div>
                      </Button>
                    )}

                    {order.notes && (
                      <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Eye className="w-3 h-3 mt-0.5 text-blue-600" />
                          <div>
                            <strong className="text-blue-800">Customer Notes:</strong>
                            <p className="mt-1 text-blue-700">{order.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}