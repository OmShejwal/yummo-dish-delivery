/**
 * OrdersPage — Lists all orders for the logged-in user.
 */

import { useNavigate } from "react-router-dom";
import { Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useApp } from "@/contexts/AppContext";

export default function OrdersPage() {
  const { orders, user, dispatch } = useApp();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="font-display text-2xl font-bold mb-2">Sign in required</h2>
        <p className="text-muted-foreground mb-5">Please sign in to view your orders</p>
        <Button
          className="gradient-brand text-primary-foreground border-0 shadow-brand"
          onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-2xl font-bold mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-semibold text-lg">No orders yet</p>
          <p className="text-muted-foreground mt-1 mb-5">Your order history will appear here</p>
          <Button className="gradient-brand text-primary-foreground border-0 shadow-brand" onClick={() => navigate("/")}>
            Start Ordering
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-surface rounded-2xl p-4 shadow-sm hover:shadow-card transition-shadow cursor-pointer group"
              onClick={() => navigate(`/track/${order.id}`)}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <p className="font-semibold">{order.restaurantName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    #{order.id.slice(-6).toUpperCase()} · {new Date(order.placedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <OrderStatusBadge status={order.status} />
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {order.items.map((item) => (
                  <div key={item.menuItemId} className="flex items-center gap-1.5 bg-muted rounded-lg px-2 py-1">
                    <img src={item.image} alt={item.name} className="w-5 h-5 rounded object-cover" />
                    <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                      {item.name} ×{item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm text-muted-foreground">{order.paymentMethod}</span>
                <span className="font-bold text-brand">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
