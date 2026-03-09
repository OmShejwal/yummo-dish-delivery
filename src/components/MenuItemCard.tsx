/**
 * MenuItemCard — Card for a single menu item on the restaurant detail page.
 */

import { Plus, Minus, Flame, Leaf, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/contexts/AppContext";
import type { MenuItem } from "@/data/mockData";
import { toast } from "sonner";

interface Props {
  item: MenuItem;
  restaurantId: string;
}

export default function MenuItemCard({ item, restaurantId }: Props) {
  const { cart, addToCart, updateQty, user, dispatch } = useApp();
  const cartEntry = cart.find((c) => c.menuItemId === item.id);

  const handleAdd = () => {
    if (!user) {
      dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true });
      return;
    }
    addToCart({
      menuItemId: item.id,
      restaurantId,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    });
    toast.success(`${item.name} added to cart`, {
      description: `$${item.price.toFixed(2)}`,
      duration: 2000,
    });
  };

  return (
    <div className="flex gap-4 bg-surface rounded-2xl p-4 shadow-sm hover:shadow-card transition-shadow duration-200 animate-slide-up">
      {/* Image */}
      <div className="relative shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 rounded-xl object-cover"
        />
        {item.popular && (
          <Badge className="absolute -top-2 -right-2 text-[10px] px-1.5 py-0.5 gradient-brand text-primary-foreground border-0 shadow">
            Popular
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-2">
          <h4 className="font-semibold text-sm flex-1 leading-snug">{item.name}</h4>
          <div className="flex gap-1 shrink-0">
            {item.vegetarian && <Leaf className="w-3.5 h-3.5 text-success" />}
            {item.spicy && <Flame className="w-3.5 h-3.5 text-destructive" />}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{item.description}</p>

        <div className="flex items-center gap-2 mt-1.5">
          <Star className="w-3 h-3 fill-accent text-accent" />
          <span className="text-xs text-muted-foreground">{item.rating} · {item.prepTime} min</span>
          <span className="text-xs bg-muted rounded-full px-2 py-0.5 text-muted-foreground">{item.category}</span>
        </div>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-brand text-lg">${item.price.toFixed(2)}</span>

          {/* Qty controls or Add button */}
          {cartEntry ? (
            <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-lg hover:bg-primary hover:text-primary-foreground"
                onClick={() => updateQty(item.id, cartEntry.quantity - 1)}
              >
                <Minus className="w-3 h-3" />
              </Button>
              <span className="w-5 text-center text-sm font-bold">{cartEntry.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                className="w-7 h-7 rounded-lg hover:bg-primary hover:text-primary-foreground"
                onClick={() => updateQty(item.id, cartEntry.quantity + 1)}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="gradient-brand text-primary-foreground border-0 rounded-xl px-4 hover:opacity-90 shadow-sm"
              onClick={handleAdd}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
