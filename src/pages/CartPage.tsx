/**
 * CartPage — Full-page cart view with editable quantities and order summary.
 */

import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";
import { restaurants } from "@/data/mockData";

export default function CartPage() {
  const { cart, cartTotal, cartRestaurantId, removeFromCart, updateQty, dispatch, user } = useApp();
  const navigate = useNavigate();

  const restaurant = restaurants.find((r) => r.id === cartRestaurantId);
  const deliveryFee = restaurant?.deliveryFee ?? 0;
  const grandTotal = cartTotal + deliveryFee;
  const tax = cartTotal * 0.08;

  if (cart.length === 0) {
    return (
      <div className="container py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
          <ShoppingBag className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="font-display text-2xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">Add some delicious items from our restaurants</p>
        <Button
          className="gradient-brand text-primary-foreground border-0 shadow-brand"
          onClick={() => navigate("/")}
        >
          Browse Restaurants
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold">Your Cart</h1>
          {restaurant && (
            <p className="text-sm text-muted-foreground">From: {restaurant.name}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex gap-4 bg-surface rounded-2xl p-4 shadow-sm animate-slide-up">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold truncate">{item.name}</h3>
                  <button
                    className="text-muted-foreground hover:text-destructive transition-colors shrink-0 mt-0.5"
                    onClick={() => removeFromCart(item.menuItemId)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">${item.price.toFixed(2)} each</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </Button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-8 h-8 rounded-lg hover:bg-primary hover:text-primary-foreground"
                      onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <span className="font-bold text-brand text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive mt-2"
            onClick={() => dispatch({ type: "CLEAR_CART" })}
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear cart
          </Button>
        </div>

        {/* Order Summary */}
        <div className="bg-surface rounded-2xl p-5 shadow-card h-fit sticky top-24">
          <h2 className="font-display text-lg font-bold mb-4">Order Summary</h2>

          {restaurant && (
            <div className="bg-muted/60 rounded-xl p-3 mb-4 text-sm">
              <p className="font-semibold">{restaurant.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{restaurant.address}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Delivery: {restaurant.deliveryTime}</p>
            </div>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery fee</span>
              <span>{deliveryFee === 0 ? <span className="text-success font-medium">Free</span> : `$${deliveryFee.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-bold text-base pt-1">
              <span>Total</span>
              <span className="text-brand">${(grandTotal + tax).toFixed(2)}</span>
            </div>
          </div>

          <Button
            className="w-full mt-5 gradient-brand text-primary-foreground border-0 shadow-brand h-11 text-base hover:opacity-90"
            onClick={() => {
              if (!user) {
                dispatch({ type: "TOGGLE_AUTH_MODAL", payload: true });
                return;
              }
              navigate("/checkout");
            }}
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <Button
            variant="ghost"
            className="w-full mt-2 text-sm text-muted-foreground"
            onClick={() => navigate(`/restaurant/${cartRestaurantId}`)}
          >
            + Add more items
          </Button>
        </div>
      </div>
    </div>
  );
}
