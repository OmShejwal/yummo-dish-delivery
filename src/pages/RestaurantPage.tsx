/**
 * RestaurantPage — Full restaurant detail with menu, categories, and add-to-cart.
 */

import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Clock, Bike, MapPin, Search, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MenuItemCard from "@/components/MenuItemCard";
import { useApp } from "@/contexts/AppContext";
import { restaurantService, type Restaurant, type MenuItem } from "@/lib/restaurantApi";

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dispatch, cartCount, cartRestaurantId } = useApp();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadRestaurantData(id);
    }
  }, [id]);

  const loadRestaurantData = async (restaurantId: string) => {
    try {
      setLoading(true);
      const restaurantData = await restaurantService.getRestaurant(restaurantId);
      setRestaurant(restaurantData);
      setMenuItems(restaurantData.menu_items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurant');
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(menuItems.map((m) => m.category)))];

  const filtered = useMemo(() => {
    return menuItems.filter((item) => {
      const matchSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [menuItems, search, activeCategory]);

  const hasCartFromHere = cartRestaurantId === (id ?? "");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container py-24 text-center">
        <p className="text-4xl mb-3">🤔</p>
        <p className="font-semibold text-lg">{error || 'Restaurant not found'}</p>
        <Button className="mt-4" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="relative h-64 md:h-80 overflow-hidden">
        <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 gradient-card" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 md:top-6 md:left-6 flex items-center gap-2 bg-surface/90 hover:bg-surface text-foreground rounded-xl px-3 py-2 text-sm font-medium shadow transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
          <div className="container">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">{restaurant.name}</h1>
                <p className="text-primary-foreground/80 mt-1">{restaurant.cuisine_types.join(", ")}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {restaurant.cuisine_types.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-primary-foreground/20 text-primary-foreground border-primary-foreground/30 text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 bg-surface/95 rounded-2xl px-4 py-2 shadow">
                <Star className="w-4 h-4 fill-accent text-accent" />
                <span className="font-bold">{restaurant.rating.toFixed(1)}</span>
                <span className="text-xs text-muted-foreground">({restaurant.reviews_count} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-surface border-b border-border sticky top-16 z-30 shadow-sm">
        <div className="container py-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-brand" /> 25-35 min</span>
          <span className="flex items-center gap-1.5"><Bike className="w-4 h-4 text-brand" /> ${restaurant.delivery_fee.toFixed(2)} delivery</span>
          <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-brand" /> {restaurant.address}</span>
          <span className="ml-auto text-xs">Min. ${restaurant.min_order_value.toFixed(2)}</span>
        </div>
      </div>

      <div className="container py-6">
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search menu…" className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                size="sm"
                variant={activeCategory === cat ? "default" : "outline"}
                className={activeCategory === cat ? "gradient-brand text-primary-foreground border-0" : "hover:border-brand hover:text-brand"}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold">No items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item, i) => {
              // Convert API menu item to component format
              const convertedItem = {
                id: item.id,
                restaurantId: restaurant.id,
                name: item.name,
                description: item.description,
                price: item.price,
                image: item.image_url || '/placeholder-food.jpg',
                category: item.category,
                popular: false, // TODO: Add popular flag to API
                vegetarian: item.dietary_info?.includes('vegetarian') || false,
                spicy: item.dietary_info?.includes('spicy') || false,
                rating: 4.5, // TODO: Add rating to API
                prepTime: item.preparation_time,
              };
              return (
                <div key={item.id} className={`stagger-${Math.min(i + 1, 5)} animate-slide-up`}>
                  <MenuItemCard item={convertedItem} restaurantId={restaurant.id} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {hasCartFromHere && cartCount > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 md:hidden">
          <Button
            className="gradient-brand text-primary-foreground border-0 shadow-brand rounded-full px-6 h-12 gap-2 animate-bounce-in"
            onClick={() => dispatch({ type: "TOGGLE_CART", payload: true })}
          >
            <ShoppingCart className="w-4 h-4" /> View cart ({cartCount})
          </Button>
        </div>
      )}
    </div>
  );
}
