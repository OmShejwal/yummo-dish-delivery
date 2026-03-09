/**
 * ProfilePage — View and edit user profile, saved addresses, order history.
 */

import { useState } from "react";
import { User, MapPin, Plus, Trash2, Check, Package, LayoutDashboard, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { useApp } from "@/contexts/AppContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, orders, dispatch, logout } = useApp();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [name,  setName]  = useState(user?.name  ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [newAddr, setNewAddr] = useState("");

  if (!user) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🔒</p>
        <h2 className="font-display text-2xl font-bold mb-2">Sign in to view your profile</h2>
        <Button className="gradient-brand text-primary-foreground border-0 shadow-brand mt-4"
          onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}>
          Sign In
        </Button>
      </div>
    );
  }

  const handleSave = () => {
    dispatch({ type: "UPDATE_USER", payload: { name, phone } });
    setEditing(false);
    toast.success("Profile updated!");
  };

  const addAddress = () => {
    if (!newAddr.trim()) return;
    dispatch({ type: "UPDATE_USER", payload: { addresses: [...user.addresses, newAddr.trim()] } });
    setNewAddr("");
    toast.success("Address added!");
  };

  const removeAddress = (addr: string) => {
    dispatch({ type: "UPDATE_USER", payload: { addresses: user.addresses.filter((a) => a !== addr) } });
  };

  return (
    <div className="container py-8 max-w-3xl">
      <h1 className="font-display text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left sidebar */}
        <div className="space-y-4">
          <div className="bg-surface rounded-2xl p-5 shadow-sm text-center">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-3xl font-bold text-primary-foreground mx-auto mb-3 shadow-brand">
              {user.name.charAt(0)}
            </div>
            <h2 className="font-display font-bold text-lg">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant="outline" className="mt-2 capitalize">{user.role}</Badge>
          </div>

          <div className="bg-surface rounded-2xl p-4 shadow-sm space-y-1">
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/orders")}>
              <Package className="w-4 h-4" /> My Orders ({orders.length})
            </Button>
            {user.role === "admin" && (
              <Button variant="ghost" className="w-full justify-start gap-2 text-sm" onClick={() => navigate("/admin")}>
                <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
              </Button>
            )}
            <Separator />
            <Button variant="ghost" className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive hover:bg-destructive/10" onClick={logout}>
              <LogOut className="w-4 h-4" /> Log out
            </Button>
          </div>
        </div>

        {/* Right main area */}
        <div className="md:col-span-2 space-y-5">
          {/* Personal Info */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-brand" /> Personal Info
              </h3>
              <Button size="sm" variant="outline" onClick={() => editing ? handleSave() : setEditing(true)}>
                {editing ? <><Check className="w-3.5 h-3.5 mr-1" /> Save</> : "Edit"}
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <Label>Full Name</Label>
                {editing ? <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                  : <p className="text-sm mt-1 py-2 px-3 bg-muted rounded-lg">{user.name}</p>}
              </div>
              <div>
                <Label>Email</Label>
                <p className="text-sm mt-1 py-2 px-3 bg-muted rounded-lg text-muted-foreground">{user.email}</p>
              </div>
              <div>
                <Label>Phone</Label>
                {editing ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555-0000" className="mt-1" />
                  : <p className="text-sm mt-1 py-2 px-3 bg-muted rounded-lg">{user.phone || "Not set"}</p>}
              </div>
            </div>
          </div>

          {/* Saved Addresses */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-brand" /> Saved Addresses
            </h3>
            <div className="space-y-2 mb-3">
              {user.addresses.length === 0 && <p className="text-sm text-muted-foreground">No saved addresses yet</p>}
              {user.addresses.map((addr) => (
                <div key={addr} className="flex items-center gap-2 bg-muted rounded-xl px-3 py-2.5">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm">{addr}</span>
                  <button className="text-muted-foreground hover:text-destructive transition-colors" onClick={() => removeAddress(addr)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input placeholder="Add new address…" value={newAddr} onChange={(e) => setNewAddr(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addAddress()} className="flex-1" />
              <Button size="sm" onClick={addAddress} className="gradient-brand text-primary-foreground border-0">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-surface rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold mb-4">Recent Orders</h3>
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No orders yet</p>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <Link key={order.id} to={`/track/${order.id}`}
                    className="flex items-center justify-between p-3 rounded-xl hover:bg-muted transition-colors">
                    <div>
                      <p className="text-sm font-medium">{order.restaurantName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.placedAt).toLocaleDateString()} · ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </Link>
                ))}
                {orders.length > 3 && (
                  <Button variant="ghost" size="sm" className="w-full text-brand" onClick={() => navigate("/orders")}>
                    View all {orders.length} orders →
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
