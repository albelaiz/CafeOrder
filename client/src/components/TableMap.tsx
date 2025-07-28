import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink } from "lucide-react";

export function TableMap() {
  const { data: tables = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/tables"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Table Status & QR Codes</h3>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Table Status & QR Codes</h3>
        <div className="grid grid-cols-2 gap-3">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`rounded-lg border-2 p-3 flex flex-col items-center justify-center text-sm ${
                table.status === "available"
                  ? "bg-green-50 border-green-200"
                  : table.status === "occupied"
                  ? "bg-red-50 border-red-200"
                  : table.status === "reserved"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="text-lg font-bold mb-1">Table {table.number}</div>
              <Badge
                className={`text-xs mb-2 ${
                  table.status === "available" ? "bg-green-100 text-green-800" : 
                  table.status === "occupied" ? "bg-red-100 text-red-800" :
                  table.status === "reserved" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}
              >
                {table.status}
              </Badge>
              
              <div className="w-16 h-16 bg-white border rounded mb-2 flex items-center justify-center">
                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                  <QrCode className="w-6 h-6 text-gray-600" />
                </div>
              </div>
              
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-6 px-2"
                onClick={() => {
                  window.open(`/order?t=${table.number}`, '_blank');
                }}
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                View Order Page
              </Button>
            </div>
          ))}
        </div>
        
        {tables.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <QrCode className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tables have been set up yet.</p>
            <p className="text-sm">Ask admin to add tables with QR codes.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
