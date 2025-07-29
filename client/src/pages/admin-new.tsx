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
  Calendar, TrendingDown, Activity, PieChart, BarChart3
} from "lucide-react";
import type { MenuItem, OrderWithItems } from "@shared/schema";
import { insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertMenuItemSchema.omit({ id: true, createdAt: true, updatedAt: true });

export default function AdminNew() {
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
      category: "coffee" as const,
      imageUrl: "",
      isActive: true,
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
        title: "Menu Item Created",
        description: "The menu item has been added successfully.",
      });
      setIsAddMenuOpen(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create menu item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const response = await apiRequest("PUT", `/api/menu/${id}`, { isActive: active });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu Item Updated",
        description: "The menu item status has been updated.",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiRequest("DELETE", `/api/menu/${id}`);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu Item Deleted",
        description: "The menu item has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Cannot Delete Menu Item",
        description: error.message || "This item has been ordered and cannot be deleted. Mark as inactive instead.",
        variant: "destructive",
      });
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: { number: number; capacity: number }) => {
      const response = await apiRequest("POST", "/api/tables", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      toast({
        title: "Table Created",
        description: "New table has been added successfully.",
      });
      setIsAddTableOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create table. Please try again.",
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
      toast({
        title: "Table Deleted",
        description: "The table has been removed.",
      });
    },
  });

  const handleExportExcel = () => {
    window.open('/api/export/excel', '_blank');
  };

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMenuItemMutation.mutate(data);
  };

  const generateQRCode = (qrCodeUrl: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrCodeUrl)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Coffee className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Café Direct</h1>
                <p className="text-sm text-gray-500">Admin Dashboard</p>
              </div>
            </div>
            <Button 
              onClick={handleExportExcel}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "menu", label: "Menu Items", icon: Utensils },
              { id: "orders", label: "Orders", icon: Receipt },
              { id: "tables", label: "Tables", icon: Table },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${stats?.totalRevenue?.toFixed(2) || "0.00"}
                      </p>
                    </div>
                    <DollarSign className="w-8 h-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Orders Today</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.ordersToday || 0}
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.pendingOrders || 0}
                      </p>
                    </div>
                    <Clock className="w-8 h-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600">Active Tables</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {stats?.activeTables || 0}
                      </p>
                    </div>
                    <Table className="w-8 h-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Orders Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart className="w-5 h-5" />
                    <span>Orders Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Today</span>
                      <span className="font-semibold">{stats?.ordersToday || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Week</span>
                      <span className="font-semibold">{stats?.ordersThisWeek || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">This Month</span>
                      <span className="font-semibold">{stats?.ordersThisMonth || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Most Ordered Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="w-5 h-5" />
                    <span>Popular Items</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.mostOrderedItems?.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.category}
                          </Badge>
                        </div>
                        <span className="text-sm text-gray-600">{item.count} orders</span>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4">No order data available</p>
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
              <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
              <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Menu Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Menu Item</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Coffee Americano" {...field} />
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
                              <Textarea placeholder="Rich espresso with hot water..." {...field} />
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
                                    <SelectValue placeholder="Select category" />
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
                        className="w-full bg-orange-600 hover:bg-orange-700"
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
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                      </div>
                      <Badge 
                        variant={item.isActive ? "default" : "secondary"}
                        className="ml-2"
                      >
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-900">${item.price}</span>
                        <Badge variant="outline" className="ml-2 capitalize">
                          {item.category}
                        </Badge>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateMenuItemMutation.mutate({ 
                            id: item.id, 
                            active: !item.isActive 
                          })}
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
                          className="text-red-600 hover:text-red-700"
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
            <h2 className="text-xl font-semibold text-gray-900">Order Management</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Order #{order.orderNumber}
                          </h3>
                          <Badge 
                            variant={
                              order.status === "completed" ? "default" :
                              order.status === "preparing" ? "secondary" :
                              order.status === "ready" ? "outline" : "destructive"
                            }
                          >
                            {order.status}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            Table {order.tableNumber}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-3">
                          {order.orderItems.map((item, index) => (
                            <span key={item.id}>
                              {item.quantity}x {item.menuItem.name}
                              {index < order.orderItems.length - 1 && ", "}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm">
                          <span className="text-gray-500">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ""}
                          </span>
                          <span className="font-semibold text-gray-900">
                            Total: ${order.total}
                          </span>
                        </div>
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
              <h2 className="text-xl font-semibold text-gray-900">Table Management</h2>
              <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-orange-600 hover:bg-orange-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Table
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Table</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Table Number
                      </label>
                      <Input 
                        id="tableNumber" 
                        type="number" 
                        placeholder="5" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacity
                      </label>
                      <Input 
                        id="tableCapacity" 
                        type="number" 
                        placeholder="4" 
                        defaultValue="4"
                      />
                    </div>
                    <Button 
                      className="w-full bg-orange-600 hover:bg-orange-700"
                      onClick={() => {
                        const numberInput = document.getElementById("tableNumber") as HTMLInputElement;
                        const capacityInput = document.getElementById("tableCapacity") as HTMLInputElement;
                        
                        if (numberInput?.value && capacityInput?.value) {
                          createTableMutation.mutate({
                            number: parseInt(numberInput.value),
                            capacity: parseInt(capacityInput.value)
                          });
                        }
                      }}
                    >
                      Create Table
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tables.map((table) => (
                <Card key={table.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-gray-900">Table {table.number}</h3>
                        <p className="text-sm text-gray-500">Capacity: {table.capacity} guests</p>
                      </div>
                      <Badge 
                        variant={table.status === "available" ? "default" : "secondary"}
                      >
                        {table.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-center">
                        <img
                          src={generateQRCode(table.qrCode)}
                          alt={`QR Code for Table ${table.number}`}
                          className="w-32 h-32 border rounded"
                        />
                      </div>
                      
                      <div className="text-center">
                        <p className="text-xs text-gray-500 mb-2">QR Code URL:</p>
                        <p className="text-xs text-gray-700 break-all bg-gray-50 p-2 rounded">
                          {table.qrCode}
                        </p>
                      </div>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700"
                        onClick={() => deleteTableMutation.mutate(table.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Table
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}