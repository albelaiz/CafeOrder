import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/hooks/useWebSocket";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Download, Utensils, Receipt, BarChart, Users, Edit, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import type { MenuItem, OrderWithItems } from "@shared/schema";
import { insertMenuItemSchema } from "@shared/schema";
import { z } from "zod";

const formSchema = insertMenuItemSchema.extend({
  price: z.string().min(1, "Price is required").transform(val => parseFloat(val)),
});

export default function Admin() {
  const [activeTab, setActiveTab] = useState("menu");
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: menuItems = [], isLoading: menuLoading } = useQuery<MenuItem[]>({
    queryKey: ["/api/menu"],
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery<OrderWithItems[]>({
    queryKey: ["/api/orders"],
  });

  const { data: stats } = useQuery<{
    revenue: number;
    pendingOrders: number;
    completedToday: number;
    totalOrders: number;
  }>({
    queryKey: ["/api/analytics/stats"],
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "0",
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create menu item",
        variant: "destructive",
      });
    },
  });

  const updateMenuItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<MenuItem> }) => {
      const response = await apiRequest("PATCH", `/api/menu/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu Item Updated",
        description: "The menu item has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update menu item",
        variant: "destructive",
      });
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/menu/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
      toast({
        title: "Menu Item Deleted",
        description: "The menu item has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  useWebSocket((message) => {
    if (message.type === "MENU_ITEM_ADDED" || message.type === "MENU_ITEM_UPDATED" || message.type === "MENU_ITEM_DELETED") {
      queryClient.invalidateQueries({ queryKey: ["/api/menu"] });
    }
    if (message.type === "ORDER_CREATED") {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
    }
  });

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    createMenuItemMutation.mutate(data);
  };

  const toggleMenuItemStatus = (item: MenuItem) => {
    updateMenuItemMutation.mutate({
      id: item.id,
      data: { isActive: !item.isActive },
    });
  };

  const deleteMenuItem = (id: string) => {
    if (confirm("Are you sure you want to delete this menu item?")) {
      deleteMenuItemMutation.mutate(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "coffee": return "bg-orange-100 text-orange-800";
      case "food": return "bg-blue-100 text-blue-800";
      case "desserts": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const completedOrders = orders.filter(order => order.status === "completed");
  const revenue = completedOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);

  return (
    <div className="min-h-screen bg-cafe-bg">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Dashboard Header */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h2>
                <p className="text-gray-600">Manage menu, staff, and café operations</p>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-cafe-accent hover:bg-orange-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Menu Item
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Menu Item</DialogTitle>
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
                                <Input placeholder="Enter item name" {...field} />
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
                        <FormField
                          control={form.control}
                          name="price"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input type="number" step="0.01" placeholder="0.00" {...field} className="pr-12" />
                                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">DH</span>
                                </div>
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
                                <Textarea placeholder="Enter item description" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="imageUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Item Image</FormLabel>
                              <FormControl>
                                <Input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // For now, we'll use a placeholder URL
                                      // In production, you'd upload to a file service
                                      field.onChange(`/images/${file.name}`);
                                    }
                                  }}
                                  className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="flex space-x-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={() => setIsAddMenuOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1 bg-cafe-accent hover:bg-orange-600"
                            disabled={createMenuItemMutation.isPending}
                          >
                            Add Item
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
                <Button className="bg-cafe-brown hover:bg-cafe-light">
                  <Download className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Navigation Tabs */}
        <Card className="mb-8">
          <div className="flex border-b">
            <Button
              variant="ghost"
              className={`flex-1 py-4 px-6 rounded-none border-b-2 ${
                activeTab === "menu"
                  ? "border-cafe-brown text-cafe-brown"
                  : "border-transparent text-gray-600 hover:text-cafe-brown"
              }`}
              onClick={() => setActiveTab("menu")}
            >
              <Utensils className="w-4 h-4 mr-2" />
              Menu Management
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 py-4 px-6 rounded-none border-b-2 ${
                activeTab === "orders"
                  ? "border-cafe-brown text-cafe-brown"
                  : "border-transparent text-gray-600 hover:text-cafe-brown"
              }`}
              onClick={() => setActiveTab("orders")}
            >
              <Receipt className="w-4 h-4 mr-2" />
              Order History
            </Button>
            <Button
              variant="ghost"
              className={`flex-1 py-4 px-6 rounded-none border-b-2 ${
                activeTab === "analytics"
                  ? "border-cafe-brown text-cafe-brown"
                  : "border-transparent text-gray-600 hover:text-cafe-brown"
              }`}
              onClick={() => setActiveTab("analytics")}
            >
              <BarChart className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </Card>

        {/* Tab Content */}
        {activeTab === "menu" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Menu Items</h3>
                <div className="flex space-x-2">
                  <Input placeholder="Search menu items..." className="w-64" />
                  <Select>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="coffee">Coffee</SelectItem>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="desserts">Desserts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Item</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menuLoading ? (
                      [...Array(5)].map((_, i) => (
                        <tr key={i} className="border-b border-gray-100">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                              <div>
                                <div className="h-4 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                              <div className="w-8 h-8 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      menuItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              {item.imageUrl && (
                                <img
                                  src={item.imageUrl}
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <div className="font-medium text-gray-800">{item.name}</div>
                                <div className="text-sm text-gray-600">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={getCategoryColor(item.category)}>
                              {item.category}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 font-medium">{item.price} DH</td>
                          <td className="py-4 px-4">
                            <Badge className={item.isActive ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                              {item.isActive ? "Active" : "Disabled"}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="ghost" className="p-2">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2"
                                onClick={() => toggleMenuItemStatus(item)}
                              >
                                {item.isActive ? (
                                  <ToggleRight className="w-4 h-4 text-green-600" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4 text-gray-600" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-2 text-red-600 hover:text-red-700"
                                onClick={() => deleteMenuItem(item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "orders" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Order History</h3>
                <div className="flex space-x-2">
                  <Input type="date" className="w-40" />
                  <Select>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {ordersLoading ? (
                  [...Array(5)].map((_, i) => (
                    <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-200 rounded"></div>
                        <div className="h-20 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : (
                  orders.slice(0, 10).map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-bold text-lg">#{order.orderNumber}</span>
                            <Badge className={
                              order.status === "completed" ? "bg-green-100 text-green-800" : 
                              order.status === "cancelled" ? "bg-red-100 text-red-800" :
                              "bg-yellow-100 text-yellow-800"
                            }>
                              {order.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Table {order.tableNumber} • {new Date(order.createdAt!).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-cafe-brown text-lg">${order.total}</div>
                          <div className="text-sm text-gray-600">{order.orderItems.length} items</div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Items:</span>
                          <div className="mt-1 space-y-1">
                            {order.orderItems.map((item) => (
                              <div key={item.id}>
                                {item.quantity}x {item.menuItem.name} - ${item.totalPrice}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium">Payment:</span>
                          <div className="mt-1">
                            <div>Method: Card</div>
                            <div>Status: Paid</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "analytics" && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Popular Items</h3>
                <div className="space-y-3">
                  {menuItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                      <span className="font-medium">{item.name}</span>
                      <div className="text-right">
                        <div className="font-bold text-cafe-brown">
                          {Math.floor(Math.random() * 50) + 10} orders
                        </div>
                        <div className="text-sm text-gray-600">
                          ${(Math.random() * 500 + 100).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Revenue Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Today's Revenue</span>
                    <span className="font-bold text-2xl text-cafe-brown">
                      {(stats?.revenue || 0).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-bold text-lg text-gray-800">
                      {((stats?.revenue || 0) * 7).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-bold text-lg text-gray-800">
                      {((stats?.revenue || 0) * 30).toFixed(2)} DH
                    </span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Growth vs Last Month</span>
                      <span className="font-bold text-green-600">+12.5%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
