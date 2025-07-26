import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import type { Table } from "@shared/schema";

export function TableMap() {
  const { toast } = useToast();
  
  // Mock table data for demonstration
  const tables = Array.from({ length: 8 }, (_, i) => ({
    id: i + 1,
    status: i % 3 === 0 ? "occupied" : i % 3 === 1 ? "available" : "reserved",
    updatedAt: new Date(),
  }));

  const getTableColor = (status: string) => {
    switch (status) {
      case "available": return "bg-green-100 border-green-300 hover:bg-green-200";
      case "occupied": return "bg-red-100 border-red-300 hover:bg-red-200";
      case "reserved": return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
      default: return "bg-gray-100 border-gray-300 hover:bg-gray-200";
    }
  };

  const handleTableClick = (tableId: number, status: string) => {
    toast({
      title: `Table ${tableId}`,
      description: `Status: ${status}`,
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Café Map</h3>
        <div className="grid grid-cols-4 gap-2">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`aspect-square border-2 rounded-lg flex items-center justify-center text-sm font-medium relative cursor-pointer transition-colors ${getTableColor(table.status)}`}
              onClick={() => handleTableClick(table.id, table.status)}
            >
              <span>T{table.id}</span>
              {table.status === "occupied" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              )}
              {table.status === "reserved" && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-300 rounded-full"></div>
            <span>Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-300 rounded-full"></div>
            <span>Ordering/Eating</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-300 rounded-full"></div>
            <span>Pending Order</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
