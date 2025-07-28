import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Check, Eye, Clock } from "lucide-react";
import type { OrderWithItems } from "@shared/schema";

interface OrderCardProps {
  order: OrderWithItems;
  onUpdateStatus: (orderId: string, status: string) => void;
}

export function OrderCard({ order, onUpdateStatus }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "preparing": return "bg-orange-100 text-orange-800";
      case "ready": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getNextAction = () => {
    switch (order.status) {
      case "pending":
        return {
          label: "Start Preparing",
          icon: Play,
          nextStatus: "preparing",
          color: "bg-cafe-accent hover:bg-orange-600",
        };
      case "preparing":
        return {
          label: "Mark Ready",
          icon: Check,
          nextStatus: "ready",
          color: "bg-green-600 hover:bg-green-700",
        };
      case "ready":
        return {
          label: "Mark Served",
          icon: Check,
          nextStatus: "completed",
          color: "bg-cafe-brown hover:bg-cafe-light",
        };
      default:
        return null;
    }
  };

  const nextAction = getNextAction();
  const timeSince = new Date(Date.now() - new Date(order.createdAt!).getTime());
  const minutesAgo = Math.floor(timeSince.getTime() / (1000 * 60));

  return (
    <Card className="border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-bold text-lg">#{order.orderNumber}</span>
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Table {order.tableNumber} • {minutesAgo} mins ago
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-cafe-brown">{order.total} DH</div>
            <div className="text-sm text-gray-600">{order.orderItems.length} items</div>
          </div>
        </div>
        
        <div className="space-y-2 mb-4">
          {order.orderItems.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>{item.quantity}x {item.menuItem.name}</span>
              <span>${item.totalPrice}</span>
            </div>
          ))}
        </div>

        <div className="flex space-x-2">
          {nextAction && (
            <Button
              className={`flex-1 ${nextAction.color}`}
              onClick={() => onUpdateStatus(order.id, nextAction.nextStatus)}
            >
              <nextAction.icon className="w-4 h-4 mr-1" />
              {nextAction.label}
            </Button>
          )}
          <Button variant="outline" size="sm" className="px-4">
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
