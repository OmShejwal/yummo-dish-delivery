/**
 * OrderTrackingPage — Real-time-style order status tracker.
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, Clock, ChefHat, Bike, Package, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/contexts/AppContext";
import type { Order } from "@/data/mockData";

const STATUS_STEPS: { key: Order["status"]; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "pending",           label: "Order Placed",    desc: "We received your order",              icon: <CheckCircle className="w-5 h-5" /> },
  { key: "confirmed",         label: "Confirmed",       desc: "Restaurant accepted your order",      icon: <Package className="w-5 h-5" /> },
  { key: "preparing",         label: "Preparing",       desc: "Chef is cooking your meal",           icon: <ChefHat className="w-5 h-5" /> },
  { key: "out-for-delivery",  label: "On the Way",      desc: "Driver is heading to you",            icon: <Bike className="w-5 h-5" /> },
  { key: "delivered",         label: "Delivered",       desc: "Enjoy your meal! 🎉",                 icon: <CheckCircle className="w-5 h-5" /> },
];

const STATUS_ORDER: Order["status"][] = ["pending", "confirmed", "preparing", "out-for-delivery", "delivered"];

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { orders } = useApp();
  const [simulatedStatus, setSimulatedStatus] = useState<Order["status"] | null>(null);

  const order = orders.find((o) => o.id === id);

  // Auto-advance status for demo purposes
  useEffect(() => {
    if (!order) return;
    setSimulatedStatus(order.status);

    if (order.status === "delivered" || order.status === "cancelled") return;

    // Simulate status progression every 4 seconds
    const currentIdx = STATUS_ORDER.indexOf(order.status);
    let idx = currentIdx;
    const interval = setInterval(() => {
      idx = Math.min(idx + 1, STATUS_ORDER.length - 1);
      setSimulatedStatus(STATUS_ORDER[idx]);
      if (idx >= STATUS_ORDER.length - 1) clearInterval(interval);
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.id, order?.status]);

  const currentStatus = simulatedStatus ?? order?.status ?? "pending";
  const currentIdx = STATUS_ORDER.indexOf(currentStatus);

  if (!order) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">📦</p>
        <h2 className="font-display text-2xl font-bold mb-2">Order not found</h2>
        <p className="text-muted-foreground mb-5">This order may not belong to your account</p>
        <Button className="gradient-brand text-primary-foreground border-0" onClick={() => navigate("/orders")}>
          My Orders
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold">Track Order</h1>
          <p className="text-sm text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</p>
        </div>
      </div>

      {/* Live animation indicator */}
      {currentStatus !== "delivered" && currentStatus !== "cancelled" && (
        <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-xl px-4 py-2.5 mb-6 text-sm text-success font-medium">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          Live tracking active
        </div>
      )}

      {/* Status Steps */}
      <div className="bg-surface rounded-2xl p-6 shadow-card mb-6">
        <div className="space-y-0">
          {STATUS_STEPS.map((step, i) => {
            const isDone    = i <= currentIdx;
            const isActive  = i === currentIdx;
            const isLast    = i === STATUS_STEPS.length - 1;

            return (
              <div key={step.key} className="flex gap-4">
                {/* Icon + line */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    isDone
                      ? "gradient-brand text-primary-foreground border-brand shadow-brand"
                      : "bg-muted border-border text-muted-foreground"
                  } ${isActive ? "scale-110 animate-pulse-brand" : ""}`}>
                    {step.icon}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-8 mt-1 transition-all duration-700 ${
                      i < currentIdx ? "bg-brand" : "bg-border"
                    }`} />
                  )}
                </div>

                {/* Text */}
                <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
                  <p className={`font-semibold text-sm transition-colors ${isDone ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 transition-colors ${isActive ? "text-brand" : "text-muted-foreground"}`}>
                    {step.desc}
                  </p>
                  {isActive && (
                    <span className="inline-block mt-1 text-xs bg-brand/10 text-brand rounded-full px-2 py-0.5 font-medium animate-fade-in">
                      Current status
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Delivery Address</p>
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <p className="text-sm">{order.deliveryAddress}</p>
          </div>
        </div>
        <div className="bg-surface rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Estimated Time</p>
          <div className="flex gap-2">
            <Clock className="w-4 h-4 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">{order.estimatedDelivery}</p>
              <p className="text-xs text-muted-foreground">from {order.restaurantName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Items summary */}
      <div className="bg-surface rounded-2xl p-5 shadow-sm mb-6">
        <p className="font-semibold mb-3">Items Ordered</p>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.menuItemId} className="flex items-center gap-3">
              <img src={item.image} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />
              <span className="flex-1 text-sm">{item.name}</span>
              <span className="text-xs text-muted-foreground">×{item.quantity}</span>
              <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-bold mt-3 pt-3 border-t border-border">
          <span>Total Paid</span>
          <span className="text-brand">${order.total.toFixed(2)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={() => navigate("/orders")}>
          All Orders
        </Button>
        {currentStatus === "delivered" && (
          <Button className="flex-1 gradient-brand text-primary-foreground border-0 shadow-brand hover:opacity-90" onClick={() => navigate("/")}>
            Order Again
          </Button>
        )}
      </div>
    </div>
  );
}
