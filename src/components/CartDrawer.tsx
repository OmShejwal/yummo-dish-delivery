/**
 * CartDrawer — Sliding cart panel accessible from navbar.
 */

import { useNavigate } from "react-router-dom";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useApp } from "@/contexts/AppContext";

export default function CartDrawer() {
  const { cart, cartOpen, cartTotal, cartRestaurantName, dispatch, removeFromCart, updateQty } = useApp();
  const navigate = useNavigate();

  const deliveryFee = cart.length > 0 ? 2.99 : 0;
  const grandTotal = cartTotal + deliveryFee;

  if (!cartOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm animate-fade-in"
        onClick={() => dispatch({ type: "TOGGLE_CART", payload: false })}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface shadow-lg flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-display text-lg font-bold">Your Cart</h2>
            {cartRestaurantName && (
              <p className="text-xs text-muted-foreground">From: {cartRestaurantName}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => dispatch({ type: "TOGGLE_CART", payload: false })}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-1">Add items from a restaurant to get started</p>
              </div>
              <Button
                size="sm"
                className="gradient-brand text-primary-foreground border-0"
                onClick={() => { dispatch({ type: "TOGGLE_CART", payload: false }); navigate("/"); }}
              >
                Browse Restaurants
              </Button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.menuItemId} className="flex gap-3 items-center bg-muted/40 rounded-xl p-3">
                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.name}</p>
                  <p className="text-brand font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => updateQty(item.menuItemId, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => updateQty(item.menuItemId, item.quantity + 1)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7 text-muted-foreground hover:text-destructive ml-1"
                    onClick={() => removeFromCart(item.menuItemId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-5 py-4 border-t border-border space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span><span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery fee</span><span>${deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-base">
                <span>Total</span><span className="text-brand">${grandTotal.toFixed(2)}</span>
              </div>
            </div>
            <Button
              className="w-full gradient-brand text-primary-foreground border-0 shadow-brand hover:opacity-90 h-11"
              onClick={() => {
                dispatch({ type: "TOGGLE_CART", payload: false });
                navigate("/checkout");
              }}
            >
              Checkout <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground hover:text-destructive"
              onClick={() => dispatch({ type: "CLEAR_CART" })}
            >
              Clear cart
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
