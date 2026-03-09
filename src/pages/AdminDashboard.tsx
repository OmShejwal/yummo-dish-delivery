/**
 * AdminDashboard — Role-based admin view: manage restaurants, menu items, and all orders.
 */

import { useState } from "react";
import { LayoutDashboard, Store, UtensilsCrossed, ShoppingBag, Users, TrendingUp, Edit, Trash2, Plus, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import OrderStatusBadge from "@/components/OrderStatusBadge";
import { restaurants, menuItems, mockOrders } from "@/data/mockData";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Stat card component
function StatCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`bg-surface rounded-2xl p-5 shadow-sm flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, dispatch } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  if (!user || user.role !== "admin") {
    return (
      <div className="container py-24 text-center">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="font-display text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">You need admin privileges to view this page.</p>
        <p className="text-sm text-muted-foreground mb-6">
          Login as: <code className="bg-muted px-1.5 py-0.5 rounded">admin@foodiedash.com</code>
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
          <Button
            className="gradient-brand text-primary-foreground border-0 shadow-brand"
            onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}
          >
            Sign In as Admin
          </Button>
        </div>
      </div>
    );
  }

  const totalRevenue = mockOrders.reduce((s, o) => s + (o.status !== "cancelled" ? o.total : 0), 0);

  const filteredOrders = mockOrders.filter((o) =>
    !search || o.restaurantName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
  );

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-brand" /> Admin Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Welcome back, {user.name}</p>
        </div>
        <Button className="gradient-brand text-primary-foreground border-0 shadow-brand gap-1.5">
          <Plus className="w-4 h-4" /> Add Restaurant
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Orders"    value={mockOrders.length}            icon={<ShoppingBag className="w-6 h-6 text-brand" />}   color="bg-brand/10" />
        <StatCard label="Restaurants"     value={restaurants.length}           icon={<Store className="w-6 h-6 text-info" />}          color="bg-info/10" />
        <StatCard label="Menu Items"      value={menuItems.length}             icon={<UtensilsCrossed className="w-6 h-6 text-success" />} color="bg-success/10" />
        <StatCard label="Revenue"         value={`$${totalRevenue.toFixed(0)}`} icon={<TrendingUp className="w-6 h-6 text-accent" />}  color="bg-accent/10" />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders">
        <TabsList className="mb-6 bg-muted p-1 rounded-xl">
          <TabsTrigger value="orders"      className="rounded-lg data-[state=active]:gradient-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            Orders ({mockOrders.length})
          </TabsTrigger>
          <TabsTrigger value="restaurants" className="rounded-lg data-[state=active]:gradient-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            Restaurants
          </TabsTrigger>
          <TabsTrigger value="menu"        className="rounded-lg data-[state=active]:gradient-brand data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm">
            Menu Items
          </TabsTrigger>
        </TabsList>

        {/* ── Orders Tab ────────────────────────────────── */}
        <TabsContent value="orders">
          <div className="flex gap-3 mb-4">
            <Input
              placeholder="Search orders by restaurant or ID…"
              className="max-w-xs"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Order ID</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Restaurant</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Items</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Total</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Date</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr key={order.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">#{order.id.slice(-6).toUpperCase()}</td>
                      <td className="px-4 py-3 font-medium">{order.restaurantName}</td>
                      <td className="px-4 py-3 text-muted-foreground">{order.items.length} item{order.items.length > 1 ? "s" : ""}</td>
                      <td className="px-4 py-3 font-bold text-brand">${order.total.toFixed(2)}</td>
                      <td className="px-4 py-3"><OrderStatusBadge status={order.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{new Date(order.placedAt).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 hover:text-brand"
                          onClick={() => navigate(`/track/${order.id}`)}
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">No orders found</div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ── Restaurants Tab ───────────────────────────── */}
        <TabsContent value="restaurants">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {restaurants.map((r) => (
              <div key={r.id} className="bg-surface rounded-2xl overflow-hidden shadow-sm">
                <div className="relative h-36">
                  <img src={r.image} alt={r.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 gradient-card" />
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between">
                    <p className="font-bold text-sm text-primary-foreground">{r.name}</p>
                    <Badge className={r.open ? "bg-success/80 text-success-foreground border-0 text-xs" : "bg-destructive/80 text-destructive-foreground border-0 text-xs"}>
                      {r.open ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted-foreground mb-2">{r.cuisine} · {r.address}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-muted rounded-full px-2 py-0.5">{menuItems.filter((m) => m.restaurantId === r.id).length} menu items</span>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="w-7 h-7 hover:text-brand" onClick={() => toast.info("Edit restaurant")}>
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="w-7 h-7 hover:text-destructive" onClick={() => toast.error("Delete not available in demo")}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {/* Add new */}
            <button
              className="border-2 border-dashed border-border rounded-2xl h-full min-h-[180px] flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-brand hover:text-brand transition-colors"
              onClick={() => toast.info("Add restaurant form coming soon!")}
            >
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add Restaurant</span>
            </button>
          </div>
        </TabsContent>

        {/* ── Menu Items Tab ────────────────────────────── */}
        <TabsContent value="menu">
          <div className="bg-surface rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Item</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Restaurant</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Category</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Price</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map((item, i) => {
                    const rest = restaurants.find((r) => r.id === item.restaurantId);
                    return (
                      <tr key={item.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? "" : "bg-muted/10"}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <img src={item.image} alt={item.name} className="w-9 h-9 rounded-lg object-cover" />
                            <span className="font-medium">{item.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{rest?.name}</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                        </td>
                        <td className="px-4 py-3 font-bold text-brand">${item.price.toFixed(2)}</td>
                        <td className="px-4 py-3">
                          {item.popular && <Badge className="text-xs gradient-brand text-primary-foreground border-0 mr-1">Popular</Badge>}
                          {item.vegetarian && <Badge variant="outline" className="text-xs text-success border-success/40">Veggie</Badge>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" className="gap-1 hover:text-brand" onClick={() => toast.info("Edit menu item")}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1 hover:text-destructive" onClick={() => toast.error("Delete not available in demo")}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
