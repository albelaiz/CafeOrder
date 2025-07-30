import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Plus, Download, Utensils, Receipt, BarChart, Users, Edit, 
  ToggleLeft, ToggleRight, Trash2, Table, DollarSign, 
  Clock, CheckCircle, TrendingUp, Coffee, QrCode,
  Calendar, Activity, PieChart, BarChart3, Target,
  Zap, Star, MapPin, Eye, Settings
} from "lucide-react";
import type { MenuItem, OrderWithItems } from "@shared/schema";
import { insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertMenuItemSchema.omit({ id: true, createdAt: true, updatedAt: true });
const tableFormSchema = z.object({
  number: z.number().min(1, "Table number must be at least 1"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  status: z.string().default("available"),
});

export default function AdminUltraModern() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const { data: tables = [], isLoading: tablesLoading } = useQuery<any[]>({
    queryKey: ["/api/tables"],
  });

  const { data: stats } = useQuery<{
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    ordersToday: number;
    ordersThisWeek: number;
    ordersThisMonth: number;
    mostOrderedItems: Array<{ name: string; count: number; category: string }>;
    activeTables: number;
  }>({
    queryKey: ["/api/analytics/stats"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "coffee",
      imageUrl: "",
      isActive: true,
    },
  });

  const tableForm = useForm<z.infer<typeof tableFormSchema>>({
    resolver: zodResolver(tableFormSchema),
    defaultValues: {
      number: 0,
      capacity: 4,
      status: "available",
    },
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await apiRequest("POST", "/api/menu", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu item created",
        description: "Successfully added to your menu",
      });
      setIsAddMenuOpen(false);
      form.reset();
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest("PUT", `/api/menu/${id}`, { isActive: active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/menu/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
    },
    onError: (error: any) => {
      toast({
        title: "Cannot delete item",
        description: error.message || "This item has orders and cannot be deleted.",
        variant: "destructive",
      });
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: z.infer<typeof tableFormSchema>) => {
      const response = await apiRequest("POST", "/api/tables", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Table created successfully",
        description: "New table added to your café",
      });
      setIsAddTableOpen(false);
      tableForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create table",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/tables/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
    },
  });

  const handleExportExcel = () => {
    window.open('/api/export/excel', '_blank');
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMenuItemMutation.mutate(data);
  };

  const onTableSubmit = (data: z.infer<typeof tableFormSchema>) => {
    createTableMutation.mutate(data);
  };

  const generateQRCode = (qrCodeUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      preparing: "bg-blue-100 text-blue-800 border-blue-200", 
      ready: "bg-green-100 text-green-800 border-green-200",
      completed: "bg-gray-100 text-gray-800 border-gray-200"
    };
    return styles[status as keyof typeof styles] || styles.pending;
  };

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <Card className="card-modern overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {change && (
              <p className="text-sm text-green-600 mt-1">
                ↗ {change} from last month
              </p>
            )}
          </div>
          <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center`}>
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
                <p className="text-sm text-gray-500">Administrative Dashboard</p>
              </div>
            </div>
            <Button 
              onClick={handleExportExcel}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium px-6"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Navigation */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "menu", label: "Menu", icon: Utensils },
              { id: "orders", label: "Orders", icon: Receipt },
              { id: "tables", label: "Tables", icon: Table },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={`$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
                change="+12%"
                color="bg-gradient-to-r from-green-500 to-emerald-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Orders Today"
                value={stats?.ordersToday || 0}
                change="+8%"
                color="bg-gradient-to-r from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={Clock}
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                color="bg-gradient-to-r from-orange-500 to-red-500"
              />
              <StatCard
                icon={Table}
                title="Active Tables"
                value={stats?.activeTables || 0}
                color="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            {/* Quick Actions */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="w-5 h-5 text-blue-600" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveTab("menu")}
                    className="h-20 flex flex-col items-center justify-center space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-sm">Add Menu Item</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("tables")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                  >
                    <Table className="w-6 h-6 text-purple-600" />
                    <span className="text-sm text-purple-600">Manage Tables</span>
                  </Button>
                  <Button
                    onClick={() => setActiveTab("orders")}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300"
                  >
                    <Receipt className="w-6 h-6 text-green-600" />
                    <span className="text-sm text-green-600">View Orders</span>
                  </Button>
                  <Button
                    onClick={handleExportExcel}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300"
                  >
                    <Download className="w-6 h-6 text-orange-600" />
                    <span className="text-sm text-orange-600">Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Orders Timeline */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Order Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Today", value: stats?.ordersToday || 0, color: "bg-blue-500" },
                    { label: "This Week", value: stats?.ordersThisWeek || 0, color: "bg-green-500" },
                    { label: "This Month", value: stats?.ordersThisMonth || 0, color: "bg-purple-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Items */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Popular Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.mostOrderedItems?.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{item.count} orders</span>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No order data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders */}
            <Card className="card-modern">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-gray-600" />
                    <span>Recent Orders</span>
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("orders")}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                          #{order.orderNumber.slice(-3)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Order #{order.orderNumber}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-3 h-3" />
                            <span>Table {order.tableNumber}</span>
                            <span>•</span>
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">${order.total}</p>
                        <Badge className={`${getStatusBadge(order.status)} text-xs mt-1`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No recent orders</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Table Status Overview */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Table className="w-5 h-5 text-blue-600" />
                  <span>Table Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tablesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : tables.length === 0 ? (
                  <div className="text-center py-8">
                    <Table className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No tables created yet</p>
                    <Button
                      onClick={() => setActiveTab("tables")}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Table
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {tables.slice(0, 12).map((table) => {
                      const tableOrders = orders.filter(order => order.tableNumber === table.number);
                      const activeTableOrders = tableOrders.filter(order => !["completed", "cancelled"].includes(order.status));
                      
                      return (
                        <div key={table.id} className="group">
                          <Button
                            variant="outline"
                            className={`w-full h-20 flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                              activeTableOrders.length > 0 
                                ? "border-orange-300 bg-orange-50 hover:bg-orange-100" 
                                : "hover:bg-blue-50 hover:border-blue-300"
                            }`}
                            onClick={() => setActiveTab("tables")}
                          >
                            <MapPin className={`w-5 h-5 ${
                              activeTableOrders.length > 0 
                                ? "text-orange-600" 
                                : "text-gray-600 group-hover:text-blue-600"
                            }`} />
                            <span className="font-semibold">Table {table.number}</span>
                            <span className="text-xs text-gray-500">{table.capacity} seats</span>
                          </Button>
                          {activeTableOrders.length > 0 && (
                            <div className="mt-1 text-center">
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                                {activeTableOrders.length} active
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "overview-stats" && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={DollarSign}
                title="Total Revenue"
                value={`$${stats?.totalRevenue?.toFixed(2) || "0.00"}`}
                change="+12%"
                color="bg-gradient-to-r from-green-500 to-emerald-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Orders Today"
                value={stats?.ordersToday || 0}
                change="+8%"
                color="bg-gradient-to-r from-blue-500 to-indigo-600"
              />
              <StatCard
                icon={Clock}
                title="Pending Orders"
                value={stats?.pendingOrders || 0}
                color="bg-gradient-to-r from-orange-500 to-red-500"
              />
              <StatCard
                icon={Table}
                title="Active Tables"
                value={stats?.activeTables || 0}
                color="bg-gradient-to-r from-purple-500 to-pink-500"
              />
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Orders Timeline */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    <span>Order Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: "Today", value: stats?.ordersToday || 0, color: "bg-blue-500" },
                    { label: "This Week", value: stats?.ordersThisWeek || 0, color: "bg-green-500" },
                    { label: "This Month", value: stats?.ordersThisMonth || 0, color: "bg-purple-500" },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <span className="font-medium text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Popular Items */}
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Star className="w-5 h-5 text-yellow-500" />
                    <span>Popular Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.mostOrderedItems?.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">{item.name}</span>
                            <Badge variant="secondary" className="ml-2 text-xs">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{item.count} orders</span>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No order data available</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "menu" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <p className="text-gray-600 mt-1">Manage your café's menu items and categories</p>
              </div>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Menu Item</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Item Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Cappuccino" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Rich espresso with steamed milk..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input placeholder="4.50" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="coffee">Coffee</SelectItem>
                                  <SelectItem value="food">Food</SelectItem>
                                  <SelectItem value="desserts">Desserts</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={createMenuItemMutation.isPending}
                      >
                        {createMenuItemMutation.isPending ? "Creating..." : "Create Item"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card key={item.id} className="card-modern overflow-hidden group">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      <Coffee className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                        </div>
                        <Badge 
                          variant={item.isActive ? "default" : "secondary"}
                          className={item.isActive ? "bg-green-100 text-green-800" : ""}
                        >
                          {item.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl font-bold text-gray-900">${item.price}</span>
                          <Badge variant="outline" className="capitalize text-xs">
                            {item.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMenuItemMutation.mutate({ 
                            id: item.id, 
                            active: !item.isActive 
                          })}
                          className="flex-1"
                        >
                          {item.isActive ? (
                            <ToggleRight className="w-4 h-4" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => deleteMenuItemMutation.mutate(item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
              <p className="text-gray-600 mt-1">Monitor and manage customer orders</p>
            </div>
            
            <div className="grid gap-6">
              {orders.map((order) => (
                <Card key={order.id} className="card-modern">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                          #{order.orderNumber.slice(-3)}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <MapPin className="w-4 h-4" />
                            <span>Table {order.tableNumber}</span>
                            <span>•</span>
                            <span>{order.createdAt ? new Date(order.createdAt).toLocaleTimeString() : ""}</span>
                          </div>
                        </div>
                      </div>
                      
                      <Badge className={`${getStatusBadge(order.status)} border font-medium px-3 py-1`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Order Items</h4>
                        <div className="space-y-2">
                          {order.orderItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-sm">{item.menuItem.name}</span>
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {item.menuItem.category}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-medium">×{item.quantity}</span>
                                <div className="text-xs text-gray-500">${item.totalPrice}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col justify-between">
                        <div className="text-right">
                          <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                          <p className="text-2xl font-bold text-gray-900">${order.total}</p>
                        </div>
                        
                        {order.notes && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Notes:</strong> {order.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === "tables" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
                <p className="text-gray-600 mt-1">Manage café tables and QR codes</p>
              </div>
              <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Table</DialogTitle>
                  </DialogHeader>
                  <Form {...tableForm}>
                    <form onSubmit={tableForm.handleSubmit(onTableSubmit)} className="space-y-4">
                      <FormField
                        control={tableForm.control}
                        name="number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Table Number</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="5" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={tableForm.control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Capacity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="4" 
                                {...field} 
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={createTableMutation.isPending}
                      >
                        {createTableMutation.isPending ? "Creating..." : "Create Table"}
                      </Button>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            {tablesLoading ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 animate-pulse mx-auto">
                  <Table className="w-8 h-8 text-white" />
                </div>
                <p className="text-gray-600 text-lg">Loading tables...</p>
              </div>
            ) : tables.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <Table className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No tables yet</h3>
                <p className="text-gray-500 mb-4">Create your first table to start managing customer orders</p>
                <Button
                  onClick={() => setIsAddTableOpen(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Table
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tables.map((table) => {
                  const tableOrders = orders.filter(order => order.tableNumber === table.number);
                  const activeTableOrders = tableOrders.filter(order => !["completed", "cancelled"].includes(order.status));
                  
                  return (
                    <Card key={table.id} className="card-modern overflow-hidden group">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                              {table.number}
                            </div>
                            <div>
                              <h3 className="text-xl font-semibold text-gray-900">Table {table.number}</h3>
                              <p className="text-sm text-gray-500">{table.capacity} guests capacity</p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge 
                              variant={table.status === "available" ? "default" : "secondary"}
                              className={table.status === "available" ? "bg-green-100 text-green-800" : ""}
                            >
                              {table.status}
                            </Badge>
                            {activeTableOrders.length > 0 && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                                {activeTableOrders.length} active orders
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          {/* QR Code */}
                          <div className="flex justify-center">
                            <div className="p-3 bg-white border-2 border-gray-200 rounded-xl shadow-sm">
                              <img
                                src={generateQRCode(table.qrCode)}
                                alt={`QR Code for Table ${table.number}`}
                                className="w-24 h-24"
                              />
                            </div>
                          </div>
                          
                          {/* Table Stats */}
                          <div className="grid grid-cols-2 gap-3 text-center">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Total Orders</p>
                              <p className="text-lg font-bold text-gray-900">{tableOrders.length}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-500">Active</p>
                              <p className="text-lg font-bold text-gray-900">{activeTableOrders.length}</p>
                            </div>
                          </div>
                          
                          {/* QR Code URL */}
                          <div className="text-center">
                            <p className="text-xs text-gray-500 mb-2">QR Code URL:</p>
                            <p className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded-lg font-mono">
                              {table.qrCode}
                            </p>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                              onClick={() => {
                                // Open orders filtered by this table
                                setActiveTab("orders");
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Orders
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => {
                                if (activeTableOrders.length > 0) {
                                  toast({
                                    title: "Cannot delete table",
                                    description: "This table has active orders. Complete them first.",
                                    variant: "destructive",
                                  });
                                } else {
                                  deleteTableMutation.mutate(table.id);
                                }
                              }}
                              disabled={activeTableOrders.length > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}