/**
 * VendorPage — Restaurant management dashboard for vendors.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Store, Edit, Menu, Star, Clock, MapPin, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/contexts/AppContext";
import { restaurantService, type Restaurant, type MenuItem } from "@/lib/restaurantApi";
import { toast } from "sonner";

export default function VendorPage() {
  const { user, dispatch } = useApp();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'vendor') {
      return;
    }

    loadRestaurants();
  }, [user]);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      // For now, we'll get all restaurants and filter by vendor_id
      // In a real app, you'd have an endpoint to get restaurants by vendor
      const allRestaurants = await restaurantService.getRestaurants();
      const vendorRestaurants = allRestaurants.filter(r => r.vendor_id === user?.id);
      setRestaurants(vendorRestaurants);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = () => {
    navigate('/vendor/create-restaurant');
  };

  const handleEditRestaurant = (restaurantId: string) => {
    navigate(`/vendor/restaurant/${restaurantId}/edit`);
  };

  const handleManageMenu = (restaurantId: string) => {
    navigate(`/vendor/restaurant/${restaurantId}/menu`);
  };

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

  if (loading) {
    return (
      <div className="container py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading your restaurants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">❌</p>
        <p className="font-semibold text-lg text-red-600">{error}</p>
        <Button className="mt-4" onClick={loadRestaurants}>Try Again</Button>
      </div>
    );
  }

  const myRestaurant = restaurants.length > 0 ? restaurants[0] : null;
  const totalOrders = 0; // TODO: Implement order tracking
  const totalRevenue = 0; // TODO: Implement revenue tracking

  if (!myRestaurant) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🏪</p>
        <h2 className="font-display text-2xl font-bold mb-2">No restaurant yet</h2>
        <p className="text-muted-foreground mb-5">You haven't added a restaurant.</p>
        <Button onClick={handleCreateRestaurant} className="gradient-brand text-primary-foreground border-0 shadow-brand">
          <Plus className="w-4 h-4 mr-2" /> Add Your Restaurant
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">Restaurant Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your restaurant and track performance</p>
        </div>
        <Button onClick={handleCreateRestaurant} className="gradient-brand text-primary-foreground border-0">
          <Plus className="w-4 h-4 mr-2" />
          Add Restaurant
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">+15.3% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myRestaurant.rating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Based on {myRestaurant.reviews_count} reviews</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList>
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                {myRestaurant.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">Restaurant Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{myRestaurant.address}, {myRestaurant.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>📞 {myRestaurant.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>✉️ {myRestaurant.email}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Business Info</h4>
                  <div className="space-y-2 text-sm">
                    <div>Minimum Order: <span className="font-medium">${myRestaurant.min_order_value.toFixed(2)}</span></div>
                    <div>Delivery Fee: <span className="font-medium">${myRestaurant.delivery_fee.toFixed(2)}</span></div>
                    <div>Cuisine: <span className="font-medium">{myRestaurant.cuisine_types.join(", ")}</span></div>
                    <div>Status: <Badge variant={myRestaurant.is_active ? "default" : "secondary"}>
                      {myRestaurant.is_active ? "Active" : "Inactive"}
                    </Badge></div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <Button variant="outline" onClick={() => handleEditRestaurant(myRestaurant.id)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Restaurant
                </Button>
                <Button variant="outline" onClick={() => handleManageMenu(myRestaurant.id)}>
                  <Menu className="w-4 h-4 mr-2" />
                  Manage Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="menu" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Menu Items</h3>
            <Button onClick={() => handleManageMenu(myRestaurant.id)} className="gradient-brand text-primary-foreground border-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Menu Item
            </Button>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-3" />
            <p>Menu management interface coming soon...</p>
            <p className="text-sm mt-1">Click "Manage Menu" to edit your restaurant's menu items</p>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <h3 className="text-xl font-semibold">Recent Orders</h3>

          <div className="text-center py-8 text-muted-foreground">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3" />
            <p>Order management interface coming soon...</p>
            <p className="text-sm mt-1">Track and manage customer orders</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
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
