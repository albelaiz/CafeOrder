
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Eye, Users, Table as TableIcon } from "lucide-react";

export function TableMap() {
  const { data: tables = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tables"],
  });

  const { data: orders = [] } = useQuery<any[]>({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TableIcon className="w-5 h-5" />
            <span>Table Status & QR Codes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TableIcon className="w-5 h-5 text-blue-600" />
            <span>Table Overview</span>
          </div>
          <Badge variant="outline">{tables.length} Tables</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => {
            const activeOrders = orders.filter(order => 
              order.tableNumber === table.number && 
              order.status !== "completed" && 
              order.status !== "cancelled"
            );

            return (
              <div 
                key={table.id} 
                className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  table.status === "available" ? "border-green-200 bg-green-50" :
                  table.status === "occupied" ? "border-red-200 bg-red-50" :
                  table.status === "reserved" ? "border-yellow-200 bg-yellow-50" :
                  "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TableIcon className="w-6 h-6 text-gray-600" />
                  </div>
                  
                  <div className="font-bold text-sm text-gray-800 mb-1">
                    Table {table.number}
                  </div>
                  
                  <div className="flex items-center justify-center text-xs text-gray-600 mb-2">
                    <Users className="w-3 h-3 mr-1" />
                    {table.capacity} seats
                  </div>
                  
                  <Badge className={`text-xs mb-2 ${
                    table.status === "available" ? "bg-green-100 text-green-800" :
                    table.status === "occupied" ? "bg-red-100 text-red-800" :
                    table.status === "reserved" ? "bg-yellow-100 text-yellow-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {table.status}
                  </Badge>

                  {activeOrders.length > 0 && (
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {activeOrders.length} active order{activeOrders.length !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  )}
                  
                  <div className="mb-3">
                    <div className="inline-block p-1 bg-white border rounded">
                      <QrCode className="w-8 h-8 text-gray-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs h-7 w-full"
                      onClick={() => {
                        window.open(`/order?t=${table.number}`, '_blank');
                      }}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Order Page
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs h-6 w-full text-gray-600"
                      onClick={() => {
                        navigator.clipboard.writeText(table.qrCode);
                      }}
                    >
                      Copy QR URL
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {tables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="font-medium mb-1">No tables have been set up yet</p>
            <p className="text-sm">Ask admin to add tables with QR codes in the admin dashboard.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
