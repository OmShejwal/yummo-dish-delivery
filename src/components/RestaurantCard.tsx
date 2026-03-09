/**
 * RestaurantCard — Card component for displaying a restaurant in listings.
 */

import { Link } from "react-router-dom";
import { Star, Clock, Bike, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Restaurant } from "@/data/mockData";

interface Props {
  restaurant: Restaurant;
  className?: string;
}

export default function RestaurantCard({ restaurant, className = "" }: Props) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className={`group block bg-surface rounded-2xl overflow-hidden shadow-card hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${className}`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 gradient-card" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {restaurant.featured && (
            <Badge className="gradient-warm text-primary-foreground border-0 text-xs font-semibold shadow">
              Featured
            </Badge>
          )}
          {!restaurant.open && (
            <Badge variant="secondary" className="bg-foreground/70 text-primary-foreground border-0 text-xs">
              Closed
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-surface/95 rounded-lg px-2 py-1 shadow">
          <Star className="w-3.5 h-3.5 fill-accent text-accent" />
          <span className="text-xs font-bold text-foreground">{restaurant.rating}</span>
          <span className="text-xs text-muted-foreground">({restaurant.reviewCount})</span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display font-bold text-lg leading-tight group-hover:text-brand transition-colors">
              {restaurant.name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5">{restaurant.cuisine}</p>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground mt-1 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {restaurant.tags.map((tag) => (
            <span key={tag} className="text-xs bg-muted px-2 py-0.5 rounded-full text-muted-foreground">
              {tag}
            </span>
          ))}
        </div>

        {/* Delivery info */}
        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-border text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-brand" />
            {restaurant.deliveryTime}
          </span>
          <span className="flex items-center gap-1">
            <Bike className="w-3.5 h-3.5 text-brand" />
            {restaurant.deliveryFee === 0 ? "Free delivery" : `$${restaurant.deliveryFee.toFixed(2)} delivery`}
          </span>
          <span className="ml-auto">
            Min. ${restaurant.minOrder}
          </span>
        </div>
      </div>
    </Link>
  );
}
