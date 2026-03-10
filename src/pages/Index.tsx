/**
 * Home Page — Hero, search, featured restaurants, popular dishes.
 */

import { useState, useEffect, useMemo } from "react";
import { Search, MapPin, Zap, Shield, Clock, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RestaurantCard from "@/components/RestaurantCard";
import { restaurantService, type Restaurant } from "@/lib/restaurantApi";
import heroBanner from "@/assets/hero-banner.jpg";
import { useApp } from "@/contexts/AppContext";

const CUISINE_FILTERS = ["All", "Italian", "Japanese", "American", "Indian"];

export default function Index() {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { dispatch } = useApp();

  useEffect(() => {
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const data = await restaurantService.getRestaurants();
      setRestaurants(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load restaurants');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return restaurants.filter((r) => {
      const matchSearch =
        !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine_types.some((c) => c.toLowerCase().includes(search.toLowerCase()));
      const matchCuisine = cuisine === "All" || r.cuisine_types.includes(cuisine);
      return matchSearch && matchCuisine;
    });
  }, [search, cuisine, restaurants]);

  // Convert API restaurant format to component format
  const convertRestaurant = (r: Restaurant) => ({
    id: r.id,
    name: r.name,
    cuisine: r.cuisine_types.join(", "),
    rating: r.rating,
    reviewCount: r.reviews_count,
    deliveryTime: "25-35 min", // Default, could be made dynamic
    deliveryFee: r.delivery_fee,
    minOrder: r.min_order_value,
    image: r.banner_url || r.logo_url || '/placeholder-restaurant.jpg',
    featured: r.rating >= 4.5,
    open: r.is_active,
    address: r.address,
    tags: r.cuisine_types,
    ownerId: r.vendor_id,
  });

  const popularDishes = []; // TODO: Implement popular dishes from API

  return (
    <div className="min-h-screen">
      {/* ── Hero Section ─────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[520px] flex items-center">
        <img
          src={heroBanner}
          alt="Delicious food"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: "var(--gradient-hero)" }} />

        <div className="relative container py-16 md:py-24">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-4 animate-slide-up stagger-1">
              <span className="flex items-center gap-1.5 bg-accent/20 border border-accent/30 rounded-full px-3 py-1 text-xs font-semibold text-accent">
                <Zap className="w-3 h-3" /> Fast delivery to your door
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-6xl font-extrabold text-primary-foreground leading-tight animate-slide-up stagger-2">
              Hungry? <br />
              <span className="text-accent">We've got you</span> covered.
            </h1>
            <p className="text-primary-foreground/80 mt-4 text-lg animate-slide-up stagger-3">
              Order from your favourite local restaurants. Fresh food, fast delivery.
            </p>

            {/* Search bar */}
            <div className="flex gap-2 mt-8 animate-slide-up stagger-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search restaurants or cuisines…"
                  className="pl-10 h-12 bg-surface/95 border-0 shadow-lg text-base rounded-xl"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button className="h-12 px-6 gradient-brand text-primary-foreground border-0 shadow-brand rounded-xl hover:opacity-90">
                Search
              </Button>
            </div>

            {/* Location hint */}
            <div className="flex items-center gap-1.5 mt-3 text-primary-foreground/60 text-sm animate-slide-up stagger-5">
              <MapPin className="w-4 h-4" />
              Delivering to: <span className="font-medium text-primary-foreground/80">Downtown Area</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust Badges ─────────────────────────────────────── */}
      <section className="bg-surface border-b border-border">
        <div className="container py-5">
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto text-center">
            {[
              { icon: <Clock className="w-5 h-5 text-brand" />, label: "Fast Delivery", sub: "20–45 min avg" },
              { icon: <Star className="w-5 h-5 text-accent" />,  label: "Top Rated",    sub: "4.5+ restaurants" },
              { icon: <Shield className="w-5 h-5 text-success" />,label: "Secure Pay",  sub: "100% safe checkout" },
            ].map((b) => (
              <div key={b.label} className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-1">
                  {b.icon}
                </div>
                <p className="font-semibold text-sm">{b.label}</p>
                <p className="text-xs text-muted-foreground">{b.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Restaurants ──────────────────────────────────────── */}
      <section className="container py-12">
        {/* Cuisine filters */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <h2 className="font-display text-2xl font-bold">
            {search ? `Results for "${search}"` : "All Restaurants"}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {CUISINE_FILTERS.map((c) => (
              <Button
                key={c}
                size="sm"
                variant={cuisine === c ? "default" : "outline"}
                className={
                  cuisine === c
                    ? "gradient-brand text-primary-foreground border-0 shadow-sm"
                    : "hover:border-brand hover:text-brand"
                }
                onClick={() => setCuisine(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand mx-auto mb-4"></div>
            <p className="font-semibold">Loading restaurants...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">❌</p>
            <p className="font-semibold">{error}</p>
            <Button className="mt-4" onClick={loadRestaurants}>Try Again</Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">🍽️</p>
            <p className="font-semibold">No restaurants found</p>
            <p className="text-sm mt-1">Try a different search or cuisine</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r, i) => (
              <div key={r.id} className={`stagger-${Math.min(i + 1, 5)}`}>
                <RestaurantCard restaurant={convertRestaurant(r)} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Popular Dishes ───────────────────────────────────── */}
      <section className="bg-muted/50 py-12">
        <div className="container">
          <h2 className="font-display text-2xl font-bold mb-6">🔥 Popular Right Now</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {popularDishes.map((dish, i) => {
              const rest = restaurants.find((r) => r.id === dish.restaurantId);
              return (
                <a
                  key={dish.id}
                  href={`/restaurant/${dish.restaurantId}`}
                  className={`group bg-surface rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 hover:-translate-y-1 stagger-${i + 1}`}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img src={dish.image} alt={dish.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 gradient-card" />
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-bold text-primary-foreground truncate">{dish.name}</p>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-muted-foreground truncate">{rest?.name}</p>
                    <p className="font-bold text-brand text-sm mt-0.5">${dish.price.toFixed(2)}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="container py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to order?</h2>
          <p className="text-muted-foreground mb-6">Sign in to save your favourites, track orders, and enjoy faster checkout.</p>
          <Button
            size="lg"
            className="gradient-brand text-primary-foreground border-0 shadow-brand px-8 h-12 text-base hover:opacity-90 animate-pulse-brand"
            onClick={() => dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true })}
          >
            Get Started — It's Free
          </Button>
        </div>
      </section>
    </div>
  );
}
