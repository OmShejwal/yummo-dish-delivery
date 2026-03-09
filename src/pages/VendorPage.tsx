/**
 * VendorPage — Vendor panel for managing their own restaurant and menu.
 */

import { Edit, Plus, Trash2, UtensilsCrossed, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { useNavigate } from "react-router-dom";
import { restaurants, menuItems, mockOrders } from "@/data/mockData";
import { toast } from "sonner";

export default function VendorPage() {
  const { user, dispatch } = useApp();
  const navigate = useNavigate();

  if (!user || user.role !== "vendor") {
    return (
      <div className="container py-24 text-center">
        <p className="text-5xl mb-4">🚫</p>
        <h2 className="font-display text-2xl font-bold mb-2">Vendor Access Required</h2>
        <p className="text-muted-foreground mb-4">Login with a vendor account to manage your restaurant.</p>
        <p className="text-sm text-muted-foreground mb-6">
          Try: <code className="bg-muted px-1.5 py-0.5 rounded">marco@bellanapoli.com</code>
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
          <Button className="gradient-brand text-primary-foreground border-0 shadow-brand"
            onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}>
            Sign In as Vendor
          </Button>
        </div>
      </div>
    );
  }

  const myRestaurant = restaurants.find((r) => r.ownerId === user.id);
  const myMenu = myRestaurant ? menuItems.filter((m) => m.restaurantId === myRestaurant.id) : [];
  const myOrders = myRestaurant ? mockOrders.filter((o) => o.restaurantId === myRestaurant.id) : [];

  if (!myRestaurant) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🏪</p>
        <h2 className="font-display text-2xl font-bold mb-2">No restaurant yet</h2>
        <p className="text-muted-foreground mb-5">You haven't added a restaurant.</p>
        <Button className="gradient-brand text-primary-foreground border-0 shadow-brand">
          <Plus className="w-4 h-4 mr-2" /> Add Your Restaurant
        </Button>
      </div>
    );
  }

  const revenue = myOrders.reduce((s, o) => s + (o.status !== "cancelled" ? o.total : 0), 0);

  return (
    <div className="container py-8">
      <h1 className="font-display text-2xl font-bold mb-2">Vendor Dashboard</h1>
      <p className="text-muted-foreground mb-6">Managing: <span className="font-semibold text-foreground">{myRestaurant.name}</span></p>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Orders", value: myOrders.length, icon: <ShoppingBag className="w-5 h-5 text-brand" />, bg: "bg-brand/10" },
          { label: "Menu Items",   value: myMenu.length,  icon: <UtensilsCrossed className="w-5 h-5 text-info" />, bg: "bg-info/10" },
          { label: "Revenue",      value: `$${revenue.toFixed(0)}`, icon: <TrendingUp className="w-5 h-5 text-success" />, bg: "bg-success/10" },
        ].map((s) => (
          <div key={s.label} className="bg-surface rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.bg}`}>{s.icon}</div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Tabs defaultValue="menu">
        <TabsList className="mb-6 bg-muted p-1 rounded-xl">
          <TabsTrigger value="menu"   className="rounded-lg data-[state=active]:gradient-brand data-[state=active]:text-primary-foreground">Menu</TabsTrigger>
          <TabsTrigger value="orders" className="rounded-lg data-[state=active]:gradient-brand data-[state=active]:text-primary-foreground">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="menu">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold">Menu Items ({myMenu.length})</h2>
            <Button size="sm" className="gradient-brand text-primary-foreground border-0 gap-1" onClick={() => toast.info("Add item form coming soon!")}>
              <Plus className="w-3.5 h-3.5" /> Add Item
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myMenu.map((item) => (
              <div key={item.id} className="bg-surface rounded-2xl p-4 shadow-sm flex gap-3 items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.category}</p>
                  <p className="font-bold text-brand text-sm mt-1">${item.price.toFixed(2)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {item.popular && <Badge className="text-xs gradient-brand text-primary-foreground border-0">Popular</Badge>}
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-brand" onClick={() => toast.info("Edit item")}>
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-destructive" onClick={() => toast.error("Delete not available in demo")}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders">
          <div className="space-y-3">
            {myOrders.length === 0 && <p className="text-muted-foreground text-sm">No orders yet.</p>}
            {myOrders.map((order) => (
              <div key={order.id} className="bg-surface rounded-2xl p-4 shadow-sm flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-medium text-sm">#{order.id.slice(-6).toUpperCase()}</p>
                  <p className="text-xs text-muted-foreground">{order.items.length} items · ${order.total.toFixed(2)}</p>
                </div>
                <Badge variant="outline" className="capitalize">{order.status}</Badge>
                <Button size="sm" variant="outline" onClick={() => navigate(`/track/${order.id}`)}>View</Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
